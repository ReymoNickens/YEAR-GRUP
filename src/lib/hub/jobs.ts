import { timingSafeEqual } from "node:crypto";
import type { Sql } from "../scope-core.ts";
import { dispatchBatch, queueDigests, type DispatchSummary } from "./outbox.ts";
import type { VerifiedTransaction } from "./paystack.ts";
import { reconcile, type ReconcileResult } from "./reconcile.ts";
import type { SmsProvider } from "./sms.ts";

/** Scheduled routes accept only the shared secret, compared in constant time. */
export function authorisedJob(header: string | null, secret: string | null): boolean {
  if (!secret || !header) return false;
  const given = Buffer.from(header.replace(/^Bearer\s+/i, "").trim());
  const want = Buffer.from(secret);
  return given.length === want.length && timingSafeEqual(given, want);
}

export async function runOutbox(system: Sql, sms: SmsProvider, now = new Date()): Promise<DispatchSummary> {
  return dispatchBatch(system, { sms, now, limit: 100 });
}

export async function runDigests(system: Sql, now = new Date()) {
  return { queued: await queueDigests(system, now) };
}

/** One reconciliation per live organisation, each inside its own organisation scope. */
export async function runReconciliation(
  system: Sql,
  scoped: <T>(orgId: string, fn: (sql: Sql) => Promise<T>) => Promise<T>,
  verify?: (reference: string) => Promise<VerifiedTransaction>,
): Promise<{ organisation: string; ok: boolean }[]> {
  const orgs = await system<{ id: string }>`select id from organisation`;
  const out: { organisation: string; ok: boolean }[] = [];
  for (const o of orgs) {
    const r: ReconcileResult = await scoped(o.id, (sql) => reconcile(sql, o, { actorId: null, verify }));
    out.push({ organisation: o.id, ok: r.ok });
  }
  return out;
}
