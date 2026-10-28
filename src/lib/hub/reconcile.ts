import type { Sql } from "../scope-core.ts";
import { audit } from "./audit.ts";
import type { VerifiedTransaction } from "./paystack.ts";
import { num } from "./util.ts";

export type ReconcileResult = {
  ok: boolean;
  unbalanced: number;
  clearing: { actual: number; expected: number };
  gateway: { checked: number; mismatches: { reference: string; local: number; gateway: number | null; gatewayStatus: string | null; problem: string }[]; skipped: boolean };
};

/**
 * Three independent checks, run for one organisation:
 *  1. every ledger transaction balances,
 *  2. the clearing account equals what the payment rows say is still unsettled
 *     (plus the effect of refunds), so the ledger and the payments agree,
 *  3. the gateway agrees that every settled live payment succeeded for the amount we recorded.
 */
export async function reconcile(
  sql: Sql,
  org: { id: string },
  opts: { actorId: string | null; verify?: (reference: string) => Promise<VerifiedTransaction>; limit?: number },
): Promise<ReconcileResult> {
  const bad = await sql<{ n: number }>`
    select count(*)::int as n from (
      select txn_id from ledger_entry where organisation_id = ${org.id} group by txn_id
      having sum(case when direction = 'debit' then amount_pesewas else -amount_pesewas end) <> 0) x
  `;
  const actual = num((await sql<{ n: number }>`
    select coalesce(sum(case when direction = 'debit' then amount_pesewas else -amount_pesewas end), 0)::int as n
    from ledger_entry where organisation_id = ${org.id} and account = 'clearing'
  `)[0]?.n);
  const unsettled = num((await sql<{ n: number }>`
    select coalesce(sum(charge_pesewas - gateway_fee_pesewas - platform_fee_pesewas), 0)::int as n
    from payment_intent where organisation_id = ${org.id} and status = 'succeeded' and provider <> 'test' and settled_at is null
  `)[0]?.n);
  const refundEffect = num((await sql<{ n: number }>`
    select coalesce(sum(case when direction = 'debit' then amount_pesewas else -amount_pesewas end), 0)::int as n
    from ledger_entry where organisation_id = ${org.id} and account = 'clearing' and txn_id like '%:r:%'
  `)[0]?.n);
  const expected = unsettled + refundEffect;

  const mismatches: ReconcileResult["gateway"]["mismatches"] = [];
  let checked = 0;
  if (opts.verify) {
    const live = await sql<{ reference: string; charge_pesewas: number }>`
      select reference, charge_pesewas from payment_intent
      where organisation_id = ${org.id} and status = 'succeeded' and provider = 'paystack' order by paid_at desc limit ${opts.limit ?? 200}
    `;
    for (const p of live) {
      checked++;
      try {
        const v = await opts.verify(p.reference);
        if (v.status !== "success") mismatches.push({ reference: p.reference, local: num(p.charge_pesewas), gateway: v.amount, gatewayStatus: v.status, problem: "gateway does not show it as successful" });
        else if (v.amount !== num(p.charge_pesewas)) mismatches.push({ reference: p.reference, local: num(p.charge_pesewas), gateway: v.amount, gatewayStatus: v.status, problem: "amount differs" });
      } catch (e) {
        mismatches.push({ reference: p.reference, local: num(p.charge_pesewas), gateway: null, gatewayStatus: null, problem: e instanceof Error ? e.message : "could not verify" });
      }
    }
  }
  const result: ReconcileResult = {
    ok: num(bad[0]?.n) === 0 && actual === expected && mismatches.length === 0,
    unbalanced: num(bad[0]?.n),
    clearing: { actual, expected },
    gateway: { checked, mismatches, skipped: !opts.verify },
  };
  await audit(sql, org.id, opts.actorId, result.ok ? "reconciled_ok" : "reconciled_mismatch",
    `unbalanced ${result.unbalanced}, clearing ${actual} vs ${expected}, gateway checked ${checked}, mismatches ${mismatches.length}`);
  return result;
}
