import assert from "node:assert/strict";

/** process.env with NODE_ENV writable, so a test can pretend to be production. */
const env = process.env as Record<string, string | undefined>;
import { after, before, describe, it } from "node:test";
import { claimPlace, confirmClaim, enrolNewMember, founderStatus, type EnrolForm, type OrgRef } from "./claims.ts";
import { canMove, importCsv, parseCsv, reviewRow, similarity, toRows } from "./importer.ts";
import { createTestDb, ORG, type TestDb } from "./test-db.ts";

let db: TestDb;
const org: OrgRef = { id: ORG, name: "Mfantsipim 2007", verificationRule: "peer_confirmation" };
const as = (userId: string, memberId: string | null = null) => ({ userId, orgId: ORG, memberId });
let officer = "";
let cot = { id: "", dorm: "", house: "", programme: "", cls: "" };

before(async () => {
  db = await createTestDb();
  officer = (await db.system.query<{ id: string }>("select membership_id as id from role_assignment where organisation_id=$1 and role='executive' limit 1", [ORG]))[0].id;
  const c = (await db.system.query<{ id: string; dorm: string; house: string }>(
    "select c.id, c.parent_id as dorm, d.parent_id as house from structure_node c join structure_node d on d.id=c.parent_id where c.organisation_id=$1 and c.level='cot' and c.sort=3 limit 1", [ORG]))[0];
  const k = (await db.system.query<{ id: string; programme: string }>("select id, parent_id as programme from structure_node where organisation_id=$1 and level='class' and name='S3'", [ORG]))[0];
  cot = { id: c.id, dorm: c.dorm, house: c.house, programme: k.programme, cls: k.id };
});
after(async () => { await db.pg.close(); });

describe("csv", () => {
  it("handles quotes, commas inside quotes, doubled quotes, BOM and blank lines", () => {
    const g = parseCsv('\uFEFFName,Profession,Phone\r\n"Mensah, Kwame","Said ""hello""",0240000001\n\n"Ama",Nurse,0240000002\n');
    assert.deepEqual(g[1], ["Mensah, Kwame", 'Said "hello"', "0240000001"]);
    assert.equal(g.length, 3);
  });
  it("maps differently labelled columns and refuses a file with no name column", () => {
    const { rows, mapped } = toRows("Full Name,Mobile number,House,Dormitory\nAma,024 000 0003,Balmer,Upper\n");
    assert.deepEqual(Object.keys(mapped).sort(), ["dorm", "house", "name", "phone"]);
    assert.equal(rows[0].cells.phone, "024 000 0003");
    assert.throws(() => toRows("Phone,House\n024,Balmer\n"), /name column/);
  });
  it("catches the same person written two ways", () => {
    assert.ok(similarity("Kwame Mensah", "Mensah Kwame") >= 0.88);
    assert.ok(similarity("Kwame Mensah", "Yaw Boateng") < 0.5);
  });
  it("only allows the documented state moves", () => {
    assert.ok(canMove("imported", "normalised") && canMove("approved", "invited") && canMove("invited", "claimed") && canMove("claimed", "verified"));
    assert.ok(!canMove("imported", "approved") && !canMove("verified", "invited") && !canMove("invited", "approved"));
  });
});

describe("import to claim to verified", () => {
  it("resolves aliases, flags problems, and never guesses", async () => {
    const csv = [
      "Name,Phone,House,Dorm,Cot,Class,Profession,City",
      `Esi Mensimah,024 111 0001,Balmer Acquaah,Upper,3,S3,Nurse,Accra`,
      `Kojo Quartey,024 111 0002,Acquaah,Lower,9,S3,Teacher,Tema`,
      `Abena Tetteh,024 111 0006,B-Acquaah,Upper,1,S3,Auditor,Tema`,
      `Nii Armah,024 111 0003,Narnia House,Upper,1,S3,Chef,Kumasi`,
      `Yaa Pokua,02411100,Balmer,Upper,2,A1,Judge,Cape Coast`,
      `Esi Mensimah,024 111 0001,Balmer,Upper,3,S3,Nurse,Accra`,
    ].join("\n");
    const r = await db.scoped(as("admin-user", officer), (sql) => importCsv(sql, ORG, officer, "cohort.csv", csv));
    assert.equal(r.rows, 6);
    const rows = await db.system.query<{ display_name: string; status: string; issues: string[] }>("select display_name, status, issues from import_row where batch_id=$1 order by id", [r.batchId]);
    const by = (n: string, i = 0) => rows.filter((x) => x.display_name === n)[i];
    const esi = rows.filter((x) => x.display_name === "Esi Mensimah");
    assert.equal(esi.filter((x) => x.status === "normalised").length, 1); // alias "Balmer Acquaah" resolved, dorm and cot found
    assert.ok(by("Kojo Quartey").issues.includes("cot_not_in_dorm"));
    assert.equal(by("Kojo Quartey").status, "needs_review"); // the surname "Acquaah" resolved the house, cot 9 does not exist
    assert.ok(by("Abena Tetteh").issues.includes("unknown_house")); // an unlisted abbreviation is never guessed
    await db.system.query("insert into structure_alias(id,organisation_id,node_id,alias,normalised) select 'al_x',organisation_id,node_id,'B-Acquaah','bacquaah' from structure_alias where organisation_id=$1 and normalised='balmeracquaah'", [ORG]);
    const again = await db.scoped(as("admin-user", officer), (sql) => importCsv(sql, ORG, officer, "again.csv", "Name,Phone,House,Dorm,Cot,Class\nAbena Tetteh,024 111 0006,B-Acquaah,Upper,1,S3\n"));
    const fixed = (await db.system.query<{ status: string }>("select status from import_row where batch_id=$1", [again.batchId]))[0];
    assert.equal(fixed.status, "normalised"); // once an administrator adds the alias, it resolves
    assert.ok(by("Nii Armah").issues.includes("unknown_house"));
    assert.ok(by("Yaa Pokua").issues.includes("bad_phone"));
    assert.equal(esi.filter((x) => x.issues.includes("duplicate_in_file")).length, 1); // the second copy in the same file is flagged
  });

  it("will not approve a row with open problems, and a suspected duplicate needs a human decision", async () => {
    const csv = "Name,Phone,House,Dorm,Cot,Class\nBad House,024 222 0001,Nowhere,Upper,1,S3\nKnown Person,024 222 0002,Balmer,Upper,3,S3\n";
    const r = await db.scoped(as("a", officer), (sql) => importCsv(sql, ORG, officer, "two.csv", csv));
    const rows = await db.system.query<{ id: string; display_name: string }>("select id, display_name from import_row where batch_id=$1 order by display_name", [r.batchId]);
    await assert.rejects(() => db.scoped(as("a", officer), (sql) => reviewRow(sql, org, officer, rows[0].id, "approved")), /Fix this first/);
    await assert.rejects(() => db.scoped(as("a", officer), (sql) => reviewRow(sql, org, officer, rows[1].id, "invited")), /cannot move/);
    const dup = await db.scoped(as("a", officer), (sql) => importCsv(sql, ORG, officer, "dup.csv", "Name,Phone\nSomeone Else,024 222 0002\n"));
    const drow = (await db.system.query<{ id: string; status: string }>("select id, status from import_row where batch_id=$1", [dup.batchId]))[0];
    assert.equal(drow.status, "normalised"); // the first copy is not a member until approved
    await db.scoped(as("a", officer), (sql) => reviewRow(sql, org, officer, rows[1].id, "approved"));
    const dup2 = await db.scoped(as("a", officer), (sql) => importCsv(sql, ORG, officer, "dup2.csv", "Name,Phone\nKnown Person,024 222 0002\n"));
    const d2 = (await db.system.query<{ id: string; status: string }>("select id, status from import_row where batch_id=$1", [dup2.batchId]))[0];
    assert.equal(d2.status, "suspected_duplicate");
    await assert.rejects(() => db.scoped(as("a", officer), (sql) => reviewRow(sql, org, officer, d2.id, "approved")), /not the same person/);
  });

  it("approval creates an unclaimed place; a person with the verified phone claims it; two cot mates verify", async () => {
    const csv = "Name,Phone,House,Dorm,Cot,Class,Profession\nAkua Sarpong,024 333 0001,Balmer-Acquaah,Upper,3,S3,Pharmacist\n";
    const r = await db.scoped(as("a", officer), (sql) => importCsv(sql, ORG, officer, "claim.csv", csv));
    const row = (await db.system.query<{ id: string }>("select id from import_row where batch_id=$1", [r.batchId]))[0];
    const { membershipId } = await db.scoped(as("a", officer), (sql) => reviewRow(sql, org, officer, row.id, "approved"));
    const placed = (await db.system.query<{ status: string; user_id: string | null; cot_node_id: string }>("select status, user_id, cot_node_id from membership where id=$1", [membershipId!]))[0];
    assert.equal(placed.status, "approved");
    assert.equal(placed.user_id, null);
    assert.equal(placed.cot_node_id, cot.id);
    await db.scoped(as("a", officer), (sql) => reviewRow(sql, org, officer, row.id, "invited"));
    const sms = await db.system.query<{ n: number }>("select count(*)::int as n from outbox where idempotency_key=$1", [`claim:${row.id}:sms`]);
    assert.equal(Number(sms[0].n), 1);

    // someone with another number gets nothing
    const miss = await db.scoped(as("stranger"), (sql) => claimPlace(sql, org, "stranger", "+233241119999"));
    assert.equal(miss, null);
    const claimed = await db.scoped(as("akua-user"), (sql) => claimPlace(sql, org, "akua-user", "+233243330001"));
    assert.equal(claimed?.membershipId, membershipId);
    assert.equal(claimed?.verified, false); // peer rule: still needs confirming
    // cannot be claimed twice
    assert.equal(await db.scoped(as("thief"), (sql) => claimPlace(sql, org, "thief", "+233243330001")), null);

    // mates: two verified members in the same cot, one in another cot, one unverified in the same cot
    const mk = async (id: string, status: string, cotId: string | null) => db.system.query(
      "insert into membership(id,organisation_id,user_id,status,display_name,phone,cot_node_id,dorm_node_id,house_node_id) values($1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [id, ORG, `u-${id}`, status, id, `+2332400${id.length}${Math.random().toString().slice(2, 6)}`, cotId, cot.dorm, cot.house]);
    await mk("mate_a", "verified", cot.id); await mk("mate_b", "verified", cot.id); await mk("mate_c", "claimed", cot.id);
    const other = (await db.system.query<{ id: string }>("select id from structure_node where organisation_id=$1 and level='cot' and sort=4 and parent_id=$2", [ORG, cot.dorm]))[0].id;
    await mk("far_d", "verified", other);

    await assert.rejects(() => db.scoped(as("u-far_d", "far_d"), (sql) => confirmClaim(sql, org, "far_d", membershipId!)), /share your cot/);
    await assert.rejects(() => db.scoped(as("u-mate_c", "mate_c"), (sql) => confirmClaim(sql, org, "mate_c", membershipId!)), /share your cot/);
    await assert.rejects(() => db.scoped(as("akua-user", membershipId!), (sql) => confirmClaim(sql, org, membershipId!, membershipId!)), /yourself/);
    const one = await db.scoped(as("u-mate_a", "mate_a"), (sql) => confirmClaim(sql, org, "mate_a", membershipId!));
    assert.equal(one.verified, false);
    const again = await db.scoped(as("u-mate_a", "mate_a"), (sql) => confirmClaim(sql, org, "mate_a", membershipId!));
    assert.equal(again.verified, false); // the same person twice still counts once
    const two = await db.scoped(as("u-mate_b", "mate_b"), (sql) => confirmClaim(sql, org, "mate_b", membershipId!));
    assert.equal(two.verified, true);
    const done = (await db.system.query<{ status: string }>("select status from membership where id=$1", [membershipId!]))[0];
    assert.equal(done.status, "verified");
    const inCot = await db.system.query<{ n: number }>("select count(*)::int as n from circle_member cm join circle c on c.id=cm.circle_id where cm.membership_id=$1", [membershipId!]);
    assert.ok(Number(inCot[0].n) >= 5, "year, programme, class, house, dorm and cot circles"); // house, dorm, cot, programme, class + year
    const rowAfter = (await db.system.query<{ status: string }>("select status from import_row where id=$1", [row.id]))[0];
    assert.equal(rowAfter.status, "verified");
  });
});

describe("enrolling someone who is not on the list", () => {
  const form = (over: Partial<EnrolForm> = {}): EnrolForm => ({
    displayName: "Newcomer One", programmeId: cot.programme, classId: cot.cls, residence: "placed", houseId: cot.house, dormId: cot.dorm,
    cotNumber: 3, profession: "Lawyer", city: "Accra", circleIds: [], ...over,
  });
  it("starts unverified, with no officer roles, and the first sign-up is never an officer", async () => {
    const r = await db.scoped(as("new-1"), (sql) => enrolNewMember(sql, org, "new-1", "+233245550001", "first@example.com", form()));
    assert.equal(r.founder, false);
    const roles = await db.system.query<{ n: number }>("select count(*)::int as n from role_assignment where membership_id=$1", [r.membershipId]);
    assert.equal(Number(roles[0].n), 0);
    const m = (await db.system.query<{ status: string; phone_verified: boolean }>("select status, phone_verified from membership where id=$1", [r.membershipId]))[0];
    assert.equal(m.status, "claimed");
    assert.equal(m.phone_verified, true);
  });
  it("seats officers only for an email an administrator listed, once", async () => {
    await db.system.query("insert into org_founder(organisation_id,email) values($1,'chair@example.com')", [ORG]);
    assert.equal(await db.scoped(as("x"), (sql) => founderStatus(sql, ORG, "stranger@example.com")), false);
    assert.equal(await db.scoped(as("x"), (sql) => founderStatus(sql, ORG, "CHAIR@example.com")), true);
    const r = await db.scoped(as("new-2"), (sql) => enrolNewMember(sql, org, "new-2", "+233245550002", "chair@example.com", form({ displayName: "Chair Person", cotNumber: 5 })));
    assert.equal(r.founder, true);
    assert.equal(await db.scoped(as("x"), (sql) => founderStatus(sql, ORG, "chair@example.com")), false);
  });
  it("refuses a number that already belongs to someone and a class outside its programme", async () => {
    await assert.rejects(() => db.scoped(as("new-3"), (sql) => enrolNewMember(sql, org, "new-3", "+233245550001", null, form())), /already has that number/);
    const other = (await db.system.query<{ id: string }>("select id from structure_node where organisation_id=$1 and level='programme' and id<>$2 limit 1", [ORG, cot.programme]))[0].id;
    await assert.rejects(() => db.scoped(as("new-4"), (sql) => enrolNewMember(sql, org, "new-4", "+233245550009", null, form({ programmeId: other }))), /does not sit in that programme/);
  });
  it("the developer founder shortcut is off unless explicitly enabled outside production", async () => {
    const was = { f: process.env.HUB_DEV_FOUNDER, n: process.env.NODE_ENV };
    try {
      await db.system.query("insert into organisation(id,slug,name,type,terminology,branding,verification_rule,enabled_modules,gateway_fee_bps,platform_fee_bps,receipt_prefix) values('org_f','fff','F','x','{}','{}','executive_approval','[]',195,100,'FFF') on conflict do nothing");
      delete process.env.HUB_DEV_FOUNDER;
      assert.equal(await db.scoped({ userId: "x", orgId: "org_f" }, (sql) => founderStatus(sql, "org_f", null)), false);
      process.env.HUB_DEV_FOUNDER = "1";
      assert.equal(await db.scoped({ userId: "x", orgId: "org_f" }, (sql) => founderStatus(sql, "org_f", null)), true);
      env.NODE_ENV = "production";
      assert.equal(await db.scoped({ userId: "x", orgId: "org_f" }, (sql) => founderStatus(sql, "org_f", null)), false);
    } finally {
      if (was.f === undefined) delete process.env.HUB_DEV_FOUNDER; else process.env.HUB_DEV_FOUNDER = was.f;
      if (was.n === undefined) delete env.NODE_ENV; else env.NODE_ENV = was.n;
    }
  });
});
