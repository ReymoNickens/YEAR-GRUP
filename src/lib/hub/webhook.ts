import type { Sql } from "../scope-core.ts";
import { audit } from "./audit.ts";
import { failIntent, settleIntent, type PayOrg } from "./payments.ts";
import { parseEvent, verifySignature } from "./paystack.ts";
import { num } from "./util.ts";

export type WebhookDeps = {
  rawBody: string;
  signature: string | null;
  secret: string | null;
  /** Privileged lookup of which organisation owns a reference. Nothing else runs privileged. */
  system: Sql;
  /** Run `fn` as a request scoped to one organisation (row level security applies). */
  scoped: <T>(orgId: string, fn: (sql: Sql) => Promise<T>) => Promise<T>;
};

export type WebhookResult = { status: number; body: string };

/**
 * Status codes are the contract with the gateway: 2xx means "stop sending this",
 * anything else means "try again". So an unreadable or forged request gets 4xx,
 * a transient failure while posting gets 5xx and is retried, and a payment that
 * can never be applied (amount mismatch) is recorded for a person and answered 200.
 *
 * The event row is written inside the same transaction as the ledger postings, so
 * a failure leaves nothing behind that could make a retry look like a duplicate.
 */
export async function handlePaystackWebhook(d: WebhookDeps): Promise<WebhookResult> {
  if (!d.secret) return { status: 503, body: "Payments are not connected." };
  if (!verifySignature(d.secret, d.rawBody, d.signature)) return { status: 401, body: "Bad signature." };
  const event = parseEvent(d.rawBody);
  if (!event) return { status: 400, body: "Unreadable event." };
  if (!event.reference) return { status: 200, body: "Ignored." };

  const found = await d.system<{ id: string; organisation_id: string; provider: string }>`
    select id, organisation_id, provider from payment_intent where reference = ${event.reference}
  `;
  const intent = found[0];
  if (!intent) return { status: 200, body: "Unknown reference, ignored." };
  if (intent.provider !== "paystack") return { status: 200, body: "Not a live payment, ignored." };

  const base = { provider: "paystack" as const, reference: event.reference, eventKey: event.key, eventType: event.event, raw: JSON.parse(d.rawBody) };
  const org = async (sql: Sql): Promise<PayOrg> => {
    const r = await sql<Record<string, unknown>>`select id, name, gateway_fee_bps, platform_fee_bps, reverse_platform_fee_on_refund from organisation where id = ${intent.organisation_id}`;
    return { id: String(r[0].id), name: String(r[0].name), gatewayFeeBps: num(r[0].gateway_fee_bps), platformFeeBps: num(r[0].platform_fee_bps), reversePlatformFeeOnRefund: r[0].reverse_platform_fee_on_refund === true };
  };

  try {
    if (event.event === "charge.success") {
      const out = await d.scoped(intent.organisation_id, async (sql) =>
        settleIntent(sql, await org(sql), intent.id, { ...base, amount: event.amount, paidAt: new Date().toISOString() }),
      );
      return { status: 200, body: out.already ? "Already applied." : "Applied." };
    }
    if (event.event === "charge.failed") {
      await d.scoped(intent.organisation_id, async (sql) => failIntent(sql, await org(sql), intent.id, "failed", base));
      return { status: 200, body: "Recorded." };
    }
    if (event.event.startsWith("refund.")) {
      await d.scoped(intent.organisation_id, (sql) => audit(sql, intent.organisation_id, null, `gateway_${event.event.replace(".", "_")}`, `Reference ${event.reference}`));
      return { status: 200, body: "Recorded." };
    }
    return { status: 200, body: "Ignored." };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    // These can never succeed on retry. Keep them for a person and tell the gateway to stop.
    if (/does not match|different gateway|no longer matches|no longer waiting/i.test(message)) {
      await d.scoped(intent.organisation_id, (sql) =>
        audit(sql, intent.organisation_id, null, "webhook_rejected", `${event.event} for ${event.reference}: ${message}`),
      );
      return { status: 200, body: "Rejected and logged." };
    }
    return { status: 500, body: "Try again." };
  }
}
