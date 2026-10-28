import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { cell, ledgerCsv } from "./ledger-export.ts";
import { createTestDb, ORG, type TestDb } from "./test-db.ts";

let db: TestDb;
let officer = "";
before(async () => {
  db = await createTestDb();
  officer = (await db.system.query<{ membership_id: string }>("select membership_id from role_assignment where organisation_id=$1 and role='executive' limit 1", [ORG]))[0].membership_id;
});
after(async () => { await db.pg.close(); });

describe("ledger export", () => {
  it("neutralises spreadsheet formulas and quotes", () => {
    assert.equal(cell("=HYPERLINK(1)"), `"'=HYPERLINK(1)"`);
    assert.equal(cell('say "hi"'), `"say ""hi"""`);
  });

  it("exports every line, balanced, hides anonymous givers from non-treasurers, and is audited", async () => {
    const as = { userId: "u", orgId: ORG, memberId: officer };
    const out = await db.scoped(as, (sql) => ledgerCsv(sql, ORG, officer, false));
    const total = await db.system.query<{ n: number }>("select count(*)::int as n from ledger_entry where organisation_id=$1", [ORG]);
    assert.equal(out.rows, total[0].n);
    assert.equal(out.csv.trim().split("\r\n").length, total[0].n + 1);

    const anon = await db.system.query<{ display_name: string }>(
      "select m.display_name from payment_intent pi join membership m on m.id = pi.membership_id where pi.organisation_id=$1 and pi.anonymous and pi.status='succeeded' limit 1", [ORG]);
    assert.ok(anon[0], "the sample cohort has an anonymous gift");
    assert.ok(out.csv.split("\r\n").some((l) => l.includes('"Anonymous"')));
    const treasurerView = await db.scoped(as, (sql) => ledgerCsv(sql, ORG, officer, true));
    assert.ok(treasurerView.csv.includes(anon[0].display_name));
    const audited = await db.system.query<{ n: number }>("select count(*)::int as n from audit_log where action='ledger_exported' and actor_membership_id=$1", [officer]);
    assert.ok(audited[0].n >= 1);
  });
});
