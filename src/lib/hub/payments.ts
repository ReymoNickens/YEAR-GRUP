import type { Sql } from "../scope-core.ts";
import { audit, track } from "./audit.ts";
import { planCollection, planExpensePayout, planRefund, planSettlement, proportionalFee, type LedgerLine } from "./money.ts";
import { enqueue } from "./outbox.ts";
import { fail, nid, num } from "./util.ts";

export type PayOrg = { id: string; name: string; gatewayFeeBps: number; platformFeeBps: number; reversePlatformFeeOnRefund?: boolean };
type Row = Record<string, unknown>;

/** Post balanced lines. The database refuses to commit a transaction that does not balance. */
export async function postLines(
  sql: Sql,
  orgId: string,
  base: string,
  lines: LedgerLine[],
  ctx: { purposeId?: string | null; membershipId?: string | null; intentId?: string | null; memo: string },
) {
  for (const line of lines) {
    await sql`
      insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo)
      values (${nid("le")}, ${orgId}, ${`${base}:${line.txn}`}, ${line.account}, ${line.direction}, ${line.amount},
              ${ctx.purposeId ?? null}, ${ctx.membershipId ?? null}, ${ctx.intentId ?? null}, ${ctx.memo})
    `;
  }
}

/** Per-organisation, gap-free, atomic. The counter row is locked by the update itself. */
export async function nextReceiptNumber(sql: Sql, orgId: string): Promise<string> {
  const n = await sql<{ n: number }>`
    insert into receipt_counter (organisation_id, n) values (${orgId}, 1)
    on conflict (organisation_id) do update set n = receipt_counter.n + 1 returning n
  `;
  const prefix = await sql<{ receipt_prefix: string }>`select receipt_prefix from organisation where id = ${orgId}`;
  return `${prefix[0]?.receipt_prefix ?? "R"}-${String(num(n[0]?.n)).padStart(4, "0")}`;
}

/** Fill instalments oldest first. */
export async function allocate(sql: Sql, pledgeId: string, amount: number) {
  const rows = await sql<{ id: string; amount_pesewas: number; paid_pesewas: number }>`
    select id, amount_pesewas, paid_pesewas from instalment where pledge_id = ${pledgeId} order by seq for update
  `;
  let left = amount;
  for (const row of rows) {
    if (left <= 0) break;
    const room = num(row.amount_pesewas) - num(row.paid_pesewas);
    if (room <= 0) continue;
    const take = Math.min(room, left);
    await sql`update instalment set paid_pesewas = paid_pesewas + ${take} where id = ${row.id}`;
    left -= take;
  }
}

/** A refund reopens instalments, latest paid one first. */
export async function deallocate(sql: Sql, pledgeId: string, amount: number) {
  const rows = await sql<{ id: string; paid_pesewas: number }>`
    select id, paid_pesewas from instalment where pledge_id = ${pledgeId} order by seq desc for update
  `;
  let left = amount;
  for (const row of rows) {
    if (left <= 0) break;
    const take = Math.min(num(row.paid_pesewas), left);
    if (take <= 0) continue;
    await sql`update instalment set paid_pesewas = paid_pesewas - ${take} where id = ${row.id}`;
    left -= take;
  }
}

export type GatewayFact = {
  provider: "test" | "paystack";
  reference: string;
  eventKey: string;
  eventType: string;
  raw: unknown;
  /** The amount the gateway says it took, when it said. Must equal the quote. */
  amount?: number | null;
  paidAt?: string | null;
};

async function recordEvent(sql: Sql, orgId: string, intentId: string, g: GatewayFact) {
  await sql`
    insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at)
    values (${nid("ge")}, ${orgId}, ${intentId}, ${g.provider}, ${g.reference}, ${JSON.stringify(g.raw)}::jsonb, ${g.eventKey}, ${g.eventType}, now())
    on conflict (provider, event_key) do nothing
  `;
}

/**
 * Turn a confirmed gateway payment into ledger postings, exactly once.
 * The intent row is locked first, so a replayed webhook and a member pressing
 * "I have paid" at the same moment cannot both post.
 */
export async function settleIntent(sql: Sql, org: PayOrg, intentId: string, g: GatewayFact): Promise<{ already: boolean; receipt: string | null }> {
  const rows = await sql<Row>`
    select pi.*, pr.title as purpose_title from payment_intent pi join purpose pr on pr.id = pi.purpose_id
    where pi.id = ${intentId} and pi.organisation_id = ${org.id} for update of pi
  `;
  const intent = rows[0];
  if (!intent) fail("That payment is not here.");
  if (String(intent.status) === "succeeded") {
    const have = await sql<{ number: string }>`select number from receipt where intent_id = ${intentId} and refund_of is null limit 1`;
    return { already: true, receipt: have[0]?.number ?? null };
  }
  if (String(intent.status) !== "pending" && String(intent.status) !== "initiated") fail("This payment is no longer waiting.");
  if (String(intent.provider) !== g.provider) fail("That confirmation came from a different gateway than the payment was started with.");

  const plan = planCollection({
    gift: num(intent.gift_pesewas), gatewayBps: org.gatewayFeeBps, platformBps: org.platformFeeBps,
    coverFees: intent.cover_fees === true, settleNow: g.provider === "test",
  });
  if (plan.charge !== num(intent.charge_pesewas)) fail("The fee quote no longer matches this payment. Start again.");
  if (g.amount != null && g.amount !== plan.charge) fail("The gateway amount does not match the payment.");

  await recordEvent(sql, org.id, intentId, g);
  await postLines(sql, org.id, intentId, plan.lines, {
    purposeId: String(intent.purpose_id), membershipId: String(intent.membership_id), intentId,
    memo: g.provider === "test" ? "Test gateway collection" : "Paystack collection",
  });
  if (intent.pledge_id) await allocate(sql, String(intent.pledge_id), plan.gift);
  await sql`update payment_intent set status = 'succeeded', paid_at = ${g.paidAt ?? new Date().toISOString()}, settled_at = ${g.provider === "test" ? new Date().toISOString() : null} where id = ${intentId}`;

  const number = await nextReceiptNumber(sql, org.id);
  await sql`
    insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
    values (${nid("rc")}, ${org.id}, ${number}, ${intentId}, ${String(intent.purpose_title)}, ${plan.charge}, current_date, false)
  `;
  await sql`update shop_order set status = 'paid' where intent_id = ${intentId} and status = 'pending'`;
  await sql`
    insert into rsvp (organisation_id, event_id, membership_id, status)
    select ${org.id}, id, ${String(intent.membership_id)}, 'going' from hub_event
    where organisation_id = ${org.id} and purpose_id = ${String(intent.purpose_id)}
    on conflict (event_id, membership_id) do update set status = 'going'
  `;
  await track(sql, org.id, String(intent.membership_id), "money", "payment_completed", intentId);
  await enqueue(sql, {
    orgId: org.id, membershipId: String(intent.membership_id), template: "payment_receipt", key: `receipt:${intentId}`,
    payload: { receipt: number, amount: plan.charge, body: `Receipt ${number}` },
  });
  return { already: false, receipt: number };
}

export async function failIntent(sql: Sql, org: PayOrg, intentId: string, status: "failed" | "abandoned", g: GatewayFact) {
  const rows = await sql<Row>`select * from payment_intent where id = ${intentId} and organisation_id = ${org.id} for update`;
  const intent = rows[0];
  if (!intent || String(intent.status) !== "pending") return false;
  await recordEvent(sql, org.id, intentId, g);
  await sql`update payment_intent set status = ${status} where id = ${intentId}`;
  if (status === "failed") {
    await enqueue(sql, { orgId: org.id, membershipId: String(intent.membership_id), template: "payment_failed", key: `failed:${intentId}`, payload: { body: "Your payment did not go through." } });
  }
  return true;
}

/** Settle payments the gateway has paid out. Each posts clearing into the bank account. */
export async function confirmSettlement(sql: Sql, org: PayOrg, input: { reference: string; byMembershipId: string }) {
  if (!input.reference.trim()) fail("Enter the bank settlement reference.");
  const rows = await sql<Row>`
    select * from payment_intent where organisation_id = ${org.id} and status = 'succeeded' and provider <> 'test' and settled_at is null for update
  `;
  let total = 0;
  for (const intent of rows) {
    const net = num(intent.charge_pesewas) - num(intent.gateway_fee_pesewas) - num(intent.platform_fee_pesewas);
    await postLines(sql, org.id, String(intent.id), planSettlement(net), {
      purposeId: String(intent.purpose_id), membershipId: String(intent.membership_id), intentId: String(intent.id), memo: `Settlement ${input.reference}`,
    });
    await sql`update payment_intent set settled_at = now(), settlement_reference = ${input.reference} where id = ${String(intent.id)}`;
    total += net;
  }
  await audit(sql, org.id, input.byMembershipId, "settlement_confirmed", `${rows.length} payments, ${total} pesewas, reference ${input.reference}`);
  return { payments: rows.length, total };
}

// ---------------------------------------------------------------------------
// Refunds
// ---------------------------------------------------------------------------

/** Already approved, plus requests still waiting. The next refund must fit in what is left. */
export async function refundCommitted(sql: Sql, intentId: string, excludeRefundId?: string) {
  const r = await sql<{ n: number }>`
    select coalesce(sum(amount_pesewas), 0)::int as n from refund
    where intent_id = ${intentId} and status in ('approved', 'awaiting_approval') and id <> ${excludeRefundId ?? ""}
  `;
  return num(r[0]?.n);
}

export async function requestRefund(
  sql: Sql, org: PayOrg,
  input: { intentId: string; amount: number; reason: string; method: "gateway" | "manual"; requesterId: string },
) {
  if (!Number.isInteger(input.amount) || input.amount <= 0) fail("Enter the refund amount.");
  if (input.reason.trim().length < 5) fail("Say why, in a sentence.");
  const rows = await sql<Row>`select * from payment_intent where id = ${input.intentId} and organisation_id = ${org.id} for update`;
  const intent = rows[0];
  if (!intent || String(intent.status) !== "succeeded") fail("Only a settled payment can be refunded.");
  const committed = await refundCommitted(sql, input.intentId);
  const room = num(intent.charge_pesewas) - committed;
  if (input.amount > room) fail(`Only ${room} pesewas of this payment can still be refunded.`);
  const id = nid("rf");
  await sql`
    insert into refund (id, organisation_id, intent_id, amount_pesewas, reason, status, requester_membership_id, method)
    values (${id}, ${org.id}, ${input.intentId}, ${input.amount}, ${input.reason.trim().slice(0, 200)}, 'awaiting_approval', ${input.requesterId}, ${input.method})
  `;
  await audit(sql, org.id, input.requesterId, "refund_requested", `${input.amount} pesewas on ${String(intent.reference)}: ${input.reason.trim().slice(0, 80)}`);
  return { id };
}

export type GatewayRefund = (input: { transaction: string; amount: number }) => Promise<{ reference: string }>;

export async function approveRefund(
  sql: Sql, org: PayOrg,
  input: { refundId: string; approverId: string; gatewayRefund?: GatewayRefund; manualReference?: string },
) {
  const rows = await sql<Row>`select * from refund where id = ${input.refundId} and organisation_id = ${org.id} and status = 'awaiting_approval' for update`;
  const refund = rows[0];
  if (!refund) fail("That refund is not waiting.");
  if (String(refund.requester_membership_id) === input.approverId) fail("The person who requested it cannot approve it.");
  const intents = await sql<Row>`select * from payment_intent where id = ${String(refund.intent_id)} and organisation_id = ${org.id} for update`;
  const intent = intents[0];
  if (!intent || String(intent.status) !== "succeeded") fail("The original payment is not settled in the ledger.");
  const amount = num(refund.amount_pesewas);
  const charge = num(intent.charge_pesewas);
  const others = await refundCommitted(sql, String(intent.id), String(refund.id));
  const approvedBefore = num((await sql<{ n: number }>`select coalesce(sum(amount_pesewas),0)::int as n from refund where intent_id = ${String(intent.id)} and status = 'approved'`)[0]?.n);
  if (approvedBefore + amount > charge) fail("Approving this would refund more than the payment.");
  void others;

  let gatewayRef: string | null = null;
  if (String(refund.method) === "manual") {
    const ref = (input.manualReference ?? "").trim();
    if (ref.length < 3) fail("Attach the reference of the payout made outside the gateway.");
    gatewayRef = ref;
  } else if (String(intent.provider) === "test") {
    gatewayRef = `test_refund_${String(refund.id)}`;
  } else {
    if (!input.gatewayRefund) fail("The gateway is not connected, so this refund cannot be sent.");
    try {
      gatewayRef = (await input.gatewayRefund({ transaction: String(intent.reference), amount })).reference;
    } catch (e) {
      const message = e instanceof Error ? e.message : "The gateway refused the refund.";
      await sql`update refund set last_error = ${message.slice(0, 200)} where id = ${String(refund.id)}`;
      fail(`The gateway refused the refund: ${message}`);
    }
  }

  const share = org.reversePlatformFeeOnRefund ? proportionalFee(num(intent.platform_fee_pesewas), amount, charge) : 0;
  await postLines(sql, org.id, `${String(intent.id)}:r:${String(refund.id)}`, planRefund(amount, share), {
    purposeId: String(intent.purpose_id), membershipId: String(intent.membership_id), intentId: String(intent.id),
    memo: `Refund. Gateway fees kept.${share ? " Platform fee reversed in proportion." : " Platform fee kept."}`,
  });
  if (intent.pledge_id) await deallocate(sql, String(intent.pledge_id), Math.min(amount, num(intent.gift_pesewas)));

  const original = await sql<{ id: string; number: string }>`select id, number from receipt where intent_id = ${String(intent.id)} and refund_of is null and voided = false limit 1`;
  const full = approvedBefore + amount === charge;
  if (full && original[0]) await sql`update receipt set voided = true where id = ${original[0].id}`;
  const number = await nextReceiptNumber(sql, org.id);
  await sql`
    insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided, refund_of)
    values (${nid("rc")}, ${org.id}, ${number}, ${String(intent.id)}, 'Refund', ${amount}, current_date, false, ${original[0]?.number ?? null})
  `;
  await sql`update refund set status = 'approved', approver_membership_id = ${input.approverId}, gateway_reference = ${gatewayRef}, processed_at = now(), last_error = null where id = ${String(refund.id)}`;
  await sql`
    insert into approval (id, organisation_id, subject_type, subject_id, approver_membership_id, decision, step_up)
    values (${nid("ap")}, ${org.id}, 'refund', ${String(refund.id)}, ${input.approverId}, 'approved', 'code')
  `;
  await audit(sql, org.id, input.approverId, "refund_approved", `${number} for ${amount} pesewas${full ? ", payment fully refunded" : ", partial"}`);
  await enqueue(sql, {
    orgId: org.id, membershipId: String(intent.membership_id), template: "refund_processed", key: `refund:${String(refund.id)}`,
    payload: { receipt: number, amount, body: `Refund ${number}` },
  });
  return { receipt: number, full };
}

export async function rejectRefund(sql: Sql, org: PayOrg, input: { refundId: string; approverId: string }) {
  const rows = await sql<Row>`select * from refund where id = ${input.refundId} and organisation_id = ${org.id} and status = 'awaiting_approval' for update`;
  const refund = rows[0];
  if (!refund) fail("That refund is not waiting.");
  if (String(refund.requester_membership_id) === input.approverId) fail("The person who requested it cannot decide it.");
  await sql`update refund set status = 'rejected', approver_membership_id = ${input.approverId}, processed_at = now() where id = ${input.refundId}`;
  await audit(sql, org.id, input.approverId, "refund_rejected", String(refund.reason));
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

/** After approval, record the payment actually made. It leaves the bank account. */
export async function recordExpensePayout(sql: Sql, org: PayOrg, input: { expenseId: string; payerId: string; reference: string }) {
  const rows = await sql<Row>`select * from expense where id = ${input.expenseId} and organisation_id = ${org.id} for update`;
  const exp = rows[0];
  if (!exp) fail("That expense is not here.");
  if (String(exp.status) !== "approved") fail("Only an approved expense can be paid.");
  if (input.reference.trim().length < 3) fail("Enter the payment reference.");
  await postLines(sql, org.id, `${String(exp.id)}`, planExpensePayout(num(exp.amount_pesewas)), { memo: `Expense paid: ${String(exp.memo).slice(0, 80)}` });
  await sql`update expense set status = 'paid', payout_reference = ${input.reference.trim()}, paid_at = now() where id = ${String(exp.id)}`;
  await audit(sql, org.id, input.payerId, "expense_paid", `${String(exp.memo)} (${num(exp.amount_pesewas)} pesewas, ref ${input.reference.trim()})`);
}
