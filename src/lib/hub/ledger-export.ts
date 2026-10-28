import type { Sql } from "../scope-core.ts";
import { audit } from "./audit.ts";

/** One CSV cell. Quotes always, and a leading = + - @ is neutralised so a spreadsheet never runs it as a formula. */
export function cell(v: unknown): string {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replaceAll('"', '""')}"`;
}

const cedis = (pesewas: number) => (pesewas / 100).toFixed(2);

/**
 * The whole ledger as CSV, for executives to keep their own copy (brief
 * section 3: export without the owner's help). Gifts given without a name
 * stay anonymous unless the person exporting is the treasurer. The export
 * itself is written to the audit log.
 */
export async function ledgerCsv(sql: Sql, orgId: string, actorId: string, treasurer: boolean): Promise<{ csv: string; rows: number }> {
  const rows = await sql<Record<string, unknown>>`
    select le.created_at, le.txn_id, le.account, le.direction, le.amount_pesewas, le.memo,
           p.title as purpose, pi.reference, pi.anonymous, m.display_name,
           (select r.number from receipt r where r.intent_id = le.intent_id and r.refund_of is null limit 1) as receipt
    from ledger_entry le
    left join purpose p on p.id = le.purpose_id
    left join payment_intent pi on pi.id = le.intent_id
    left join membership m on m.id = le.membership_id
    where le.organisation_id = ${orgId}
    order by le.created_at, le.txn_id, le.direction desc, le.id
  `;
  const header = ["Date (UTC)", "Transaction", "Account", "Debit or credit", "Amount (GHS)", "Purpose", "Giver", "Receipt", "Gateway reference", "Memo"];
  const lines = [header.map(cell).join(",")];
  for (const r of rows) {
    const giver = r.display_name == null ? "" : r.anonymous === true && !treasurer ? "Anonymous" : String(r.display_name);
    lines.push([
      new Date(String(r.created_at)).toISOString(), r.txn_id, r.account, r.direction, cedis(Number(r.amount_pesewas)),
      r.purpose ?? "", giver, r.receipt ?? "", r.reference ?? "", r.memo,
    ].map(cell).join(","));
  }
  await audit(sql, orgId, actorId, "ledger_exported", `${rows.length} ledger lines${treasurer ? ", with names" : ""}`);
  return { csv: `${lines.join("\r\n")}\r\n`, rows: rows.length };
}
