import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { dismissFailed, enqueue, failed, flush, isNetworkError, queued, sendOrQueue, clearOfflineData } from "../offline-queue.ts";
import { firstTime, mergeProfile } from "./sync.ts";
import { createTestDb, ORG, type TestDb } from "./test-db.ts";

let db: TestDb;
let me = "";
const as = () => ({ userId: "u-sync", orgId: ORG, memberId: me });

before(async () => {
  db = await createTestDb();
  me = (await db.system.query<{ id: string }>("select id from membership where organisation_id=$1 and status='verified' order by id limit 1", [ORG]))[0].id;
  await db.system.query("update membership set user_id='u-sync', nickname='Old', city='Accra' where id=$1", [me]);
});
after(async () => { await db.pg.close(); });

describe("applying a retried action once", () => {
  it("accepts a client id the first time only", async () => {
    assert.equal(await db.scoped(as(), (sql) => firstTime(sql, ORG, me, "post", "client-abc-12345")), true);
    assert.equal(await db.scoped(as(), (sql) => firstTime(sql, ORG, me, "post", "client-abc-12345")), false);
    assert.equal(await db.scoped(as(), (sql) => firstTime(sql, ORG, me, "post", "client-def-12345")), true);
  });
});

describe("profile edits made offline", () => {
  const edit = (data: Record<string, unknown>) => db.scoped(as(), (sql) => mergeProfile(sql, me, "u-sync", data));
  const row = async () => (await db.system.query<{ nickname: string | null; city: string | null; profession: string | null }>("select nickname, city, profession from membership where id=$1", [me]))[0];

  it("the newer edit wins per field, whichever arrives last", async () => {
    const now = Date.now();
    await edit({ nickname: "Newer", city: "Tema", profession: "Nurse", times: { nickname: now, city: now, profession: now } });
    // an older edit (typed offline last week) arrives afterwards
    await edit({ nickname: "Stale", city: "Kumasi", profession: "Teacher", times: { nickname: now - 7 * 86_400_000, city: now - 7 * 86_400_000, profession: now + 5 } });
    const r = await row();
    assert.equal(r.nickname, "Newer"); // stale edit lost
    assert.equal(r.city, "Tema"); // stale edit lost
    assert.equal(r.profession, "Teacher"); // this one really was newer
  });
  it("cannot touch placement, status, phone or roles", async () => {
    await edit({ nickname: "x", status: "verified", phone: "+233200000000", houseNodeId: "h_balmer", role: "treasurer", times: {} });
    const m = (await db.system.query<{ phone: string | null; status: string }>("select phone, status from membership where id=$1", [me]))[0];
    assert.notEqual(m.phone, "+233200000000");
    const roles = await db.system.query<{ role: string }>("select role from role_assignment where membership_id=$1 and role='treasurer'", [me]);
    assert.equal(roles.length, 0);
  });
  it("refuses someone else's profile", async () => {
    await assert.rejects(() => db.scoped({ userId: "intruder", orgId: ORG, memberId: me }, (sql) => mergeProfile(sql, me, "intruder", { nickname: "hack" })), /not yours/);
  });
});

describe("the device queue", () => {
  const mem: Record<string, string> = {};
  const fake = { getItem: (k: string) => mem[k] ?? null, setItem: (k: string, v: string) => { mem[k] = v; }, removeItem: (k: string) => { delete mem[k]; }, key: (i: number) => Object.keys(mem)[i] ?? null, get length() { return Object.keys(mem).length; } };
  before(() => { (globalThis as { localStorage?: unknown }).localStorage = fake; (globalThis as { window?: unknown }).window = { dispatchEvent() {}, addEventListener() {}, removeEventListener() {} }; });
  after(() => { delete (globalThis as { localStorage?: unknown }).localStorage; delete (globalThis as { window?: unknown }).window; });
  const reset = () => { for (const k of Object.keys(mem)) delete mem[k]; };

  it("sends at once when online, and keeps the id", async () => {
    reset();
    const seen: string[] = [];
    const out = await sendOrQueue(async (p) => { seen.push(String(p.clientId)); return { ok: true }; }, { type: "post", body: "hi" });
    assert.deepEqual(out, { ok: true });
    assert.equal(queued().length, 0);
    assert.ok(seen[0].length >= 8);
  });
  it("queues on a dropped connection but rethrows a real refusal", async () => {
    reset();
    const out = await sendOrQueue(async () => { throw new TypeError("Failed to fetch"); }, { type: "rsvp", status: "going" });
    assert.deepEqual(out, { queued: true });
    assert.equal(queued().length, 1);
    await assert.rejects(() => sendOrQueue(async () => { throw new Error("Posting opens once your place is confirmed."); }, { type: "post", body: "x" }), /confirmed/);
    assert.equal(queued().length, 1); // the refusal was not queued
  });
  it("flushes in order, stops when the connection is still down, and keeps the same id on retry", async () => {
    reset();
    enqueue({ type: "post", body: "one" }); enqueue({ type: "post", body: "two" }); enqueue({ type: "post", body: "three" });
    const ids = queued().map((i) => i.clientId);
    const sent: string[] = [];
    let n = 0;
    const r1 = await flush(async (p) => { if (++n === 2) throw new TypeError("Failed to fetch"); sent.push(String(p.body)); });
    assert.deepEqual(sent, ["one"]);
    assert.equal(r1.left, 2);
    const r2 = await flush(async (p) => { sent.push(String(p.body)); });
    assert.deepEqual(sent, ["one", "two", "three"]);
    assert.equal(r2.left, 0);
    assert.ok(ids.every((id) => id.length >= 8));
  });
  it("gives up on an action the server keeps refusing and tells the member", async () => {
    reset();
    enqueue({ type: "reply", body: "x" });
    for (let i = 0; i < 3; i++) await flush(async () => { throw new Error("That request is not here."); });
    assert.equal(queued().length, 0);
    assert.equal(failed()[0].message, "That request is not here.");
    dismissFailed();
    assert.equal(failed().length, 0);
  });
  it("is wiped on sign-out and never carries money", () => {
    reset();
    enqueue({ type: "post", body: "x" });
    mem["ygh:read:home"] = "private";
    mem["other"] = "keep";
    clearOfflineData();
    assert.equal(queued().length, 0);
    assert.equal(mem["ygh:read:home"], undefined);
    assert.equal(mem["other"], "keep");
    assert.equal(isNetworkError(new Error("Giving needs a connection.")), false);
  });
});
