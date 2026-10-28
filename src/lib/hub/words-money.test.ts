import assert from "node:assert/strict";
import test from "node:test";
import { cedisInWords, localPhone, pledgeParts, timeAgo } from "./words-money.ts";

test("receipt amounts in words", () => {
  assert.equal(cedisInWords(20_000), "Two hundred Ghana cedis");
  assert.equal(cedisInWords(100), "One Ghana cedi");
  assert.equal(cedisInWords(48_525), "Four hundred and eighty-five Ghana cedis and twenty-five pesewas");
  assert.equal(cedisInWords(15_000_000), "One hundred and fifty thousand Ghana cedis");
  assert.equal(cedisInWords(100_500), "One thousand and five Ghana cedis");
});

test("pledge parts add up to the gift", () => {
  assert.deepEqual(pledgeParts(20_000), [6666, 6666, 6668]);
  assert.equal(pledgeParts(10_001).reduce((a, b) => a + b, 0), 10_001);
});

test("time ago and phone formatting", () => {
  const now = Date.parse("2026-10-28T12:00:00Z");
  assert.equal(timeAgo("2026-10-28T11:59:30Z", now), "just now");
  assert.equal(timeAgo("2026-10-28T09:00:00Z", now), "3 hours ago");
  assert.equal(timeAgo("2026-10-27T10:00:00Z", now), "yesterday");
  assert.equal(localPhone("+233244123456"), "024 412 3456");
});
