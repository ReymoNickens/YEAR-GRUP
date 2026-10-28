import "server-only";
import { authMiddleware, createServerFn } from "@/lib/server-fn";
import { getSql, getSystemSql, setTenant, withScope, type Sql } from "@/lib/db";
import { audit, track } from "@/lib/hub/audit";
import { syncDerived as syncDerivedFor } from "@/lib/hub/circles";
import { claimPlace, enrolNewMember, type EnrolForm } from "@/lib/hub/claims";
import { planCollection } from "@/lib/hub/money";
import { bindPhone, primaryPhone, requestCode, verifyCode } from "@/lib/hub/otp";
import { failIntent, settleIntent as settleIntentCore, type PayOrg } from "@/lib/hub/payments";
import { buildInitializePayload, initializeTransaction, verifyTransaction } from "@/lib/hub/paystack";
import { normalisePhone, maskPhone } from "@/lib/hub/phone";
import { createSmsProvider } from "@/lib/hub/sms";
import { requestStepUp, confirmStepUp, STEP_UP_ACTIONS, type StepUpAction } from "@/lib/hub/stepup";
import { demoMode, devFlag, fail, like, nid, num, str } from "@/lib/hub/util";

export { audit, track, fail, like, nid, num, str };

export type Org = {
  id: string;
  slug: string;
  name: string;
  terminology: Record<string, string>;
  branding: Record<string, string>;
  paymentMode: string;
  gatewayFeeBps: number;
  platformFeeBps: number;
  minGivers: number;
  twoApprover: number;
  verificationRule: string;
  reversePlatformFeeOnRefund: boolean;
  paystackSubaccount: string | null;
};

export type Member = {
  id: string;
  sample: boolean;
  status: string;
  displayName: string;
  nickname: string | null;
  phone: string | null;
  city: string | null;
  profession: string | null;
  bio: string | null;
  houseNodeId: string | null;
  dormNodeId: string | null;
  cotNodeId: string | null;
  programmeNodeId: string | null;
  classNodeId: string | null;
  residenceEscape: string | null;
  birthdayMonth: number | null;
  birthdayDay: number | null;
  birthdayOptOut: boolean;
  houseName: string | null;
  dormName: string | null;
  cotName: string | null;
  programmeName: string | null;
  className: string | null;
};

type Role = { role: string; scopeType: string; scopeId: string | null; scopePath: string | null };

function obj(v: unknown): Record<string, string> {
  if (!v) return {};
  if (typeof v === "string") return JSON.parse(v) as Record<string, string>;
  return v as Record<string, string>;
}
export const ASK_CATEGORIES = [
  "business",
  "career",
  "education",
  "professional service",
  "supplier",
  "employment",
  "housing",
  "travel",
  "mentoring",
  "personal support",
];

function mapOrg(row: Record<string, unknown>): Org {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    terminology: obj(row.terminology),
    branding: obj(row.branding),
    paymentMode: String(row.payment_mode),
    gatewayFeeBps: num(row.gateway_fee_bps),
    platformFeeBps: num(row.platform_fee_bps),
    minGivers: num(row.min_givers),
    twoApprover: num(row.expense_two_approver_pesewas),
    verificationRule: String(row.verification_rule),
    reversePlatformFeeOnRefund: row.reverse_platform_fee_on_refund === true,
    paystackSubaccount: str(row.paystack_subaccount),
  };
}

export const payOrg = (o: Org): PayOrg => ({
  id: o.id, name: o.name, gatewayFeeBps: o.gatewayFeeBps, platformFeeBps: o.platformFeeBps, reversePlatformFeeOnRefund: o.reversePlatformFeeOnRefund,
});

export function mapMember(row: Record<string, unknown>): Member {
  return {
    id: String(row.id),
    sample: row.sample === true,
    status: String(row.status),
    displayName: String(row.display_name),
    nickname: str(row.nickname),
    phone: str(row.phone),
    city: str(row.city),
    profession: str(row.profession),
    bio: str(row.bio),
    houseNodeId: str(row.house_node_id),
    dormNodeId: str(row.dorm_node_id),
    cotNodeId: str(row.cot_node_id),
    programmeNodeId: str(row.programme_node_id),
    classNodeId: str(row.class_node_id),
    residenceEscape: str(row.residence_escape),
    birthdayMonth: row.birthday_month == null ? null : num(row.birthday_month),
    birthdayDay: row.birthday_day == null ? null : num(row.birthday_day),
    birthdayOptOut: row.birthday_opt_out === true,
    houseName: str(row.house_name),
    dormName: str(row.dorm_name),
    cotName: str(row.cot_name),
    programmeName: str(row.programme_name),
    className: str(row.class_name),
  };
}

export const MEMBER_SELECT = `
  m.*,
  h.name as house_name, d.name as dorm_name, ct.name as cot_name,
  pg.name as programme_name, cl.name as class_name
`;
export const MEMBER_JOINS = `
  left join structure_node h on h.id = m.house_node_id
  left join structure_node d on d.id = m.dorm_node_id
  left join structure_node ct on ct.id = m.cot_node_id
  left join structure_node pg on pg.id = m.programme_node_id
  left join structure_node cl on cl.id = m.class_node_id
`;

async function orgBySlug(sql: Sql, slug: string) {
  const rows = await sql<Record<string, unknown>>`select * from organisation where slug = ${slug}`;
  if (!rows[0]) fail("That year group is not here.");
  await setTenant(String(rows[0].id)); // from here the database only shows this organisation
  return mapOrg(rows[0]);
}

async function memberByUser(sql: Sql, orgId: string, userId: string) {
  const rows = await sql.query<Record<string, unknown>>(
    `select ${MEMBER_SELECT} from membership m ${MEMBER_JOINS} where m.organisation_id = $1 and m.user_id = $2`,
    [orgId, userId],
  );
  if (rows[0]) await setTenant(orgId, String(rows[0].id));
  return rows[0] ? mapMember(rows[0]) : null;
}

async function rolesOf(sql: Sql, memberId: string) {
  const rows = await sql<Record<string, unknown>>`
    select role, scope_type, scope_id, scope_path from role_assignment where membership_id = ${memberId}
  `;
  return rows.map((r) => ({
    role: String(r.role),
    scopeType: String(r.scope_type),
    scopeId: str(r.scope_id),
    scopePath: str(r.scope_path),
  })) satisfies Role[];
}

export function isOfficer(roles: Role[]) {
  return roles.some((r) => ["organisation_admin", "executive", "treasurer", "secretary"].includes(r.role));
}
export function isTreasurer(roles: Role[]) {
  return roles.some((r) => r.role === "treasurer");
}
export function scopeOf(roles: Role[]) {
  if (isOfficer(roles)) return null;
  const scoped = roles.find((r) =>
    ["house_captain", "dorm_prefect", "cot_leader", "class_representative"].includes(r.role),
  );
  return scoped?.scopePath ?? null;
}
export function canOpenControl(roles: Role[]) {
  return isOfficer(roles) || scopeOf(roles) != null;
}

export async function requireMember(sql: Sql, slug: string, userId: string) {
  const org = await orgBySlug(sql, slug);
  const member = await memberByUser(sql, org.id, userId);
  if (!member) fail("Join the year group first.");
  const roles = await rolesOf(sql, member.id);
  return { org, member, roles };
}

function publicPerson(m: Member, roles: Role[], self: boolean) {
  const seePhone = self || isOfficer(roles);
  return { ...m, phone: seePhone ? m.phone : null, bio: m.bio };
}

export async function syncDerived(sql: Sql, org: Org, member: Member) {
  await syncDerivedFor(sql, org.id, {
    id: member.id, programmeNodeId: member.programmeNodeId, classNodeId: member.classNodeId,
    houseNodeId: member.houseNodeId, dormNodeId: member.dormNodeId, cotNodeId: member.cotNodeId,
  });
}

export const authed = <T>(validate: (input: unknown) => T) =>
  createServerFn({ method: "POST" }).validator(validate).middleware([authMiddleware]).middleware([authMiddleware]);

export function slugOf(input: unknown) {
  const slug = typeof input === "string" ? input : "";
  if (!/^[a-z0-9-]{3,60}$/.test(slug)) fail("That year group is not here.");
  return slug;
}

export const listOrgs = createServerFn({ method: "POST" }).validator((input: unknown) => input).middleware([authMiddleware]).handler(async () => {
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`
    select id, slug, name, branding, terminology from organisation where listed = true order by name
  `;
  return rows.map((r) => ({
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    motto: obj(r.branding).motto ?? "",
    place: obj(r.branding).place ?? "",
  }));
});

export const orgEntry = createServerFn({ method: "POST" }).validator(slugOf).middleware([authMiddleware]).handler(async ({ data: slug, context }) => {
  const sql = await getSql();
  const org = await orgBySlug(sql, slug);
  const member = await memberByUser(sql, org.id, context.userId);
  const roles = member ? await rolesOf(sql, member.id) : [];
  return {
    org,
    member: member ? publicPerson(member, roles, true) : null,
    roles: roles.map((r) => r.role),
    control: canOpenControl(roles),
  };
});

export const structure = createServerFn({ method: "POST" }).validator(slugOf).middleware([authMiddleware]).handler(async ({ data: slug }) => {
  const sql = await getSql();
  const org = await orgBySlug(sql, slug);
  const nodes = await sql<Record<string, unknown>>`
    select id, parent_id, level, name, child_limit, sort, path
    from structure_node where organisation_id = ${org.id} order by sort, name
  `;
  const programmes = nodes
    .filter((n) => n.level === "programme")
    .map((p) => ({
      id: String(p.id),
      name: String(p.name),
      classes: nodes.filter((n) => n.parent_id === p.id && n.level === "class").map((c) => ({ id: String(c.id), name: String(c.name) })),
    }));
  const houses = nodes
    .filter((n) => n.level === "house")
    .map((h) => ({
      id: String(h.id),
      name: String(h.name),
      dorms: nodes
        .filter((n) => n.parent_id === h.id && n.level === "dorm")
        .map((d) => ({ id: String(d.id), name: String(d.name), cotCount: num(d.child_limit) || 8 })),
    }));
  const voluntary = await sql<Record<string, unknown>>`
    select id, name, purpose, visibility from circle
    where organisation_id = ${org.id} and kind = 'voluntary' order by name
  `;
  return {
    org,
    programmes,
    houses,
    voluntary: voluntary.map((c) => ({
      id: String(c.id),
      name: String(c.name),
      purpose: String(c.purpose),
      visibility: String(c.visibility),
    })),
  };
});

type RegisterBody = {
  slug: string; displayName: string; programmeId: string; classId: string; residence: "placed" | "day" | "unsure";
  houseId: string | null; dormId: string | null; cotNumber: number | null; profession: string; city: string; circleIds: string[];
};

function parseRegister(input: unknown): RegisterBody {
  const b = input as RegisterBody;
  if (!b || typeof b.slug !== "string") fail("Start again from your name.");
  slugOf(b.slug);
  if (typeof b.displayName !== "string" || b.displayName.trim().length < 2) fail("Write your name.");
  if (b.residence !== "placed" && b.residence !== "day" && b.residence !== "unsure") fail("Choose where you lived.");
  if (!b.programmeId || !b.classId) fail("Choose your programme and class.");
  if (b.residence === "placed" && (!b.houseId || !b.dormId)) fail("Choose your house and dorm.");
  if (typeof b.profession !== "string" || !b.profession.trim() || typeof b.city !== "string" || !b.city.trim()) {
    fail("Add your work and your city.");
  }
  return {
    ...b,
    displayName: b.displayName.trim().slice(0, 80),
    profession: b.profession.trim().slice(0, 80),
    city: b.city.trim().slice(0, 60),
    circleIds: Array.isArray(b.circleIds) ? b.circleIds.slice(0, 8) : [],
    cotNumber: b.cotNumber == null ? null : num(b.cotNumber),
  };
}

const smsDeps = () => ({ sms: createSmsProvider(), exposeCode: devFlag("HUB_DEV_OTP") });

/** Supabase Auth is private to the request role, so the email is read with the system client. */
async function userEmail(userId: string): Promise<string | null> {
  try {
    const sys = await getSystemSql();
    const r = await sys<{ email: string | null }>`select email from auth.users where id::text = ${userId}`;
    return r[0]?.email ?? null;
  } catch {
    return null;
  }
}

const orgRef = (o: Org) => ({ id: o.id, name: o.name, verificationRule: o.verificationRule });

export const phoneStatus = createServerFn({ method: "POST" }).validator(slugOf).middleware([authMiddleware]).handler(async ({ data: slug, context }) => {
  const sql = await getSql();
  const org = await orgBySlug(sql, slug);
  const phone = await primaryPhone(sql, context.userId);
  const member = await memberByUser(sql, org.id, context.userId);
  const waiting = phone
    ? await sql<{ id: string }>`select id from membership where organisation_id = ${org.id} and phone = ${phone.phone} and user_id is null and status in ('approved', 'invited')`
    : [];
  return { verified: Boolean(phone), masked: phone ? maskPhone(phone.phone) : null, hasPlace: Boolean(waiting[0]), member: member ? { status: member.status } : null };
});

export const phoneStart = createServerFn({ method: "POST" }).validator((input: unknown) => {
  const b = input as { slug?: string; phone?: string };
  const phone = normalisePhone(String(b?.phone ?? ""));
  if (!phone) fail("Write a phone number we can text, for example 024 000 0000.");
  return { slug: slugOf(b?.slug), phone };
}).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  await orgBySlug(sql, data.slug);
  const sent = await requestCode(sql, smsDeps(), { userId: context.userId, phone: data.phone, purpose: "verify_phone" });
  return { masked: maskPhone(sent.phone), expiresInSeconds: sent.expiresInSeconds, devCode: sent.devCode ?? null };
});

export const phoneVerify = createServerFn({ method: "POST" }).validator((input: unknown) => {
  const b = input as { slug?: string; phone?: string; code?: string };
  const phone = normalisePhone(String(b?.phone ?? ""));
  if (!phone) fail("Write the number the code was sent to.");
  return { slug: slugOf(b?.slug), phone, code: String(b?.code ?? "").replace(/\D/g, "").slice(0, 6) };
}).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const org = await orgBySlug(sql, data.slug);
  const checked = await verifyCode(sql, { userId: context.userId, phone: data.phone, purpose: "verify_phone", code: data.code });
  if (!checked.ok) return { ok: false as const, message: checked.message };
  let changed = false;
  try {
    changed = (await bindPhone(sql, context.userId, checked.phone)).changed;
  } catch (e) {
    return { ok: false as const, message: e instanceof Error ? e.message : "We could not link that number." };
  }
  const existing = await memberByUser(sql, org.id, context.userId);
  if (existing) {
    await sql`update membership set phone = ${checked.phone}, phone_verified = true where id = ${existing.id}`;
    if (changed) await audit(sql, org.id, existing.id, "phone_changed", "Verified a new number from a signed-in session.");
    return { ok: true as const, masked: maskPhone(checked.phone), claimed: null, changed };
  }
  const claimed = await claimPlace(sql, orgRef(org), context.userId, checked.phone);
  return { ok: true as const, masked: maskPhone(checked.phone), claimed: claimed ? { verified: claimed.verified } : null, changed };
});

export const registerMember = createServerFn({ method: "POST" }).validator(parseRegister).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const org = await orgBySlug(sql, data.slug);
  const existing = await memberByUser(sql, org.id, context.userId);
  if (existing) return { already: true, founding: false, claimed: false };
  const phone = await primaryPhone(sql, context.userId);
  if (!phone) fail("Verify your phone number first. It is how the year group knows it is you.");
  const claimed = await claimPlace(sql, orgRef(org), context.userId, phone.phone);
  if (claimed) return { already: false, founding: false, claimed: true };
  const form: EnrolForm = {
    displayName: data.displayName, programmeId: data.programmeId, classId: data.classId, residence: data.residence,
    houseId: data.houseId, dormId: data.dormId, cotNumber: data.cotNumber, profession: data.profession, city: data.city, circleIds: data.circleIds,
  };
  const out = await enrolNewMember(sql, orgRef(org), context.userId, phone.phone, context.email ?? (await userEmail(context.userId)), form);
  return { already: false, founding: out.founder, claimed: false };
});

function parseStep(input: unknown) {
  const b = input as { slug?: string; action?: string; code?: string };
  const action = String(b?.action ?? "") as StepUpAction;
  if (!STEP_UP_ACTIONS.includes(action)) fail("That action does not take a code.");
  return { slug: slugOf(b?.slug), action, code: String(b?.code ?? "").replace(/\D/g, "").slice(0, 6) };
}

export const stepUpStart = createServerFn({ method: "POST" }).validator(parseStep).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const { org, member } = await requireMember(sql, data.slug, context.userId);
  const sent = await requestStepUp(sql, smsDeps(), { userId: context.userId, orgId: org.id, memberId: member.id }, data.action);
  return { masked: maskPhone(sent.phone), expiresInSeconds: sent.expiresInSeconds, devCode: sent.devCode ?? null };
});

export const stepUpConfirm = createServerFn({ method: "POST" }).validator(parseStep).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const { org, member } = await requireMember(sql, data.slug, context.userId);
  return confirmStepUp(sql, { userId: context.userId, orgId: org.id, memberId: member.id }, data.action, data.code);
});

export const homeData = createServerFn({ method: "POST" }).validator(slugOf).middleware([authMiddleware]).handler(async ({ data: slug, context }) => {
  const sql = await getSql();
  const { org, member, roles } = await requireMember(sql, slug, context.userId);
  const heroRows = await sql<Record<string, unknown>>`
    select * from purpose where organisation_id = ${org.id} and hero = true and status = 'open' limit 1
  `;
  const hero = heroRows[0];
  let raised = 0;
  if (hero) {
    const sum = await sql<{ net: number }>`
      select coalesce(sum(case when direction = 'credit' then amount_pesewas else -amount_pesewas end), 0)::int as net
      from ledger_entry where organisation_id = ${org.id} and purpose_id = ${String(hero.id)} and account = 'fund'
    `;
    raised = num(sum[0]?.net);
  }
  const circles = await sql<Record<string, unknown>>`
    select c.id, c.name, c.kind, c.purpose from circle_member cm
    join circle c on c.id = cm.circle_id
    where cm.membership_id = ${member.id}
    order by case c.kind when 'derived' then 0 else 1 end, c.name
  `;
  const feed = await sql<Record<string, unknown>>`
    select p.id, p.body, p.created_at::text as created_at, c.name as circle_name, m.nickname, m.display_name, m.sample
    from post p
    join circle c on c.id = p.circle_id
    join membership m on m.id = p.author_membership_id
    where p.circle_id in (select circle_id from circle_member where membership_id = ${member.id})
    order by p.created_at desc limit 6
  `;
  const due = await sql<Record<string, unknown>>`
    select i.due_on::text as due_on, pr.title from instalment i
    join pledge pl on pl.id = i.pledge_id
    join purpose pr on pr.id = pl.purpose_id
    where pl.membership_id = ${member.id} and i.paid_pesewas < i.amount_pesewas and i.due_on <= current_date + 21
    order by i.due_on limit 1
  `;
  const event = await sql<Record<string, unknown>>`
    select e.id, e.title, e.place from hub_event e
    where e.organisation_id = ${org.id} and e.starts_at > now() and e.starts_at < now() + interval '30 days'
      and (e.circle_id is null or e.circle_id in (select circle_id from circle_member where membership_id = ${member.id}))
      and not exists (select 1 from rsvp r where r.event_id = e.id and r.membership_id = ${member.id})
    order by e.starts_at limit 1
  `;
  const expense = isOfficer(roles)
    ? await sql<{ n: number }>`select count(*)::int as n from expense where organisation_id = ${org.id} and status in ('submitted', 'partially_approved')`
    : [];
  const refunds = isOfficer(roles)
    ? await sql<{ n: number }>`select count(*)::int as n from refund where organisation_id = ${org.id} and status = 'awaiting_approval'`
    : [];
  let attention: { kicker: string; title: string; body: string; href: string } | null = null;
  if (member.status !== "verified") {
    attention = { kicker: "Your place", title: "Waiting on confirmation", body: "Two verified cot mates, or an executive who is not you, confirm a claim.", href: "me" };
  } else if (due[0]) {
    attention = { kicker: "Instalment", title: String(due[0].title), body: `A part is due ${String(due[0].due_on)}.`, href: "give" };
  } else if (num(expense[0]?.n) > 0) {
    attention = { kicker: "Approval", title: "An expense is waiting", body: "It does not move until someone other than the requester approves it.", href: "control" };
  } else if (num(refunds[0]?.n) > 0) {
    attention = { kicker: "Refund", title: "A refund needs a second person", body: "The treasurer has asked. A different executive confirms, with a fresh text-message code.", href: "control" };
  } else if (event[0]) {
    attention = { kicker: "Coming up", title: String(event[0].title), body: `${String(event[0].place)}. Say if you are coming.`, href: `event:${String(event[0].id)}` };
  }
  // What you have given (gateway-confirmed only), and how many have given to the appeal.
  const mine = await sql<{ total: number; n: number }>`
    select coalesce(sum(gift_pesewas), 0)::int as total, count(*)::int as n from payment_intent
    where organisation_id = ${org.id} and membership_id = ${member.id} and status = 'succeeded'
  `;
  const heroGivers = hero
    ? await sql<{ n: number }>`
        select count(distinct membership_id)::int as n from payment_intent
        where organisation_id = ${org.id} and purpose_id = ${String(hero.id)} and status = 'succeeded'
      `
    : [];
  // The latest announcement that reached this member, signed with the sender's name and title.
  const notice = await sql<Record<string, unknown>>`
    select a.body, a.audience, a.created_at::text as created_at, m.display_name, m.nickname,
      (select r.role from role_assignment r where r.membership_id = a.author_membership_id
         order by array_position(array['organisation_admin','executive','treasurer','secretary','house_captain','dorm_prefect','cot_leader','class_representative'], r.role) limit 1) as role
    from announcement a join membership m on m.id = a.author_membership_id
    where a.organisation_id = ${org.id} and a.created_at > now() - interval '21 days'
      and exists (select 1 from outbox o where o.idempotency_key = 'an:' || a.id || ':' || ${member.id} || ':in_app')
    order by a.created_at desc limit 1
  `;
  return {
    org,
    member: publicPerson(member, roles, true),
    roles: roles.map((r) => r.role),
    control: canOpenControl(roles),
    notice: notice[0]
      ? {
          body: String(notice[0].body), audience: String(notice[0].audience), at: String(notice[0].created_at),
          from: String(notice[0].display_name), role: str(notice[0].role),
        }
      : null,
    hero: hero ? { id: String(hero.id), title: String(hero.title), story: String(hero.story), target: num(hero.target_pesewas), raised, givers: num(heroGivers[0]?.n) } : null,
    given: { total: num(mine[0]?.total), count: num(mine[0]?.n) },
    circles: circles.map((c) => ({ id: String(c.id), name: String(c.name), kind: String(c.kind), purpose: String(c.purpose) })),
    feed: feed.map((p) => ({
      id: String(p.id),
      body: String(p.body),
      at: String(p.created_at),
      circle: String(p.circle_name),
      author: String(p.nickname || p.display_name),
      sample: p.sample === true,
    })),
    attention,
  };
});

export const feedData = createServerFn({ method: "POST" }).validator(slugOf).middleware([authMiddleware]).handler(async ({ data: slug, context }) => {
  const sql = await getSql();
  const { member } = await requireMember(sql, slug, context.userId);
  const feed = await sql<Record<string, unknown>>`
    select p.id, p.body, p.created_at::text as created_at, c.name as circle_name, m.nickname, m.display_name, m.sample
    from post p join circle c on c.id = p.circle_id join membership m on m.id = p.author_membership_id
    where p.circle_id in (select circle_id from circle_member where membership_id = ${member.id})
    order by p.created_at desc limit 40
  `;
  return feed.map((p) => ({
    id: String(p.id), body: String(p.body), at: String(p.created_at), circle: String(p.circle_name),
    author: String(p.nickname || p.display_name), sample: p.sample === true,
  }));
});

export const circleList = createServerFn({ method: "POST" }).validator(slugOf).middleware([authMiddleware]).handler(async ({ data: slug, context }) => {
  const sql = await getSql();
  const { org, member } = await requireMember(sql, slug, context.userId);
  const rows = await sql<Record<string, unknown>>`
    select c.id, c.name, c.kind, c.visibility, c.purpose, sn.level,
      exists(select 1 from circle_member cm where cm.circle_id = c.id and cm.membership_id = ${member.id}) as joined,
      (select count(*)::int from circle_member cm where cm.circle_id = c.id) as members
    from circle c
    left join structure_node sn on sn.id = c.node_id
    where c.organisation_id = ${org.id}
      and (c.visibility <> 'hidden' or exists(select 1 from circle_member cm where cm.circle_id = c.id and cm.membership_id = ${member.id}))
    order by c.name
  `;
  return rows.map((c) => ({
    id: String(c.id), name: String(c.name), kind: String(c.kind), visibility: String(c.visibility),
    purpose: String(c.purpose), joined: c.joined === true, level: str(c.level) ?? (c.kind === "derived" ? "year" : null),
    members: num(c.members),
  }));
});

async function groupStanding(sql: Sql, org: Org, nodeId: string, level: "house" | "class") {
  const col = level === "house" ? "house_node_id" : "class_node_id";
  const hero = await sql<{ id: string }>`select id from purpose where organisation_id = ${org.id} and hero = true limit 1`;
  if (!hero[0]) return { shown: false, total: null as number | null };
  const rows = await sql.query<{ givers: number; total: number }>(
    `with nets as (
      select pi.membership_id,
        coalesce(sum(case when le.account = 'fund' and le.direction = 'credit' then le.amount_pesewas
                          when le.account = 'fund' and le.direction = 'debit' then -le.amount_pesewas else 0 end), 0)::int as net
      from payment_intent pi join ledger_entry le on le.intent_id = pi.id
      where pi.organisation_id = $1 and pi.purpose_id = $2 and pi.status = 'succeeded'
      group by pi.membership_id
    )
    select count(distinct m.id) filter (where nets.net > 0)::int as givers,
           coalesce(sum(nets.net) filter (where nets.net > 0), 0)::int as total
    from membership m left join nets on nets.membership_id = m.id
    where m.organisation_id = $1 and m.${col} = $3`,
    [org.id, hero[0].id, nodeId],
  );
  const givers = num(rows[0]?.givers);
  const shown = givers >= org.minGivers;
  return { shown, total: shown ? num(rows[0]?.total) : null };
}

export const circleDetail = createServerFn({ method: "POST" }).validator((input: unknown) => {
  const b = input as { slug?: string; id?: string };
  return { slug: slugOf(b?.slug), id: String(b?.id ?? "") };
}).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const { org, member } = await requireMember(sql, data.slug, context.userId);
  const rows = await sql<Record<string, unknown>>`select * from circle where id = ${data.id} and organisation_id = ${org.id}`;
  const circle = rows[0];
  if (!circle) fail("That circle is not here.");
  const mine = await sql<{ n: number }>`select count(*)::int as n from circle_member where circle_id = ${data.id} and membership_id = ${member.id}`;
  const joined = num(mine[0]?.n) > 0;
  if (circle.visibility === "hidden" && !joined) fail("That circle is hidden.");
  const posts = await sql<Record<string, unknown>>`
    select p.id, p.body, p.created_at::text as created_at, m.nickname, m.display_name, m.sample, m.id as author_id
    from post p join membership m on m.id = p.author_membership_id
    where p.circle_id = ${data.id} order by p.created_at desc limit 30
  `;
  const members = await sql<Record<string, unknown>>`
    select m.id, m.nickname, m.display_name, m.sample, m.city from circle_member cm
    join membership m on m.id = cm.membership_id
    where cm.circle_id = ${data.id} order by m.display_name limit 40
  `;
  const events = await sql<Record<string, unknown>>`
    select id, title, place, starts_at::text as starts_at from hub_event
    where circle_id = ${data.id} and starts_at > now() - interval '1 day' order by starts_at limit 4
  `;
  let standing: { shown: boolean; total: number | null } | null = null;
  if (circle.node_id && joined) {
    const node = await sql<{ level: string }>`select level from structure_node where id = ${String(circle.node_id)}`;
    if (node[0]?.level === "house" || node[0]?.level === "class") {
      standing = await groupStanding(sql, org, String(circle.node_id), node[0].level);
    }
  }
  return {
    id: String(circle.id),
    name: String(circle.name),
    purpose: String(circle.purpose),
    kind: String(circle.kind),
    visibility: String(circle.visibility),
    joined,
    canPost: joined && member.status === "verified",
    posts: posts.map((p) => ({
      id: String(p.id), body: String(p.body), at: String(p.created_at),
      author: String(p.nickname || p.display_name), authorId: String(p.author_id), sample: p.sample === true,
    })),
    members: members.map((m) => ({
      id: String(m.id), name: String(m.nickname || m.display_name), full: String(m.display_name),
      sample: m.sample === true, city: str(m.city),
    })),
    events: events.map((e) => ({ id: String(e.id), title: String(e.title), place: String(e.place), startsAt: String(e.starts_at) })),
    standing,
  };
});

export const peoplePage = createServerFn({ method: "POST" }).validator((input: unknown) => {
  const b = input as { slug?: string; q?: string; cursor?: string | null };
  return { slug: slugOf(b?.slug), q: String(b?.q ?? "").slice(0, 60), cursor: b?.cursor ?? null };
}).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const { org, member, roles } = await requireMember(sql, data.slug, context.userId);
  const params: unknown[] = [org.id];
  let where = "m.organisation_id = $1";
  if (data.q.trim()) {
    params.push(like(data.q));
    where += ` and (m.display_name ilike $${params.length} or coalesce(m.nickname,'') ilike $${params.length} or coalesce(m.city,'') ilike $${params.length} or coalesce(m.profession,'') ilike $${params.length})`;
  }
  if (data.cursor) {
    const [name, id] = String(data.cursor).split("|");
    params.push(name, id);
    where += ` and (m.display_name > $${params.length - 1} or (m.display_name = $${params.length - 1} and m.id > $${params.length}))`;
  }
  const rows = await sql.query<Record<string, unknown>>(
    `select ${MEMBER_SELECT} from membership m ${MEMBER_JOINS} where ${where} order by m.display_name, m.id limit 21`,
    params,
  );
  if (data.q.trim()) await track(sql, org.id, member.id, "utility", "directory_searched", data.q.slice(0, 40));
  const hasMore = rows.length > 20;
  const slice = rows.slice(0, 20);
  const last = slice[slice.length - 1];
  return {
    people: slice.map((r) => {
      const m = publicPerson(mapMember(r), roles, r.user_id === context.userId);
      return {
        id: m.id, name: m.nickname || m.displayName, full: m.displayName, city: m.city,
        profession: m.profession, house: m.houseName, className: m.className, programme: m.programmeName, sample: m.sample,
      };
    }),
    hasMore,
    cursor: hasMore && last ? `${String(last.display_name)}|${String(last.id)}` : null,
  };
});

export const personDetail = createServerFn({ method: "POST" }).validator((input: unknown) => {
  const b = input as { slug?: string; id?: string };
  return { slug: slugOf(b?.slug), id: String(b?.id ?? "") };
}).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const { org, member, roles } = await requireMember(sql, data.slug, context.userId);
  const rows = await sql.query<Record<string, unknown>>(
    `select ${MEMBER_SELECT} from membership m ${MEMBER_JOINS} where m.id = $1 and m.organisation_id = $2`,
    [data.id, org.id],
  );
  if (!rows[0]) fail("That person is not in this year group.");
  const them = mapMember(rows[0]);
  const circles = await sql.query<Record<string, unknown>>(
    `select c.id, c.name from circle_member cm join circle c on c.id = cm.circle_id
     where cm.membership_id = $1 and (c.visibility <> 'hidden' or exists (
       select 1 from circle_member me where me.circle_id = c.id and me.membership_id = $2))
     order by c.name`,
    [them.id, member.id],
  );
  const businesses = await sql<{ id: string; name: string; category: string }>`
    select id, name, category from business where membership_id = ${them.id} and organisation_id = ${org.id}
  `;
  return {
    person: publicPerson(them, roles, them.id === member.id),
    self: them.id === member.id,
    circles: circles.map((c) => ({ id: String(c.id), name: String(c.name) })),
    businesses,
  };
});

async function boards(sql: Sql, org: Org, purposeId: string) {
  const run = async (level: "house" | "class") => {
    const col = level === "house" ? "house_node_id" : "class_node_id";
    const rows = await sql.query<Record<string, unknown>>(
      `with nets as (
        select pi.membership_id,
          coalesce(sum(case when le.account = 'fund' and le.direction = 'credit' then le.amount_pesewas
                            when le.account = 'fund' and le.direction = 'debit' then -le.amount_pesewas else 0 end), 0)::int as net
        from payment_intent pi join ledger_entry le on le.intent_id = pi.id
        where pi.organisation_id = $1 and pi.purpose_id = $2 and pi.status = 'succeeded'
        group by pi.membership_id
      )
      select n.id, n.name, parent.name as parent_name,
        count(distinct m.id) filter (where nets.net > 0)::int as givers,
        coalesce(sum(nets.net) filter (where nets.net > 0), 0)::int as total
      from structure_node n
      left join structure_node parent on parent.id = n.parent_id
      left join membership m on m.${col} = n.id and m.organisation_id = n.organisation_id
      left join nets on nets.membership_id = m.id
      where n.organisation_id = $1 and n.level = $3
      group by n.id, n.name, parent.name, n.sort
      order by n.sort, n.name`,
      [org.id, purposeId, level],
    );
    return rows.map((r) => {
      const shown = num(r.givers) >= org.minGivers;
      return {
        id: String(r.id),
        name: level === "class" && r.parent_name ? `${String(r.parent_name)} ${String(r.name)}` : String(r.name),
        shown,
        total: shown ? num(r.total) : null,
        // How many have given is shown even below the threshold ("2 more givers puts us on the board"); amounts are not.
        givers: num(r.givers),
      };
    });
  };
  return { houses: await run("house"), classes: await run("class"), minGivers: org.minGivers };
}

export const purposeList = createServerFn({ method: "POST" }).validator(slugOf).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const { org, member } = await requireMember(sql, data, context.userId);
  if (member.status !== "verified") fail("Giving opens once your place is confirmed.");
  const rows = await sql<Record<string, unknown>>`
    select id, type, title, story, target_pesewas, hero from purpose
    where organisation_id = ${org.id} and status = 'open' order by hero desc, title
  `;
  const totals = await sql<Record<string, unknown>>`
    select purpose_id, coalesce(sum(case when direction = 'credit' then amount_pesewas else -amount_pesewas end), 0)::int as net
    from ledger_entry where organisation_id = ${org.id} and account = 'fund' group by purpose_id
  `;
  const byId = new Map(totals.map((t) => [String(t.purpose_id), num(t.net)]));
  return {
    paymentMode: org.paymentMode,
    purposes: rows.map((p) => ({
      id: String(p.id), type: String(p.type), title: String(p.title), story: String(p.story),
      target: num(p.target_pesewas), raised: byId.get(String(p.id)) ?? 0, hero: p.hero === true,
    })),
  };
});

export const purposeDetail = createServerFn({ method: "POST" }).validator((input: unknown) => {
  const b = input as { slug?: string; id?: string };
  return { slug: slugOf(b?.slug), id: String(b?.id ?? "") };
}).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const { org, member } = await requireMember(sql, data.slug, context.userId);
  const rows = await sql<Record<string, unknown>>`select * from purpose where id = ${data.id} and organisation_id = ${org.id}`;
  if (!rows[0]) fail("That purpose is not open.");
  await track(sql, org.id, member.id, "money", "campaign_viewed", String(rows[0].title));
  const raisedRow = await sql<{ net: number }>`
    select coalesce(sum(case when direction = 'credit' then amount_pesewas else -amount_pesewas end), 0)::int as net
    from ledger_entry where purpose_id = ${data.id} and account = 'fund'
  `;
  // What moves people to give: how many have, that someone just did, and how their own cot is doing.
  // Counts and houses only; a giver's name or amount never appears here.
  const givers = await sql<{ n: number }>`
    select count(distinct membership_id)::int as n from payment_intent
    where organisation_id = ${org.id} and purpose_id = ${data.id} and status = 'succeeded'
  `;
  const recent = await sql<{ house: string | null; at: string; me: boolean }>`
    select h.name as house, coalesce(pi.paid_at, pi.created_at)::text as at, (pi.membership_id = ${member.id}) as me
    from payment_intent pi
    join membership m on m.id = pi.membership_id
    left join structure_node h on h.id = m.house_node_id
    where pi.organisation_id = ${org.id} and pi.purpose_id = ${data.id} and pi.status = 'succeeded'
    order by coalesce(pi.paid_at, pi.created_at) desc limit 6
  `;
  const cot = member.cotNodeId
    ? await sql<{ mates: number; given: number }>`
        select count(*)::int as mates,
          count(*) filter (where exists (
            select 1 from payment_intent pi where pi.membership_id = m.id and pi.purpose_id = ${data.id} and pi.status = 'succeeded'
          ))::int as given
        from membership m where m.organisation_id = ${org.id} and m.cot_node_id = ${member.cotNodeId} and m.status = 'verified'
      `
    : [];
  const mine = await sql<{ total: number }>`
    select coalesce(sum(gift_pesewas), 0)::int as total from payment_intent
    where organisation_id = ${org.id} and purpose_id = ${data.id} and membership_id = ${member.id} and status = 'succeeded'
  `;
  return {
    givers: num(givers[0]?.n),
    recent: recent.map((r) => ({ house: r.house, at: String(r.at), me: r.me === true })),
    cot: cot[0] && member.cotName ? { name: `${member.cotName}, ${member.dormName ?? ""} ${member.houseName ?? ""}`.trim(), mates: num(cot[0].mates), given: num(cot[0].given) } : null,
    mine: num(mine[0]?.total),
    myHouseId: member.houseNodeId,
    id: String(rows[0].id), type: String(rows[0].type), title: String(rows[0].title), story: String(rows[0].story),
    target: num(rows[0].target_pesewas), raised: num(raisedRow[0]?.net), hero: rows[0].hero === true,
    gatewayFeeBps: org.gatewayFeeBps, platformFeeBps: org.platformFeeBps, paymentMode: org.paymentMode,
    verified: member.status === "verified",
    boards: rows[0].hero === true ? await boards(sql, org, data.id) : null,
  };
});

function parsePay(input: unknown) {
  const b = input as { slug?: string; purposeId?: string; giftPesewas?: number; coverFees?: boolean; anonymous?: boolean; clientRef?: string; pledge?: boolean };
  const gift = num(b?.giftPesewas);
  if (!Number.isInteger(gift) || gift < 100) fail("Enter at least GH₵ 1.");
  if (gift > 50_000_000) fail("That amount is above what this hub will take in one gift.");
  const clientRef = String(b?.clientRef ?? "");
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(clientRef)) fail("Start the payment again.");
  return {
    slug: slugOf(b?.slug), purposeId: String(b?.purposeId ?? ""), giftPesewas: gift,
    coverFees: b?.coverFees === true, anonymous: b?.anonymous === true, clientRef, pledge: b?.pledge === true,
  };
}

const paystackSecret = () => process.env.PAYSTACK_SECRET_KEY?.trim() || null;
const appUrl = () => (process.env.PUBLIC_APP_URL?.trim() || "http://localhost:8080").replace(/\/$/, "");
const providerFor = (org: Org) => (org.paymentMode === "live" ? "paystack" : "test");

/**
 * Start the live gateway for a pending payment and return where to send the
 * member. If the gateway refuses, this throws and the whole request, including
 * the intent, rolls back. In test mode there is no gateway and it returns null.
 */
export async function beginGateway(
  sql: Sql, org: Org, memberId: string, userId: string, intentId: string,
  plan: { charge: number; platformFee: number }, reference: string,
): Promise<string | null> {
  if (org.paymentMode !== "live") return null;
  if (demoMode()) fail("This is the demo. Live payments are switched off here.");
  const secret = paystackSecret();
  if (!secret) fail("Live payments are not connected yet.");
  if (!org.paystackSubaccount) fail("This year group has not connected its payment account yet.");
  const email = (await userEmail(userId)) ?? `member-${memberId}@payments.invalid`;
  const init = await initializeTransaction(
    secret,
    buildInitializePayload({
      email, chargePesewas: plan.charge, reference, callbackUrl: `${appUrl()}/o/${org.slug}/pay/${intentId}`,
      platformFeePesewas: plan.platformFee, subaccount: org.paystackSubaccount, metadata: { intent: intentId, organisation: org.slug },
    }),
  );
  await sql`update payment_intent set authorization_url = ${init.authorization_url} where id = ${intentId}`;
  return init.authorization_url;
}

export const startPayment = createServerFn({ method: "POST" }).validator(parsePay).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const { org, member } = await requireMember(sql, data.slug, context.userId);
  if (member.status !== "verified") fail("Giving opens once your place is confirmed.");
  if (org.paymentMode === "live" && !paystackSecret()) fail("Live payments are not connected yet.");
  if (org.paymentMode === "live" && !org.paystackSubaccount) fail("This year group has not connected its payment account yet.");
  const purpose = await sql<{ id: string; title: string }>`
    select id, title from purpose where id = ${data.purposeId} and organisation_id = ${org.id} and status = 'open'
  `;
  if (!purpose[0]) fail("That purpose is not open.");
  const reference = `c_${data.clientRef}`;
  const existing = await sql<Record<string, unknown>>`select id, membership_id, status, authorization_url from payment_intent where reference = ${reference}`;
  if (existing[0]) {
    if (existing[0].membership_id !== member.id) fail("That reference is already used.");
    return { intentId: String(existing[0].id), status: String(existing[0].status), authorizationUrl: str(existing[0].authorization_url) };
  }
  let gift = data.giftPesewas;
  let pledgeId: string | null = null;
  if (data.pledge) {
    const part = Math.floor(gift / 3);
    const amounts = [part, part, gift - 2 * part];
    pledgeId = nid("pl");
    await sql`
      insert into pledge (id, organisation_id, purpose_id, membership_id, total_pesewas, anonymous, status)
      values (${pledgeId}, ${org.id}, ${purpose[0].id}, ${member.id}, ${gift}, ${data.anonymous}, 'open')
    `;
    for (let i = 0; i < 3; i++) {
      await sql`
        insert into instalment (id, organisation_id, pledge_id, due_on, amount_pesewas, paid_pesewas, seq)
        values (${nid("in")}, ${org.id}, ${pledgeId}, (current_date + (${i} * 30)), ${amounts[i]}, 0, ${i + 1})
      `;
    }
    gift = amounts[0];
    await track(sql, org.id, member.id, "money", "pledge_created", purpose[0].title);
  }
  const plan = planCollection({ gift, gatewayBps: org.gatewayFeeBps, platformBps: org.platformFeeBps, coverFees: data.coverFees });
  const intentId = nid("pi");
  await sql`
    insert into payment_intent (
      id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas,
      gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, provider
    ) values (
      ${intentId}, ${org.id}, ${purpose[0].id}, ${member.id}, ${pledgeId}, ${plan.gift}, ${plan.charge},
      ${plan.gatewayFee}, ${plan.platformFee}, ${data.coverFees}, ${data.anonymous}, 'pending', ${reference}, ${providerFor(org)}
    )
  `;
  const authorizationUrl = await beginGateway(sql, org, member.id, context.userId, intentId, plan, reference);
  await track(sql, org.id, member.id, "money", "payment_started", purpose[0].title);
  return { intentId, status: "pending", authorizationUrl };
});

async function intentView(sql: Sql, orgId: string, intentId: string, memberId: string) {
  const rows = await sql<Record<string, unknown>>`
    select pi.*, pr.title as purpose_title, m.display_name as payer, m.phone as payer_phone, h.name as house
    from payment_intent pi
    join purpose pr on pr.id = pi.purpose_id
    join membership m on m.id = pi.membership_id
    left join structure_node h on h.id = m.house_node_id
    where pi.id = ${intentId} and pi.organisation_id = ${orgId} and pi.membership_id = ${memberId}
  `;
  const row = rows[0];
  if (!row) fail("That payment is not yours.");
  const receipt = await sql<{ number: string; voided: boolean }>`
    select number, voided from receipt where intent_id = ${intentId} and refund_of is null order by issued_on desc limit 1
  `;
  return {
    id: String(row.id), status: String(row.status), reference: String(row.reference), title: String(row.purpose_title),
    gift: num(row.gift_pesewas), charge: num(row.charge_pesewas), gatewayFee: num(row.gateway_fee_pesewas),
    platformFee: num(row.platform_fee_pesewas), coverFees: row.cover_fees === true, anonymous: row.anonymous === true,
    provider: String(row.provider), authorizationUrl: str(row.authorization_url),
    receipt: receipt[0]?.number ?? null, voided: receipt[0]?.voided === true,
    purposeId: String(row.purpose_id), payer: String(row.payer), payerPhone: str(row.payer_phone), house: str(row.house),
    paidAt: str(row.paid_at), pledged: row.pledge_id != null,
  };
}

export const intentState = createServerFn({ method: "POST" }).validator((input: unknown) => {
  const b = input as { slug?: string; id?: string };
  return { slug: slugOf(b?.slug), id: String(b?.id ?? "") };
}).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const { org, member } = await requireMember(sql, data.slug, context.userId);
  const view = await intentView(sql, org.id, data.id, member.id);
  return { ...view, paymentMode: org.paymentMode, canSimulate: org.paymentMode === "test" && devFlag("HUB_ALLOW_TEST_GATEWAY") };
});

const intentArgs = (input: unknown) => {
  const b = input as { slug?: string; id?: string };
  return { slug: slugOf(b?.slug), id: String(b?.id ?? "") };
};

/**
 * A stand-in gateway for demonstrations only. It is refused in production and
 * unless HUB_ALLOW_TEST_GATEWAY=1, and it never applies to a live organisation.
 */
export const testGateway = createServerFn({ method: "POST" }).validator(intentArgs).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const { org, member } = await requireMember(sql, data.slug, context.userId);
  if (org.paymentMode !== "test" || !devFlag("HUB_ALLOW_TEST_GATEWAY")) fail("Payments are confirmed by the gateway, never from this screen.");
  const rows = await sql<{ id: string; reference: string }>`
    select id, reference from payment_intent where id = ${data.id} and organisation_id = ${org.id} and membership_id = ${member.id}
  `;
  if (!rows[0]) fail("That payment is not yours.");
  await settleIntentCore(sql, payOrg(org), rows[0].id, {
    provider: "test", reference: `test_${rows[0].id}`, eventKey: `test:${rows[0].id}`, eventType: "charge.success", raw: { provider: "test", reference: rows[0].reference },
  });
  return intentView(sql, org.id, data.id, member.id);
});

/**
 * "I have paid but it still shows pending." Ask the gateway directly. Only the
 * gateway's own answer, fetched by the server, can move the payment.
 */
export const verifyIntent = createServerFn({ method: "POST" }).validator(intentArgs).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const { org, member } = await requireMember(sql, data.slug, context.userId);
  const view = await intentView(sql, org.id, data.id, member.id);
  const secret = paystackSecret();
  if (view.status === "pending" && view.provider === "paystack" && secret) {
    const { enforce } = await import("@/lib/hub/ratelimit");
    await enforce(sql, `verify:${member.id}`, 30, 600, "That is a lot of checks. Wait a few minutes, then try again.");
    const v = await verifyTransaction(secret, view.reference);
    const fact = { provider: "paystack" as const, reference: view.reference, eventKey: `verify:${view.reference}:${v.status}`, eventType: `verify.${v.status}`, raw: v, amount: v.amount, paidAt: v.paidAt };
    if (v.status === "success") await settleIntentCore(sql, payOrg(org), view.id, fact);
    else if (v.status === "failed" || v.status === "abandoned") await failIntent(sql, payOrg(org), view.id, v.status === "failed" ? "failed" : "abandoned", fact);
  }
  return intentView(sql, org.id, data.id, member.id);
});

export const abandonIntent = createServerFn({ method: "POST" }).validator(intentArgs).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const { org, member } = await requireMember(sql, data.slug, context.userId);
  await sql`
    update payment_intent set status = 'abandoned'
    where id = ${data.id} and organisation_id = ${org.id} and membership_id = ${member.id} and status = 'pending'
  `;
  return { ok: true };
});

export const publicReceipt = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const number = String((input as { number?: string })?.number ?? "");
    if (!/^[A-Za-z0-9-]{4,40}$/.test(number)) fail("That receipt number does not look right.");
    return number;
  })
  .handler(async ({ data }) =>
    withScope({ userId: null }, async () => {
      const sql = await getSql();
      const rows = await sql<Record<string, unknown>>`select * from public_receipt(${data})`;
      if (!rows[0]) fail("No receipt matches that number.");
      return {
        number: String(rows[0].number), purpose: String(rows[0].purpose_title), amount: num(rows[0].amount_pesewas),
        issuedOn: String(rows[0].issued_on), voided: rows[0].voided === true,
      };
    }),
  );

export const myReceipts = createServerFn({ method: "POST" }).validator(slugOf).middleware([authMiddleware]).handler(async ({ data: slug, context }) => {
  const sql = await getSql();
  const { org, member } = await requireMember(sql, slug, context.userId);
  const rows = await sql<Record<string, unknown>>`
    select r.number, r.purpose_title, r.amount_pesewas, r.issued_on::text as issued_on, r.voided, r.refund_of
    from receipt r join payment_intent pi on pi.id = r.intent_id
    where pi.membership_id = ${member.id} and r.organisation_id = ${org.id}
    order by r.issued_on desc, r.number desc
  `;
  return rows.map((r) => ({
    number: String(r.number), purpose: String(r.purpose_title), amount: num(r.amount_pesewas),
    issuedOn: String(r.issued_on), voided: r.voided === true, refundOf: str(r.refund_of),
  }));
});
