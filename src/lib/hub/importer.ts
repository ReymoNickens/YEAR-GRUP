import type { Sql } from "../scope-core.ts";
import { audit } from "./audit.ts";
import { enqueue } from "./outbox.ts";
import { normalisePhone } from "./phone.ts";
import { fail, nid, num } from "./util.ts";

/** RFC 4180 style: quoted fields, doubled quotes, commas and newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((x) => x.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((x) => x.trim() !== "")) rows.push(row);
  return rows;
}

const FIELD_WORDS: Record<string, string[]> = {
  name: ["name", "fullname", "displayname", "member", "oldboy"],
  phone: ["phone", "mobile", "tel", "telephone", "contact", "whatsapp", "number"],
  house: ["house"],
  dorm: ["dorm", "dormitory"],
  cot: ["cot", "bed"],
  programme: ["programme", "program", "course"],
  class: ["class", "form", "classname"],
  profession: ["profession", "occupation", "job", "work"],
  city: ["city", "town", "location", "residence"],
};

export const squash = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "");

/** Map each column to a field, tolerating the way people label spreadsheets. */
export function mapColumns(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  headers.forEach((h, i) => {
    const key = squash(h);
    for (const [field, words] of Object.entries(FIELD_WORDS)) {
      if (map[field] === undefined && words.some((w) => key === w || key.includes(w))) { map[field] = i; break; }
    }
  });
  return map;
}

export type RawRow = { rowNumber: number; cells: Record<string, string> };

export function toRows(text: string): { rows: RawRow[]; mapped: Record<string, number>; headers: string[] } {
  const grid = parseCsv(text);
  if (grid.length < 2) fail("The file needs a header row and at least one person.");
  const headers = grid[0].map((h) => h.trim());
  const mapped = mapColumns(headers);
  if (mapped.name === undefined) fail("There is no name column. Add a column headed Name.");
  const rows = grid.slice(1).map((cells, i) => {
    const out: Record<string, string> = {};
    for (const [field, idx] of Object.entries(mapped)) out[field] = (cells[idx] ?? "").trim();
    return { rowNumber: i + 2, cells: out };
  });
  return { rows, mapped, headers };
}

/** Dice coefficient over character pairs. Good enough to catch "Kwame Mensah" against "Mensah Kwame". */
export function similarity(a: string, b: string): number {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z ]+/g, "").split(" ").filter(Boolean).sort().join(" ");
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  const pairs = (s: string) => { const out = new Map<string, number>(); for (let i = 0; i < s.length - 1; i++) { const p = s.slice(i, i + 2); out.set(p, (out.get(p) ?? 0) + 1); } return out; };
  const px = pairs(x);
  const py = pairs(y);
  let overlap = 0;
  for (const [p, n] of px) overlap += Math.min(n, py.get(p) ?? 0);
  return (2 * overlap) / (Math.max(1, x.length - 1) + Math.max(1, y.length - 1));
}
export const DUPLICATE_THRESHOLD = 0.88;

const DORM_WORDS: Record<string, string> = { upper: "upper", up: "upper", lower: "lower", low: "lower", middle: "middle", mid: "middle", extension: "extension", ext: "extension" };

export type Placement = { houseId: string | null; dormId: string | null; cotId: string | null; programmeId: string | null; classId: string | null };

/** Resolve the names in a row to structure nodes. Unknown names become issues, never guesses. */
export async function resolvePlacement(sql: Sql, orgId: string, cells: Record<string, string>) {
  const issues: string[] = [];
  const p: Placement = { houseId: null, dormId: null, cotId: null, programmeId: null, classId: null };
  const alias = async (text: string, level: string) => {
    const rows = await sql<{ node_id: string }>`
      select a.node_id from structure_alias a join structure_node n on n.id = a.node_id
      where a.organisation_id = ${orgId} and a.normalised = ${squash(text)} and n.level = ${level}
    `;
    return rows.length === 1 ? rows[0].node_id : null;
  };
  if (cells.house) { p.houseId = await alias(cells.house, "house"); if (!p.houseId) issues.push("unknown_house"); }
  if (cells.dorm && p.houseId) {
    const want = DORM_WORDS[squash(cells.dorm)] ?? squash(cells.dorm);
    const rows = await sql<{ id: string }>`
      select id from structure_node where organisation_id = ${orgId} and parent_id = ${p.houseId} and level = 'dorm' and lower(name) = ${want}
    `;
    if (rows[0]) p.dormId = rows[0].id; else issues.push("dorm_not_in_house");
  } else if (cells.dorm && !p.houseId) issues.push("dorm_without_house");
  if (cells.cot && p.dormId) {
    const n = Number(cells.cot.replace(/\D/g, ""));
    const rows = await sql<{ id: string }>`
      select id from structure_node where organisation_id = ${orgId} and parent_id = ${p.dormId} and level = 'cot' and sort = ${n}
    `;
    if (rows[0]) p.cotId = rows[0].id; else issues.push("cot_not_in_dorm");
  }
  if (cells.class) {
    p.classId = await alias(cells.class, "class");
    if (!p.classId) issues.push("unknown_class");
    else {
      const parent = await sql<{ parent_id: string }>`select parent_id from structure_node where id = ${p.classId}`;
      p.programmeId = parent[0]?.parent_id ?? null;
    }
  }
  if (cells.programme) {
    const prog = await alias(cells.programme, "programme");
    if (!prog) issues.push("unknown_programme");
    else if (p.programmeId && p.programmeId !== prog) issues.push("class_not_in_programme");
    else p.programmeId = prog;
  }
  return { placement: p, issues };
}

export const STATES = ["imported", "normalised", "suspected_duplicate", "needs_review", "approved", "invited", "claimed", "verified"] as const;
export type State = (typeof STATES)[number];

/** The only moves a row may make. Anything else is refused. */
export const TRANSITIONS: Record<State, State[]> = {
  imported: ["normalised", "needs_review", "suspected_duplicate"],
  normalised: ["approved", "needs_review"],
  suspected_duplicate: ["approved", "needs_review"],
  needs_review: ["approved", "normalised"],
  approved: ["invited", "claimed", "needs_review"],
  invited: ["claimed"],
  claimed: ["verified"],
  verified: [],
};
export const canMove = (from: string, to: string) => (TRANSITIONS[from as State] ?? []).includes(to as State);

/** Problems that stop a row being approved until someone fixes it. */
export const BLOCKING = new Set(["missing_name", "missing_phone", "bad_phone", "duplicate_in_file", "unknown_house", "dorm_not_in_house", "dorm_without_house", "cot_not_in_dorm", "unknown_class", "unknown_programme", "class_not_in_programme"]);

export async function importCsv(sql: Sql, orgId: string, createdBy: string | null, fileName: string, text: string) {
  const { rows } = toRows(text);
  const batchId = nid("ib");
  await sql`insert into import_batch (id, organisation_id, file_name, created_by, total_rows) values (${batchId}, ${orgId}, ${fileName.slice(0, 120)}, ${createdBy}, ${rows.length})`;
  const members = await sql<{ id: string; display_name: string; phone: string | null }>`select id, display_name, phone from membership where organisation_id = ${orgId}`;
  const seenPhones = new Map<string, number>();
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const id = nid("imp");
    const issues: string[] = [];
    const name = (r.cells.name ?? "").trim();
    const phone = r.cells.phone ? normalisePhone(r.cells.phone) : null;
    if (!name) issues.push("missing_name");
    if (!r.cells.phone) issues.push("missing_phone"); else if (!phone) issues.push("bad_phone");
    if (phone) {
      if (seenPhones.has(phone)) issues.push("duplicate_in_file"); else seenPhones.set(phone, r.rowNumber);
    }
    let matched: string | null = null;
    if (phone) matched = members.find((m) => m.phone === phone)?.id ?? null;
    if (!matched && name) matched = members.find((m) => similarity(m.display_name, name) >= DUPLICATE_THRESHOLD)?.id ?? null;
    const { placement, issues: placeIssues } = await resolvePlacement(sql, orgId, r.cells);
    issues.push(...placeIssues);
    const blocking = issues.some((i) => BLOCKING.has(i));
    const state: State = matched ? "suspected_duplicate" : blocking ? "needs_review" : "normalised";
    counts[state] = (counts[state] ?? 0) + 1;
    await sql`
      insert into import_row (id, organisation_id, batch_id, raw, display_name, phone, status, note, normalised, issues, matched_membership_id)
      values (${id}, ${orgId}, ${batchId}, ${JSON.stringify(r.cells)}::jsonb, ${name || "(no name)"}, ${phone}, ${state},
              ${issues.length ? issues.join(", ") : "Matched cleanly."}, ${JSON.stringify({ displayName: name, phone, placement, profession: r.cells.profession ?? "", city: r.cells.city ?? "" })}::jsonb,
              ${JSON.stringify(issues)}::jsonb, ${matched})
    `;
  }
  await audit(sql, orgId, createdBy, "import_uploaded", `${fileName}: ${rows.length} rows`);
  return { batchId, rows: rows.length, counts };
}

type ImportRow = { id: string; status: string; display_name: string; phone: string | null; normalised: { displayName: string; phone: string | null; placement: Placement; profession: string; city: string } | null; issues: string[]; matched_membership_id: string | null };

async function getRow(sql: Sql, orgId: string, id: string): Promise<ImportRow> {
  const rows = await sql<ImportRow>`select id, status, display_name, phone, normalised, issues, matched_membership_id from import_row where id = ${id} and organisation_id = ${orgId} for update`;
  if (!rows[0]) fail("That row is not in the sheet.");
  return rows[0];
}

export type Decision = "approved" | "needs_review" | "invited";

/** Move one row, refusing illegal moves and approvals with open problems. Approval creates the unclaimed membership. */
export async function reviewRow(sql: Sql, org: { id: string; name: string }, actorId: string, rowId: string, to: Decision, opts: { notDuplicate?: boolean } = {}) {
  const row = await getRow(sql, org.id, rowId);
  if (!canMove(row.status, to)) fail(`A row that is ${row.status.replace("_", " ")} cannot move to ${to.replace("_", " ")}.`);
  if (to === "approved") {
    const blocking = (row.issues ?? []).filter((i) => BLOCKING.has(i));
    if (blocking.length) fail(`Fix this first: ${blocking.join(", ").replaceAll("_", " ")}.`);
    if (row.status === "suspected_duplicate" && !opts.notDuplicate) fail("Confirm this is not the same person before approving.");
    const n = row.normalised;
    if (!n || !n.phone) fail("A phone number is needed to approve this row.");
    const exists = await sql<{ id: string }>`select id from membership where organisation_id = ${org.id} and phone = ${n.phone}`;
    if (exists[0]) fail("Someone in this year group already has that phone number.");
    const mid = nid("mem");
    const pl = n.placement;
    await sql`
      insert into membership (id, organisation_id, user_id, sample, status, display_name, phone, phone_verified, city, profession,
                              house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id)
      values (${mid}, ${org.id}, null, false, 'approved', ${n.displayName}, ${n.phone}, false, ${n.city || null}, ${n.profession || null},
              ${pl.houseId}, ${pl.dormId}, ${pl.cotId}, ${pl.programmeId}, ${pl.classId})
    `;
    await sql`update import_row set status = 'approved', matched_membership_id = ${mid}, note = 'Approved. An unclaimed place is waiting.' where id = ${rowId}`;
    await audit(sql, org.id, actorId, "import_approved", row.display_name);
    return { membershipId: mid };
  }
  if (to === "invited") {
    if (!row.matched_membership_id) fail("Approve the row first.");
    await sql`update import_row set status = 'invited', note = 'Claim invitation queued.' where id = ${rowId}`;
    await sql`update membership set status = 'invited' where id = ${row.matched_membership_id} and status = 'approved'`;
    await enqueue(sql, { orgId: org.id, membershipId: row.matched_membership_id, template: "claim_link", key: `claim:${rowId}`, payload: { org: org.name } });
    await audit(sql, org.id, actorId, "import_invited", row.display_name);
    return { membershipId: row.matched_membership_id };
  }
  await sql`update import_row set status = 'needs_review' where id = ${rowId}`;
  await audit(sql, org.id, actorId, "import_sent_back", row.display_name);
  return { membershipId: null };
}

/** When a person claims or is verified, their import row follows. */
export async function advanceRowForMembership(sql: Sql, orgId: string, membershipId: string, to: "claimed" | "verified") {
  const rows = await sql<{ id: string; status: string }>`select id, status from import_row where organisation_id = ${orgId} and matched_membership_id = ${membershipId} for update`;
  const row = rows[0];
  if (!row) return;
  if (to === "claimed" && canMove(row.status, "claimed")) await sql`update import_row set status = 'claimed' where id = ${row.id}`;
  if (to === "verified" && canMove(row.status, "verified")) await sql`update import_row set status = 'verified' where id = ${row.id}`;
}

export const summary = (counts: Record<string, number>) => Object.entries(counts).map(([k, v]) => `${num(v)} ${k.replace("_", " ")}`).join(", ");
