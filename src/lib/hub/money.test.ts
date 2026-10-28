import assert from "node:assert/strict";
import test from "node:test";
import { accountNet, balancesByTxn, planCollection, planRefund } from "./money.ts";

test("uncovered gift balances and clears", () => {
  const plan = planCollection({ gift: 50000, gatewayBps: 195, platformBps: 100, coverFees: false });
  assert.equal(plan.charge, 50000);
  assert.equal(plan.gatewayFee, 975);
  assert.equal(plan.platformFee, 500);
  for (const [, net] of balancesByTxn(plan.lines)) assert.equal(net, 0);
  assert.equal(accountNet(plan.lines, "clearing"), 0);
  assert.equal(accountNet(plan.lines, "fund"), -50000);
  assert.equal(accountNet(plan.lines, "org_bank"), 50000 - 1475);
});

test("covered fees credit the gift, not the fee", () => {
  const plan = planCollection({ gift: 50000, gatewayBps: 195, platformBps: 100, coverFees: true });
  assert.equal(plan.charge, 50000 + 1475);
  for (const [, net] of balancesByTxn(plan.lines)) assert.equal(net, 0);
  assert.equal(accountNet(plan.lines, "clearing"), 0);
  assert.equal(accountNet(plan.lines, "fund"), -50000);
  assert.equal(accountNet(plan.lines, "fees_recovered"), -1475);
  assert.equal(accountNet(plan.lines, "fees_expense"), 1475);
  assert.equal(accountNet(plan.lines, "org_bank"), 50000);
});

test("refund reverses only the fund amount", () => {
  const lines = planRefund(12500);
  assert.equal(balancesByTxn(lines).get("refund"), 0);
  assert.equal(accountNet(lines, "fund"), 12500);
  assert.equal(accountNet(lines, "clearing"), -12500);
  assert.equal(lines.some((l) => l.account === "fees_expense"), false);
});
