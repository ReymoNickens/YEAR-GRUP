import type { Sql } from "../scope-core.ts";
import { generateCode, hashCode, normalisePhone, safeEqual } from "./phone.ts";
import { enforce } from "./ratelimit.ts";
import type { SmsProvider } from "./sms.ts";
import { fail, nid } from "./util.ts";

export const CODE_TTL_SECONDS = 600;
export const MAX_ATTEMPTS = 5;
/** After a number changes, money approvals wait this long: a swapped SIM cannot approve at once. */
export const PHONE_COOLING_HOURS = 24;

export type OtpPurpose = "verify_phone" | "step_up";

export async function requestCode(
  sql: Sql,
  deps: { sms: SmsProvider; exposeCode: boolean },
  input: { userId: string; phone: string; purpose: OtpPurpose; action?: string; orgId?: string },
) {
  const phone = normalisePhone(input.phone);
  if (!phone) fail("Write a phone number we can text, for example 024 000 0000.");
  await enforce(sql, `otp:user:${input.userId}`, 5, 3600, "Too many codes asked for. Try again in an hour.");
  await enforce(sql, `otp:phone:${phone}`, 5, 3600, "Too many codes sent to that number. Try again in an hour.");

  await sql`update otp_challenge set consumed_at = now()
            where user_id = ${input.userId} and purpose = ${input.purpose} and consumed_at is null`;
  const id = nid("otp");
  const code = generateCode();
  await sql`
    insert into otp_challenge (id, user_id, phone, purpose, action, organisation_id, code_hash, expires_at)
    values (${id}, ${input.userId}, ${phone}, ${input.purpose}, ${input.action ?? null}, ${input.orgId ?? null},
            ${hashCode(code, id)}, now() + ${`${CODE_TTL_SECONDS} seconds`}::interval)
  `;
  const text =
    input.purpose === "step_up"
      ? `Your Year Group Hub code to confirm ${input.action ?? "this action"} is ${code}. It lasts 10 minutes. Never share it.`
      : `Your Year Group Hub code is ${code}. It lasts 10 minutes. Never share it.`;
  const sent = await deps.sms.send(phone, text);
  if (!sent.ok && deps.sms.configured) {
    await sql`update otp_challenge set consumed_at = now() where id = ${id}`;
    fail("We could not send the code just now. Try again shortly.");
  }
  return { phone, expiresInSeconds: CODE_TTL_SECONDS, devCode: deps.exposeCode ? code : undefined };
}

export type VerifyResult = { ok: true; phone: string } | { ok: false; message: string };

/**
 * Check a code. A wrong guess RETURNS a failure instead of throwing: the whole
 * request is one transaction, so a thrown error would roll back the attempt
 * counter and a guesser would never be locked out.
 */
export async function verifyCode(
  sql: Sql,
  input: { userId: string; phone: string; purpose: OtpPurpose; code: string; action?: string },
): Promise<VerifyResult> {
  const phone = normalisePhone(input.phone);
  if (!phone) return { ok: false, message: "That number does not look right." };
  const rows = await sql<{ id: string; code_hash: string; attempts: number; expired: boolean }>`
    select id, code_hash, attempts, (expires_at < now()) as expired from otp_challenge
    where user_id = ${input.userId} and phone = ${phone} and purpose = ${input.purpose}
      and (${input.action ?? null}::text is null or action = ${input.action ?? null})
      and consumed_at is null
    order by created_at desc limit 1
  `;
  const row = rows[0];
  if (!row || row.expired) return { ok: false, message: "That code has expired. Ask for a new one." };
  if (Number(row.attempts) >= MAX_ATTEMPTS) return { ok: false, message: "Too many wrong tries. Ask for a new code." };
  await sql`update otp_challenge set attempts = attempts + 1 where id = ${row.id}`;
  if (!safeEqual(row.code_hash, hashCode(String(input.code).trim(), row.id))) return { ok: false, message: "That code is not right." };
  await sql`update otp_challenge set consumed_at = now() where id = ${row.id}`;
  return { ok: true, phone };
}

/**
 * Bind a verified number to the signed-in person. A number already verified by
 * someone else is refused: telcos recycle numbers, so taking one over needs an
 * executive to approve the move.
 */
export async function bindPhone(sql: Sql, userId: string, phone: string): Promise<{ changed: boolean }> {
  const owner = await sql<{ user_id: string }>`select hub_phone_owner(${phone}) as user_id`;
  if (owner[0]?.user_id && owner[0].user_id !== userId) {
    fail("That number is already linked to another account. Ask an executive to move it for you.");
  }
  const current = await sql<{ phone: string }>`select phone from phone_identity where user_id = ${userId} and is_primary`;
  if (current[0]?.phone === phone) {
    await sql`update phone_identity set verified_at = verified_at where phone = ${phone}`;
    return { changed: false };
  }
  await sql`update phone_identity set is_primary = false where user_id = ${userId}`;
  await sql`
    insert into phone_identity (id, user_id, phone, is_primary) values (${nid("ph")}, ${userId}, ${phone}, true)
    on conflict (phone) do update set is_primary = true, verified_at = now()
  `;
  return { changed: Boolean(current[0]) };
}

export async function primaryPhone(sql: Sql, userId: string) {
  const rows = await sql<{ phone: string; recent: boolean; had_earlier: boolean }>`
    select p.phone,
           (p.verified_at > now() - ${`${PHONE_COOLING_HOURS} hours`}::interval
              and exists (select 1 from phone_identity o where o.user_id = p.user_id and o.id <> p.id)) as recent,
           exists (select 1 from phone_identity o where o.user_id = p.user_id and o.id <> p.id) as had_earlier
    from phone_identity p where p.user_id = ${userId} and p.is_primary limit 1
  `;
  return rows[0] ?? null;
}
