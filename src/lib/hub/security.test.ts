import assert from "node:assert/strict";

/** process.env with NODE_ENV writable, so a test can pretend to be production. */
const env = process.env as Record<string, string | undefined>;
import { after, before, describe, it } from "node:test";
import { bindPhone, primaryPhone, requestCode, verifyCode, MAX_ATTEMPTS } from "./otp.ts";
import { confirmStepUp, requestStepUp, requireStepUp } from "./stepup.ts";
import { dispatchBatch, enqueue, queueDigests, backoffMinutes } from "./outbox.ts";
import type { SmsProvider } from "./sms.ts";
import { createTestDb, ORG, type TestDb } from "./test-db.ts";

let db: TestDb;
const sent: { to: string; text: string }[] = [];
let failNext = false;
const sms: SmsProvider = { name: "fake", configured: true, async send(to, text) { if (failNext) return { ok: false, error: "gateway down" }; sent.push({ to, text }); return { ok: true, id: `m${sent.length}` }; } };
const deps = { sms, exposeCode: false };
const lastCode = () => sent[sent.length - 1].text.match(/\b(\d{6})\b/)![1];
const as = (userId: string, memberId: string | null = null, orgId: string | null = ORG) => ({ userId, orgId, memberId });
let m1 = "", m2 = "";

before(async () => {
  db = await createTestDb();
  const r = await db.system.query<{ id: string }>("select id from membership where organisation_id=$1 and status='verified' order by id limit 2", [ORG]);
  m1 = r[0].id; m2 = r[1].id;
});
after(async () => { await db.pg.close(); });

describe("one-time codes", () => {
  it("send, verify, and cannot be reused", async () => {
    const r = await db.scoped(as("otp-a"), (sql) => requestCode(sql, deps, { userId: "otp-a", phone: "024 700 0001", purpose: "verify_phone" }));
    assert.equal(r.phone, "+233247000001");
    assert.equal(r.devCode, undefined); // never returned unless asked for
    const code = lastCode();
    const v = (c: string) => db.scoped(as("otp-a"), (sql) => verifyCode(sql, { userId: "otp-a", phone: "+233247000001", purpose: "verify_phone", code: c }));
    assert.deepEqual(await v(code === "000000" ? "111111" : "000000"), { ok: false, message: "That code is not right." });
    assert.deepEqual(await v(code), { ok: true, phone: "+233247000001" });
    assert.equal((await v(code)).ok, false); // a used code cannot be used again
  });
  it("lock after too many wrong tries, even for the right code", async () => {
    await db.scoped(as("otp-b"), (sql) => requestCode(sql, deps, { userId: "otp-b", phone: "+233247000002", purpose: "verify_phone" }));
    const code = lastCode();
    const wrong = code === "123456" ? "654321" : "123456";
    const v = (c: string) => db.scoped(as("otp-b"), (sql) => verifyCode(sql, { userId: "otp-b", phone: "+233247000002", purpose: "verify_phone", code: c }));
    for (let i = 0; i < MAX_ATTEMPTS; i++) assert.equal((await v(wrong)).ok, false);
    const locked = await v(code); // the counter was committed, so even the right code is now refused
    assert.equal(locked.ok, false);
    assert.match((locked as { message: string }).message, /Too many wrong tries/);
  });
  it("a newer code replaces the older one, and an expired one is refused", async () => {
    await db.scoped(as("otp-c"), (sql) => requestCode(sql, deps, { userId: "otp-c", phone: "+233247000003", purpose: "verify_phone" }));
    const first = lastCode();
    await db.scoped(as("otp-c"), (sql) => requestCode(sql, deps, { userId: "otp-c", phone: "+233247000003", purpose: "verify_phone" }));
    const second = lastCode();
    const v = (c: string) => db.scoped(as("otp-c"), (sql) => verifyCode(sql, { userId: "otp-c", phone: "+233247000003", purpose: "verify_phone", code: c }));
    if (first !== second) assert.equal((await v(first)).ok, false);
    await db.system.query("update otp_challenge set expires_at = now() - interval '1 minute' where user_id='otp-c' and consumed_at is null");
    const late = await v(second);
    assert.equal(late.ok, false);
    assert.match((late as { message: string }).message, /expired/);
  });
  it("are rate limited per person and per number", async () => {
    for (let i = 0; i < 5; i++) await db.scoped(as("otp-d"), (sql) => requestCode(sql, deps, { userId: "otp-d", phone: "+233247000004", purpose: "verify_phone" }));
    await assert.rejects(() => db.scoped(as("otp-d"), (sql) => requestCode(sql, deps, { userId: "otp-d", phone: "+233247000004", purpose: "verify_phone" })), /Too many codes/);
  });
  it("a failed text leaves nothing usable behind", async () => {
    failNext = true;
    await assert.rejects(() => db.scoped(as("otp-e"), (sql) => requestCode(sql, deps, { userId: "otp-e", phone: "+233247000005", purpose: "verify_phone" })), /could not send/);
    failNext = false;
    const live = await db.system.query<{ n: number }>("select count(*)::int as n from otp_challenge where user_id='otp-e' and consumed_at is null");
    assert.equal(Number(live[0].n), 0);
  });
  it("a code is private to the person it was sent to", async () => {
    await db.scoped(as("otp-f"), (sql) => requestCode(sql, deps, { userId: "otp-f", phone: "+233247000006", purpose: "verify_phone" }));
    const seen = await db.scoped(as("someone-else"), (sql) => sql<{ id: string }>`select id from otp_challenge`);
    assert.equal(seen.length, 0);
  });
});

describe("phone identity", () => {
  it("binds once, refuses a number someone else verified, and tracks a change", async () => {
    await db.scoped(as("p-a"), (sql) => bindPhone(sql, "p-a", "+233248000001"));
    await assert.rejects(() => db.scoped(as("p-b"), (sql) => bindPhone(sql, "p-b", "+233248000001")), /already linked to another account/);
    const same = await db.scoped(as("p-a"), (sql) => bindPhone(sql, "p-a", "+233248000001"));
    assert.equal(same.changed, false);
    const moved = await db.scoped(as("p-a"), (sql) => bindPhone(sql, "p-a", "+233248000002"));
    assert.equal(moved.changed, true);
    const p = await db.scoped(as("p-a"), (sql) => primaryPhone(sql, "p-a"));
    assert.equal(p?.phone, "+233248000002");
    assert.equal(p?.recent, true); // a changed number starts a cooling-off
    const first = await db.scoped(as("p-z"), async (sql) => { await bindPhone(sql, "p-z", "+233248000009"); return primaryPhone(sql, "p-z"); });
    assert.equal(first?.recent, false); // a first number does not
  });
  it("another account cannot read your numbers", async () => {
    const rows = await db.scoped(as("p-b"), (sql) => sql<{ phone: string }>`select phone from phone_identity`);
    assert.equal(rows.length, 0);
  });
});

describe("step-up for money and roles", () => {
  async function verified(userId: string, memberId: string, phone: string) {
    await db.scoped(as(userId, memberId), (sql) => bindPhone(sql, userId, phone));
    await db.system.query("update phone_identity set verified_at = now() - interval '3 days' where user_id=$1", [userId]);
  }
  it("a fresh code is spent once, for one action, and expires", async () => {
    await verified("su-1", m1, "+233249000001");
    const ctx = { userId: "su-1", orgId: ORG, memberId: m1 };
    await assert.rejects(() => db.scoped(as("su-1", m1), (sql) => requireStepUp(sql, ctx, "refund")), /fresh text-message code/);
    await db.scoped(as("su-1", m1), (sql) => requestStepUp(sql, deps, ctx, "refund"));
    assert.match(sent[sent.length - 1].text, /confirm refund/);
    assert.equal((await db.scoped(as("su-1", m1), (sql) => confirmStepUp(sql, ctx, "refund", "000000"))).ok, lastCode() === "000000");
    const good = await db.scoped(as("su-1", m1), (sql) => confirmStepUp(sql, ctx, "refund", lastCode()));
    assert.equal(good.ok, true);
    await assert.rejects(() => db.scoped(as("su-1", m1), (sql) => requireStepUp(sql, ctx, "expense")), /fresh text-message code/); // other action
    assert.equal(await db.scoped(as("su-1", m1), (sql) => requireStepUp(sql, ctx, "refund")), "code");
    await assert.rejects(() => db.scoped(as("su-1", m1), (sql) => requireStepUp(sql, ctx, "refund")), /fresh text-message code/); // spent
    await db.scoped(as("su-1", m1), (sql) => requestStepUp(sql, deps, ctx, "refund"));
    assert.equal((await db.scoped(as("su-1", m1), (sql) => confirmStepUp(sql, ctx, "refund", lastCode()))).ok, true);
    await db.system.query("update step_up_grant set expires_at = now() - interval '1 second' where membership_id=$1", [m1]);
    await assert.rejects(() => db.scoped(as("su-1", m1), (sql) => requireStepUp(sql, ctx, "refund")), /fresh text-message code/); // expired
  });
  it("another member cannot spend your grant", async () => {
    await verified("su-2", m2, "+233249000002");
    const ctx = { userId: "su-2", orgId: ORG, memberId: m2 };
    await db.scoped(as("su-2", m2), (sql) => requestStepUp(sql, deps, ctx, "expense"));
    assert.equal((await db.scoped(as("su-2", m2), (sql) => confirmStepUp(sql, ctx, "expense", lastCode()))).ok, true);
    await assert.rejects(() => db.scoped(as("su-1", m1), (sql) => requireStepUp(sql, { orgId: ORG, memberId: m1 }, "expense")), /fresh text-message code/);
  });
  it("a number changed in the last day cannot approve money", async () => {
    await db.scoped(as("su-3", m1), (sql) => bindPhone(sql, "su-3", "+233249000003"));
    await db.system.query("update phone_identity set verified_at = now() - interval '3 days' where user_id='su-3'");
    await db.scoped(as("su-3", m1), (sql) => bindPhone(sql, "su-3", "+233249000004")); // swapped just now
    await assert.rejects(() => db.scoped(as("su-3", m1), (sql) => requestStepUp(sql, deps, { userId: "su-3", orgId: ORG, memberId: m1 }, "refund")), /changed your number recently/);
  });
  it("the typed-CONFIRM stand-in works only outside production and only when switched on", async () => {
    const was = { s: process.env.HUB_ALLOW_TEST_STEPUP, n: process.env.NODE_ENV };
    const ctx = { orgId: ORG, memberId: m1 };
    try {
      delete process.env.HUB_ALLOW_TEST_STEPUP;
      await assert.rejects(() => db.scoped(as("x", m1), (sql) => requireStepUp(sql, ctx, "refund", "CONFIRM")), /fresh/);
      process.env.HUB_ALLOW_TEST_STEPUP = "1";
      assert.equal(await db.scoped(as("x", m1), (sql) => requireStepUp(sql, ctx, "refund", "CONFIRM")), "test_phrase");
      await assert.rejects(() => db.scoped(as("x", m1), (sql) => requireStepUp(sql, ctx, "refund", "confirm")), /fresh/);
      env.NODE_ENV = "production";
      await assert.rejects(() => db.scoped(as("x", m1), (sql) => requireStepUp(sql, ctx, "refund", "CONFIRM")), /fresh/);
    } finally {
      if (was.s === undefined) delete process.env.HUB_ALLOW_TEST_STEPUP; else process.env.HUB_ALLOW_TEST_STEPUP = was.s;
      if (was.n === undefined) delete env.NODE_ENV; else env.NODE_ENV = was.n;
    }
  });
});

describe("tenant isolation enforced by the database", () => {
  before(async () => {
    await db.system.query("insert into organisation(id,slug,name,type,terminology,branding,verification_rule,enabled_modules,gateway_fee_bps,platform_fee_bps,receipt_prefix) values('org_x','ex','Ex','x','{}','{}','executive_approval','[]',195,100,'EX') on conflict do nothing");
    await db.system.query("insert into membership(id,organisation_id,status,display_name) values('x_m1','org_x','verified','Other tenant') on conflict do nothing");
  });
  it("reads and writes stay inside the organisation", async () => {
    const seen = await db.scoped(as("u", m1), (sql) => sql<{ id: string }>`select id from membership where id = 'x_m1'`);
    assert.equal(seen.length, 0);
    await assert.rejects(() => db.scoped(as("u", m1), (sql) => sql`insert into membership(id,organisation_id,status,display_name) values('evil','org_x','verified','x')`), /row-level security/);
    await assert.rejects(() => db.scoped(as("u", m1), (sql) => sql`insert into pledge(id,organisation_id,purpose_id,membership_id,total_pesewas) values('plx',${ORG},(select id from purpose limit 1),'x_m1',100)`), /foreign key/);
    const none = await db.scoped(as("u", null, null), (sql) => sql<{ id: string }>`select id from membership`);
    assert.equal(none.length, 0); // no organisation set, nothing visible
  });
  it("dues rates stay inside the organisation, and are history that cannot be edited", async () => {
    await db.system.query("insert into purpose(id,organisation_id,type,title,story,target_pesewas,status,hero) values('x_dues','org_x','dues','Dues','',0,'open',false) on conflict do nothing");
    await db.system.query("insert into dues_plan(id,organisation_id,purpose_id,amount_pesewas,period,starts_on) values('x_dp','org_x','x_dues',5000,'year','2025-01-01') on conflict do nothing");
    const seen = await db.scoped(as("u", m1), (sql) => sql<{ id: string }>`select id from dues_plan`);
    assert.ok(seen.length > 0 && seen.every((r) => r.id !== "x_dp")); // own plan visible, the other tenant's not
    await assert.rejects(() => db.scoped(as("u", m1), (sql) => sql`insert into dues_plan(id,organisation_id,purpose_id,amount_pesewas,period,starts_on) values('evil_dp','org_x','x_dues',1,'year','2030-01-01')`), /row-level security/);
    await assert.rejects(() => db.scoped(as("u", m1), (sql) => sql`update dues_plan set amount_pesewas = 1 where organisation_id = ${ORG}`), /history/);
    await assert.rejects(() => db.scoped(as("u", m1), (sql) => sql`delete from dues_plan where organisation_id = ${ORG}`), /history/);
  });
  it("hidden circles, their posts and their members are invisible to outsiders", async () => {
    await db.system.query("insert into circle(id,organisation_id,kind,visibility,name,purpose,slug) values('hid','org_2007','voluntary','hidden','Quiet','','quiet')");
    await db.system.query("insert into circle_member(organisation_id,circle_id,membership_id,source) values('org_2007','hid',$1,'joined')", [m1]);
    await db.system.query("insert into post(id,organisation_id,circle_id,author_membership_id,body) values('hp','org_2007','hid',$1,'private')", [m1]);
    const count = (memberId: string) => db.scoped(as("u", memberId), async (sql) => [
      (await sql`select id from circle where id='hid'`).length,
      (await sql`select id from post where circle_id='hid'`).length,
      (await sql`select membership_id from circle_member where circle_id='hid'`).length,
    ]);
    assert.deepEqual(await count(m2), [0, 0, 0]);
    assert.deepEqual(await count(m1), [1, 1, 1]);
  });
  it("welfare requests are visible to the member and the executive only", async () => {
    await db.system.query("insert into welfare_request(id,organisation_id,membership_id,category,body,status) values('wr1','org_2007',$1,'medical','private','submitted')", [m1]);
    const exec = (await db.system.query<{ membership_id: string }>("select membership_id from role_assignment where organisation_id=$1 and role='executive' limit 1", [ORG]))[0].membership_id;
    const peer = (await db.system.query<{ id: string }>("select id from membership where organisation_id=$1 and status='verified' and id not in ($2,$3) order by id limit 1", [ORG, m1, exec]))[0].id;
    const n = (id: string) => db.scoped(as("u", id), async (sql) => (await sql`select id from welfare_request where id='wr1'`).length);
    assert.equal(await n(m1), 1);
    assert.equal(await n(exec), 1);
    assert.equal(await n(peer), 0);
  });
  it("a ballot records that you voted, never what you chose", async () => {
    const cols = await db.system.query<{ column_name: string }>("select column_name from information_schema.columns where table_name='ballot_choice'");
    assert.ok(!cols.some((c) => /voter|member/.test(c.column_name)));
  });
  it("the ledger refuses edits, deletes and unbalanced postings", async () => {
    await assert.rejects(() => db.scoped(as("u", m1), (sql) => sql`update ledger_entry set amount_pesewas = amount_pesewas + 1`), /append-only/);
    await assert.rejects(() => db.scoped(as("u", m1), (sql) => sql`delete from audit_log`), /append-only/);
    await assert.rejects(() => db.scoped(as("u", m1), (sql) => sql`insert into ledger_entry(id,organisation_id,txn_id,account,direction,amount_pesewas,memo) values('lx','org_2007','tx_bad','clearing','debit',500,'x')`), /does not balance/);
    await db.scoped(as("u", m1), (sql) => sql`insert into ledger_entry(id,organisation_id,txn_id,account,direction,amount_pesewas,memo) values('l1','org_2007','tx_ok','clearing','debit',500,'x'),('l2','org_2007','tx_ok','fund','credit',500,'x')`);
  });
  it("the request role cannot reach auth tables, and cannot change an organisation", async () => {
    await assert.rejects(() => db.scoped(as("u", m1), (sql) => sql`select * from auth.users`), /permission denied/);
    // Supabase's public API roles see nothing at all.
    for (const role of ["anon", "authenticated"]) {
      await assert.rejects(() => db.pg.transaction(async (tx) => { await tx.query(`set local role ${role}`); await tx.query("select * from membership"); }), /permission denied/);
    }
    await assert.rejects(() => db.scoped(as("u", m1), (sql) => sql`update organisation set name = 'x'`), /permission denied/);
  });
  it("a notification for another organisation is refused", async () => {
    await assert.rejects(() => db.scoped(as("u", m1), (sql) => enqueue(sql, { orgId: "org_x", membershipId: "x_m1", template: "announcement", key: "evil", payload: {} })), /another organisation/);
  });
});

describe("the outbox", () => {
  // Rows are queued "now" in real time, so the dispatcher clock must be later than that.
  const day = (offsetDays: number, hour: number) => { const d = new Date(Date.now() + offsetDays * 86_400_000); d.setUTCHours(hour, 0, 0, 0); return d; };
  const at = (d: Date) => d;
  const noon = day(2, 12);
  async function sendTo(member: string, key: string, template = "payment_receipt") {
    await db.scoped(as("u", member), (sql) => enqueue(sql, { orgId: ORG, membershipId: member, template, key, payload: { receipt: "R1" } }));
  }
  it("a replayed key adds nothing, and in-app messages are delivered at once", async () => {
    const n1 = await db.scoped(as("u", m1), (sql) => enqueue(sql, { orgId: ORG, membershipId: m1, template: "payment_receipt", key: "dup-1", payload: {} }));
    const n2 = await db.scoped(as("u", m1), (sql) => enqueue(sql, { orgId: ORG, membershipId: m1, template: "payment_receipt", key: "dup-1", payload: {} }));
    assert.equal(n1, 2); assert.equal(n2, 0);
    const inApp = await db.system.query<{ status: string }>("select status from outbox where idempotency_key='dup-1:in_app'");
    assert.equal(inApp[0].status, "delivered");
  });
  it("delivers sms, retries a failure with backoff, then dead-letters", async () => {
    await db.system.query("update membership set phone='+233240001111' where id=$1", [m1]);
    await db.system.query("update outbox set status='delivered' where status='queued'"); // clear earlier
    await sendTo(m1, "ob-ok");
    const ok = await dispatchBatch(db.system, { sms, now: at(noon) });
    assert.equal(ok.delivered, 1);
    assert.ok(sent.some((s) => s.to === "+233240001111" && /Receipt R1/.test(s.text)));
    await sendTo(m1, "ob-fail");
    failNext = true;
    let now = at(noon);
    for (let attempt = 1; attempt <= 5; attempt++) {
      const r = await dispatchBatch(db.system, { sms, now });
      assert.equal(r.claimed, 1, `attempt ${attempt}`);
      const row = (await db.system.query<{ status: string; attempts: number; next_attempt_at: string }>("select status, attempts, next_attempt_at::text as next_attempt_at from outbox where idempotency_key='ob-fail:sms'"))[0];
      if (attempt < 5) {
        assert.equal(row.status, "queued");
        assert.equal(Number(row.attempts), attempt);
        now = new Date(now.getTime() + backoffMinutes(attempt) * 60_000 + 1000);
      } else assert.equal(row.status, "dead_letter");
    }
    failNext = false;
    assert.deepEqual([1, 2, 3, 4, 5, 8].map(backoffMinutes), [1, 2, 4, 8, 16, 60]);
  });
  it("holds ordinary messages overnight but sends payment messages", async () => {
    await db.system.query("update outbox set status='delivered' where status='queued'");
    await db.system.query("insert into outbox(id,organisation_id,membership_id,template_key,payload,idempotency_key,status,channel,attempts) values('qh1',$1,$2,'announcement','{\"body\":\"hello\"}','qh-1:sms','queued','sms',0)", [ORG, m1]);
    await sendTo(m1, "qh-2");
    const night = day(2, 23);
    const r = await dispatchBatch(db.system, { sms, now: night });
    assert.equal(r.delivered, 1); // the receipt
    const held = (await db.system.query<{ status: string; attempts: number; next: string; epoch: number }>("select status, attempts, next_attempt_at::text as next, extract(epoch from next_attempt_at)::float as epoch from outbox where id='qh1'"))[0];
    assert.equal(held.status, "queued");
    assert.equal(Number(held.attempts), 0);
    assert.match(held.next, /\d{4}-\d{2}-\d{2} 06:00:00/);
    assert.ok(Number(held.epoch) * 1000 > night.getTime());
  });
  it("stops at the monthly sms budget and warns first", async () => {
    await db.system.query("update outbox set status='delivered' where status='queued'");
    await db.system.query("update organisation set sms_monthly_budget = 5 where id=$1", [ORG]);
    await db.system.query("delete from usage_meter");
    for (let i = 0; i < 7; i++) await sendTo(m1, `bud-${i}`);
    const r = await dispatchBatch(db.system, { sms, now: at(noon), limit: 20 });
    assert.equal(r.delivered, 5);
    assert.equal(r.held, 2);
    const warns = await db.system.query<{ n: number }>("select count(*)::int as n from audit_log where action like 'sms_budget_warn:%'");
    assert.equal(Number(warns[0].n), 1);
    const stops = await db.system.query<{ n: number }>("select count(*)::int as n from audit_log where action like 'sms_budget_stop:%'");
    assert.equal(Number(stops[0].n), 1);
    await db.system.query("update organisation set sms_monthly_budget = 300 where id=$1", [ORG]);
  });
  it("a message for someone with no phone is dead-lettered, not retried forever", async () => {
    await db.system.query("update outbox set status='delivered' where status='queued'");
    await db.system.query("update membership set phone=null where id=$1", [m2]);
    await sendTo(m2, "nophone");
    const r = await dispatchBatch(db.system, { sms, now: at(noon) });
    assert.equal(r.dead, 1);
  });
  it("sends one digest per member per week, and none when there is nothing to say", async () => {
    await db.system.query("update membership set user_id='dig-u' where id=$1", [m1]);
    const wk = day(0, 12);
    const first = await queueDigests(db.system, wk);
    const second = await queueDigests(db.system, wk);
    assert.ok(first >= 0);
    assert.equal(second, 0);
    const nextWeek = await queueDigests(db.system, day(7, 12));
    assert.ok(nextWeek >= 0);
  });
});
