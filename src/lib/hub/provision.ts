import type { Sql } from "../scope-core.ts";
import { fail } from "./util.ts";

export type Node = { name: string; aliases?: string[]; children?: Node[]; cots?: number };
export type OrgConfig = {
  slug: string; name: string; type: string; receiptPrefix: string;
  terminology: Record<string, string>; branding: Record<string, string>;
  verificationRule: string; minGivers?: number; paymentMode?: "test" | "live";
  gatewayFeeBps: number; platformFeeBps: number; reversePlatformFeeOnRefund?: boolean; twoApproverPesewas?: number;
  enabledModules: string[]; listed?: boolean;
  structure: { dimensions: { key: string; name: string; levels: string[]; nodes: Node[] }[] };
  voluntaryCircles?: { name: string; purpose: string; visibility: "open" | "listed" | "hidden" }[];
  purposes?: { type: string; title: string; story: string; targetPesewas: number; hero?: boolean }[];
  founders?: string[];
};

const VERIFICATION_RULES = ["peer_confirmation", "two_cot_peers_or_executive", "executive_approval", "administrator_verification", "invitation"];
export const squash = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "");
const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export function validate(c: OrgConfig): string[] {
  const problems: string[] = [];
  if (!/^[a-z0-9][a-z0-9-]{2,40}$/.test(c.slug ?? "")) problems.push("slug must be lowercase letters, digits and hyphens");
  if (!c.name?.trim()) problems.push("name is required");
  if (!/^[A-Z0-9]{2,12}$/.test(c.receiptPrefix ?? "")) problems.push("receiptPrefix must be 2 to 12 capital letters or digits");
  if (!VERIFICATION_RULES.includes(c.verificationRule)) problems.push(`verificationRule must be one of ${VERIFICATION_RULES.join(", ")}`);
  if (!Number.isInteger(c.gatewayFeeBps) || c.gatewayFeeBps < 0 || c.gatewayFeeBps > 1000) problems.push("gatewayFeeBps must be 0 to 1000");
  if (!Number.isInteger(c.platformFeeBps) || c.platformFeeBps < 0 || c.platformFeeBps > 1000) problems.push("platformFeeBps must be 0 to 1000");
  if ((c.paymentMode ?? "test") === "live") problems.push("provision organisations in test mode and switch to live after the payment account is connected");
  const dims = c.structure?.dimensions ?? [];
  if (dims.length === 0) problems.push("at least one structure dimension is required");
  for (const d of dims) {
    if (!d.levels?.length) problems.push(`dimension ${d.key} needs levels`);
    const walk = (nodes: Node[], depth: number) => {
      for (const n of nodes) {
        if (!n.name?.trim()) problems.push(`a node in ${d.key} has no name`);
        if (depth >= (d.levels?.length ?? 0)) problems.push(`${n.name} is deeper than the levels of ${d.key}`);
        walk(n.children ?? [], depth + 1);
      }
    };
    walk(d.nodes ?? [], 0);
  }
  return problems;
}

export type Plan = { dimensions: number; nodes: number; circles: number; aliases: number; purposes: number; founders: number };

/** Every row the config will create. Pure, so `--dry-run` can show it without a database. */
export function plan(c: OrgConfig): Plan {
  let nodes = 0; let circles = 1;
  const seen = new Set<string>();
  for (const d of c.structure.dimensions) {
    const walk = (list: Node[], depth: number) => {
      for (const n of list) {
        nodes++;
        const level = d.levels[depth];
        if (level !== "cot") circles++;
        if (["house", "programme", "class"].includes(level)) {
          for (const a of [n.name, ...(n.name.includes("-") ? n.name.split("-") : []), ...(n.aliases ?? [])]) {
            const norm = squash(a);
            if (norm.length >= 2) seen.add(norm);
          }
        }
        if (n.cots) nodes += n.cots;
        walk(n.children ?? [], depth + 1);
      }
    };
    walk(d.nodes, 0);
  }
  circles += c.voluntaryCircles?.length ?? 0;
  return { dimensions: c.structure.dimensions.length, nodes, circles, aliases: seen.size, purposes: c.purposes?.length ?? 0, founders: c.founders?.length ?? 0 };
}

/**
 * Create an organisation from its configuration. Idempotent: running it again
 * changes nothing. It never overwrites an existing organisation, because a
 * silent change to a verification rule or a fee is exactly what must not happen.
 */
export async function provision(sql: Sql, c: OrgConfig): Promise<{ created: boolean; organisationId: string; differences: string[]; plan: Plan }> {
  const problems = validate(c);
  if (problems.length) fail(`The configuration is not valid: ${problems.join("; ")}.`);
  const orgId = `org_${slugify(c.slug)}`;
  const existing = await sql<Record<string, unknown>>`select id, name, verification_rule, gateway_fee_bps, platform_fee_bps from organisation where slug = ${c.slug}`;
  if (existing[0]) {
    const diff: string[] = [];
    if (String(existing[0].name) !== c.name) diff.push("name");
    if (String(existing[0].verification_rule) !== c.verificationRule) diff.push("verificationRule");
    if (Number(existing[0].gateway_fee_bps) !== c.gatewayFeeBps) diff.push("gatewayFeeBps");
    if (Number(existing[0].platform_fee_bps) !== c.platformFeeBps) diff.push("platformFeeBps");
    return { created: false, organisationId: String(existing[0].id), differences: diff, plan: plan(c) };
  }
  const taken = await sql<{ id: string }>`select id from organisation where receipt_prefix = ${c.receiptPrefix}`;
  if (taken[0]) fail(`The receipt prefix ${c.receiptPrefix} belongs to another organisation.`);

  await sql`
    insert into organisation (id, slug, name, type, terminology, branding, verification_rule, min_givers, enabled_modules, payment_mode,
                              gateway_fee_bps, platform_fee_bps, reverse_platform_fee_on_refund, expense_two_approver_pesewas, listed, receipt_prefix)
    values (${orgId}, ${c.slug}, ${c.name}, ${c.type}, ${JSON.stringify(c.terminology)}::jsonb, ${JSON.stringify(c.branding)}::jsonb, ${c.verificationRule},
            ${c.minGivers ?? 5}, ${JSON.stringify(c.enabledModules)}::jsonb, 'test', ${c.gatewayFeeBps}, ${c.platformFeeBps},
            ${c.reversePlatformFeeOnRefund === true}, ${c.twoApproverPesewas ?? 200000}, ${c.listed !== false}, ${c.receiptPrefix})
  `;
  await sql`insert into receipt_counter (organisation_id, n) values (${orgId}, 0) on conflict do nothing`;
  const circleSlugs = new Set<string>();
  const addCircle = async (id: string, kind: string, visibility: string, nodeId: string | null, name: string, purpose: string, slug: string) => {
    let s = slug; let i = 2;
    while (circleSlugs.has(s)) s = `${slug}-${i++}`;
    circleSlugs.add(s);
    await sql`insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values (${id}, ${orgId}, ${kind}, ${visibility}, ${nodeId}, ${name}, ${purpose}, ${s})`;
  };
  await addCircle(`${orgId}_year`, "derived", "open", null, c.name, "Everyone in the year group.", "year");

  const aliasSeen = new Set<string>();
  const addAlias = async (nodeId: string, alias: string) => {
    const norm = squash(alias);
    if (norm.length < 2 || aliasSeen.has(norm)) return;
    aliasSeen.add(norm);
    await sql`insert into structure_alias (id, organisation_id, node_id, alias, normalised) values (${`${nodeId}_a_${norm}`}, ${orgId}, ${nodeId}, ${alias}, ${norm})`;
  };

  let dimSort = 0;
  for (const d of c.structure.dimensions) {
    const dimId = `${orgId}_d_${slugify(d.key)}`;
    await sql`insert into structure_dimension (id, organisation_id, key, name, sort) values (${dimId}, ${orgId}, ${d.key}, ${d.name}, ${++dimSort})`;
    const walk = async (list: Node[], depth: number, parent: { id: string; path: string } | null) => {
      let sort = 0;
      for (const n of list) {
        sort++;
        const level = d.levels[depth];
        const path = `${parent ? `${parent.path}.` : ""}${slugify(n.name)}`;
        const id = `${orgId}_n_${slugify(d.key)}_${path.replaceAll(".", "_")}`;
        await sql`
          insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values (${id}, ${orgId}, ${dimId}, ${parent?.id ?? null}, ${level}, ${n.name}, ${n.cots ?? null}, ${path}, ${sort})
        `;
        if (level !== "cot") await addCircle(`${id}_c`, "derived", "open", id, n.name, "", `${slugify(level)}-${path.replaceAll(".", "-")}`);
        if (["house", "programme", "class"].includes(level)) {
          await addAlias(id, n.name);
          if (n.name.includes("-")) for (const part of n.name.split("-")) await addAlias(id, part);
          for (const a of n.aliases ?? []) await addAlias(id, a);
        }
        for (let k = 1; k <= (n.cots ?? 0); k++) {
          // Cot nodes exist from the start. Their circles open on first use.
          await sql`
            insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values (${`${id}_cot${k}`}, ${orgId}, ${dimId}, ${id}, 'cot', ${String(k)}, null, ${`${path}.c_${k}`}, ${k})
          `;
        }
        await walk(n.children ?? [], depth + 1, { id, path });
      }
    };
    await walk(d.nodes, 0, null);
  }
  for (const v of c.voluntaryCircles ?? []) await addCircle(`${orgId}_v_${slugify(v.name)}`, "voluntary", v.visibility, null, v.name, v.purpose, `v-${slugify(v.name)}`);
  for (const p of c.purposes ?? []) {
    await sql`
      insert into purpose (id, organisation_id, type, title, story, target_pesewas, status, hero)
      values (${`${orgId}_p_${slugify(p.title)}`}, ${orgId}, ${p.type}, ${p.title}, ${p.story}, ${p.targetPesewas}, 'open', ${p.hero === true})
    `;
  }
  for (const email of c.founders ?? []) {
    await sql`insert into org_founder (organisation_id, email) values (${orgId}, ${email.trim().toLowerCase()}) on conflict do nothing`;
  }
  return { created: true, organisationId: orgId, differences: [], plan: plan(c) };
}
