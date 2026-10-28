import type { Sql } from "../scope-core.ts";
import { audit } from "./audit.ts";
import type { SmsProvider } from "./sms.ts";
import { isoWeek, monthKey, nid, num } from "./util.ts";

export type Channel = "in_app" | "sms" | "push" | "email";
export const MAX_ATTEMPTS = 5;
export const QUIET_START_HOUR = 21; // Ghana keeps GMT all year, so UTC is local time
export const QUIET_END_HOUR = 6;

/** Which channels a message uses, and whether it may break quiet hours. */
export const ROUTES: Record<string, { channels: Channel[]; critical: boolean }> = {
  sign_in_code: { channels: ["sms"], critical: true },
  payment_receipt: { channels: ["sms", "in_app"], critical: true },
  payment_failed: { channels: ["sms", "in_app"], critical: true },
  payment_due: { channels: ["sms", "in_app"], critical: true },
  refund_processed: { channels: ["sms", "in_app"], critical: true },
  claim_link: { channels: ["sms"], critical: true },
  claim_update: { channels: ["in_app"], critical: false },
  announcement: { channels: ["in_app"], critical: false },
  weekly_digest: { channels: ["in_app"], critical: false },
  event_reminder: { channels: ["in_app"], critical: false },
};

export function routeFor(template: string, urgent = false): { channels: Channel[]; critical: boolean } {
  const base = ROUTES[template] ?? { channels: ["in_app"] as Channel[], critical: false };
  if (urgent && !base.channels.includes("sms")) return { channels: [...base.channels, "sms"], critical: base.critical };
  return base;
}

export type EnqueueInput = {
  orgId: string;
  membershipId: string | null;
  template: string;
  payload: Record<string, unknown>;
  /** Stable per logical message. A replay with the same key adds nothing. */
  key: string;
  urgent?: boolean;
};

/**
 * In-app messages are the inbox itself, so they are delivered at once; the rest
 * queue for the dispatcher. The write goes through hub_enqueue, which checks the
 * organisation and ignores a replayed key.
 */
export async function enqueue(sql: Sql, input: EnqueueInput): Promise<number> {
  const route = routeFor(input.template, input.urgent);
  let added = 0;
  for (const channel of route.channels) {
    const inApp = channel === "in_app";
    const r = await sql<{ added: boolean }>`
      select hub_enqueue(${nid("ob")}, ${input.orgId}, ${input.membershipId}, ${input.template}, ${JSON.stringify(input.payload)}::jsonb,
                         ${`${input.key}:${channel}`}, ${inApp ? "delivered" : "queued"}, ${channel},
                         ${inApp ? new Date().toISOString() : null}::timestamptz) as added
    `;
    if (r[0]?.added) added++;
  }
  return added;
}

export function renderSms(template: string, payload: Record<string, unknown>): string {
  const p = payload as Record<string, string | number | undefined>;
  switch (template) {
    case "payment_receipt":
      return `Thank you. We received your gift. Receipt ${p.receipt ?? ""}. ${p.org ?? ""}`.trim();
    case "payment_failed":
      return `Your payment did not go through. Nothing was taken. You can try again in the app.`;
    case "payment_due":
      return `A part of your pledge is due ${p.due ?? "soon"}. Open the app to give.`;
    case "refund_processed":
      return `Your refund of GHS ${(num(p.amount) / 100).toFixed(2)} was approved. Receipt ${p.receipt ?? ""}.`;
    case "claim_link":
      return `${p.org ?? "Your year group"} has a place for you. Open the app and verify this number to claim it.`;
    case "announcement":
      return `${p.org ?? "Your year group"}: ${String(p.body ?? "").slice(0, 120)}`;
    default:
      return String(p.body ?? "You have a new message in the app.").slice(0, 160);
  }
}

export function backoffMinutes(attempts: number): number {
  return Math.min(60, 2 ** Math.max(0, attempts - 1));
}

export function inQuietHours(now: Date): boolean {
  const h = now.getUTCHours();
  return h >= QUIET_START_HOUR || h < QUIET_END_HOUR;
}

export function nextQuietEnd(now: Date): Date {
  const d = new Date(now);
  d.setUTCHours(QUIET_END_HOUR, 0, 0, 0);
  if (d <= now) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

type Claimed = {
  id: string;
  organisation_id: string;
  membership_id: string | null;
  template_key: string;
  payload: Record<string, unknown>;
  channel: Channel;
  attempts: number;
};

export type DispatchSummary = { claimed: number; delivered: number; retried: number; dead: number; held: number };

/**
 * Claim a batch with FOR UPDATE SKIP LOCKED, so two dispatchers never take the
 * same message, then send each one. Failures retry with exponential backoff and
 * move to dead_letter after the attempt limit. The per-organisation SMS budget
 * warns at 80 percent and stops at 100.
 */
export async function dispatchBatch(sql: Sql, deps: { sms: SmsProvider; now?: Date; limit?: number }): Promise<DispatchSummary> {
  const now = deps.now ?? new Date();
  const summary: DispatchSummary = { claimed: 0, delivered: 0, retried: 0, dead: 0, held: 0 };
  const rows = await sql<Claimed>`
    update outbox set status = 'processing', attempts = attempts + 1
    where id in (select id from outbox where status = 'queued' and next_attempt_at <= ${now.toISOString()}
                 order by next_attempt_at limit ${deps.limit ?? 50} for update skip locked)
    returning id, organisation_id, membership_id, template_key, payload, channel, attempts
  `;
  summary.claimed = rows.length;
  const month = monthKey(now);

  for (const row of rows) {
    const route = routeFor(row.template_key);
    try {
      if (row.channel !== "sms") {
        await sql`update outbox set status = 'held_no_provider', last_error = ${`No ${row.channel} provider is connected`} where id = ${row.id}`;
        summary.held++;
        continue;
      }
      if (!route.critical && inQuietHours(now)) {
        await sql`update outbox set status = 'queued', attempts = attempts - 1, next_attempt_at = ${nextQuietEnd(now).toISOString()} where id = ${row.id}`;
        continue;
      }
      const org = await sql<{ sms_monthly_budget: number; name: string }>`select sms_monthly_budget, name from organisation where id = ${row.organisation_id}`;
      const budget = num(org[0]?.sms_monthly_budget);
      const used = num((await sql<{ count: number }>`select count from usage_meter where organisation_id = ${row.organisation_id} and month = ${month} and channel = 'sms'`)[0]?.count);
      if (budget > 0 && used >= budget) {
        await sql`update outbox set status = 'held_budget', last_error = 'Monthly SMS budget reached' where id = ${row.id}`;
        await auditOnce(sql, row.organisation_id, `sms_budget_stop:${month}`, "SMS budget reached. Sending is paused until next month or the budget is raised.");
        summary.held++;
        continue;
      }
      const member = row.membership_id ? await sql<{ phone: string | null }>`select phone from membership where id = ${row.membership_id}` : [];
      const phone = member[0]?.phone;
      if (!phone) {
        await sql`update outbox set status = 'dead_letter', last_error = 'No phone number on file' where id = ${row.id}`;
        summary.dead++;
        continue;
      }
      const result = await deps.sms.send(phone, renderSms(row.template_key, { ...row.payload, org: org[0]?.name }));
      if (result.ok) {
        await sql`update outbox set status = 'delivered', delivered_at = now(), provider_message_id = ${result.id ?? null}, last_error = null where id = ${row.id}`;
        await sql`
          insert into usage_meter (organisation_id, month, channel, count) values (${row.organisation_id}, ${month}, 'sms', 1)
          on conflict (organisation_id, month, channel) do update set count = usage_meter.count + 1
        `;
        if (budget > 0 && used + 1 >= Math.ceil(budget * 0.8)) {
          await auditOnce(sql, row.organisation_id, `sms_budget_warn:${month}`, `SMS use passed 80 percent of the monthly budget (${used + 1} of ${budget}).`);
        }
        summary.delivered++;
      } else {
        throw new Error(result.error ?? "SMS provider refused the message");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (row.attempts >= MAX_ATTEMPTS) {
        await sql`update outbox set status = 'dead_letter', last_error = ${message} where id = ${row.id}`;
        summary.dead++;
      } else {
        const next = new Date(now.getTime() + backoffMinutes(row.attempts) * 60_000);
        await sql`update outbox set status = 'queued', last_error = ${message}, next_attempt_at = ${next.toISOString()} where id = ${row.id}`;
        summary.retried++;
      }
    }
  }
  return summary;
}

async function auditOnce(sql: Sql, orgId: string, marker: string, detail: string) {
  const seen = await sql<{ id: string }>`select id from audit_log where organisation_id = ${orgId} and action = ${marker} limit 1`;
  if (!seen[0]) await audit(sql, orgId, null, marker, detail);
}

/** One in-app digest per member per ISO week, only when there is something to say. */
export async function queueDigests(sql: Sql, now: Date = new Date()): Promise<number> {
  const week = isoWeek(now);
  const members = await sql<{ id: string; organisation_id: string; posts: number; events: number }>`
    select m.id, m.organisation_id,
      (select count(*)::int from post p where p.organisation_id = m.organisation_id and p.created_at > ${now.toISOString()}::timestamptz - interval '7 days'
         and p.circle_id in (select circle_id from circle_member cm where cm.membership_id = m.id)) as posts,
      (select count(*)::int from hub_event e where e.organisation_id = m.organisation_id and e.starts_at between ${now.toISOString()}::timestamptz and ${now.toISOString()}::timestamptz + interval '14 days') as events
    from membership m where m.user_id is not null and m.status = 'verified'
  `;
  let queued = 0;
  for (const m of members) {
    if (num(m.posts) + num(m.events) === 0) continue;
    queued += await enqueue(sql, {
      orgId: m.organisation_id, membershipId: m.id, template: "weekly_digest",
      key: `digest:${m.organisation_id}:${m.id}:${week}`,
      payload: { body: `${num(m.posts)} new notes in your circles and ${num(m.events)} coming up.`, posts: num(m.posts), events: num(m.events), href: "feed" },
    });
  }
  return queued;
}
