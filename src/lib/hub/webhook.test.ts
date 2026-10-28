import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { after, before, describe, it } from "node:test";
import { authorisedJob, runDigests, runOutbox, runReconciliation } from "./jobs.ts";
import { planCollection } from "./money.ts";
import { handlePaystackWebhook } from "./webhook.ts";
import type { Sql } from "../scope-core.ts";
import { createTestDb, ORG, type TestDb } from "./test-db.ts";

const SECRET = "sk_test_secret";
let db: TestDb;
let purpose = "";
let member = "";
const sign = (body: string) => createHmac("sha512", SECRET).update(body).digest("hex");
const scoped = <T,>(orgId: string, fn: (sql: Sql) => Promise<T>) => db.scoped({ userId: "", orgId, memberId: null }, (sql) => fn(sql));

async function liveIntent(provider = "paystack") {
  const plan = planCollection({ gift: 100_000, gatewayBps: 195, platformBps: 100, coverFees: false, settleNow: false });
  const id = `pi_w${Math.random().toString(36).slice(2, 9)}`;
  await db.system.query(
    `insert into payment_intent (id, organisation_id, purpose_id, membership_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, provider)
     values ($1,$2,$3,$4,$5,$6,$7,$8,false,false,'pending',$9,$10)`,
    [id, ORG, purpose, member, plan.gift, plan.charge, plan.gatewayFee, plan.platformFee, `c_${id}`, provider],
  );
  return { id, reference: `c_${id}`, charge: plan.charge };
}
const body = (event: string, id: number, reference: string, amount: number) => JSON.stringify({ event, data: { id, reference, amount } });
const post = (raw: string, over: Partial<Parameters<typeof handlePaystackWebhook>[0]> = {}) =>
  handlePaystackWebhook({ rawBody: raw, signature: sign(raw), secret: SECRET, system: db.system, scoped, ...over });
const lines = async (id: string) => Number((await db.system.query<{ n: number }>("select count(*)::int as n from ledger_entry where intent_id=$1", [id]))[0].n);

before(async () => {
  db = await createTestDb();
  purpose = (await db.system.query<{ id: string }>("select id from purpose where organisation_id=$1 and hero limit 1", [ORG]))[0].id;
  member = (await db.system.query<{ id: string }>("select id from membership where organisation_id=$1 and status='verified' limit 1", [ORG]))[0].id;
});
after(async () => { await db.pg.close(); });

describe("paystack webhook", () => {
  it("refuses an unconfigured gateway, a forged signature and an unreadable body", async () => {
    const i = await liveIntent();
    const raw = body("charge.success", 1, i.reference, i.charge);
    assert.equal((await post(raw, { secret: null })).status, 503);
    assert.equal((await post(raw, { signature: "deadbeef" })).status, 401);
    assert.equal((await post(raw, { signature: null })).status, 401);
    assert.equal((await post("not json")).status, 400);
    assert.equal(await lines(i.id), 0); // nothing moved
  });

  it("applies a genuine payment once and answers a replay without posting twice", async () => {
    const i = await liveIntent();
    const raw = body("charge.success", 11, i.reference, i.charge);
    const first = await post(raw);
    assert.deepEqual([first.status, first.body], [200, "Applied."]);
    const again = await post(raw);
    assert.deepEqual([again.status, again.body], [200, "Already applied."]);
    assert.equal(await lines(i.id), 4); // pay x2, fee x2; a live payment leaves clearing open
    const st = await db.system.query<{ status: string }>("select status from payment_intent where id=$1", [i.id]);
    assert.equal(st[0].status, "succeeded");
    const ev = await db.system.query<{ n: number }>("select count(*)::int as n from gateway_event where intent_id=$1", [i.id]);
    assert.equal(Number(ev[0].n), 1);
  });

  it("a failure while posting is retried and the payment is not lost", async () => {
    const i = await liveIntent();
    const raw = body("charge.success", 21, i.reference, i.charge);
    let calls = 0;
    const flaky = <T,>(orgId: string, fn: (sql: Sql) => Promise<T>): Promise<T> => {
      calls++;
      if (calls === 1) return scoped(orgId, async (sql) => { await fn(sql); throw new Error("connection reset"); }); // posted, then died before commit
      return scoped(orgId, fn);
    };
    const first = await post(raw, { scoped: flaky });
    assert.equal(first.status, 500); // the gateway will send it again
    assert.equal(await lines(i.id), 0); // the aborted attempt left nothing behind, not even an event row
    const retry = await post(raw, { scoped: flaky });
    assert.equal(retry.status, 200);
    assert.equal(await lines(i.id), 4);
  });

  it("records an amount mismatch for a person and stops the gateway retrying", async () => {
    const i = await liveIntent();
    const res = await post(body("charge.success", 31, i.reference, i.charge - 1));
    assert.deepEqual([res.status, res.body], [200, "Rejected and logged."]);
    assert.equal(await lines(i.id), 0);
    const a = await db.system.query<{ n: number }>("select count(*)::int as n from audit_log where action='webhook_rejected' and detail like $1", [`%${i.reference}%`]);
    assert.equal(Number(a[0].n), 1);
    const st = await db.system.query<{ status: string }>("select status from payment_intent where id=$1", [i.id]);
    assert.equal(st[0].status, "pending");
  });

  it("ignores unknown references and test-mode payments, and records a failed charge", async () => {
    assert.equal((await post(body("charge.success", 41, "c_nope", 100))).status, 200);
    const t = await liveIntent("test");
    assert.equal((await post(body("charge.success", 42, t.reference, t.charge))).body, "Not a live payment, ignored.");
    assert.equal(await lines(t.id), 0);
    const f = await liveIntent();
    assert.equal((await post(body("charge.failed", 43, f.reference, f.charge))).status, 200);
    const st = await db.system.query<{ status: string }>("select status from payment_intent where id=$1", [f.id]);
    assert.equal(st[0].status, "failed");
    assert.equal(await lines(f.id), 0);
  });

  it("a payment from one organisation's reference cannot be applied inside another's scope", async () => {
    await db.system.query("insert into organisation(id,slug,name,type,terminology,branding,verification_rule,enabled_modules,gateway_fee_bps,platform_fee_bps,receipt_prefix) values('org_w','wee','W','x','{}','{}','executive_approval','[]',195,100,'WEE') on conflict do nothing");
    const i = await liveIntent();
    const raw = body("charge.success", 51, i.reference, i.charge);
    const wrong = await post(raw, { scoped: (_o, fn) => scoped("org_w", fn) });
    assert.equal(wrong.status, 500); // the payment is invisible there, so it is neither posted nor silently dropped
    assert.equal(await lines(i.id), 0);
  });
});

describe("scheduled jobs", () => {
  it("accept only the shared secret", () => {
    assert.ok(authorisedJob("Bearer abc123", "abc123"));
    assert.ok(!authorisedJob("Bearer abc124", "abc123"));
    assert.ok(!authorisedJob(null, "abc123"));
    assert.ok(!authorisedJob("Bearer abc123", null));
    assert.ok(!authorisedJob("", ""));
  });
  it("reconcile every organisation, run the outbox and queue digests", async () => {
    const rec = await runReconciliation(db.system, scoped);
    assert.ok(rec.length >= 1);
    assert.ok(rec.every((r) => typeof r.ok === "boolean"));
    const sms = { name: "fake", configured: true, send: async () => ({ ok: true, id: "x" }) };
    const out = await runOutbox(db.system, sms, new Date(Date.now() + 86_400_000 * 2));
    assert.ok(out.claimed >= 0);
    assert.ok((await runDigests(db.system)).queued >= 0);
  });
});
