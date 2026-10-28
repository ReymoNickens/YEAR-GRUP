import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { digestDraft, networkSearch, polish, reminderDraft, routeAsk, tokens, type Ctx } from "./ai.ts";
import { createTestDb, ORG, type TestDb } from "./test-db.ts";

let db: TestDb;
let me = "";
const ctx = (over: Partial<Ctx> = {}): Ctx => ({ orgId: ORG, memberId: me, orgName: "Mfantsipim 2007", aiBudget: 50, ...over });
const as = () => ({ userId: "u", orgId: ORG, memberId: me });

before(async () => {
  db = await createTestDb();
  me = (await db.system.query<{ id: string }>("select id from membership where organisation_id=$1 and status='verified' order by id limit 1", [ORG]))[0].id;
  await db.system.query("update membership set profession='Quantity surveyor', city='Kumasi' where id=(select id from membership where organisation_id=$1 and status='verified' and id<>$2 order by id offset 3 limit 1)", [ORG, me]);
  await db.system.query("insert into organisation(id,slug,name,type,terminology,branding,verification_rule,enabled_modules,gateway_fee_bps,platform_fee_bps,receipt_prefix) values('org_o','oo','O','x','{}','{}','executive_approval','[]',195,100,'OO') on conflict do nothing");
  await db.system.query("insert into membership(id,organisation_id,status,display_name,profession,city) values('o_m1','org_o','verified','Other Tenant','Quantity surveyor','Accra')");
});
after(async () => { await db.pg.close(); });

describe("assistant", () => {
  it("drops filler words and keeps what matters", () => {
    assert.deepEqual(tokens("I need a quantity surveyor in Kumasi please"), ["quantity", "surveyor", "kumasi"]);
  });
  it("finds members from what they put on their profiles, and never another organisation's", async () => {
    const found = await db.scoped(as(), (sql) => networkSearch(sql, ctx(), "Does anyone know a quantity surveyor in Kumasi?"));
    assert.ok(found.length >= 1);
    assert.ok(found[0].reason.includes("surveyor"));
    assert.ok(!found.some((m) => m.membershipId === "o_m1"));
    assert.ok(!found.some((m) => m.membershipId === me));
  });
  it("is capped by the organisation budget", async () => {
    const tight = ctx({ aiBudget: 2 });
    await db.system.query("delete from usage_meter where channel='ai'");
    await db.scoped(as(), (sql) => networkSearch(sql, tight, "surveyor"));
    await db.scoped(as(), (sql) => networkSearch(sql, tight, "surveyor"));
    await assert.rejects(() => db.scoped(as(), (sql) => networkSearch(sql, tight, "surveyor")), /limit/);
  });
  it("only reads: no member, money, role or message record changes", async () => {
    const snap = async () => JSON.stringify(await db.system.query(
      "select (select count(*) from membership) m, (select count(*) from ledger_entry) l, (select count(*) from role_assignment) r, (select count(*) from outbox) o, (select count(*) from post) p"));
    await db.system.query("delete from usage_meter where channel='ai'");
    const before = await snap();
    await db.scoped(as(), async (sql) => { await networkSearch(sql, ctx(), "surveyor"); await digestDraft(sql, ctx()); });
    assert.equal(await snap(), before);
  });
  it("routes a request to people who could answer it, not to the person who asked", async () => {
    const other = (await db.system.query<{ id: string }>("select id from membership where organisation_id=$1 and profession='Quantity surveyor'", [ORG]))[0].id;
    await db.system.query("insert into ask(id,organisation_id,membership_id,category,title,body) values('ask_ai',$1,$2,'professional','Need a quantity surveyor','For a hotel build in Kumasi')", [ORG, me]);
    await db.system.query("delete from usage_meter where channel='ai'");
    const routed = await db.scoped(as(), (sql) => routeAsk(sql, ctx(), "ask_ai"));
    assert.ok(routed.some((m) => m.membershipId === other));
  });
  it("counts the people who have not answered an event, drafts the words, and sends nothing", async () => {
    const ev = (await db.system.query<{ id: string }>("select id from hub_event where organisation_id=$1 limit 1", [ORG]))[0].id;
    await db.system.query("delete from usage_meter where channel='ai'");
    const before = Number((await db.system.query<{ n: number }>("select count(*)::int as n from outbox"))[0].n);
    const r = await db.scoped(as(), (sql) => reminderDraft(sql, ctx(), ev));
    assert.ok(r.audience > 0);
    assert.match(r.draft, /have not heard from you/);
    assert.equal(Number((await db.system.query<{ n: number }>("select count(*)::int as n from outbox"))[0].n), before);
  });
  it("sends only the draft to an outside model, and falls back when it fails or is not configured", async () => {
    assert.equal(await polish("hello", {}), "hello");
    let sentBody = "";
    const ok = (async (_u: string, init?: RequestInit) => { sentBody = String(init?.body); return new Response(JSON.stringify({ choices: [{ message: { content: "Hello there" } }] })); }) as unknown as typeof fetch;
    assert.equal(await polish("hello", { AI_API_KEY: "k", AI_API_URL: "https://x" }, ok), "Hello there");
    assert.ok(!/phone|membership|@/.test(sentBody));
    const bad = (async () => new Response("no", { status: 500 })) as unknown as typeof fetch;
    assert.equal(await polish("hello", { AI_API_KEY: "k", AI_API_URL: "https://x" }, bad), "hello");
    const boom = (async () => { throw new Error("down"); }) as unknown as typeof fetch;
    assert.equal(await polish("hello", { AI_API_KEY: "k", AI_API_URL: "https://x" }, boom), "hello");
  });
});
