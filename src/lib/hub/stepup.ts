import type { Sql } from "../scope-core.ts";
import { primaryPhone, requestCode, verifyCode } from "./otp.ts";
import type { SmsProvider } from "./sms.ts";
import { devFlag, fail, nid } from "./util.ts";

export const STEP_UP_TTL_SECONDS = 300;
/** Money, roles and settings: every action that needs a fresh code. */
export const STEP_UP_ACTIONS = ["expense", "expense_pay", "refund", "refund_request", "settlement", "role", "phone_recover", "dues"] as const;
export type StepUpAction = (typeof STEP_UP_ACTIONS)[number];

type Ctx = { userId: string; orgId: string; memberId: string };

export async function requestStepUp(sql: Sql, deps: { sms: SmsProvider; exposeCode: boolean }, ctx: Ctx, action: StepUpAction) {
  const phone = await primaryPhone(sql, ctx.userId);
  if (!phone) fail("Verify your phone first. Approvals need a fresh text-message code.");
  if (phone.recent) fail("You changed your number recently, so approvals wait a day. Ask another executive.");
  return requestCode(sql, deps, { userId: ctx.userId, phone: phone.phone, purpose: "step_up", action, orgId: ctx.orgId });
}

export async function confirmStepUp(sql: Sql, ctx: Ctx, action: StepUpAction, code: string) {
  const phone = await primaryPhone(sql, ctx.userId);
  if (!phone) return { ok: false as const, message: "Verify your phone first." };
  const checked = await verifyCode(sql, { userId: ctx.userId, phone: phone.phone, purpose: "step_up", code, action });
  if (!checked.ok) return { ok: false as const, message: checked.message };
  const id = nid("su");
  await sql`
    insert into step_up_grant (id, organisation_id, membership_id, action, expires_at)
    values (${id}, ${ctx.orgId}, ${ctx.memberId}, ${action}, now() + ${`${STEP_UP_TTL_SECONDS} seconds`}::interval)
  `;
  return { ok: true as const, expiresInSeconds: STEP_UP_TTL_SECONDS };
}

/**
 * Spend one grant for this action. In a non-production environment that has set
 * HUB_ALLOW_TEST_STEPUP=1, typing CONFIRM stands in for the text message so the
 * flow can be demonstrated; production never accepts it.
 */
export async function requireStepUp(sql: Sql, ctx: Pick<Ctx, "orgId" | "memberId">, action: StepUpAction, phrase?: unknown): Promise<"code" | "test_phrase"> {
  const rows = await sql<{ id: string }>`
    update step_up_grant set used_at = now()
    where id = (select id from step_up_grant
                where organisation_id = ${ctx.orgId} and membership_id = ${ctx.memberId} and action = ${action}
                  and used_at is null and expires_at > now()
                order by created_at desc limit 1 for update)
    returning id
  `;
  if (rows[0]) return "code";
  if (devFlag("HUB_ALLOW_TEST_STEPUP") && phrase === "CONFIRM") return "test_phrase";
  fail("This needs a fresh text-message code. Ask for one, enter it, then try again.");
}
