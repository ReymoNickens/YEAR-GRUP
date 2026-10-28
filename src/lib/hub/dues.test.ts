import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { duesStatement } from "./dues.ts";

const yearly = [{ amount: 24000, period: "year" as const, startsOn: "2025-01-01" }];

describe("dues statement", () => {
  it("owes every year since the plan began, up to this one", () => {
    const s = duesStatement(yearly, 0, "2026-10-28");
    assert.deepEqual(s.periods.map((p) => [p.label, p.due, p.state, p.current]), [["2025", 24000, "due", false], ["2026", 24000, "due", true]]);
    assert.equal(s.owed, 48000);
    assert.equal(s.outstanding, 48000);
    assert.equal(s.rate, 24000);
  });
  it("applies payments to the oldest year first, then part-pays the next", () => {
    const s = duesStatement(yearly, 30000, "2026-10-28");
    assert.deepEqual(s.periods.map((p) => [p.label, p.paid, p.state]), [["2025", 24000, "paid"], ["2026", 6000, "part"]]);
    assert.equal(s.outstanding, 18000);
    assert.equal(s.ahead, 0);
  });
  it("keeps what is paid beyond today as paid ahead", () => {
    const s = duesStatement(yearly, 60000, "2026-10-28");
    assert.equal(s.outstanding, 0);
    assert.equal(s.ahead, 12000);
    assert.ok(s.periods.every((p) => p.state === "paid"));
  });
  it("charges each year at the rate in force that year", () => {
    const s = duesStatement([...yearly, { amount: 30000, period: "year", startsOn: "2026-01-01" }], 0, "2026-03-01");
    assert.deepEqual(s.periods.map((p) => p.due), [24000, 30000]);
    assert.equal(s.rate, 30000);
  });
  it("counts months for a monthly plan", () => {
    const s = duesStatement([{ amount: 2000, period: "month", startsOn: "2026-08-15" }], 2000, "2026-10-28");
    assert.deepEqual(s.periods.map((p) => [p.label, p.state]), [["Aug 2026", "paid"], ["Sep 2026", "due"], ["Oct 2026", "due"]]);
    assert.equal(s.outstanding, 4000);
  });
  it("owes nothing before a plan starts, or without a plan", () => {
    assert.equal(duesStatement(yearly, 0, "2024-12-31").owed, 0);
    assert.equal(duesStatement([], 5000, "2026-01-01").ahead, 5000);
  });
  it("refuses fractions of a pesewa", () => {
    assert.throws(() => duesStatement(yearly, 10.5, "2026-01-01"));
  });
});
