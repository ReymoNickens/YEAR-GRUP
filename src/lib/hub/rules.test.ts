import assert from "node:assert/strict";
import test from "node:test";
import { evaluateClaim, eligibleConfirmer, type ConfirmerFacts } from "./rules.ts";

const peer = (over: Partial<ConfirmerFacts> = {}): ConfirmerFacts => ({
  verified: true, isClaimant: false, sharesCot: true, sharesDorm: true, isExecutive: false, isAdmin: false, ...over,
});
const base = { claimantHasCot: true, claimantHasDorm: true, invited: false };

test("two verified cot mates verify a claim", () => {
  assert.equal(evaluateClaim("peer_confirmation", { ...base, confirmations: [peer()] }).verified, false);
  const d = evaluateClaim("peer_confirmation", { ...base, confirmations: [peer(), peer()] });
  assert.equal(d.verified, true);
});

test("an unverified member never counts, nor does someone from another cot", () => {
  const d = evaluateClaim("two_cot_peers_or_executive", {
    ...base,
    confirmations: [peer({ verified: false }), peer({ sharesCot: false }), peer()],
  });
  assert.equal(d.verified, false);
  assert.equal(d.remaining, 1);
});

test("an executive alone verifies under the peer rules", () => {
  const d = evaluateClaim("peer_confirmation", { ...base, confirmations: [peer({ isExecutive: true, sharesCot: false })] });
  assert.equal(d.verified, true);
});

test("the claimant cannot confirm themselves, even as an executive", () => {
  const me = peer({ isClaimant: true, isExecutive: true });
  assert.equal(eligibleConfirmer("peer_confirmation", me, base), false);
  assert.equal(evaluateClaim("peer_confirmation", { ...base, confirmations: [me, me] }).verified, false);
});

test("without a cot, dorm mates stand in; without either, only an executive can", () => {
  const noCot = { claimantHasCot: false, claimantHasDorm: true, invited: false };
  assert.equal(evaluateClaim("peer_confirmation", { ...noCot, confirmations: [peer({ sharesCot: false }), peer({ sharesCot: false })] }).verified, true);
  const none = { claimantHasCot: false, claimantHasDorm: false, invited: false };
  assert.equal(evaluateClaim("peer_confirmation", { ...none, confirmations: [peer(), peer()] }).verified, false);
  assert.equal(evaluateClaim("peer_confirmation", { ...none, confirmations: [peer({ isExecutive: true })] }).verified, true);
});

test("executive, administrator and invitation rules", () => {
  assert.equal(evaluateClaim("executive_approval", { ...base, confirmations: [peer(), peer()] }).verified, false);
  assert.equal(evaluateClaim("executive_approval", { ...base, confirmations: [peer({ isExecutive: true })] }).verified, true);
  assert.equal(evaluateClaim("administrator_verification", { ...base, confirmations: [peer({ isExecutive: true })] }).verified, false);
  assert.equal(evaluateClaim("administrator_verification", { ...base, confirmations: [peer({ isAdmin: true })] }).verified, true);
  assert.equal(evaluateClaim("invitation", { ...base, invited: true, confirmations: [] }).verified, true);
  assert.equal(evaluateClaim("invitation", { ...base, invited: false, confirmations: [] }).verified, false);
});

test("an unknown rule fails closed", () => {
  assert.equal(evaluateClaim("something_new", { ...base, confirmations: [peer(), peer(), peer({ isExecutive: true })] }).verified, false);
  assert.equal(evaluateClaim("something_new", { ...base, confirmations: [peer({ isAdmin: true })] }).verified, true);
});
