import type { Sql } from "../scope-core.ts";
import { nid } from "./util.ts";

export type Placement = {
  id: string;
  programmeNodeId: string | null;
  classNodeId: string | null;
  houseNodeId: string | null;
  dormNodeId: string | null;
  cotNodeId: string | null;
};

/**
 * Put a member in every derived circle their placement implies: the whole
 * year, programme, class, house, dorm and cot. A cot circle is created the
 * first time anyone is placed in that cot, so there are no empty groups.
 */
export async function syncDerived(sql: Sql, orgId: string, m: Placement): Promise<void> {
  const year = await sql<{ id: string }>`select id from circle where organisation_id = ${orgId} and slug = 'year'`;
  const circleIds: string[] = year[0] ? [year[0].id] : [];
  for (const nodeId of [m.programmeNodeId, m.classNodeId, m.houseNodeId, m.dormNodeId]) {
    if (!nodeId) continue;
    const found = await sql<{ id: string }>`select id from circle where organisation_id = ${orgId} and node_id = ${nodeId}`;
    if (found[0]) circleIds.push(found[0].id);
  }
  if (m.cotNodeId) {
    const existing = await sql<{ id: string }>`select id from circle where organisation_id = ${orgId} and node_id = ${m.cotNodeId}`;
    if (existing[0]) circleIds.push(existing[0].id);
    else {
      const node = await sql<{ name: string; path: string }>`
        select name, path from structure_node where id = ${m.cotNodeId} and organisation_id = ${orgId}
      `;
      if (node[0]) {
        const id = nid("cir");
        await sql`
          insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug)
          values (${id}, ${orgId}, 'derived', 'open', ${m.cotNodeId}, ${node[0].name}, 'Opened because a cot mate arrived.',
                  ${`cot-${node[0].path.replaceAll(".", "-")}`})
        `;
        circleIds.push(id);
      }
    }
  }
  for (const circleId of circleIds) {
    await sql`
      insert into circle_member (organisation_id, circle_id, membership_id, source)
      values (${orgId}, ${circleId}, ${m.id}, 'derived')
      on conflict (circle_id, membership_id) do nothing
    `;
  }
}
