import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { normalisePhone, generateCode, hashCode, safeEqual } from "./phone.ts";
import { createSmsProvider } from "./sms.ts";
import { buildInitializePayload, parseEvent, verifySignature, verifyTransaction, initializeTransaction, createRefund } from "./paystack.ts";

test("phone numbers normalise to E.164", () => {
  for (const [input, want] of [
    ["024 000 0000", "+233240000000"],
    ["0240000000", "+233240000000"],
    ["240000000", "+233240000000"],
    ["233240000000", "+233240000000"],
    ["+233 24 000 0000", "+233240000000"],
    ["+44 7700 900123", "+447700900123"],
    ["0044 7700 900123", "+447700900123"],
  ] as const) assert.equal(normalisePhone(input), want, input);
  for (const bad of ["", "12345", "abc", "+12", "02400000"]) assert.equal(normalisePhone(bad), null, bad);
});

test("codes are six digits, hashed with a salt, and compared safely", () => {
  const code = generateCode();
  assert.match(code, /^\d{6}$/);
  const h = hashCode(code, "salt", "pepper");
  assert.notEqual(h, hashCode(code, "other", "pepper"));
  assert.ok(safeEqual(h, hashCode(code, "salt", "pepper")));
  assert.ok(!safeEqual(h, hashCode("000000", "salt", "pepper")));
});

test("webhook signatures are checked in constant time and reject tampering", () => {
  const body = JSON.stringify({ event: "charge.success", data: { id: 1, reference: "c_x", amount: 5000 } });
  const sig = createHmac("sha512", "sk_test").update(body).digest("hex");
  assert.ok(verifySignature("sk_test", body, sig));
  assert.ok(!verifySignature("sk_test", body + " ", sig));
  assert.ok(!verifySignature("other", body, sig));
  assert.ok(!verifySignature("sk_test", body, null));
  assert.ok(!verifySignature("", body, sig));
});

test("events get a stable idempotency key", () => {
  const e = parseEvent(JSON.stringify({ event: "charge.success", data: { id: 99, reference: "c_x", amount: 5000 } }));
  assert.deepEqual(e, { event: "charge.success", reference: "c_x", amount: 5000, key: "charge.success:99" });
  assert.equal(parseEvent("not json"), null);
  assert.equal(parseEvent("{}"), null);
});

test("the initialise payload splits to the organisation and sends only the flat platform charge", () => {
  const p = buildInitializePayload({
    email: "a@b.c", chargePesewas: 10200, reference: "c_1", callbackUrl: "https://x/pay/1",
    platformFeePesewas: 100, subaccount: "ACCT_abc", metadata: { intent: "pi_1" },
  });
  assert.equal(p.amount, 10200);
  assert.equal(p.subaccount, "ACCT_abc");
  assert.equal(p.transaction_charge, 100);
  assert.equal(p.bearer, "subaccount");
  const noSplit = buildInitializePayload({ email: "a@b.c", chargePesewas: 500, reference: "c_2", callbackUrl: "https://x", platformFeePesewas: 5 });
  assert.equal(noSplit.subaccount, undefined);
});

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

test("paystack calls use the secret, surface errors, and never leak it", async () => {
  const calls: { url: string; auth: string | null }[] = [];
  const fake = (async (url: string, init?: RequestInit) => {
    calls.push({ url, auth: new Headers(init?.headers).get("authorization") });
    if (url.includes("/transaction/verify/bad")) return json({ status: false, message: "Transaction reference not found" }, 400);
    if (url.includes("/transaction/verify/")) return json({ status: true, data: { status: "success", amount: 5000, reference: "c_ok", paid_at: "2026-10-07T10:00:00Z" } });
    if (url.endsWith("/transaction/initialize")) return json({ status: true, data: { authorization_url: "https://pay/xyz", reference: "c_ok" } });
    return json({ status: true, data: { id: 7, status: "pending" } });
  }) as unknown as typeof fetch;
  const v = await verifyTransaction("sk", "c_ok", fake);
  assert.equal(v.status, "success");
  assert.equal(v.amount, 5000);
  await assert.rejects(() => verifyTransaction("sk", "bad", fake), /not found/);
  assert.equal((await initializeTransaction("sk", { a: 1 }, fake)).authorization_url, "https://pay/xyz");
  assert.equal((await createRefund("sk", { transaction: "c_ok", amountPesewas: 100 }, fake)).reference, "7");
  assert.ok(calls.every((c) => c.auth === "Bearer sk"));
});

test("sms provider selection and failure handling", async () => {
  assert.equal(createSmsProvider({}).name, "dev");
  assert.equal(createSmsProvider({ SMS_PROVIDER: "arkesel" }).name, "dev"); // no key: stay in dev
  const sent: { url: string; body: string }[] = [];
  const ok = (async (url: string, init?: RequestInit) => { sent.push({ url, body: String(init?.body) }); return json({ status: "success", data: [{ id: "m1" }] }); }) as unknown as typeof fetch;
  const ark = createSmsProvider({ SMS_PROVIDER: "arkesel", SMS_API_KEY: "k" }, ok);
  assert.equal((await ark.send("+233240000000", "hi")).ok, true);
  assert.match(sent[0].body, /233240000000/);
  const bad = (async () => json({ status: "error", message: "no credit" }, 402)) as unknown as typeof fetch;
  const r = await createSmsProvider({ SMS_PROVIDER: "mnotify", SMS_API_KEY: "k" }, bad).send("+233240000000", "hi");
  assert.equal(r.ok, false);
  assert.match(r.error ?? "", /no credit/);
  const boom = (async () => { throw new Error("network down"); }) as unknown as typeof fetch;
  assert.equal((await createSmsProvider({ SMS_PROVIDER: "x", SMS_API_KEY: "k", SMS_API_URL: "https://g" }, boom).send("+1", "t")).ok, false);
});
