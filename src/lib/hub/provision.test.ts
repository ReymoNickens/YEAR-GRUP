import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, describe, it } from "node:test";
import { claimPlace, confirmClaim, enrolNewMember } from "./claims.ts";
import { plan, provision, validate, type OrgConfig } from "./provision.ts";
import { createTestDb, ORG, type TestDb } from "./test-db.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const load = (f: string) => JSON.parse(readFileSync(join(root, "config", "organisations", f), "utf8")) as OrgConfig;
let db: TestDb;

before(async () => { db = await createTestDb(); });
after(async () => { await db.pg.close(); });

describe("provisioning a second organisation", () => {
  const aggrey = load("aggrey-2010.example.json");
  it("rejects a configuration that would cause trouble later", () => {
    assert.ok(validate({ ...aggrey, slug: "A" }).some((p) => /slug/.test(p)));
    assert.ok(validate({ ...aggrey, receiptPrefix: "x" }).some((p) => /receiptPrefix/.test(p)));
    assert.ok(validate({ ...aggrey, verificationRule: "vibes" }).some((p) => /verificationRule/.test(p)));
    assert.ok(validate({ ...aggrey, paymentMode: "live" }).some((p) => /test mode/.test(p)));
    assert.deepEqual(validate(aggrey), []);
  });

  it("creates structure, circles, aliases, purposes and founders from the file alone, with no code change", async () => {
    const out = await db.system.query("select 1");
    void out;
    const r = await provision(db.system, aggrey);
    assert.equal(r.created, true);
    const q = async (text: string) => Number((await db.system.query<{ n: number }>(text, [r.organisationId]))[0].n);
    assert.equal(await q("select count(*)::int as n from structure_node where organisation_id=$1"), plan(aggrey).nodes);
    assert.equal(await q("select count(*)::int as n from structure_node where organisation_id=$1 and level='cot'"), 6 + 6 + 10); // cot nodes exist from the start
    assert.equal(await q("select count(*)::int as n from circle where organisation_id=$1"), plan(aggrey).circles);
    assert.equal(await q("select count(*)::int as n from circle c join structure_node n on n.id=c.node_id where c.organisation_id=$1 and n.level='cot'"), 0); // cot circles open on first use
    assert.equal(await q("select count(*)::int as n from structure_alias where organisation_id=$1"), plan(aggrey).aliases);
    assert.equal(await q("select count(*)::int as n from purpose where organisation_id=$1 and hero"), 1);
    assert.equal(await q("select count(*)::int as n from org_founder where organisation_id=$1 and email='chair@example.com'"), 1);
    const o = (await db.system.query<{ terminology: Record<string, string>; receipt_prefix: string }>("select terminology, receipt_prefix from organisation where id=$1", [r.organisationId]))[0];
    assert.equal(o.terminology.house, "Hall");
    assert.equal(o.receipt_prefix, "AG2010");
  });

  it("is idempotent, reports differences, and never overwrites an existing organisation", async () => {
    const again = await provision(db.system, aggrey);
    assert.equal(again.created, false);
    assert.deepEqual(again.differences, []);
    const edited = await provision(db.system, { ...aggrey, verificationRule: "administrator_verification", platformFeeBps: 999 });
    assert.equal(edited.created, false);
    assert.deepEqual(edited.differences.sort(), ["platformFeeBps", "verificationRule"]);
    const row = (await db.system.query<{ verification_rule: string; platform_fee_bps: number }>("select verification_rule, platform_fee_bps from organisation where slug='aggrey-2010'"))[0];
    assert.equal(row.verification_rule, "executive_approval");
    assert.equal(Number(row.platform_fee_bps), 120);
    await assert.rejects(() => provision(db.system, { ...aggrey, slug: "someone-else", receiptPrefix: "AG2010" }), /belongs to another organisation/);
  });

  it("the Mfantsipim file reproduces the seeded structure exactly", async () => {
    const mf = load("mfantsipim-2007.json");
    const r = await provision(db.system, { ...mf, slug: "mf-copy", receiptPrefix: "MFCOPY" });
    const n = async (org: string, extra = "") => Number((await db.system.query<{ n: number }>(`select count(*)::int as n from structure_node where organisation_id=$1 ${extra}`, [org]))[0].n);
    assert.equal(await n(r.organisationId), await n(ORG));
    assert.equal(await n(r.organisationId, "and level='cot'"), await n(ORG, "and level='cot'"));
    assert.equal(await n(r.organisationId, "and level='dorm'"), 14);
    const circles = async (org: string) => Number((await db.system.query<{ n: number }>("select count(*)::int as n from circle c left join structure_node s on s.id=c.node_id where c.organisation_id=$1 and (s.level is null or s.level <> 'cot') and c.kind='derived'", [org]))[0].n);
    assert.equal(await circles(r.organisationId), await circles(ORG));
  });

  it("the new organisation works end to end under its own rule, and stays invisible to the first", async () => {
    const orgId = "org_aggrey_2010";
    const org = { id: orgId, name: aggrey.name, verificationRule: aggrey.verificationRule };
    const prog = (await db.system.query<{ id: string }>("select id from structure_node where organisation_id=$1 and level='programme' and name='Science'", [orgId]))[0].id;
    const cls = (await db.system.query<{ id: string }>("select id from structure_node where organisation_id=$1 and level='class' and name='S1'", [orgId]))[0].id;
    const house = (await db.system.query<{ id: string }>("select id from structure_node where organisation_id=$1 and level='house' and name='Fraser-Hall'", [orgId]))[0].id;
    const dorm = (await db.system.query<{ id: string }>("select id from structure_node where organisation_id=$1 and level='dorm' and parent_id=$2 and name='North'", [orgId, house]))[0].id;
    const form = { displayName: "Kofi Founder", programmeId: prog, classId: cls, residence: "placed" as const, houseId: house, dormId: dorm, cotNumber: 4, profession: "Engineer", city: "Takoradi", circleIds: [] };
    const as = (u: string, m: string | null = null) => ({ userId: u, orgId, memberId: m });
    const founder = await db.scoped(as("k-1"), (sql) => enrolNewMember(sql, org, "k-1", "+233246660001", "chair@example.com", form));
    assert.equal(founder.founder, true);
    const member = await db.scoped(as("k-2"), (sql) => enrolNewMember(sql, org, "k-2", "+233246660002", null, { ...form, displayName: "Ama Member", cotNumber: 5 }));
    assert.equal(member.founder, false);
    // executive_approval: two cot mates are not enough, an executive is
    const peer = async (id: string) => db.system.query("insert into membership(id,organisation_id,user_id,status,display_name,phone,cot_node_id,dorm_node_id,house_node_id) select $1,$2,$3,'verified',$1,$4,cot_node_id,dorm_node_id,house_node_id from membership where id=$5", [id, orgId, `u-${id}`, `+23324666${id.length}${Math.floor(Math.random() * 9000 + 1000)}`, member.membershipId]);
    await peer("pa"); await peer("pb");
    await assert.rejects(() => db.scoped(as("u-pa", "pa"), (sql) => confirmClaim(sql, org, "pa", member.membershipId)), /share your cot|only/);
    const done = await db.scoped(as("k-1", founder.membershipId), (sql) => confirmClaim(sql, org, founder.membershipId, member.membershipId));
    assert.equal(done.verified, true);
    const cots = await db.system.query<{ n: number }>("select count(*)::int as n from circle c join structure_node s on s.id=c.node_id where c.organisation_id=$1 and s.level='cot'", [orgId]);
    assert.equal(Number(cots[0].n), 2); // one for cot 4, one for cot 5, opened on arrival
    // the first organisation cannot see any of it
    const leak = await db.scoped({ userId: "x", orgId: ORG, memberId: null }, (sql) => sql<{ n: number }>`select count(*)::int as n from membership where organisation_id = ${orgId}`);
    assert.equal(Number(leak[0].n), 0);
    // and a claim by phone for an unlisted number finds nothing
    assert.equal(await db.scoped(as("nobody"), (sql) => claimPlace(sql, org, "nobody", "+233240000999")), null);
  });
});

describe("configuration, not code", () => {
  it("no source file outside tests and fixtures names an organisation", () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) { if (f !== "node_modules") walk(p); continue; }
        if (!/\.(ts|tsx|js|html)$/.test(f) || /\.test\.ts$/.test(f) || f === "test-db.ts" || f === "routeTree.gen.ts") continue;
        if (/mfantsipim|dwen hwe|aggrey/i.test(readFileSync(p, "utf8"))) hits.push(p.replace(root, ""));
      }
    };
    walk(join(root, "src")); walk(join(root, "public"));
    assert.deepEqual(hits, []);
  });
});
