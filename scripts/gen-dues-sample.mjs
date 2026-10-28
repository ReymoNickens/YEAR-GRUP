/**
 * The fictional cohort's dues: a GH₵ 240 a year plan from 2025, and a spread of
 * members who are paid up, half-way, or behind. Payments are test-gateway payments
 * with the same ledger lines a real one produces.
 *   node --experimental-strip-types scripts/gen-dues-sample.mjs
 */
import { writeFileSync } from "node:fs";
import { planCollection } from "../src/lib/hub/money.ts";

const ORG = "org_2007";
const q = (s) => (s == null ? "null" : `'${String(s).replaceAll("'", "''")}'`);
const mid = (i) => `mem_${String(i + 1).padStart(2, "0")}`;
const out = [
  "-- Sample only: the fictional cohort's dues. Never loaded into a real year group.",
  `insert into dues_plan (id, organisation_id, purpose_id, amount_pesewas, period, starts_on) values ('dp_2025', ${q(ORG)}, 'pur_dues', 24000, 'year', '2025-01-01') on conflict do nothing;`,
];
// [member index, gift in pesewas, days ago, covers fees]
const paid = [
  [10, 48000, 200, true], [18, 48000, 190, true], [16, 48000, 160, false], [20, 48000, 120, true],
  [8, 48000, 95, false], [21, 48000, 70, true], [27, 48000, 40, true], [2, 48000, 12, false],
  [0, 24000, 300, true], [1, 24000, 290, false], [3, 24000, 280, true], [4, 24000, 260, false],
  [5, 24000, 250, true], [6, 24000, 240, false], [7, 24000, 220, true], [9, 24000, 210, false],
  [12, 24000, 180, true], [14, 24000, 150, false], [22, 36000, 60, true], [25, 12000, 30, false],
  [30, 24000, 20, true], [33, 24000, 8, false],
];
paid.forEach(([i, gift, ago, cover], n) => {
  const plan = planCollection({ gift, gatewayBps: 195, platformBps: 100, coverFees: cover });
  const id = `pi_dues_${String(n + 1).padStart(2, "0")}`;
  const ref = `seed_${id}`;
  out.push(`insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values (${q(id)}, ${q(ORG)}, 'pur_dues', ${q(mid(i))}, null, ${plan.gift}, ${plan.charge}, ${plan.gatewayFee}, ${plan.platformFee}, ${cover}, false, 'succeeded', ${q(ref)}, now() - interval '${ago} days', now() - interval '${ago} days') on conflict do nothing;`);
  out.push(`insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values (${q(`ge_${id}`)}, ${q(ORG)}, ${q(id)}, 'test', ${q(ref)}, ${q(JSON.stringify({ provider: "test", reference: ref, gift }))}::jsonb, ${q(`test:${ref}:seed`)}, 'charge.success', now() - interval '${ago} days') on conflict do nothing;`);
  const values = plan.lines.map((l, li) => `(${q(`le_${id}_${li}`)}, ${q(ORG)}, ${q(`${id}:${l.txn}`)}, ${q(l.account)}, ${q(l.direction)}, ${l.amount}, 'pur_dues', ${q(mid(i))}, ${q(id)}, ${q(`Test gateway ${l.txn}`)})`);
  out.push(`insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values\n  ${values.join(",\n  ")}\non conflict do nothing;`);
  // Numbered from the year group's own counter, so they never collide with receipts already issued.
  out.push(`with c as (update receipt_counter set n = n + 1 where organisation_id = ${q(ORG)} and not exists (select 1 from receipt where intent_id = ${q(id)}) returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select ${q(`rc_${id}`)}, ${q(ORG)}, 'MF2007-' || lpad(c.n::text, 4, '0'), ${q(id)}, 'Year group dues', ${plan.charge}, (now() - interval '${ago} days')::date, false from c;`);
});
writeFileSync(new URL("../supabase/sample/20261029090050_sample_dues.sql", import.meta.url), out.join("\n") + "\n");
console.log(`${paid.length} sample dues payments written.`);
