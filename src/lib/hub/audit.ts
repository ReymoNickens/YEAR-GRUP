import type { Sql } from "../scope-core.ts";
import { nid } from "./util.ts";

export async function audit(sql: Sql, orgId: string, actor: string | null, action: string, detail: string) {
  await sql`
    insert into audit_log (id, organisation_id, actor_membership_id, action, detail)
    values (${nid("au")}, ${orgId}, ${actor}, ${action}, ${detail})
  `;
}

export async function track(sql: Sql, orgId: string, memberId: string | null, stage: string, name: string, detail = "") {
  await sql`
    insert into usage_event (id, organisation_id, membership_id, stage, name, detail)
    values (${nid("us")}, ${orgId}, ${memberId}, ${stage}, ${name}, ${detail})
  `;
}
