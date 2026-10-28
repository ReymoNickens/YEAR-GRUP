import { createHmac, timingSafeEqual } from "node:crypto";

/** Paystack client. Every network call takes an injectable fetch so it can be tested offline. */

type Fetch = typeof fetch;
const API = "https://api.paystack.co";

export function verifySignature(secret: string, rawBody: string, signature: string | null | undefined): boolean {
  if (!secret || !signature) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature.trim().toLowerCase());
  return a.length === b.length && timingSafeEqual(a, b);
}

export type InitializeInput = {
  email: string;
  chargePesewas: number;
  reference: string;
  callbackUrl: string;
  /** Platform fee in pesewas. Sent as the flat transaction charge so it lands with the platform. */
  platformFeePesewas: number;
  subaccount?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * The split keeps the organisation's money out of the platform's hands: the
 * organisation's subaccount receives the payment, the platform receives only
 * the flat charge, and the organisation bears the gateway fee.
 */
export function buildInitializePayload(i: InitializeInput) {
  const payload: Record<string, unknown> = {
    email: i.email,
    amount: i.chargePesewas,
    currency: "GHS",
    reference: i.reference,
    callback_url: i.callbackUrl,
    channels: ["card", "mobile_money", "bank_transfer"],
    metadata: i.metadata ?? {},
  };
  if (i.subaccount) {
    payload.subaccount = i.subaccount;
    payload.transaction_charge = i.platformFeePesewas;
    payload.bearer = "subaccount";
  }
  return payload;
}

async function call<T>(fetchImpl: Fetch, secret: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetchImpl(`${API}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${secret}`, "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = (await res.json().catch(() => ({}))) as { status?: boolean; message?: string } & T;
  if (!res.ok || body.status === false) throw new Error(body.message ?? `Paystack returned ${res.status}`);
  return body;
}

export async function initializeTransaction(secret: string, payload: Record<string, unknown>, fetchImpl: Fetch = fetch) {
  const body = await call<{ data: { authorization_url: string; reference: string } }>(fetchImpl, secret, "/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return body.data;
}

export type VerifiedTransaction = { status: string; amount: number; reference: string; paidAt: string | null; currency: string };

export async function verifyTransaction(secret: string, reference: string, fetchImpl: Fetch = fetch): Promise<VerifiedTransaction> {
  const body = await call<{ data: { status: string; amount: number; reference: string; paid_at?: string | null; currency?: string } }>(
    fetchImpl,
    secret,
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
  return {
    status: String(body.data.status),
    amount: Number(body.data.amount),
    reference: String(body.data.reference),
    paidAt: body.data.paid_at ?? null,
    currency: String(body.data.currency ?? "GHS"),
  };
}

export async function createRefund(
  secret: string,
  input: { transaction: string; amountPesewas: number },
  fetchImpl: Fetch = fetch,
): Promise<{ reference: string; status: string }> {
  const body = await call<{ data: { id?: number | string; status?: string; transaction_reference?: string } }>(fetchImpl, secret, "/refund", {
    method: "POST",
    body: JSON.stringify({ transaction: input.transaction, amount: input.amountPesewas }),
  });
  return { reference: String(body.data.id ?? input.transaction), status: String(body.data.status ?? "pending") };
}

export type PaystackEvent = { event: string; reference: string | null; amount: number | null; key: string };

/** A stable key per event, so a replayed webhook is recognised and ignored. */
export function parseEvent(raw: string): PaystackEvent | null {
  let parsed: { event?: string; data?: { id?: number | string; reference?: string; amount?: number; transaction_reference?: string } };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed.event) return null;
  const data = parsed.data ?? {};
  const reference = data.reference ?? data.transaction_reference ?? null;
  const key = `${parsed.event}:${data.id ?? reference ?? "unknown"}`;
  return { event: parsed.event, reference, amount: data.amount == null ? null : Number(data.amount), key };
}
