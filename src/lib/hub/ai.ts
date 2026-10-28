import type { Sql } from "../scope-core.ts";
import { audit } from "./audit.ts";
import { fail, monthKey, num } from "./util.ts";

/**
 * Assistant helpers. Three rules hold for all of them:
 *  1. They run on the asking member's own request scope, so row level security
 *     decides what they can read. They cannot see a hidden circle or another
 *     organisation, because the database will not show it to this member.
 *  2. They only read, and draft text. Nothing here writes a financial,
 *     governance or membership record, and nothing sends a message.
 *  3. They are metered per organisation, with a hard stop at the budget.
 * Words go to an outside model only when AI_API_KEY is set, and then only the
 * draft text, never names, numbers or profile fields.
 */

export type Ctx = { orgId: string; memberId: string; orgName: string; aiBudget: number };
type Env = Record<string, string | undefined>;
type Fetch = typeof fetch;

const STOP = new Set("a an and are as at be by can do for from has have i in is it me my need of on or please someone somebody someone the to we who with you your looking find want know anyone".split(" "));
export const tokens = (text: string) => [...new Set(text.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)))];

async function meter(sql: Sql, ctx: Ctx) {
  const month = monthKey(new Date());
  const used = num((await sql<{ count: number }>`select count from usage_meter where organisation_id = ${ctx.orgId} and month = ${month} and channel = 'ai'`)[0]?.count);
  if (ctx.aiBudget > 0 && used >= ctx.aiBudget) {
    await audit(sql, ctx.orgId, null, `ai_budget_stop:${month}`, "The monthly assistant budget is used up.").catch(() => undefined);
    fail("The assistant has reached this month's limit for your year group.");
  }
  await sql`
    insert into usage_meter (organisation_id, month, channel, count) values (${ctx.orgId}, ${month}, 'ai', 1)
    on conflict (organisation_id, month, channel) do update set count = usage_meter.count + 1
  `;
}

export type Match = { membershipId: string; name: string; profession: string | null; city: string | null; business: string | null; reason: string; score: number };

/** Who in this member's year group could help? Ranked on what people chose to put on their profiles. */
export async function networkSearch(sql: Sql, ctx: Ctx, query: string): Promise<Match[]> {
  await meter(sql, ctx);
  const words = tokens(query);
  if (words.length === 0) fail("Say what you need, in a few words.");
  const people = await sql<{ id: string; display_name: string; nickname: string | null; profession: string | null; city: string | null; bio: string | null; business: string | null; blurb: string | null; category: string | null }>`
    select m.id, m.display_name, m.nickname, m.profession, m.city, m.bio, b.name as business, b.blurb, b.category
    from membership m left join business b on b.membership_id = m.id
    where m.organisation_id = ${ctx.orgId} and m.status = 'verified' and m.id <> ${ctx.memberId}
  `;
  const out: Match[] = [];
  for (const p of people) {
    const fields: [string, string | null, number][] = [
      ["work", p.profession, 3], ["business", p.business, 3], ["business type", p.category, 2],
      ["city", p.city, 1], ["about", `${p.bio ?? ""} ${p.blurb ?? ""}`, 1],
    ];
    let score = 0;
    const why: string[] = [];
    for (const w of words) {
      for (const [label, text, weight] of fields) {
        if (text && text.toLowerCase().includes(w)) { score += weight; why.push(`${label} mentions ${w}`); break; }
      }
    }
    if (score > 0) out.push({ membershipId: p.id, name: p.nickname || p.display_name, profession: p.profession, city: p.city, business: p.business, reason: [...new Set(why)].slice(0, 3).join(", "), score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 8);
}

/** Who might answer this request? Same ranking, using what the asker wrote. */
export async function routeAsk(sql: Sql, ctx: Ctx, askId: string): Promise<Match[]> {
  const ask = await sql<{ title: string; body: string; category: string; membership_id: string }>`
    select title, body, category, membership_id from ask where id = ${askId} and organisation_id = ${ctx.orgId}
  `;
  if (!ask[0]) fail("That request is not here.");
  const found = await networkSearch(sql, ctx, `${ask[0].title} ${ask[0].body} ${ask[0].category}`);
  return found.filter((m) => m.membershipId !== ask[0].membership_id);
}

/** What the member missed this week. A draft they read; nothing is sent. */
export async function digestDraft(sql: Sql, ctx: Ctx): Promise<string> {
  await meter(sql, ctx);
  const posts = await sql<{ body: string; name: string; circle: string }>`
    select p.body, coalesce(m.nickname, m.display_name) as name, c.name as circle
    from post p join membership m on m.id = p.author_membership_id join circle c on c.id = p.circle_id
    where p.organisation_id = ${ctx.orgId} and p.created_at > now() - interval '7 days'
      and p.circle_id in (select circle_id from circle_member where membership_id = ${ctx.memberId})
    order by p.created_at desc limit 5
  `;
  if (posts.length === 0) return "A quiet week in your circles. Nothing you missed.";
  return `This week in your circles:\n${posts.map((p) => `• ${p.circle}: ${p.name} wrote "${p.body.slice(0, 90)}"`).join("\n")}`;
}

/** Draft a reminder for people who have not answered an event. The audience is counted, never contacted. */
export async function reminderDraft(sql: Sql, ctx: Ctx, eventId: string) {
  await meter(sql, ctx);
  const ev = await sql<{ title: string; place: string; starts_at: string }>`
    select title, place, starts_at::text as starts_at from hub_event where id = ${eventId} and organisation_id = ${ctx.orgId}
  `;
  if (!ev[0]) fail("That event is not here.");
  const silent = await sql<{ n: number }>`
    select count(*)::int as n from membership m where m.organisation_id = ${ctx.orgId} and m.status = 'verified'
      and not exists (select 1 from rsvp r where r.event_id = ${eventId} and r.membership_id = m.id)
  `;
  return {
    audience: num(silent[0]?.n),
    draft: `${ctx.orgName}: we have not heard from you about ${ev[0].title} at ${ev[0].place}. Please tell us if you are coming, so we can plan.`,
    note: "This is a draft. Nothing has been sent. Send it from the control room if you agree.",
  };
}

/** Optional polish by an outside model. Only the draft text leaves, and any failure returns the original. */
export async function polish(text: string, env: Env = process.env, fetchImpl: Fetch = fetch): Promise<string> {
  const key = env.AI_API_KEY?.trim();
  const url = env.AI_API_URL?.trim();
  if (!key || !url) return text;
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model: env.AI_MODEL ?? "default", messages: [{ role: "system", content: "Rewrite the message to be warm, short and plain. Keep every fact. Do not add names." }, { role: "user", content: text }] }),
    });
    if (!res.ok) return text;
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return body.choices?.[0]?.message?.content?.trim() || text;
  } catch {
    return text;
  }
}
