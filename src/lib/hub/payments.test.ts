import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { approveRefund, confirmSettlement, failIntent, nextReceiptNumber, recordExpensePayout, rejectRefund, requestRefund, settleIntent, type PayOrg } from "./payments.ts";
import { planCollection } from "./money.ts";
import { createTestDb, ORG, type TestDb } from "./test-db.ts";

let db: TestDb;
let purpose = "";
let members: string[] = [];
const org: PayOrg = { id: ORG, name: "Mfantsipim 2007", gatewayFeeBps: 195, platformFeeBps: 100 };

async function newIntent(opts: { gift?: number; cover?: boolean; provider?: "test" | "paystack"; pledge?: string | null; member?: string } = {}) {
  const gift = opts.gift ?? 100_000;
  const plan = planCollection({ gift, gatewayBps: org.gatewayFeeBps, platformBps: org.platformFeeBps, coverFees: opts.cover === true });
  const id = `pi_t${Math.random().toString(36).slice(2, 10)}`;
  await db.system.query(
    `insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, provider)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,false,'pending',$11,$12)`,
    [id, ORG, purpose, opts.member ?? members[0], opts.pledge ?? null, gift, plan.charge, plan.gatewayFee, plan.platformFee, opts.cover === true, `ref_${id}`, opts.provider ?? "test"],
  );
  return { id, plan, reference: `ref_${id}` };
}
const fact = (reference: string, key: string, provider: "test" | "paystack" = "test", amount?: number) =>
  ({ provider, reference, eventKey: key, eventType: "charge.success", raw: { reference }, amount });
const net = async (account: string) => Number((await db.system.query<{ n: number }>(
  "select coalesce(sum(case when direction='debit' then amount_pesewas else -amount_pesewas end),0)::int as n from ledger_entry where account=$1 and organisation_id=$2", [account, ORG]))[0].n);

before(async () => {
  db = await createTestDb();
  purpose = (await db.system.query<{ id: string }>("select id from purpose where organisation_id=$1 and hero order by id limit 1", [ORG]))[0].id;
  members = (await db.system.query<{ id: string }>("select id from membership where organisation_id=$1 and status='verified' order by id limit 4", [ORG])).map((r) => r.id);
});
after(async () => { await db.pg.close(); });

describe("settling a payment", () => {
  it("posts the section 8 lines once, issues one receipt, and is safe to replay", async () => {
    const { id, reference } = await newIntent({ gift: 100_000, cover: false });
    const first = await db.scoped({ userId: "u" , orgId: ORG, memberId: members[0] }, (sql) => settleIntent(sql, org, id, fact(reference, `k1:${id}`)));
    assert.equal(first.already, false);
    assert.match(first.receipt ?? "", /^MF2007-\d{4}$/);
    const again = await db.scoped({ userId: "u", orgId: ORG, memberId: members[0] }, (sql) => settleIntent(sql, org, id, fact(reference, `k2:${id}`)));
    assert.equal(again.already, true);
    assert.equal(again.receipt, first.receipt);
    const lines = await db.system.query<{ n: number }>("select count(*)::int as n from ledger_entry where intent_id=$1", [id]);
    assert.equal(Number(lines[0].n), 6); // pay x2, fee x2, settle x2
    const rc = await db.system.query<{ n: number }>("select count(*)::int as n from receipt where intent_id=$1", [id]);
    assert.equal(Number(rc[0].n), 1);
  });

  it("two settlements racing for the same payment post once", async () => {
    const { id, reference } = await newIntent();
    const run = (k: string) => db.scoped({ userId: "u", orgId: ORG, memberId: members[0] }, (sql) => settleIntent(sql, org, id, fact(reference, k)));
    const results = await Promise.allSettled([run(`ra:${id}`), run(`rb:${id}`)]);
    assert.ok(results.every((r) => r.status === "fulfilled"));
    const lines = await db.system.query<{ n: number }>("select count(*)::int as n from ledger_entry where intent_id=$1", [id]);
    assert.equal(Number(lines[0].n), 6);
  });

  it("refuses an amount that differs from the quote, and a different gateway", async () => {
    const a = await newIntent({ provider: "paystack" });
    await assert.rejects(() => db.scoped({ userId: "u", orgId: ORG, memberId: members[0] }, (sql) => settleIntent(sql, org, a.id, fact(a.reference, `m:${a.id}`, "paystack", a.plan.charge - 1))), /does not match/);
    await assert.rejects(() => db.scoped({ userId: "u", orgId: ORG, memberId: members[0] }, (sql) => settleIntent(sql, org, a.id, fact(a.reference, `g:${a.id}`, "test"))), /different gateway/);
    const left = await db.system.query<{ s: string }>("select status as s from payment_intent where id=$1", [a.id]);
    assert.equal(left[0].s, "pending"); // failed attempts changed nothing, ledger untouched
  });

  it("a live payment leaves clearing open until the bank settles, and ledger balances at every step", async () => {
    const before = await net("clearing");
    const a = await newIntent({ provider: "paystack", gift: 200_000 });
    await db.scoped({ userId: "u", orgId: ORG, memberId: members[0] }, (sql) => settleIntent(sql, org, a.id, fact(a.reference, `p:${a.id}`, "paystack", a.plan.charge)));
    const netAmount = a.plan.charge - a.plan.gatewayFee - a.plan.platformFee;
    assert.equal(await net("clearing") - before, netAmount);
    const s = await db.scoped({ userId: "u", orgId: ORG, memberId: members[0] }, (sql) => confirmSettlement(sql, org, { reference: "BANK-001", byMembershipId: members[0] }));
    assert.ok(s.payments >= 1);
    assert.equal(await net("clearing"), before);
    const bad = await db.system.query<{ n: number }>("select count(*)::int as n from (select txn_id from ledger_entry group by txn_id having sum(case when direction='debit' then amount_pesewas else -amount_pesewas end) <> 0) x");
    assert.equal(Number(bad[0].n), 0);
  });

  it("a covered-fee gift credits the fund only the gift", async () => {
    const a = await newIntent({ gift: 100_000, cover: true });
    await db.scoped({ userId: "u", orgId: ORG, memberId: members[0] }, (sql) => settleIntent(sql, org, a.id, fact(a.reference, `c:${a.id}`)));
    const fund = await db.system.query<{ n: number }>("select coalesce(sum(case when direction='credit' then amount_pesewas else -amount_pesewas end),0)::int as n from ledger_entry where intent_id=$1 and account='fund'", [a.id]);
    assert.equal(Number(fund[0].n), 100_000);
  });

  it("a failed gateway event marks the payment failed and tells the member", async () => {
    const a = await newIntent();
    const ok = await db.scoped({ userId: "u", orgId: ORG, memberId: members[0] }, (sql) => failIntent(sql, org, a.id, "failed", { ...fact(a.reference, `f:${a.id}`), eventType: "charge.failed" }));
    assert.equal(ok, true);
    const m = await db.system.query<{ n: number }>("select count(*)::int as n from outbox where idempotency_key like $1", [`failed:${a.id}%`]);
    assert.ok(Number(m[0].n) >= 1);
  });

  it("a payment cannot be settled from another organisation's scope", async () => {
    await db.system.query("insert into organisation(id,slug,name,type,terminology,branding,verification_rule,enabled_modules,gateway_fee_bps,platform_fee_bps,receipt_prefix) values('org_b','bee','Bee','x','{}','{}','executive_approval','[]',195,100,'BEE') on conflict do nothing");
    const a = await newIntent();
    await assert.rejects(() => db.scoped({ userId: "u", orgId: "org_b", memberId: null }, (sql) => settleIntent(sql, { ...org, id: "org_b" }, a.id, fact(a.reference, `x:${a.id}`))), /not here/);
  });
});

describe("receipt numbers", () => {
  it("are per organisation, sequential and unique under concurrency", async () => {
    await db.system.query("insert into organisation(id,slug,name,type,terminology,branding,verification_rule,enabled_modules,gateway_fee_bps,platform_fee_bps,receipt_prefix) values('org_c','cee','Cee','x','{}','{}','executive_approval','[]',195,100,'CEE') on conflict do nothing");
    const nums = await Promise.all(Array.from({ length: 5 }, () => db.scoped({ userId: "u", orgId: "org_c", memberId: null }, (sql) => nextReceiptNumber(sql, "org_c"))));
    assert.deepEqual([...nums].sort(), ["CEE-0001", "CEE-0002", "CEE-0003", "CEE-0004", "CEE-0005"]);
  });
});

describe("refunds", () => {
  const as = (m: string) => ({ userId: `u-${m}`, orgId: ORG, memberId: m });
  async function paid(gift = 90_000, pledge: string | null = null) {
    const a = await newIntent({ gift, pledge });
    await db.scoped(as(members[0]), (sql) => settleIntent(sql, org, a.id, fact(a.reference, `rp:${a.id}`)));
    return a;
  }

  it("needs a second person, reverses the ledger and issues a refund receipt", async () => {
    const a = await paid();
    const r = await db.scoped(as(members[1]), (sql) => requestRefund(sql, org, { intentId: a.id, amount: 30_000, reason: "Wrong amount entered", method: "gateway", requesterId: members[1] }));
    await assert.rejects(() => db.scoped(as(members[1]), (sql) => approveRefund(sql, org, { refundId: r.id, approverId: members[1] })), /requested it cannot approve/);
    const fundBefore = await net("fund");
    const out = await db.scoped(as(members[2]), (sql) => approveRefund(sql, org, { refundId: r.id, approverId: members[2] }));
    assert.equal(out.full, false);
    assert.equal(await net("fund") - fundBefore, 30_000); // fund is credit-normal, so a debit moves the net up
    const original = await db.system.query<{ voided: boolean }>("select voided from receipt where intent_id=$1 and refund_of is null", [a.id]);
    assert.equal(original[0].voided, false); // partial refund keeps the original receipt
    const refundReceipt = await db.system.query<{ refund_of: string }>("select refund_of from receipt where number=$1", [out.receipt]);
    assert.ok(refundReceipt[0].refund_of);
    const notice = await db.system.query<{ n: number }>("select count(*)::int as n from outbox where idempotency_key like $1", [`refund:${r.id}%`]);
    assert.ok(Number(notice[0].n) >= 1);
  });

  it("can never refund more than the payment in total, even across several requests", async () => {
    const a = await paid(90_000);
    const one = await db.scoped(as(members[1]), (sql) => requestRefund(sql, org, { intentId: a.id, amount: 60_000, reason: "First part back", method: "gateway", requesterId: members[1] }));
    await assert.rejects(() => db.scoped(as(members[1]), (sql) => requestRefund(sql, org, { intentId: a.id, amount: 40_000, reason: "Too much now", method: "gateway", requesterId: members[1] })), /can still be refunded/);
    await db.scoped(as(members[2]), (sql) => approveRefund(sql, org, { refundId: one.id, approverId: members[2] }));
    const two = await db.scoped(as(members[1]), (sql) => requestRefund(sql, org, { intentId: a.id, amount: 30_000, reason: "The rest of it", method: "gateway", requesterId: members[1] }));
    const done = await db.scoped(as(members[3]), (sql) => approveRefund(sql, org, { refundId: two.id, approverId: members[3] }));
    assert.equal(done.full, true);
    const original = await db.system.query<{ voided: boolean }>("select voided from receipt where intent_id=$1 and refund_of is null", [a.id]);
    assert.equal(original[0].voided, true); // fully refunded: original voided
    await assert.rejects(() => db.scoped(as(members[1]), (sql) => requestRefund(sql, org, { intentId: a.id, amount: 1, reason: "Anything at all", method: "gateway", requesterId: members[1] })), /can still be refunded/);
  });

  it("reopens the instalments a refund pays back", async () => {
    await db.system.query("insert into pledge(id,organisation_id,purpose_id,membership_id,total_pesewas) values('pl_t1',$1,$2,$3,90000)", [ORG, purpose, members[0]]);
    for (let i = 1; i <= 3; i++) await db.system.query("insert into instalment(id,organisation_id,pledge_id,due_on,amount_pesewas,paid_pesewas,seq) values($1,$2,'pl_t1',current_date,30000,0,$3)", [`in_t${i}`, ORG, i]);
    const a = await newIntent({ gift: 60_000, pledge: "pl_t1" });
    await db.scoped(as(members[0]), (sql) => settleIntent(sql, org, a.id, fact(a.reference, `pl:${a.id}`)));
    const paidRows = await db.system.query<{ p: number }>("select paid_pesewas as p from instalment where pledge_id='pl_t1' order by seq");
    assert.deepEqual(paidRows.map((r) => Number(r.p)), [30_000, 30_000, 0]);
    const r = await db.scoped(as(members[1]), (sql) => requestRefund(sql, org, { intentId: a.id, amount: 30_000, reason: "One part back", method: "gateway", requesterId: members[1] }));
    await db.scoped(as(members[2]), (sql) => approveRefund(sql, org, { refundId: r.id, approverId: members[2] }));
    const after = await db.system.query<{ p: number }>("select paid_pesewas as p from instalment where pledge_id='pl_t1' order by seq");
    assert.deepEqual(after.map((x) => Number(x.p)), [30_000, 0, 0]); // latest paid instalment reopens first
  });

  it("a live refund goes to the gateway first and a gateway failure changes nothing", async () => {
    const a = await newIntent({ provider: "paystack", gift: 50_000 });
    await db.scoped(as(members[0]), (sql) => settleIntent(sql, org, a.id, fact(a.reference, `lv:${a.id}`, "paystack", a.plan.charge)));
    const r = await db.scoped(as(members[1]), (sql) => requestRefund(sql, org, { intentId: a.id, amount: 10_000, reason: "Duplicate gift", method: "gateway", requesterId: members[1] }));
    const fundBefore = await net("fund");
    await assert.rejects(() => db.scoped(as(members[2]), (sql) => approveRefund(sql, org, { refundId: r.id, approverId: members[2], gatewayRefund: async () => { throw new Error("insufficient balance"); } })), /gateway refused/);
    assert.equal(await net("fund"), fundBefore);
    const st = await db.system.query<{ status: string; last_error: string }>("select status, last_error from refund where id=$1", [r.id]);
    assert.equal(st[0].status, "awaiting_approval");
    const calls: unknown[] = [];
    await db.scoped(as(members[2]), (sql) => approveRefund(sql, org, { refundId: r.id, approverId: members[2], gatewayRefund: async (i) => { calls.push(i); return { reference: "gw_77" }; } }));
    assert.deepEqual(calls, [{ transaction: a.reference, amount: 10_000 }]);
  });

  it("a manual refund needs the payout reference; a rejected one posts nothing", async () => {
    const a = await paid(20_000);
    const m = await db.scoped(as(members[1]), (sql) => requestRefund(sql, org, { intentId: a.id, amount: 5_000, reason: "Mobile money payout", method: "manual", requesterId: members[1] }));
    await assert.rejects(() => db.scoped(as(members[2]), (sql) => approveRefund(sql, org, { refundId: m.id, approverId: members[2] })), /reference/);
    await db.scoped(as(members[2]), (sql) => approveRefund(sql, org, { refundId: m.id, approverId: members[2], manualReference: "MOMO-8841" }));
    const b = await paid(20_000);
    const x = await db.scoped(as(members[1]), (sql) => requestRefund(sql, org, { intentId: b.id, amount: 5_000, reason: "Asked then withdrew", method: "gateway", requesterId: members[1] }));
    const before = await net("fund");
    await db.scoped(as(members[2]), (sql) => rejectRefund(sql, org, { refundId: x.id, approverId: members[2] }));
    assert.equal(await net("fund"), before);
  });

  it("returns the platform fee in proportion only when the organisation says so", async () => {
    const a = await newIntent({ gift: 100_000 });
    const o2: PayOrg = { ...org, reversePlatformFeeOnRefund: true };
    await db.scoped(as(members[0]), (sql) => settleIntent(sql, o2, a.id, fact(a.reference, `pf:${a.id}`)));
    const r = await db.scoped(as(members[1]), (sql) => requestRefund(sql, o2, { intentId: a.id, amount: 50_000, reason: "Half back please", method: "gateway", requesterId: members[1] }));
    await db.scoped(as(members[2]), (sql) => approveRefund(sql, o2, { refundId: r.id, approverId: members[2] }));
    const credit = await db.system.query<{ n: number }>("select coalesce(sum(amount_pesewas),0)::int as n from ledger_entry where intent_id=$1 and account='fees_expense' and direction='credit'", [a.id]);
    assert.equal(Number(credit[0].n), Math.round(a.plan.platformFee * 50_000 / a.plan.charge));
  });
});

describe("expenses", () => {
  it("are paid out of the bank only once approved, and only once", async () => {
    await db.system.query("insert into expense(id,organisation_id,requester_membership_id,amount_pesewas,memo,status) values('ex_t1',$1,$2,45000,'Library shelves','approved'),('ex_t2',$1,$2,1000,'Not approved','submitted')", [ORG, members[0]]);
    const bank = await net("org_bank");
    await assert.rejects(() => db.scoped({ userId: "u", orgId: ORG, memberId: members[1] }, (sql) => recordExpensePayout(sql, org, { expenseId: "ex_t2", payerId: members[1], reference: "CHQ-1" })), /approved/);
    await db.scoped({ userId: "u", orgId: ORG, memberId: members[1] }, (sql) => recordExpensePayout(sql, org, { expenseId: "ex_t1", payerId: members[1], reference: "CHQ-2" }));
    assert.equal(bank - await net("org_bank"), 45_000);
    await assert.rejects(() => db.scoped({ userId: "u", orgId: ORG, memberId: members[1] }, (sql) => recordExpensePayout(sql, org, { expenseId: "ex_t1", payerId: members[1], reference: "CHQ-3" })), /approved/);
  });
});
