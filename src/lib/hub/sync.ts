import type { Sql } from "../scope-core.ts";
import { fail, num } from "./util.ts";

/** Record a client action id. True the first time, false if this exact action was already applied. */
export async function firstTime(sql: Sql, orgId: string, memberId: string, type: string, clientId: string): Promise<boolean> {
  const fresh = await sql<{ client_id: string }>`
    insert into client_action (client_id, organisation_id, membership_id, type) values (${clientId}, ${orgId}, ${memberId}, ${type})
    on conflict (client_id) do nothing returning client_id
  `;
  return fresh.length > 0;
}

const FIELDS = ["nickname", "city", "profession", "bio", "birthday_month", "birthday_day", "birthday_opt_out"] as const;
const CLIENT_KEY: Record<string, string> = {
  nickname: "nickname", city: "city", profession: "profession", bio: "bio",
  birthday_month: "birthdayMonth", birthday_day: "birthdayDay", birthday_opt_out: "birthdayOptOut",
};

/**
 * Last write wins per field, judged by when the member made the edit. An edit
 * typed offline last week cannot overwrite the same field changed from another
 * phone since. Admin-controlled data (roles, placement, status) is not here at all.
 */
export async function mergeProfile(sql: Sql, memberId: string, userId: string, data: Record<string, unknown>) {
  const times = (data.times ?? {}) as Record<string, unknown>;
  const month = data.birthdayMonth == null || data.birthdayMonth === "" ? null : num(data.birthdayMonth);
  const day = data.birthdayDay == null || data.birthdayDay === "" ? null : num(data.birthdayDay);
  if (month != null && (month < 1 || month > 12)) fail("That month is not right.");
  if (day != null && (day < 1 || day > 31)) fail("That day is not right.");
  const incoming: Record<string, unknown> = {
    nickname: String(data.nickname ?? "").trim().slice(0, 40) || null,
    city: String(data.city ?? "").trim().slice(0, 60) || null,
    profession: String(data.profession ?? "").trim().slice(0, 80) || null,
    bio: String(data.bio ?? "").trim().slice(0, 240) || null,
    birthday_month: month, birthday_day: day, birthday_opt_out: data.birthdayOptOut === true,
  };
  const cur = await sql<Record<string, unknown>>`
    select nickname, city, profession, bio, birthday_month, birthday_day, birthday_opt_out, field_times
    from membership where id = ${memberId} and user_id = ${userId} for update
  `;
  if (!cur[0]) fail("That profile is not yours.");
  const stored = { ...((cur[0].field_times as Record<string, number>) ?? {}) };
  const merged: Record<string, unknown> = {};
  const applied: string[] = [];
  for (const col of FIELDS) {
    const edited = num(times[CLIENT_KEY[col]]);
    const when = edited > 0 ? edited : Date.now();
    if (when >= num(stored[col])) { merged[col] = incoming[col]; stored[col] = when; applied.push(col); }
    else merged[col] = cur[0][col];
  }
  await sql`
    update membership set nickname = ${merged.nickname as string | null}, city = ${merged.city as string | null}, profession = ${merged.profession as string | null},
      bio = ${merged.bio as string | null}, birthday_month = ${merged.birthday_month as number | null}, birthday_day = ${merged.birthday_day as number | null},
      birthday_opt_out = ${merged.birthday_opt_out === true}, field_times = ${JSON.stringify(stored)}::jsonb, updated_at = now()
    where id = ${memberId} and user_id = ${userId}
  `;
  return { applied };
}
