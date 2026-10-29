"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { homeData } from "@/lib/hub/api";
import { roleTitle } from "@/lib/hub/roles";
import { timeAgo, wholeCedis } from "@/lib/hub/words-money";
import { DemoConfirm } from "@/components/hub/demo-confirm";
import { useOrgFace } from "@/components/hub/org-context";
import { Shell } from "@/components/hub/shell";
import { Avatar, SampleTag, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";

type Home = Awaited<ReturnType<typeof homeData>>;

const WORDS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "twenty-one", "twenty-two", "twenty-three", "twenty-four", "twenty-five"];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function attentionHref(slug: string, href: string) {
  if (href === "control") return `/o/${slug}/control/money`;
  if (href === "me") return `/o/${slug}/me`;
  return `/o/${slug}/m/events`;
}

/** The date as a teacher chalks it in the corner of the board: "Thursday, 29th October". */
function chalkDate(d = new Date()) {
  const n = d.getDate();
  const th = n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th";
  return `${d.toLocaleDateString("en-GB", { weekday: "long" })}, ${n}${th} ${d.toLocaleDateString("en-GB", { month: "long" })}`;
}

/** How long since we left the hill, and what is coming. Only when the cohort year is known. */
function yearsLine(cohort: string) {
  const year = Number(cohort);
  if (!year) return null;
  const since = new Date().getFullYear() - year;
  if (since <= 0) return null;
  const words = WORDS[since] ?? String(since);
  const tail = since === 19 ? " The twentieth is next year." : since === 20 ? " This is our twentieth year." : "";
  return `${cap(words)} ${since === 1 ? "year" : "years"} since we left the hill.${tail}`;
}

function birthdayWhen(inDays: number, month: number, day: number) {
  if (inDays === 0) return "is today";
  if (inDays === 1) return "is tomorrow";
  const d = new Date(Date.UTC(2000, month - 1, day));
  if (inDays < 7) {
    const target = new Date();
    target.setDate(target.getDate() + inDays);
    return `is on ${target.toLocaleDateString("en-GB", { weekday: "long" })}`;
  }
  return `is on ${d.getUTCDate()} ${d.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" })}`;
}

/**
 * Home: the blackboard with your name on it, then the exercise book. The boys come first,
 * who is in your city, whose birthday it is, what the President has pinned up, the next
 * meet-up and what the boys are writing. Dues and the appeal are one quiet line at the end.
 */
export function HomeScreen({ slug }: { slug: string }) {
  const { data, error, loading, reload } = useHub(`home-${slug}`, () => homeData({ data: slug }));
  return (
    <Shell slug={slug} bleed>
      {data ? (
        <HomeBody slug={slug} data={data} reload={reload} />
      ) : (
        <div className="px-5 pt-8 lg:px-14 lg:pt-14">
          <State loading={loading} error={error} onRetry={reload}>{null}</State>
        </div>
      )}
    </Shell>
  );
}

function HomeBody({ slug, data, reload }: { slug: string; data: Home; reload: () => void }) {
  const org = useOrgFace();
  const first = data.member.nickname || data.member.displayName.split(" ")[0];
  const cohort = org?.cohort ?? "";
  const line = yearsLine(cohort);
  return (
    <>
      <Blackboard first={first} cohort={cohort} line={line} present={data.present} />

      <div className="lined px-5 pt-8 pb-6 pl-[3.25rem] lg:px-14 lg:pt-12 lg:pl-[4.5rem]">
        <div className="lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
          <div className="min-w-0 space-y-11">
            {data.attention ? <Pinned slug={slug} attention={data.attention} /> : null}
            {data.attention?.kicker === "Your place" ? <DemoConfirm slug={slug} onDone={reload} /> : null}
            <Around slug={slug} around={data.around} />
            <Birthdays slug={slug} birthdays={data.birthdays} />
            <Letters slug={slug} feed={data.feed} />
          </div>
          <aside className="mt-11 space-y-11 lg:mt-0">
            <Notice slug={slug} notice={data.notice} />
            <NextMeet slug={slug} next={data.next} />
            <Rooms slug={slug} circles={data.circles} />
            <Purse slug={slug} data={data} />
          </aside>
        </div>
      </div>
    </>
  );
}

/** The blackboard: the date in the corner, Akwaaba in chalk, your name painted in red. */
function Blackboard({ first, cohort, line, present }: { first: string; cohort: string; line: string | null; present: number }) {
  return (
    <section className="board relative overflow-hidden border-b-[10px] border-[#141212] px-5 pt-6 pb-9 lg:px-14 lg:pt-10 lg:pb-14" aria-labelledby="greeting">
      {cohort ? <span className="tape top-5 -right-10 rotate-[32deg] lg:top-7" aria-hidden>Class of {cohort}</span> : null}
      <p className="chalk pr-16 text-right text-[1.05rem] lg:text-[1.2rem]">{chalkDate()}</p>
      <div className="rise mt-5 lg:mt-3">
        <p className="chalk text-[2rem] leading-none lg:text-[2.6rem]">Akwaaba,</p>
        <h1 id="greeting" className="display-xl painted-on-board mt-2 break-words">{first}</h1>
        <div className="chalk-line mt-5 w-40" aria-hidden />
        {line ? <p className="chalk mt-4 max-w-[30ch] text-[1.3rem] leading-snug lg:text-[1.5rem]">{line}</p> : null}
        {present > 0 ? (
          <p className="chalk mt-3 text-[1.15rem] text-[#d2d3cb]">
            <span className="chalk-red">{present}</span> of the boys are on the roll.
          </p>
        ) : null}
      </div>
    </section>
  );
}

/** A heading painted like a sign: slab capitals, one word in red. */
function Head({ id, children, action }: { id: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 id={id} className="font-sign text-[1.3rem] leading-[1.75rem] uppercase">{children}</h2>
      {action}
    </div>
  );
}
const Red = ({ children }: { children: ReactNode }) => <span className="text-gilt">{children}</span>;

/** Something that needs you (never money): a confirmation, an approval, a date to answer. */
function Pinned({ slug, attention }: { slug: string; attention: NonNullable<Home["attention"]> }) {
  return (
    <article className="slip pinned tilt-r rise px-5 pt-6 pb-5">
      <p className="kicker kicker-red">{attention.kicker}</p>
      <h2 className="mt-2 font-display text-[1.5rem] leading-tight font-bold text-hand">{attention.title}</h2>
      <p className="mt-2 max-w-[48ch] text-[0.98rem] leading-relaxed text-ink-2">{attention.body}</p>
      <Link href={attentionHref(slug, attention.href)} className="btn btn-primary btn-sm mt-4">Open it</Link>
    </article>
  );
}

/** The boys in your city, or the newest on the roll when no one else is in your city yet. */
function Around({ slug, around }: { slug: string; around: Home["around"] }) {
  if (!around.people.length) return null;
  const city = around.kind === "city" ? around.city : null;
  return (
    <section aria-labelledby="around">
      <Head id="around">{city ? <>Boys in <Red>{city}</Red></> : <>New on the <Red>roll</Red></>}</Head>
      <ul className="rail -mr-5 mt-3 flex gap-3 overflow-x-auto pr-5 pb-1 lg:mr-0 lg:flex-wrap lg:pr-0">
        {around.people.map((p) => (
          <li key={p.id} className="w-[5.5rem] shrink-0 text-center">
            <Link href={`/o/${slug}/people/${p.id}`} className="group block py-1">
              <Avatar name={p.full} size={60} className="mx-auto transition-transform duration-200 group-hover:-translate-y-0.5" />
              <span className="mt-1.5 block truncate font-display text-[1.05rem] leading-tight font-bold text-hand">{p.name}</span>
              <span className="block truncate text-[0.74rem] leading-snug text-muted">{city ? p.house ?? "" : p.city ?? p.house ?? ""}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Birthdays in the next ten days, among those who share them. */
function Birthdays({ slug, birthdays }: { slug: string; birthdays: Home["birthdays"] }) {
  if (!birthdays.length) return null;
  return (
    <section aria-labelledby="bdays">
      <Head id="bdays"><Red>Birthdays</Red> this week</Head>
      <ul className="mt-4 space-y-4">
        {birthdays.map((b, i) => (
          <li key={b.id} className={`slip px-4 py-3.5 shadow-[0_10px_22px_-16px_rgba(0,0,0,.55)] ${i % 2 ? "tilt-r" : "tilt-l"}`}>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <p className="min-w-0">
                <span className="font-display text-[1.25rem] leading-tight font-bold text-hand">{b.name}’s birthday {birthdayWhen(b.inDays, b.month, b.day)}</span>
                {b.sample ? <SampleTag /> : null}
                {b.house ? <span className="block text-[0.85rem] text-muted">{b.house}</span> : null}
              </p>
              <Link href={`/o/${slug}/people/${b.id}`} className="btn btn-primary btn-sm">Say happy birthday</Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The latest notice from an officer, typed, pinned, signed with their office. */
function Notice({ slug, notice }: { slug: string; notice: Home["notice"] }) {
  if (!notice) {
    return (
      <section aria-labelledby="notice">
        <Head id="notice">The <Red>notice</Red> board</Head>
        <p className="mt-3 font-display text-[1.15rem] leading-snug text-muted">Nothing pinned up yet. When an officer writes to the year group, it goes up here, signed.</p>
      </section>
    );
  }
  const office = notice.role ? roleTitle(notice.role) : "The executive";
  return (
    <section aria-labelledby="notice">
      <Head id="notice">The <Red>notice</Red> board</Head>
      <Link href={`/o/${slug}/m/inbox`} className="slip pinned tilt-r mt-5 block px-5 pt-6 pb-5 transition-transform hover:rotate-0">
        <p className="typed border-b border-ink pb-2 text-center text-[0.8rem] tracking-[0.18em] uppercase">Notice</p>
        <p className="typed mt-3 text-[0.95rem] leading-relaxed">{notice.body}</p>
        <p className="mt-3 font-display text-[1.2rem] font-bold text-hand">— {notice.from}, {office}</p>
        <p className="mt-1 text-[0.8rem] text-muted">To {notice.audience} · {timeAgo(notice.at)}</p>
      </Link>
    </section>
  );
}

/** The next time the boys meet, with a stamp of how many are going. */
function NextMeet({ slug, next }: { slug: string; next: Home["next"] }) {
  return (
    <section aria-labelledby="next">
      <Head id="next">Next <Red>meet</Red></Head>
      {next ? (
        <Link href={`/o/${slug}/m/events`} className="slip relative mt-4 block px-4 pt-4 pb-4 shadow-[0_10px_22px_-16px_rgba(0,0,0,.55)]">
          {next.going > 0 ? <span className="stamp absolute top-3 right-3">Going · {next.going}</span> : null}
          <p className={`kicker kicker-red ${next.going > 0 ? "pr-28" : ""}`}>
            {new Date(next.at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · {new Date(next.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="mt-1.5 font-display text-[1.4rem] leading-tight font-bold text-hand">{next.title}</p>
          <p className="mt-1 text-[0.92rem] text-muted">{next.place}</p>
          <p className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[0.9rem]">{next.mine ? <>You said {next.mine === "no" ? "you can’t make it" : next.mine === "going" ? "you’re coming" : next.mine}.</> : "Will you come?"}</span>
            <span className="btn btn-primary btn-sm">{next.mine ? "See who’s coming" : "Say if you’re coming"}</span>
          </p>
        </Link>
      ) : (
        <p className="mt-3 font-display text-[1.15rem] text-muted">Nothing on the calendar yet. The organiser puts the dates up here.</p>
      )}
    </section>
  );
}

/** Your houses and circles. */
function Rooms({ slug, circles }: { slug: string; circles: Home["circles"] }) {
  if (!circles.length) return null;
  return (
    <section aria-labelledby="rooms">
      <Head id="rooms">Where you <Red>belong</Red></Head>
      <ul className="mt-2">
        {circles.slice(0, 7).map((c) => (
          <li key={c.id}>
            <Link href={`/o/${slug}/circles/${c.id}`} className="leader min-h-[1.75rem] py-2.5 text-[1rem] hover:text-gilt">
              <span className="truncate">{c.name}</span>
              <span className="dots" aria-hidden />
              <span className="shrink-0 font-display text-[1rem] text-muted">{c.kind === "derived" ? "where you sat" : "joined"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** What the boys are writing in your circles, in their own hand. */
function Letters({ slug, feed }: { slug: string; feed: Home["feed"] }) {
  return (
    <section aria-labelledby="letters">
      <Head id="letters" action={<Link href={`/o/${slug}/feed`} className="textlink inline-flex min-h-11 items-center">All of it</Link>}>From the <Red>boys</Red></Head>
      {feed.length === 0 ? <p className="mt-3 font-display text-[1.15rem] text-muted">Your circles are quiet. Write the first line.</p> : null}
      <ul className="mt-4 space-y-4">
        {feed.slice(0, 4).map((p, i) => (
          <li key={p.id} className={`slip px-4 pt-3.5 pb-3 shadow-[0_10px_22px_-16px_rgba(0,0,0,.55)] ${i % 2 ? "tilt-r" : ""}`}>
            <p className="font-display text-[1.2rem] leading-snug text-hand">“{p.body}”</p>
            <p className="mt-2 flex items-center gap-2 text-[0.85rem] text-muted">
              <Avatar name={p.full} size={26} />
              <span><span className="font-semibold text-ink">{p.author}</span> · {p.circle} · {timeAgo(p.at)}</span>
              {p.sample ? <SampleTag /> : null}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Money, kept to a quiet line: dues, an instalment, and the open appeal. */
function Purse({ slug, data }: { slug: string; data: Home }) {
  const d = data.dues;
  const lines: ReactNode[] = [];
  if (d) {
    lines.push(
      d.outstanding > 0 ? (
        <>Dues{d.current ? ` for ${d.current.label}` : ""}: {wholeCedis(d.outstanding)}, whenever you’re ready. <Link href={`/o/${slug}/dues`} className="textlink">My dues</Link></>
      ) : (
        <>Dues{d.current ? ` for ${d.current.label}` : ""}: settled. Thank you. <Link href={`/o/${slug}/dues`} className="textlink">My dues</Link></>
      ),
    );
  }
  if (data.instalment) lines.push(<>Your next part for {data.instalment.title} is due {data.instalment.dueOn}. <Link href={`/o/${slug}/give`} className="textlink">Give</Link></>);
  if (data.hero) lines.push(<>The appeal for {data.hero.title} is open. <Link href={`/o/${slug}/give/${data.hero.id}`} className="textlink">See it</Link></>);
  if (!lines.length) return null;
  return (
    <section aria-label="Dues and giving" className="border-t border-line-2 pt-4">
      <ul className="space-y-2 text-[0.92rem] leading-relaxed text-muted">
        {lines.map((l, i) => <li key={i}>{l}</li>)}
      </ul>
    </section>
  );
}
