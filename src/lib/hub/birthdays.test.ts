import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { daysUntilBirthday, upcoming } from "./birthdays.ts";

describe("birthdays", () => {
  it("counts today as zero and tomorrow as one", () => {
    assert.equal(daysUntilBirthday(10, 29, "2026-10-29"), 0);
    assert.equal(daysUntilBirthday(10, 30, "2026-10-29"), 1);
  });

  it("wraps into next year", () => {
    assert.equal(daysUntilBirthday(1, 2, "2026-12-30"), 3);
    assert.equal(daysUntilBirthday(10, 28, "2026-10-29"), 364);
  });

  it("keeps 29 February on 1 March in ordinary years", () => {
    assert.equal(daysUntilBirthday(2, 29, "2027-02-27"), 2);
    assert.equal(daysUntilBirthday(2, 29, "2028-02-27"), 2);
  });

  it("ignores impossible dates", () => {
    assert.equal(daysUntilBirthday(13, 1, "2026-10-29"), null);
    assert.equal(daysUntilBirthday(0, 0, "2026-10-29"), null);
  });

  it("keeps only the next days, soonest first", () => {
    const rows = [{ month: 11, day: 5, n: "a" }, { month: 10, day: 30, n: "b" }, { month: 12, day: 25, n: "c" }];
    assert.deepEqual(upcoming(rows, "2026-10-29", 10).map((r) => [r.n, r.inDays]), [["b", 1], ["a", 7]]);
  });
});
