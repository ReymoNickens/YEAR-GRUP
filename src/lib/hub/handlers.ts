import "server-only";
import { authMiddleware, createServerFn } from "@/lib/server-fn";
import { getSql, type Sql } from "@/lib/db";
import { digestDraft, networkSearch, polish, reminderDraft, routeAsk, type Ctx as AiCtx } from "@/lib/hub/ai";
import { confirmClaim, demoConfirm, openClaims } from "@/lib/hub/claims";
import { importCsv, reviewRow, squash, type Decision } from "@/lib/hub/importer";
import { planCollection } from "@/lib/hub/money";
import {
  ASK_CATEGORIES,
  audit,
  beginGateway,
  canOpenControl,
  fail,
  isOfficer,
  isTreasurer,
  like,
  nid,
  num,
  payOrg,
  requireMember,
  scopeOf,
  slugOf,
  str,
  track,
} from "@/lib/hub/core";
import { enqueue } from "@/lib/hub/outbox";
import { approveRefund, confirmSettlement, recordExpensePayout, rejectRefund, requestRefund } from "@/lib/hub/payments";
import { createRefund, verifyTransaction } from "@/lib/hub/paystack";
import { normalisePhone } from "@/lib/hub/phone";
import { reconcile } from "@/lib/hub/reconcile";
import { requireStepUp, type StepUpAction } from "@/lib/hub/stepup";
import { QUEUEABLE } from "@/lib/offline-queue";
import { firstTime, mergeProfile } from "@/lib/hub/sync";
import { expenseSignerOf, expenseStatusAfter, type ExpenseSigner } from "@/lib/hub/rules";
import { demoMode, devFlag } from "@/lib/hub/util";

export {
  abandonIntent,
  circleDetail,
  circleList,
  feedData,
  homeData,
  intentState,
  listOrgs,
  myReceipts,
  orgEntry,
  peoplePage,
  personDetail,
  publicReceipt,
  purposeDetail,
  purposeList,
  registerMember,
  phoneStart,
  phoneStatus,
  phoneVerify,
  startPayment,
  stepUpConfirm,
  stepUpStart,
  structure,
  testGateway,
  verifyIntent,
} from "@/lib/hub/core";

async function readBundle(sql: Sql, slug: string, userId: string, module: string, extra: { id?: string; nodeId?: string; q?: string }) {
  const { org, member, roles } = await requireMember(sql, slug, userId);
  const officer = isOfficer(roles);
  if (module === "directory") {
    const q = like(extra.q || "");
    const rows = extra.q?.trim()
      ? await sql.query<Record<string, unknown>>(
          `select b.*, m.nickname, m.display_name, m.sample,
            (select count(*)::int from business_support s where s.business_id = b.id) as supports,
            exists(select 1 from business_support s where s.business_id = b.id and s.membership_id = $3) as mine
           from business b join membership m on m.id = b.membership_id
           where b.organisation_id = $1 and (b.name ilike $2 or b.category ilike $2 or b.city ilike $2 or m.nickname ilike $2)
           order by b.name`,
          [org.id, q, member.id],
        )
      : await sql<Record<string, unknown>>`
          select b.*, m.nickname, m.display_name, m.sample,
            (select count(*)::int from business_support s where s.business_id = b.id) as supports,
            exists(select 1 from business_support s where s.business_id = b.id and s.membership_id = ${member.id}) as mine
          from business b join membership m on m.id = b.membership_id
          where b.organisation_id = ${org.id} order by b.name
        `;
    return {
      businesses: rows.map((b) => ({
        id: String(b.id),
        name: String(b.name),
        category: String(b.category),
        city: String(b.city),
        contact: String(b.contact),
        blurb: String(b.blurb),
        owner: String(b.nickname || b.display_name),
        ownerId: String(b.membership_id),
        sample: b.sample === true,
        supports: num(b.supports),
        mine: b.mine === true,
      })),
    };
  }
  if (module === "asks") {
    const asks = await sql<Record<string, unknown>>`
      select a.*, m.nickname, m.display_name, m.sample from ask a
      join membership m on m.id = a.membership_id
      where a.organisation_id = ${org.id} order by a.created_at desc limit 40
    `;
    const replies = await sql<Record<string, unknown>>`
      select r.*, m.nickname, m.display_name from ask_reply r
      join membership m on m.id = r.membership_id
      where r.ask_id in (select id from ask where organisation_id = ${org.id})
      order by r.created_at
    `;
    return {
      asks: asks.map((a) => ({
        id: String(a.id),
        category: String(a.category),
        title: String(a.title),
        body: String(a.body),
        author: String(a.nickname || a.display_name),
        sample: a.sample === true,
        replies: replies
          .filter((r) => r.ask_id === a.id)
          .map((r) => ({
            id: String(r.id),
            body: String(r.body),
            author: String(r.nickname || r.display_name),
            recommended: r.recommended === true,
          })),
      })),
      categories: ASK_CATEGORIES,
    };
  }
  if (module === "events") {
    const rows = await sql<Record<string, unknown>>`
      select e.*, (select status from rsvp r where r.event_id = e.id and r.membership_id = ${member.id}) as mine,
        (select count(*)::int from rsvp r where r.event_id = e.id and r.status = 'going') as going
      from hub_event e where e.organisation_id = ${org.id} order by e.starts_at
    `;
    return {
      events: rows.map((e) => ({
        id: String(e.id),
        title: String(e.title),
        place: String(e.place),
        startsAt: String(e.starts_at),
        story: String(e.story),
        price: e.price_pesewas == null ? null : num(e.price_pesewas),
        purposeId: str(e.purpose_id),
        going: num(e.going),
        mine: str(e.mine),
        capacity: e.capacity == null ? null : num(e.capacity),
      })),
    };
  }
  if (module === "photos") {
    // Albums are listed with a count; only one album's pictures travel at a time,
    // at most 24, so the archive stays light on mobile data as it grows.
    const albums = await sql<Record<string, unknown>>`
      select a.*, (select count(*)::int from photo p where p.album_id = a.id) as photo_count
      from album a where a.organisation_id = ${org.id} order by a.year, a.title
    `;
    const pick = extra.id && albums.some((a) => a.id === extra.id) ? extra.id : albums[0] ? String(albums[0].id) : null;
    const photos = pick
      ? await sql<Record<string, unknown>>`
          select id, caption, motif, data_url from photo
          where organisation_id = ${org.id} and album_id = ${pick} order by created_at desc limit 24
        `
      : [];
    return {
      selected: pick,
      albums: albums.map((a) => ({
        id: String(a.id),
        title: String(a.title),
        year: num(a.year),
        caption: String(a.caption),
        motif: String(a.motif),
        count: num(a.photo_count),
        photos: a.id === pick
          ? photos.map((p) => ({ id: String(p.id), caption: String(p.caption), motif: String(p.motif), dataUrl: p.data_url ? String(p.data_url) : null }))
          : [],
      })),
    };
  }

  if (module === "polls") {
    const polls = await sql<Record<string, unknown>>`select * from poll where organisation_id = ${org.id}`;
    const options = await sql<Record<string, unknown>>`
      select o.*, (select count(*)::int from poll_vote v where v.option_id = o.id) as votes
      from poll_option o where o.poll_id in (select id from poll where organisation_id = ${org.id})
      order by o.sort
    `;
    const mine = await sql<{ poll_id: string; option_id: string }>`
      select poll_id, option_id from poll_vote where membership_id = ${member.id}
    `;
    return {
      polls: polls.map((p) => ({
        id: String(p.id),
        question: String(p.question),
        closesOn: String(p.closes_on),
        mine: mine.find((v) => v.poll_id === p.id)?.option_id ?? null,
        options: options
          .filter((o) => o.poll_id === p.id)
          .map((o) => ({ id: String(o.id), label: String(o.label), votes: num(o.votes) })),
      })),
    };
  }
  if (module === "welfare") {
    const rows = await sql.query<Record<string, unknown>>(
      `select w.*, m.nickname, m.display_name from welfare_request w
       join membership m on m.id = w.membership_id
       where w.organisation_id = $1 and ($2::boolean or w.membership_id = $3)
       order by w.created_at desc`,
      [org.id, officer || isTreasurer(roles), member.id],
    );
    return {
      officer,
      requests: rows.map((w) => ({
        id: String(w.id),
        category: String(w.category),
        body: String(w.body),
        status: String(w.status),
        author: officer ? String(w.nickname || w.display_name) : "A classmate",
        mine: w.membership_id === member.id,
      })),
    };
  }
  if (module === "mentoring") {
    const rows = await sql<Record<string, unknown>>`
      select o.*, m.nickname, m.display_name, m.sample from mentor_offer o
      join membership m on m.id = o.membership_id where o.organisation_id = ${org.id} order by o.field
    `;
    return {
      offers: rows.map((o) => ({
        id: String(o.id),
        field: String(o.field),
        kind: String(o.kind),
        note: String(o.note),
        author: String(o.nickname || o.display_name),
        sample: o.sample === true,
      })),
    };
  }
  if (module === "trivia") {
    const questions = await sql<Record<string, unknown>>`
      select * from trivia_question where organisation_id = ${org.id} order by sort
    `;
    const answers = await sql<{ question_id: string; choice: number; correct: boolean }>`
      select question_id, choice, correct from trivia_answer where membership_id = ${member.id}
    `;
    const scores = await sql<Record<string, unknown>>`
      select h.name, count(*) filter (where a.correct)::int as points
      from trivia_answer a
      join membership m on m.id = a.membership_id
      join structure_node h on h.id = m.house_node_id
      where h.organisation_id = ${org.id}
      group by h.name, h.sort order by points desc, h.sort
    `;
    return {
      questions: questions.map((q) => {
        const mine = answers.find((a) => a.question_id === q.id);
        const choices = Array.isArray(q.choices) ? q.choices : JSON.parse(String(q.choices));
        return {
          id: String(q.id),
          prompt: String(q.prompt),
          choices: choices as string[],
          yourChoice: mine ? num(mine.choice) : null,
          correct: mine ? mine.correct === true : null,
        };
      }),
      scores: scores.map((s) => ({ house: String(s.name), points: num(s.points) })),
    };
  }
  if (module === "capsules") {
    const rows = await sql<Record<string, unknown>>`
      select c.*, m.nickname, m.display_name, (c.seals_until > current_date) as sealed
      from capsule c join membership m on m.id = c.membership_id
      where c.organisation_id = ${org.id}
        and (c.circle_id is null or c.circle_id in (select circle_id from circle_member where membership_id = ${member.id}) or c.membership_id = ${member.id})
      order by c.seals_until
    `;
    return {
      capsules: rows.map((c) => ({
        id: String(c.id),
        title: String(c.title),
        body: c.sealed === true ? null : String(c.body),
        sealed: c.sealed === true,
        until: String(c.seals_until),
        author: String(c.nickname || c.display_name),
      })),
    };
  }
  if (module === "milestones") {
    const rows = await sql<Record<string, unknown>>`
      select s.*, m.nickname, m.display_name, m.sample from milestone s
      join membership m on m.id = s.membership_id where s.organisation_id = ${org.id}
      order by s.created_at desc
    `;
    return {
      items: rows.map((s) => ({
        id: String(s.id),
        kind: String(s.kind),
        body: String(s.body),
        author: String(s.nickname || s.display_name),
        sample: s.sample === true,
      })),
    };
  }
  if (module === "spotlight") {
    const rows = await sql<Record<string, unknown>>`
      select s.story, m.id, m.nickname, m.display_name, m.profession, m.city, m.sample
      from spotlight s join membership m on m.id = s.membership_id
      where s.organisation_id = ${org.id} and s.published = true and s.consented = true
    `;
    return {
      items: rows.map((s) => ({
        memberId: String(s.id),
        name: String(s.nickname || s.display_name),
        full: String(s.display_name),
        profession: str(s.profession),
        city: str(s.city),
        story: String(s.story),
        sample: s.sample === true,
      })),
    };
  }
  if (module === "elections") {
    const elections = await sql<Record<string, unknown>>`select * from election where organisation_id = ${org.id}`;
    const nominations = await sql<Record<string, unknown>>`
      select n.*, m.nickname, m.display_name,
        (select count(*)::int from ballot_choice b where b.nomination_id = n.id) as votes
      from nomination n join membership m on m.id = n.membership_id
      where n.election_id in (select id from election where organisation_id = ${org.id})
    `;
    // A ballot records that you voted and, separately, what was chosen. Nothing links the two.
    const mine = await sql<{ election_id: string }>`
      select election_id from ballot_receipt where voter_membership_id = ${member.id}
    `;
    return {
      elections: elections.map((e) => ({
        id: String(e.id),
        role: String(e.role_name),
        blurb: String(e.blurb),
        status: String(e.status),
        closesOn: String(e.closes_on),
        voted: mine.some((b) => b.election_id === e.id),
        nominations: nominations
          .filter((n) => n.election_id === e.id)
          .map((n) => ({
            id: String(n.id),
            statement: String(n.statement),
            name: String(n.nickname || n.display_name),
            votes: num(n.votes),
          })),
      })),
    };
  }
  if (module === "impact") {
    const rows = await sql<Record<string, unknown>>`
      select pr.title, pr.story, pr.type,
        coalesce(sum(case when le.direction = 'credit' then le.amount_pesewas else -le.amount_pesewas end), 0)::int as net
      from purpose pr
      left join ledger_entry le on le.purpose_id = pr.id and le.account = 'fund'
      where pr.organisation_id = ${org.id} and pr.type in ('campaign', 'donation')
      group by pr.id, pr.title, pr.story, pr.type
    `;
    return { projects: rows.map((r) => ({ title: String(r.title), story: String(r.story), net: num(r.net) })) };
  }
  if (module === "store") {
    const rows = await sql<Record<string, unknown>>`select * from product where organisation_id = ${org.id} order by price_pesewas`;
    return {
      products: rows.map((p) => ({
        id: String(p.id),
        name: String(p.name),
        blurb: String(p.blurb),
        price: num(p.price_pesewas),
        stock: num(p.stock),
        motif: String(p.motif),
      })),
    };
  }
  if (module === "roll") {
    const nodes = await sql<Record<string, unknown>>`
      select n.id, n.name, n.level, p.name as parent_name from structure_node n
      left join structure_node p on p.id = n.parent_id
      where n.organisation_id = ${org.id} and n.level in ('house', 'class')
      order by n.level, p.sort, n.sort
    `;
    const picks = nodes.map((n) => ({
      id: String(n.id),
      level: String(n.level),
      name: n.parent_name && n.level === "class" ? `${String(n.parent_name)} ${String(n.name)}` : String(n.name),
    }));
    if (!extra.nodeId) {
      const imports = await sql<{ n: number }>`
        select count(*)::int as n from import_row where organisation_id = ${org.id} and status <> 'claimed'
      `;
      return { picks, people: [], missing: num(imports[0]?.n) };
    }
    const people = await sql.query<Record<string, unknown>>(
      `select id, display_name, nickname, status, sample, city from membership
       where organisation_id = $1 and (house_node_id = $2 or class_node_id = $2)
       order by display_name`,
      [org.id, extra.nodeId],
    );
    return {
      picks,
      missing: 0,
      people: people.map((p) => ({
        id: String(p.id),
        name: String(p.nickname || p.display_name),
        full: String(p.display_name),
        status: String(p.status),
        sample: p.sample === true,
        city: str(p.city),
      })),
    };
  }
  if (module === "birthdays") {
    const rows = await sql<Record<string, unknown>>`
      select distinct m.id, m.nickname, m.display_name, m.birthday_day, m.sample, m.city
      from membership m
      join circle_member cm on cm.membership_id = m.id
      join circle_member mine on mine.circle_id = cm.circle_id and mine.membership_id = ${member.id}
      where m.organisation_id = ${org.id} and m.birthday_opt_out = false
        and m.birthday_month = extract(month from current_date)::int
      order by m.birthday_day
    `;
    return {
      month: new Date().toLocaleString("en-GB", { month: "long" }),
      people: rows.map((p) => ({
        id: String(p.id),
        name: String(p.nickname || p.display_name),
        day: num(p.birthday_day),
        sample: p.sample === true,
        city: str(p.city),
      })),
      optedOut: member.birthdayOptOut,
    };
  }
  if (module === "inbox") {
    const rows = await sql<Record<string, unknown>>`
      select template_key, payload, status, channel, created_at::text as created_at
      from outbox where organisation_id = ${org.id} and membership_id = ${member.id}
      order by created_at desc limit 20
    `;
    return {
      messages: rows.map((r) => ({
        template: String(r.template_key),
        payload: typeof r.payload === "string" ? r.payload : JSON.stringify(r.payload),
        status: String(r.status),
        channel: String(r.channel),
        at: String(r.created_at),
      })),
    };
  }
  fail("That part of the hub is not open.");
}

export const readModule = createServerFn({ method: "POST" }).validator((input: unknown) => {
  const b = input as { slug?: string; module?: string; id?: string; nodeId?: string; q?: string };
  const area = String(b?.module ?? "");
  if (!/^[a-z]{3,20}$/.test(area)) fail("That part of the hub is not open.");
  return { slug: slugOf(b?.slug), module: area, id: b?.id, nodeId: b?.nodeId, q: b?.q };
}).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  return readBundle(sql, data.slug, context.userId, data.module, data);
});

type Act = Record<string, unknown>;

export const hubAct = createServerFn({ method: "POST" }).validator((input: unknown) => {
  const b = input as Act;
  if (!b || typeof b.type !== "string") fail("That action is not available.");
  slugOf(b.slug);
  return b;
}).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const slug = String(data.slug);
  const { org, member, roles } = await requireMember(sql, slug, context.userId);
  const type = String(data.type);
  const officer = isOfficer(roles);

  // A queued action may arrive twice (the reply was lost, so the phone retried). Apply it once.
  const clientId = typeof data.clientId === "string" && /^[A-Za-z0-9-]{8,64}$/.test(data.clientId) ? data.clientId : null;
  if (clientId && QUEUEABLE.has(type)) {
    const fresh = await firstTime(sql, org.id, member.id, type, clientId);
    if (!fresh) return { ok: true, duplicate: true };
  }

  if (type === "post") {
    if (member.status !== "verified") fail("Posting opens once your place is confirmed.");
    const body = String(data.body ?? "").trim();
    if (body.length < 1 || body.length > 500) fail("Write a short note, under 500 characters.");
    const joined = await sql<{ n: number }>`
      select count(*)::int as n from circle_member where circle_id = ${String(data.circleId)} and membership_id = ${member.id}
    `;
    if (num(joined[0]?.n) < 1) fail("You are not in that circle.");
    const recent = await sql<{ n: number }>`
      select count(*)::int as n from post where author_membership_id = ${member.id} and created_at > now() - interval '1 hour'
    `;
    if (num(recent[0]?.n) > 20) fail("Slow down a little, then post again.");
    await sql`
      insert into post (id, organisation_id, circle_id, author_membership_id, body)
      values (${nid("post")}, ${org.id}, ${String(data.circleId)}, ${member.id}, ${body})
    `;
    await track(sql, org.id, member.id, "community", "first_post", "");
    return { ok: true };
  }

  if (type === "demo_confirm") {
    if (!demoMode()) fail("That action is not available.");
    await demoConfirm(sql, { id: org.id, name: org.name, verificationRule: org.verificationRule }, member.id);
    return { ok: true };
  }

  if (type === "join") {
    const circle = await sql<{ id: string; kind: string; visibility: string }>`
      select id, kind, visibility from circle where id = ${String(data.circleId)} and organisation_id = ${org.id}
    `;
    if (!circle[0]) fail("That circle is not here.");
    if (circle[0].kind !== "voluntary") fail("House, dorm and class follow your placement. You do not join them.");
    if (circle[0].visibility === "hidden") fail("That circle is by invitation only.");
    await sql`
      insert into circle_member (organisation_id, circle_id, membership_id, source)
      values (${org.id}, ${circle[0].id}, ${member.id}, 'joined')
      on conflict do nothing
    `;
    await track(sql, org.id, member.id, "community", "circle_joined", "");
    return { ok: true };
  }

  if (type === "report") {
    const reason = String(data.reason ?? "").trim().slice(0, 200);
    if (reason.length < 3) fail("Say what is wrong, briefly.");
    await sql`
      insert into report (id, organisation_id, post_id, membership_id, reason, status)
      values (${nid("rp")}, ${org.id}, ${String(data.postId)}, ${member.id}, ${reason}, 'open')
    `;
    return { ok: true };
  }

  if (type === "profile") {
    const out = await mergeProfile(sql, member.id, context.userId, data);
    return { ok: true, ...out };
  }

  if (type === "rsvp") {
    const status = String(data.status);
    if (!["going", "maybe", "no"].includes(status)) fail("Choose going, maybe, or no.");
    const ev = await sql<{ id: string }>`select id from hub_event where id = ${String(data.eventId)} and organisation_id = ${org.id}`;
    if (!ev[0]) fail("That event is not here.");
    await sql`
      insert into rsvp (organisation_id, event_id, membership_id, status) values (${org.id}, ${ev[0].id}, ${member.id}, ${status})
      on conflict (event_id, membership_id) do update set status = ${status}
    `;
    await track(sql, org.id, member.id, "utility", "event_rsvp", status);
    return { ok: true };
  }

  if (type === "ask") {
    const category = String(data.category ?? "");
    if (!ASK_CATEGORIES.includes(category)) fail("Choose a category.");
    const title = String(data.title ?? "").trim();
    const body = String(data.body ?? "").trim();
    if (title.length < 4 || body.length < 4) fail("Say what you need, in a title and a few lines.");
    await sql`
      insert into ask (id, organisation_id, membership_id, category, title, body, circle_id)
      values (${nid("ask")}, ${org.id}, ${member.id}, ${category}, ${title.slice(0, 120)}, ${body.slice(0, 600)}, null)
    `;
    await track(sql, org.id, member.id, "utility", "request_created", category);
    return { ok: true };
  }

  if (type === "reply") {
    const body = String(data.body ?? "").trim();
    if (body.length < 2) fail("Write a reply.");
    const ask = await sql<{ id: string }>`select id from ask where id = ${String(data.askId)} and organisation_id = ${org.id}`;
    if (!ask[0]) fail("That request is not here.");
    await sql`
      insert into ask_reply (id, organisation_id, ask_id, membership_id, body, recommended)
      values (${nid("ar")}, ${org.id}, ${ask[0].id}, ${member.id}, ${body.slice(0, 500)}, ${data.recommended === true})
    `;
    return { ok: true };
  }

  if (type === "support") {
    const biz = await sql<{ id: string }>`select id from business where id = ${String(data.businessId)} and organisation_id = ${org.id}`;
    if (!biz[0]) fail("That business is not listed.");
    const have = await sql<{ n: number }>`
      select count(*)::int as n from business_support where business_id = ${biz[0].id} and membership_id = ${member.id}
    `;
    if (num(have[0]?.n) > 0) {
      await sql`delete from business_support where business_id = ${biz[0].id} and membership_id = ${member.id}`;
    } else {
      await sql`insert into business_support (organisation_id, business_id, membership_id) values (${org.id}, ${biz[0].id}, ${member.id})`;
      await track(sql, org.id, member.id, "utility", "referral_made", "");
    }
    return { ok: true };
  }

  if (type === "business") {
    const name = String(data.name ?? "").trim();
    const category = String(data.category ?? "").trim();
    const city = String(data.city ?? "").trim();
    const contact = String(data.contact ?? "").trim();
    const blurb = String(data.blurb ?? "").trim();
    if (name.length < 2 || category.length < 2 || city.length < 2) fail("Name, category and city are enough to list it.");
    await sql`
      insert into business (id, organisation_id, membership_id, name, category, city, contact, blurb)
      values (${nid("biz")}, ${org.id}, ${member.id}, ${name.slice(0, 80)}, ${category.slice(0, 40)}, ${city.slice(0, 40)}, ${contact.slice(0, 40)}, ${blurb.slice(0, 240)})
    `;
    return { ok: true };
  }

  if (type === "vote") {
    const opt = await sql<{ id: string; poll_id: string }>`
      select o.id, o.poll_id from poll_option o join poll p on p.id = o.poll_id
      where o.id = ${String(data.optionId)} and p.organisation_id = ${org.id} and p.closes_on >= current_date
    `;
    if (!opt[0]) fail("That poll is closed.");
    await sql`
      insert into poll_vote (organisation_id, poll_id, option_id, membership_id) values (${org.id}, ${opt[0].poll_id}, ${opt[0].id}, ${member.id})
      on conflict do nothing
    `;
    return { ok: true };
  }

  if (type === "photo") {
    const caption = String(data.caption ?? "").trim().slice(0, 140);
    const dataUrl = String(data.dataUrl ?? "");
    if (!dataUrl.startsWith("data:image/") || dataUrl.length > 280000) fail("That photo is still too heavy. Try another.");
    const album = await sql<{ id: string; motif: string }>`select id, motif from album where id = ${String(data.albumId)} and organisation_id = ${org.id}`;
    if (!album[0]) fail("Choose an album.");
    await sql`
      insert into photo (id, organisation_id, album_id, caption, motif, data_url, author_membership_id)
      values (${nid("ph")}, ${org.id}, ${album[0].id}, ${caption || "Untitled"}, ${album[0].motif}, ${dataUrl}, ${member.id})
    `;
    return { ok: true };
  }

  if (type === "welfare") {
    const body = String(data.body ?? "").trim();
    if (body.length < 8) fail("Write enough for the secretary to understand. It stays off the board.");
    await sql`
      insert into welfare_request (id, organisation_id, membership_id, category, body, status)
      values (${nid("wf")}, ${org.id}, ${member.id}, ${String(data.category ?? "other").slice(0, 40)}, ${body.slice(0, 800)}, 'open')
    `;
    return { ok: true };
  }

  if (type === "mentor") {
    const kind = String(data.kind);
    if (kind !== "offer" && kind !== "seek") fail("Say if you are offering or seeking.");
    const field = String(data.field ?? "").trim();
    const note = String(data.note ?? "").trim();
    if (field.length < 2) fail("Name the field.");
    await sql`
      insert into mentor_offer (id, organisation_id, membership_id, field, kind, note)
      values (${nid("mn")}, ${org.id}, ${member.id}, ${field.slice(0, 60)}, ${kind}, ${note.slice(0, 240)})
    `;
    return { ok: true };
  }

  if (type === "trivia") {
    const q = await sql<{ id: string; answer_index: number }>`
      select id, answer_index from trivia_question where id = ${String(data.questionId)} and organisation_id = ${org.id}
    `;
    if (!q[0]) fail("That question is not here.");
    const choice = num(data.choice);
    const correct = choice === num(q[0].answer_index);
    await sql`
      insert into trivia_answer (organisation_id, question_id, membership_id, choice, correct)
      values (${org.id}, ${q[0].id}, ${member.id}, ${choice}, ${correct})
      on conflict do nothing
    `;
    return { ok: true, correct };
  }

  if (type === "capsule") {
    const title = String(data.title ?? "").trim();
    const body = String(data.body ?? "").trim();
    const until = String(data.sealsUntil ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(until)) fail("Choose a date.");
    if (title.length < 2 || body.length < 2) fail("Write a title and the note.");
    await sql`
      insert into capsule (id, organisation_id, membership_id, circle_id, title, body, seals_until)
      values (${nid("cap")}, ${org.id}, ${member.id}, null, ${title.slice(0, 80)}, ${body.slice(0, 800)}, ${until})
    `;
    return { ok: true };
  }

  if (type === "milestone") {
    const body = String(data.body ?? "").trim();
    if (body.length < 4) fail("Write the news in a sentence.");
    await sql`
      insert into milestone (id, organisation_id, membership_id, kind, body)
      values (${nid("ms")}, ${org.id}, ${member.id}, ${String(data.kind ?? "news").slice(0, 20)}, ${body.slice(0, 240)})
    `;
    return { ok: true };
  }

  if (type === "nominate") {
    const statement = String(data.statement ?? "").trim();
    if (statement.length < 8) fail("Say why you are standing, briefly.");
    const el = await sql<{ id: string }>`
      select id from election where id = ${String(data.electionId)} and organisation_id = ${org.id} and status = 'open' and closes_on >= current_date
    `;
    if (!el[0]) fail("Nominations are closed.");
    await sql`
      insert into nomination (id, organisation_id, election_id, membership_id, statement)
      values (${nid("nom")}, ${org.id}, ${el[0].id}, ${member.id}, ${statement.slice(0, 280)})
    `;
    return { ok: true };
  }

  if (type === "ballot") {
    if (member.status !== "verified") fail("Voting opens once your place is confirmed.");
    const nom = await sql<{ id: string; election_id: string }>`
      select n.id, n.election_id from nomination n
      join election e on e.id = n.election_id
      where n.id = ${String(data.nominationId)} and e.organisation_id = ${org.id} and e.status = 'open' and e.closes_on >= current_date
    `;
    if (!nom[0]) fail("That ballot is closed.");
    const receipt = await sql<{ voter_membership_id: string }>`
      select voter_membership_id from ballot_receipt where election_id = ${nom[0].election_id} and voter_membership_id = ${member.id}
    `;
    if (receipt[0]) fail("You have already voted in this election.");
    await sql`insert into ballot_receipt (organisation_id, election_id, voter_membership_id) values (${org.id}, ${nom[0].election_id}, ${member.id})`;
    await sql`insert into ballot_choice (id, organisation_id, election_id, nomination_id) values (${nid("bc")}, ${org.id}, ${nom[0].election_id}, ${nom[0].id})`;
    return { ok: true };
  }

  if (type === "buy") {
    const product = await sql<Record<string, unknown>>`
      select * from product where id = ${String(data.productId)} and organisation_id = ${org.id} and stock > 0
    `;
    if (!product[0]) fail("That item is gone.");
    const price = num(product[0].price_pesewas);
    const plan = planCollection({ gift: price, gatewayBps: org.gatewayFeeBps, platformBps: org.platformFeeBps, coverFees: false });
    const purpose = await sql<{ id: string }>`select id from purpose where organisation_id = ${org.id} and type = 'other' limit 1`;
    if (!purpose[0]) fail("The store has no payment purpose yet.");
    const intentId = nid("pi");
    const reference = `buy_${intentId}`;
    const upd = await sql<{ id: string }>`
      update product set stock = stock - 1 where id = ${String(product[0].id)} and stock > 0 returning id
    `;
    if (!upd[0]) fail("That item is gone.");
    await sql`
      insert into payment_intent (
        id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas,
        gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, provider
      ) values (
        ${intentId}, ${org.id}, ${purpose[0].id}, ${member.id}, null, ${plan.gift}, ${plan.charge},
        ${plan.gatewayFee}, ${plan.platformFee}, false, false, 'pending', ${reference}, ${org.paymentMode === "live" ? "paystack" : "test"}
      )
    `;
    await sql`
      insert into shop_order (id, organisation_id, product_id, membership_id, intent_id, qty, status)
      values (${nid("so")}, ${org.id}, ${String(product[0].id)}, ${member.id}, ${intentId}, 1, 'pending')
    `;
    const authorizationUrl = await beginGateway(sql, org, member.id, context.userId, intentId, plan, reference);
    return { intentId, authorizationUrl };
  }

  const payOrganisation = payOrg(org);
  const exec = roles.some((r) => r.role === "organisation_admin" || r.role === "executive");
  const treasurer = isTreasurer(roles);
  const stepUp = (action: StepUpAction) => requireStepUp(sql, { orgId: org.id, memberId: member.id }, action, data.phrase);
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim() || null;

  if (type === "announce") {
    if (!officer) fail("Announcements are sent by the executive.");
    const body = String(data.body ?? "").trim();
    if (body.length < 4) fail("Write the announcement.");
    const circle = await sql<{ id: string; name: string }>`
      select id, name from circle where id = ${String(data.circleId)} and organisation_id = ${org.id} and visibility <> 'hidden'
    `;
    if (!circle[0]) fail("Choose who should hear it.");
    const announcementId = nid("an");
    await sql`
      insert into announcement (id, organisation_id, author_membership_id, audience, body)
      values (${announcementId}, ${org.id}, ${member.id}, ${circle[0].name}, ${body.slice(0, 500)})
    `;
    const people = await sql<{ membership_id: string }>`select membership_id from circle_member where circle_id = ${circle[0].id}`;
    for (const p of people) {
      await enqueue(sql, {
        orgId: org.id, membershipId: p.membership_id, template: "announcement", urgent: data.urgent === true,
        key: `an:${announcementId}:${p.membership_id}`, payload: { body: body.slice(0, 140), org: org.name, audience: circle[0].name },
      });
    }
    await audit(sql, org.id, member.id, "announcement_sent", `${circle[0].name}: ${people.length} members${data.urgent === true ? " (urgent, by text)" : ""}`);
    return { ok: true, reached: people.length };
  }

  if (type === "import_upload") {
    if (!exec) fail("Imports are reviewed by an executive.");
    const text = String(data.csv ?? "");
    if (text.length < 10 || text.length > 1_000_000) fail("Choose a CSV file under 1 MB.");
    const out = await importCsv(sql, org.id, member.id, String(data.fileName ?? "cohort.csv"), text);
    return { ok: true, ...out };
  }

  if (type === "import_review") {
    if (!exec) fail("Imports are reviewed by an executive.");
    const to = String(data.to) as Decision;
    if (!["approved", "needs_review", "invited"].includes(to)) fail("That is not a step in the import flow.");
    await reviewRow(sql, org, member.id, String(data.importId), to, { notDuplicate: data.notDuplicate === true });
    return { ok: true };
  }

  if (type === "alias") {
    if (!exec) fail("Aliases are added by an executive.");
    const alias = String(data.alias ?? "").trim().slice(0, 60);
    if (squash(alias).length < 2) fail("Write the other name people use for it.");
    const node = await sql<{ id: string; level: string }>`select id, level from structure_node where id = ${String(data.nodeId)} and organisation_id = ${org.id}`;
    if (!node[0] || !["house", "programme", "class"].includes(node[0].level)) fail("Aliases are for houses, programmes and classes.");
    const clash = await sql<{ id: string }>`select id from structure_alias where organisation_id = ${org.id} and normalised = ${squash(alias)}`;
    if (clash[0]) fail("That name already points somewhere.");
    await sql`insert into structure_alias (id, organisation_id, node_id, alias, normalised) values (${nid("al")}, ${org.id}, ${node[0].id}, ${alias}, ${squash(alias)})`;
    await audit(sql, org.id, member.id, "alias_added", alias);
    return { ok: true };
  }

  if (type === "expense_submit") {
    if (!officer) fail("Expenses are raised by an officer.");
    const amount = num(data.amountPesewas);
    const memo = String(data.memo ?? "").trim();
    if (!Number.isInteger(amount) || amount <= 0) fail("Enter the amount.");
    if (memo.length < 4) fail("Say what it is for.");
    const id = nid("ex");
    await sql`insert into expense (id, organisation_id, requester_membership_id, amount_pesewas, memo, status) values (${id}, ${org.id}, ${member.id}, ${amount}, ${memo.slice(0, 160)}, 'submitted')`;
    await audit(sql, org.id, member.id, "expense_submitted", `${memo.slice(0, 80)} (${amount} pesewas)`);
    return { ok: true, id };
  }

  if (type === "expense") {
    const signer = expenseSignerOf(roles.map((r) => r.role));
    if (!signer) fail("Expenses are approved by the treasurer or an executive.");
    const how = await stepUp("expense");
    const exp = await sql<Record<string, unknown>>`select * from expense where id = ${String(data.expenseId)} and organisation_id = ${org.id} for update`;
    if (!exp[0]) fail("That expense is not here.");
    if (exp[0].requester_membership_id === member.id) fail("You cannot approve your own expense.");
    if (!["submitted", "partially_approved"].includes(String(exp[0].status))) fail("This expense is not waiting for approval.");
    const prior = await sql<{ approver_membership_id: string }>`
      select approver_membership_id from approval where subject_type = 'expense' and subject_id = ${String(exp[0].id)}
    `;
    if (prior.some((p) => p.approver_membership_id === member.id)) fail("You have already signed this.");
    const signers: ExpenseSigner[] = [signer];
    for (const p of prior) {
      const r = await sql<{ role: string }>`select role from role_assignment where membership_id = ${p.approver_membership_id} and organisation_id = ${org.id}`;
      const s = expenseSignerOf(r.map((x) => x.role));
      if (s) signers.push(s);
    }
    const amount = num(exp[0].amount_pesewas);
    if (amount >= org.twoApprover && prior.length > 0 && signers.every((s) => s === signer)) {
      fail(signer === "treasurer" ? "This one also needs an executive's signature." : "This one also needs the treasurer's signature.");
    }
    const next = expenseStatusAfter(amount, org.twoApprover, signers);
    await sql`update expense set status = ${next} where id = ${String(exp[0].id)}`;
    await sql`
      insert into approval (id, organisation_id, subject_type, subject_id, approver_membership_id, decision, step_up)
      values (${nid("ap")}, ${org.id}, 'expense', ${String(exp[0].id)}, ${member.id}, ${next}, ${how})
    `;
    await audit(sql, org.id, member.id, "expense_decision", `${String(exp[0].memo)} -> ${next}`);
    return { ok: true, status: next };
  }

  if (type === "expense_pay") {
    if (!treasurer) fail("The treasurer records the payment.");
    await stepUp("expense_pay");
    await recordExpensePayout(sql, payOrganisation, { expenseId: String(data.expenseId), payerId: member.id, reference: String(data.reference ?? "") });
    return { ok: true };
  }

  if (type === "refund_request") {
    if (!treasurer) fail("The treasurer asks for a refund.");
    await stepUp("refund_request");
    const method = data.method === "manual" ? "manual" : "gateway";
    const out = await requestRefund(sql, payOrganisation, {
      intentId: String(data.intentId), amount: num(data.amountPesewas), reason: String(data.reason ?? ""), method, requesterId: member.id,
    });
    return { ok: true, id: out.id };
  }

  if (type === "refund") {
    if (!officer) fail("A refund is confirmed by an executive.");
    const decision = String(data.decision);
    if (decision !== "approved" && decision !== "rejected") fail("Approve or reject it.");
    await stepUp("refund");
    if (decision === "rejected") {
      await rejectRefund(sql, payOrganisation, { refundId: String(data.refundId), approverId: member.id });
      return { ok: true };
    }
    const out = await approveRefund(sql, payOrganisation, {
      refundId: String(data.refundId), approverId: member.id, manualReference: str(data.manualReference) ?? undefined,
      gatewayRefund: secret ? async ({ transaction, amount }) => createRefund(secret, { transaction, amountPesewas: amount }) : undefined,
    });
    return { ok: true, receipt: out.receipt, full: out.full };
  }

  if (type === "settlement") {
    if (!treasurer) fail("The treasurer confirms settlements.");
    await stepUp("settlement");
    const out = await confirmSettlement(sql, payOrganisation, { reference: String(data.reference ?? ""), byMembershipId: member.id });
    return { ok: true, ...out };
  }

  if (type === "reconcile") {
    if (!treasurer && !exec) fail("Reconciliation is for the treasurer.");
    const result = await reconcile(sql, org, {
      actorId: member.id, verify: secret ? (ref: string) => verifyTransaction(secret, ref) : undefined,
    });
    return result;
  }

  if (type === "confirm") {
    if (member.status !== "verified" && !officer) fail("Only a confirmed member can confirm someone else.");
    const out = await confirmClaim(sql, org, member.id, String(data.membershipId));
    return { ok: true, ...out };
  }

  if (type === "phone_recover") {
    if (!exec) fail("An executive moves a number.");
    await stepUp("phone_recover");
    const phone = normalisePhone(String(data.phone ?? ""));
    if (!phone) fail("Write the new number.");
    const target = String(data.membershipId);
    if (target === member.id) fail("Ask a different executive to move your own number.");
    await sql`select hub_move_phone(${target}, ${phone})`;
    await audit(sql, org.id, member.id, "phone_recovered", `Moved a number for ${target}`);
    return { ok: true };
  }

  if (type === "verify") {
    // Kept for older screens: an executive confirms outright.
    if (!officer) fail("An executive confirms a claim.");
    const out = await confirmClaim(sql, org, member.id, String(data.membershipId));
    return { ok: true, ...out };
  }

  if (type === "dismiss-report") {
    if (!officer) fail("Reports are cleared by an executive.");
    await sql`update report set status = 'dismissed' where id = ${String(data.reportId)} and organisation_id = ${org.id}`;
    return { ok: true };
  }

  fail("That action is not available.");
});

/**
 * The assistant. It reads on the caller's own scope, drafts text, and sends nothing.
 * Reminder drafts are for officers, because they describe the whole year group.
 */
export const aiAssist = createServerFn({ method: "POST" }).validator((input: unknown) => {
  const b = input as { slug?: string; task?: string; query?: string; askId?: string; eventId?: string };
  const task = String(b?.task ?? "");
  if (!["network_search", "route_ask", "digest", "reminder"].includes(task)) fail("The assistant does not do that.");
  return { slug: slugOf(b?.slug), task, query: String(b?.query ?? "").slice(0, 300), askId: String(b?.askId ?? ""), eventId: String(b?.eventId ?? "") };
}).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const { org, member, roles } = await requireMember(sql, data.slug, context.userId);
  if (member.status !== "verified") fail("The assistant opens once your place is confirmed.");
  const row = await sql<{ ai_monthly_budget: number }>`select ai_monthly_budget from organisation where id = ${org.id}`;
  const ctx: AiCtx = { orgId: org.id, memberId: member.id, orgName: org.name, aiBudget: num(row[0]?.ai_monthly_budget) };
  if (data.task === "network_search") return { matches: await networkSearch(sql, ctx, data.query) };
  if (data.task === "route_ask") return { matches: await routeAsk(sql, ctx, data.askId) };
  if (data.task === "digest") return { draft: await polish(await digestDraft(sql, ctx)) };
  if (!isOfficer(roles)) fail("Reminder drafts are for the executive.");
  const r = await reminderDraft(sql, ctx, data.eventId);
  return { ...r, draft: await polish(r.draft) };
});

/** Claimed members this person may confirm: their cot mates (or dorm mates when there is no cot), or everyone for an officer. */
export const peersWaiting = createServerFn({ method: "POST" }).validator(slugOf).middleware([authMiddleware]).handler(async ({ data: slug, context }) => {
  const sql = await getSql();
  const { org, member, roles } = await requireMember(sql, slug, context.userId);
  const officer = isOfficer(roles);
  if (member.status !== "verified" && !officer) return [];
  const rows = await sql<{ id: string; display_name: string; cot: string | null; dorm: string | null; house: string | null }>`
    select m.id, m.display_name, ct.name as cot, d.name as dorm, h.name as house
    from membership m
    left join structure_node ct on ct.id = m.cot_node_id left join structure_node d on d.id = m.dorm_node_id left join structure_node h on h.id = m.house_node_id
    where m.organisation_id = ${org.id} and m.status = 'claimed' and m.id <> ${member.id}
      and not exists (select 1 from claim_confirmation cc join profile_claim pc on pc.id = cc.claim_id where pc.membership_id = m.id and cc.confirmer_membership_id = ${member.id})
      and (${officer} or (m.cot_node_id is not null and m.cot_node_id = ${member.cotNodeId})
           or (m.cot_node_id is null and m.dorm_node_id is not null and m.dorm_node_id = ${member.dormNodeId}))
    order by m.created_at
  `;
  return rows.map((r) => ({ id: r.id, name: r.display_name, cot: r.cot, dorm: r.dorm, house: r.house }));
});

export const controlData = createServerFn({ method: "POST" }).validator((input: unknown) => {
  const b = input as { slug?: string; area?: string };
  const area = String(b?.area ?? "people");
  return { slug: slugOf(b?.slug), area };
}).middleware([authMiddleware]).handler(async ({ data, context }) => {
  const sql = await getSql();
  const { org, member, roles } = await requireMember(sql, data.slug, context.userId);
  if (!canOpenControl(roles)) fail("The control room is for officers of this year group.");
  const scope = scopeOf(roles);
  const area = data.area;

  if (area === "people") {
    const counts = await sql<Record<string, unknown>>`
      select status, count(*)::int as n from membership where organisation_id = ${org.id} and not sample group by status
    `;
    const imports = await sql<Record<string, unknown>>`
      select id, display_name, phone, status, note, issues, matched_membership_id from import_row
      where organisation_id = ${org.id} order by created_at desc, display_name limit 120
    `;
    const missing = await sql<{ n: number }>`
      select count(*)::int as n from membership where organisation_id = ${org.id} and not sample and house_node_id is null and residence_escape is null
    `;
    const nodes = await sql<{ id: string; name: string; level: string }>`
      select id, name, level from structure_node where organisation_id = ${org.id} and level in ('house', 'programme', 'class') order by level, sort
    `;
    return {
      area,
      counts: counts.map((c) => ({ status: String(c.status), n: num(c.n) })),
      missingPlacement: num(missing[0]?.n),
      canReview: roles.some((r) => r.role === "organisation_admin" || r.role === "executive"),
      claims: await openClaims(sql, org.id),
      aliasNodes: nodes,
      imports: imports.map((r) => ({
        id: String(r.id),
        name: String(r.display_name),
        phone: str(r.phone),
        status: String(r.status),
        note: String(r.note),
        issues: Array.isArray(r.issues) ? (r.issues as string[]) : [],
      })),
    };
  }

  if (area === "money") {
    const accounts = await sql<{ account: string; n: number }>`
      select account, coalesce(sum(case when direction = 'debit' then amount_pesewas else -amount_pesewas end), 0)::int as n
      from ledger_entry where organisation_id = ${org.id} group by account
    `;
    const pledges = await sql<{ n: number; total: number }>`
      select count(*)::int as n, coalesce(sum(i.amount_pesewas - i.paid_pesewas), 0)::int as total
      from instalment i join pledge p on p.id = i.pledge_id
      where p.organisation_id = ${org.id} and i.paid_pesewas < i.amount_pesewas
    `;
    const expenses = await sql<Record<string, unknown>>`
      select e.*, m.nickname, m.display_name from expense e
      join membership m on m.id = e.requester_membership_id
      where e.organisation_id = ${org.id} order by e.created_at desc
    `;
    const refunds = await sql<Record<string, unknown>>`
      select r.*, m.nickname from refund r join membership m on m.id = r.requester_membership_id
      where r.organisation_id = ${org.id} order by r.created_at desc
    `;
    const ledger = await sql<Record<string, unknown>>`
      select le.account, le.direction, le.amount_pesewas, le.memo, le.created_at::text as created_at,
        pi.anonymous, m.nickname, m.display_name
      from ledger_entry le
      left join payment_intent pi on pi.id = le.intent_id
      left join membership m on m.id = le.membership_id
      where le.organisation_id = ${org.id}
      order by le.created_at desc limit 12
    `;
    const seeNames = isTreasurer(roles);
    const payments = await sql<Record<string, unknown>>`
      select pi.id, pi.reference, pi.charge_pesewas, pi.provider, pi.anonymous, m.nickname, m.display_name,
        coalesce((select sum(r.amount_pesewas) from refund r where r.intent_id = pi.id and r.status in ('approved', 'awaiting_approval')), 0)::int as committed
      from payment_intent pi join membership m on m.id = pi.membership_id
      where pi.organisation_id = ${org.id} and pi.status = 'succeeded' order by pi.paid_at desc nulls last limit 25
    `;
    const unsettled = await sql<{ n: number; net: number }>`
      select count(*)::int as n, coalesce(sum(charge_pesewas - gateway_fee_pesewas - platform_fee_pesewas), 0)::int as net
      from payment_intent where organisation_id = ${org.id} and status = 'succeeded' and provider <> 'test' and settled_at is null
    `;
    return {
      area,
      paymentMode: org.paymentMode,
      testStepUp: devFlag("HUB_ALLOW_TEST_STEPUP"),
      isTreasurer: isTreasurer(roles),
      isExec: roles.some((r) => r.role === "organisation_admin" || r.role === "executive"),
      canApproveExpenses: expenseSignerOf(roles.map((r) => r.role)) != null,
      unsettled: { n: num(unsettled[0]?.n), net: num(unsettled[0]?.net) },
      payments: payments.map((p) => ({
        id: String(p.id), reference: String(p.reference), charge: num(p.charge_pesewas), provider: String(p.provider),
        refundable: num(p.charge_pesewas) - num(p.committed),
        who: p.anonymous === true && !seeNames ? "Anonymous" : seeNames ? String(p.nickname || p.display_name) : "A member",
      })),
      accounts: Object.fromEntries(accounts.map((a) => [a.account, num(a.n)])),
      outstandingCount: num(pledges[0]?.n),
      outstanding: num(pledges[0]?.total),
      twoApprover: org.twoApprover,
      seeNames,
      expenses: expenses.map((e) => ({
        id: String(e.id),
        amount: num(e.amount_pesewas),
        memo: String(e.memo),
        status: String(e.status),
        requester: String(e.nickname || e.display_name),
        mine: e.requester_membership_id === member.id,
      })),
      refunds: refunds.map((r) => ({
        id: String(r.id),
        amount: num(r.amount_pesewas),
        reason: String(r.reason),
        status: String(r.status),
        method: String(r.method),
        requester: String(r.nickname),
        mine: r.requester_membership_id === member.id,
      })),
      ledger: ledger.map((l) => ({
        account: String(l.account),
        direction: String(l.direction),
        amount: num(l.amount_pesewas),
        memo: String(l.memo),
        at: String(l.created_at),
        who:
          l.anonymous === true
            ? seeNames
              ? String(l.nickname || l.display_name)
              : "Anonymous"
            : seeNames
              ? String(l.nickname || l.display_name || "Member")
              : "A member",
      })),
    };
  }

  if (area === "community") {
    const circles = await sql<Record<string, unknown>>`
      select c.name, c.visibility, count(cm.membership_id)::int as n
      from circle c left join circle_member cm on cm.circle_id = c.id
      where c.organisation_id = ${org.id} and c.visibility <> 'hidden'
      group by c.id, c.name, c.visibility order by n asc, c.name limit 12
    `;
    const reports = await sql<Record<string, unknown>>`
      select r.id, r.reason, r.status, p.body from report r join post p on p.id = r.post_id
      where r.organisation_id = ${org.id} and r.status = 'open'
    `;
    return {
      area,
      quiet: circles.map((c) => ({ name: String(c.name), n: num(c.n), visibility: String(c.visibility) })),
      reports: reports.map((r) => ({ id: String(r.id), reason: String(r.reason), body: String(r.body) })),
    };
  }

  if (area === "communication") {
    const circles = await sql<{ id: string; name: string; kind: string; level: string | null; members: number }>`
      select c.id, c.name, c.kind, sn.level, (select count(*)::int from circle_member cm where cm.circle_id = c.id) as members
      from circle c left join structure_node sn on sn.id = c.node_id
      where c.organisation_id = ${org.id} and c.visibility <> 'hidden'
      order by sn.sort nulls last, c.name
    `;
    const recent = await sql<Record<string, unknown>>`
      select audience, body, created_at::text as created_at from announcement
      where organisation_id = ${org.id} order by created_at desc limit 6
    `;
    const events = await sql<{ id: string; title: string }>`select id, title from hub_event where organisation_id = ${org.id} and starts_at > now() order by starts_at limit 10`;
    const queue = await sql<{ status: string; n: number }>`select status, count(*)::int as n from outbox where organisation_id = ${org.id} and channel = 'sms' group by status`;
    return {
      area, circles, events,
      sms: queue.map((q) => ({ status: q.status, n: num(q.n) })),
      recent: recent.map((a) => ({ audience: String(a.audience), body: String(a.body), at: String(a.created_at) })),
    };
  }

  if (area === "governance") {
    const rolesRows = await sql<Record<string, unknown>>`
      select r.role, m.nickname, m.display_name, m.sample from role_assignment r
      join membership m on m.id = r.membership_id where r.organisation_id = ${org.id} order by r.role
    `;
    return {
      area,
      scope,
      roles: rolesRows.map((r) => ({
        role: String(r.role),
        name: String(r.nickname || r.display_name),
        sample: r.sample === true,
      })),
    };
  }

  if (area === "events") {
    const rows = await sql<Record<string, unknown>>`
      select e.title, e.place, e.starts_at::text as starts_at,
        (select count(*)::int from rsvp r where r.event_id = e.id and r.status = 'going') as going
      from hub_event e where e.organisation_id = ${org.id} order by e.starts_at
    `;
    return {
      area,
      events: rows.map((e) => ({ title: String(e.title), place: String(e.place), startsAt: String(e.starts_at), going: num(e.going) })),
    };
  }

  if (area === "reports") {
    const usage = await sql<{ name: string; n: number }>`
      select name, count(*)::int as n from usage_event where organisation_id = ${org.id} group by name order by n desc
    `;
    const funds = await sql<Record<string, unknown>>`
      select pr.title, coalesce(sum(case when le.direction = 'credit' then le.amount_pesewas else -le.amount_pesewas end), 0)::int as net
      from purpose pr left join ledger_entry le on le.purpose_id = pr.id and le.account = 'fund'
      where pr.organisation_id = ${org.id} group by pr.id, pr.title order by net desc
    `;
    return {
      area,
      usage: usage.map((u) => ({ name: String(u.name), n: num(u.n) })),
      funds: funds.map((f) => ({ title: String(f.title), net: num(f.net) })),
    };
  }

  fail("That desk is not in the control room.");
});
