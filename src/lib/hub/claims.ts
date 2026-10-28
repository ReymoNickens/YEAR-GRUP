import type { Sql } from "../scope-core.ts";
import { audit, track } from "./audit.ts";
import { syncDerived, type Placement } from "./circles.ts";
import { advanceRowForMembership } from "./importer.ts";
import { enqueue } from "./outbox.ts";
import { eligibleConfirmer, evaluateClaim, type ConfirmerFacts } from "./rules.ts";
import { devFlag, fail, nid, num } from "./util.ts";

export type OrgRef = { id: string; name: string; verificationRule: string };

type PlacementRow = {
  id: string; status: string; user_id: string | null; display_name: string; phone: string | null;
  house_node_id: string | null; dorm_node_id: string | null; cot_node_id: string | null;
  programme_node_id: string | null; class_node_id: string | null;
};

const asPlacement = (m: PlacementRow): Placement => ({
  id: m.id, programmeNodeId: m.programme_node_id, classNodeId: m.class_node_id,
  houseNodeId: m.house_node_id, dormNodeId: m.dorm_node_id, cotNodeId: m.cot_node_id,
});

async function ensureClaim(sql: Sql, orgId: string, membershipId: string) {
  const have = await sql<{ id: string }>`select id from profile_claim where membership_id = ${membershipId}`;
  if (have[0]) return have[0].id;
  const id = nid("claim");
  await sql`insert into profile_claim (id, organisation_id, membership_id, status, needed) values (${id}, ${orgId}, ${membershipId}, 'open', 2)`;
  return id;
}

/** Make the person the member's verification state says they are. */
async function markVerified(sql: Sql, org: OrgRef, m: PlacementRow, byMembershipId: string | null, reason: string) {
  await sql`update membership set status = 'verified' where id = ${m.id}`;
  await sql`update profile_claim set status = 'verified' where membership_id = ${m.id}`;
  await syncDerived(sql, org.id, asPlacement(m));
  await advanceRowForMembership(sql, org.id, m.id, "verified");
  await audit(sql, org.id, byMembershipId, "claim_verified", `${m.display_name}: ${reason}`);
  await enqueue(sql, { orgId: org.id, membershipId: m.id, template: "claim_update", key: `verified:${m.id}`, payload: { body: "Your place is confirmed. Welcome in." } });
}

/**
 * The executive demo only: let a new visitor skip waiting for cot mates, so they
 * can try giving straight away. The caller checks that demo mode is on.
 */
export async function demoConfirm(sql: Sql, org: OrgRef, membershipId: string) {
  const rows = await sql<PlacementRow>`
    select id, status, user_id, display_name, phone, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id
    from membership where id = ${membershipId} and organisation_id = ${org.id}
  `;
  if (!rows[0]) fail("Join the year group first.");
  if (rows[0].status === "verified") return;
  await markVerified(sql, org, rows[0], null, "confirmed straight away in the demo");
}

/**
 * A person who has proved their phone takes the place that was approved for that
 * number. The place keeps its placement. Whether they are then verified is the
 * organisation's rule, not ours.
 */
export async function claimPlace(sql: Sql, org: OrgRef, userId: string, phone: string): Promise<{ membershipId: string; verified: boolean } | null> {
  const rows = await sql<PlacementRow & { status: string }>`
    select id, status, user_id, display_name, phone, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id
    from membership where organisation_id = ${org.id} and phone = ${phone} and user_id is null and status in ('approved', 'invited') for update
  `;
  const m = rows[0];
  if (!m) return null;
  const wasInvited = m.status === "invited";
  await sql`update membership set user_id = ${userId}, status = 'claimed', phone_verified = true where id = ${m.id}`;
  await ensureClaim(sql, org.id, m.id);
  await advanceRowForMembership(sql, org.id, m.id, "claimed");
  await track(sql, org.id, m.id, "identity", "profile_claimed", "");
  const decision = evaluateClaim(org.verificationRule, {
    claimantHasCot: Boolean(m.cot_node_id), claimantHasDorm: Boolean(m.dorm_node_id), invited: wasInvited, confirmations: [],
  });
  if (decision.verified) await markVerified(sql, org, m, null, decision.reason);
  await audit(sql, org.id, m.id, "claim_opened", "Claimed an approved place by verified phone.");
  return { membershipId: m.id, verified: decision.verified };
}

/** What a confirmer is, relative to the person being confirmed. */
async function confirmerFacts(sql: Sql, orgId: string, claimant: PlacementRow, confirmerId: string): Promise<ConfirmerFacts> {
  const rows = await sql<{ status: string; cot_node_id: string | null; dorm_node_id: string | null }>`
    select status, cot_node_id, dorm_node_id from membership where id = ${confirmerId} and organisation_id = ${orgId}
  `;
  const c = rows[0];
  const roles = await sql<{ role: string }>`select role from role_assignment where membership_id = ${confirmerId} and organisation_id = ${orgId}`;
  const has = (r: string) => roles.some((x) => x.role === r);
  return {
    verified: c?.status === "verified",
    isClaimant: confirmerId === claimant.id,
    sharesCot: Boolean(claimant.cot_node_id) && c?.cot_node_id === claimant.cot_node_id,
    sharesDorm: Boolean(claimant.dorm_node_id) && c?.dorm_node_id === claimant.dorm_node_id,
    isExecutive: has("executive") || has("organisation_admin"),
    isAdmin: has("organisation_admin"),
  };
}

export async function confirmClaim(sql: Sql, org: OrgRef, confirmerId: string, claimantId: string) {
  const rows = await sql<PlacementRow>`
    select id, status, user_id, display_name, phone, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id
    from membership where id = ${claimantId} and organisation_id = ${org.id} for update
  `;
  const claimant = rows[0];
  if (!claimant) fail("That person is not here.");
  if (claimant.status === "verified") return { verified: true, remaining: 0, reason: "Already confirmed." };
  if (claimant.status !== "claimed") fail("That place has not been claimed yet.");
  if (confirmerId === claimant.id) fail("You cannot confirm yourself.");
  const claimId = await ensureClaim(sql, org.id, claimant.id);

  const confirmer = await confirmerFacts(sql, org.id, claimant, confirmerId);
  const placement = { claimantHasCot: Boolean(claimant.cot_node_id), claimantHasDorm: Boolean(claimant.dorm_node_id) };
  if (!eligibleConfirmer(org.verificationRule, confirmer, placement)) fail("You can only confirm people who share your cot, or as an executive.");

  await sql`
    insert into claim_confirmation (organisation_id, claim_id, confirmer_membership_id) values (${org.id}, ${claimId}, ${confirmerId})
    on conflict (claim_id, confirmer_membership_id) do nothing
  `;
  const all = await sql<{ confirmer_membership_id: string }>`select confirmer_membership_id from claim_confirmation where claim_id = ${claimId}`;
  const facts: ConfirmerFacts[] = [];
  for (const c of all) facts.push(await confirmerFacts(sql, org.id, claimant, c.confirmer_membership_id));
  const decision = evaluateClaim(org.verificationRule, { ...placement, invited: false, confirmations: facts });
  await sql`update profile_claim set status = ${decision.verified ? "verified" : "open"} where id = ${claimId}`;
  if (decision.verified) await markVerified(sql, org, claimant, confirmerId, decision.reason);
  else await audit(sql, org.id, confirmerId, "claim_confirmed", `${claimant.display_name}: ${decision.reason}`);
  return decision;
}

/** Everyone waiting, with who has already confirmed them. */
export async function openClaims(sql: Sql, orgId: string) {
  const rows = await sql<{ id: string; display_name: string; cot: string | null; dorm: string | null; house: string | null; confirmations: number }>`
    select m.id, m.display_name, ct.name as cot, d.name as dorm, h.name as house,
      (select count(*)::int from claim_confirmation cc join profile_claim pc on pc.id = cc.claim_id where pc.membership_id = m.id) as confirmations
    from membership m
    left join structure_node ct on ct.id = m.cot_node_id left join structure_node d on d.id = m.dorm_node_id left join structure_node h on h.id = m.house_node_id
    where m.organisation_id = ${orgId} and m.status = 'claimed' order by m.created_at
  `;
  return rows.map((r) => ({ ...r, confirmations: num(r.confirmations) }));
}

// ---------------------------------------------------------------------------
// Enrolment
// ---------------------------------------------------------------------------

export type EnrolForm = {
  displayName: string; programmeId: string; classId: string;
  residence: "placed" | "day" | "unsure"; houseId: string | null; dormId: string | null; cotNumber: number | null;
  profession: string; city: string; circleIds: string[];
};

/**
 * Seat the first officers. Never "the first person to sign up": only an email an
 * administrator listed for this organisation. In a non-production environment
 * HUB_DEV_FOUNDER=1 lets the first real account stand in, so a preview can be shown.
 */
export async function founderStatus(sql: Sql, orgId: string, email: string | null): Promise<boolean> {
  if (email) {
    const listed = await sql<{ email: string }>`select email from org_founder where organisation_id = ${orgId} and lower(email) = ${email.toLowerCase()} and claimed_membership_id is null`;
    if (listed[0]) return true;
  }
  if (devFlag("HUB_DEV_FOUNDER")) {
    const real = await sql<{ n: number }>`select count(*)::int as n from membership where organisation_id = ${orgId} and sample = false`;
    return num(real[0]?.n) === 0;
  }
  return false;
}

/** Create a membership for someone who is not on the list. They still need confirming. */
export async function enrolNewMember(
  sql: Sql, org: OrgRef, userId: string, phone: string, email: string | null, form: EnrolForm,
): Promise<{ membershipId: string; founder: boolean }> {
  const taken = await sql<{ id: string }>`select id from membership where organisation_id = ${org.id} and phone = ${phone}`;
  if (taken[0]) fail("Someone in this year group already has that number. If it is yours, claim your place instead.");
  const cls = await sql<{ id: string; parent_id: string | null }>`
    select id, parent_id from structure_node where id = ${form.classId} and organisation_id = ${org.id} and level = 'class'
  `;
  if (!cls[0] || cls[0].parent_id !== form.programmeId) fail("That class does not sit in that programme.");
  let cotNode: string | null = null;
  if (form.residence === "placed") {
    const dorm = await sql<{ id: string; parent_id: string | null; child_limit: number | null }>`
      select id, parent_id, child_limit from structure_node where id = ${form.dormId} and organisation_id = ${org.id} and level = 'dorm'
    `;
    if (!dorm[0] || dorm[0].parent_id !== form.houseId) fail("That dorm is not in that house.");
    if (form.cotNumber != null) {
      const limit = num(dorm[0].child_limit) || 8;
      if (form.cotNumber < 1 || form.cotNumber > limit) fail("Choose a cot on the grid, or skip it.");
      const cot = await sql<{ id: string }>`
        select id from structure_node where organisation_id = ${org.id} and parent_id = ${form.dormId} and level = 'cot' and sort = ${form.cotNumber}
      `;
      if (!cot[0]) fail("That cot is not in the structure.");
      cotNode = cot[0].id;
    }
  }
  const founder = await founderStatus(sql, org.id, email);
  const id = nid("mem");
  await sql`
    insert into membership (id, organisation_id, user_id, sample, status, display_name, phone, phone_verified, city, profession,
                            house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape)
    values (${id}, ${org.id}, ${userId}, false, ${founder ? "verified" : "claimed"}, ${form.displayName}, ${phone}, true, ${form.city}, ${form.profession},
            ${form.residence === "placed" ? form.houseId : null}, ${form.residence === "placed" ? form.dormId : null}, ${cotNode},
            ${form.programmeId}, ${form.classId}, ${form.residence === "placed" ? null : form.residence})
  `;
  if (founder) {
    for (const role of ["organisation_admin", "executive", "treasurer"]) {
      await sql`insert into role_assignment (id, organisation_id, membership_id, role, scope_type, scope_id, scope_path) values (${nid("role")}, ${org.id}, ${id}, ${role}, 'organisation', null, null)`;
    }
    if (email) await sql`update org_founder set claimed_membership_id = ${id} where organisation_id = ${org.id} and lower(email) = ${email.toLowerCase()}`;
    await sql`insert into profile_claim (id, organisation_id, membership_id, status, needed) values (${nid("claim")}, ${org.id}, ${id}, 'verified', 2)`;
    await audit(sql, org.id, id, "founder_seated", "Seated as the first officers from the organisation's founder list.");
  } else {
    await ensureClaim(sql, org.id, id);
    await audit(sql, org.id, id, "claim_opened", "New member is waiting for confirmation under the organisation's rule.");
  }
  const row = (await sql<PlacementRow>`
    select id, status, user_id, display_name, phone, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id from membership where id = ${id}
  `)[0];
  if (founder) await syncDerived(sql, org.id, asPlacement(row));
  for (const circleId of form.circleIds.slice(0, 8)) {
    const ok = await sql<{ id: string }>`select id from circle where id = ${circleId} and organisation_id = ${org.id} and kind = 'voluntary' and visibility <> 'hidden'`;
    if (ok[0]) await sql`insert into circle_member (organisation_id, circle_id, membership_id, source) values (${org.id}, ${circleId}, ${id}, 'joined') on conflict (circle_id, membership_id) do nothing`;
  }
  await track(sql, org.id, id, "acquisition", "registration_completed", form.residence);
  return { membershipId: id, founder };
}
