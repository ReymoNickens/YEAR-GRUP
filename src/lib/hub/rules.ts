/**
 * Profile verification rules. Pure, so every organisation's rule is testable
 * without a database. The organisation row names its rule; unknown rules fail
 * closed and only an administrator can verify.
 */

export type ConfirmerFacts = {
  /** The confirmer's own membership is verified. */
  verified: boolean;
  isClaimant: boolean;
  sharesCot: boolean;
  sharesDorm: boolean;
  isExecutive: boolean;
  isAdmin: boolean;
};

export type ClaimFacts = {
  claimantHasCot: boolean;
  claimantHasDorm: boolean;
  invited: boolean;
  confirmations: ConfirmerFacts[];
};

export type ClaimDecision = { verified: boolean; remaining: number; reason: string };

const PEER_RULES = new Set(["peer_confirmation", "two_cot_peers_or_executive"]);
export const PEERS_NEEDED = 2;

export function isOfficerConfirmer(c: ConfirmerFacts): boolean {
  return !c.isClaimant && (c.isExecutive || c.isAdmin);
}

/** Can this person count as a confirmation under the rule? */
export function eligibleConfirmer(rule: string, c: ConfirmerFacts, claim: Pick<ClaimFacts, "claimantHasCot" | "claimantHasDorm">): boolean {
  if (c.isClaimant) return false;
  if (rule === "administrator_verification") return c.isAdmin;
  if (rule === "executive_approval") return c.isExecutive || c.isAdmin;
  if (rule === "invitation") return c.isExecutive || c.isAdmin;
  if (PEER_RULES.has(rule)) {
    if (c.isExecutive || c.isAdmin) return true;
    if (!c.verified) return false;
    if (claim.claimantHasCot) return c.sharesCot;
    if (claim.claimantHasDorm) return c.sharesDorm;
    return false;
  }
  return c.isAdmin; // unknown rule: fail closed
}

export function evaluateClaim(rule: string, facts: ClaimFacts): ClaimDecision {
  if (rule === "invitation" && facts.invited) {
    return { verified: true, remaining: 0, reason: "An executive invited this number, so the invitation is the proof." };
  }
  const eligible = facts.confirmations.filter((c) => eligibleConfirmer(rule, c, facts));
  if (PEER_RULES.has(rule)) {
    if (eligible.some(isOfficerConfirmer)) {
      return { verified: true, remaining: 0, reason: "An executive confirmed this claim." };
    }
    const peers = eligible.filter((c) => !isOfficerConfirmer(c));
    if (peers.length >= PEERS_NEEDED) {
      return { verified: true, remaining: 0, reason: `${peers.length} verified peers confirmed this claim.` };
    }
    const place = facts.claimantHasCot ? "cot mates" : facts.claimantHasDorm ? "dorm mates" : "peers";
    if (!facts.claimantHasCot && !facts.claimantHasDorm) {
      return { verified: false, remaining: 1, reason: "With no cot or dorm on record, an executive has to confirm this claim." };
    }
    return { verified: false, remaining: PEERS_NEEDED - peers.length, reason: `Waiting for ${PEERS_NEEDED - peers.length} more verified ${place}, or one executive.` };
  }
  if (eligible.length > 0) return { verified: true, remaining: 0, reason: "An authorised officer confirmed this claim." };
  return { verified: false, remaining: 1, reason: "Waiting for an authorised officer." };
}
