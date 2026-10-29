"use client";
import Link from "next/link";
import { homeData } from "@/lib/hub/api";
import { roleTitle } from "@/lib/hub/roles";
import { timeAgo, wholeCedis } from "@/lib/hub/words-money";
import { DemoConfirm } from "@/components/hub/demo-confirm";
import { useOrgFace } from "@/components/hub/org-context";
import { roman, Shell } from "@/components/hub/shell";
import { Avatar, Bar, SampleTag, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";

type Home = Awaited<ReturnType<typeof homeData>>;

const WORDS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "twenty-one", "twenty-two", "twenty-three", "twenty-four", "twenty-five"];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function attentionHref(slug: string, href: string) {
  if (href === "control") return `/o/${slug}/control/money`;
  if (href === "give") return `/o/${slug}/give`;
  if (href === "me") return `/o/${slug}/me`;
  if (href === "dues") return `/o/${slug}/dues`;
  return `/o/${slug}/m/events`;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/** The line under the name: how long since we left the hill, and what is coming. Only when the cohort year is known. */
function yearsLine(cohort: string) {
  const year = Number(cohort);
  if (!year) return null;
  const since = new Date().getFullYear() - year;
  if (since <= 0) return null;
  const words = WORDS[since] ?? String(since);
  const tail = since === 19 ? " The twentieth is next year." : since === 20 ? " This is our twentieth year." : "";
  return `${cap(words)} ${since === 1 ? "year" : "years"} since we left the hill.${tail}`;
}

/**
 * Home, as an honours board: your name lettered on the board, the roll-call of who has
 * answered, the appeal as a foundation stone, and the papers pinned beneath it: what
 * needs you, your standing, the latest notice, the next date, and letters from your circles.
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
      {/* The board */}
      <section className="board relative overflow-hidden px-5 pt-9 pb-10 lg:px-14 lg:pt-16 lg:pb-16" aria-labelledby="greeting">
        <span aria-hidden className="pointer-events-none absolute -right-4 -bottom-16 font-display text-[16rem] leading-none text-[#1d1a16] italic select-none lg:-right-2 lg:-bottom-24 lg:text-[24rem]">
          {cohort ? cohort.slice(2) : ""}
        </span>
        <div className="relative lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
          <div className="rise">
            <p className="kicker">{org?.place ? `${org.place} · ` : ""}{cohort ? `Class of ${roman(Number(cohort))}` : org?.name}</p>
            <p className="mt-6 font-display text-[1.6rem] italic leading-none text-gilt lg:text-[2rem]">{greeting()},</p>
            <h1 id="greeting" className="display-xl mt-2 break-words">{first}.</h1>
            {line ? <p className="mt-6 max-w-[34ch] text-[1.05rem] leading-relaxed text-ink-2">{line}</p> : null}
            <RollCall data={data} />
          </div>
          {data.hero ? <div className="mt-10 lg:mt-2"><Stone slug={slug} hero={data.hero} org={data.org.name} /></div> : null}
        </div>
      </section>

      {/* The papers */}
      <div className="px-5 pt-10 lg:px-14 lg:pt-14">
        <div className="lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
          <div className="min-w-0 space-y-12">
            {data.attention ? <Pinned slug={slug} attention={data.attention} /> : null}
            {data.attention?.kicker === "Your place" ? <DemoConfirm slug={slug} onDone={reload} /> : null}
            {data.notice ? <Notice slug={slug} notice={data.notice} /> : <EmptyNotice />}
            <Letters slug={slug} feed={data.feed} />
          </div>
          <aside className="mt-12 space-y-12 lg:mt-0">
            <Standing slug={slug} data={data} />
            <NextDate slug={slug} next={data.next} />
            <Rooms slug={slug} circles={data.circles} />
          </aside>
        </div>
      </div>
    </>
  );
}

/** Who has answered, counted from confirmed places and confirmed gifts. No invented totals. */
function RollCall({ data }: { data: Home }) {
  return (
    <dl className="mt-9 max-w-md">
      <div className="moulding" aria-hidden />
      <div className="leader pt-4 text-[1rem]">
        <dt className="text-ink-2">Have answered present</dt>
        <span className="dots" aria-hidden />
        <dd className="figure text-[1.6rem] text-gilt">{data.present}</dd>
      </div>
      {data.hero ? (
        <div className="leader pt-2 text-[1rem]">
          <dt className="text-ink-2">Have given to the appeal</dt>
          <span className="dots" aria-hidden />
          <dd className="figure text-[1.6rem] text-gilt">{data.hero.givers}</dd>
        </div>
      ) : null}
    </dl>
  );
}

/** The appeal as a foundation stone: lettered, framed, its progress drawn as one gilt line. */
function Stone({ slug, hero, org }: { slug: string; hero: NonNullable<Home["hero"]>; org: string }) {
  const pct = hero.target > 0 ? Math.floor((hero.raised / hero.target) * 100) : 0;
  const link = typeof window !== "undefined" ? `${window.location.origin}/o/${slug}/give/${hero.id}` : "";
  const share = `${hero.title}, for ${org}: ${wholeCedis(hero.raised)} given so far by ${hero.givers} of us. Add your name: ${link}`;
  return (
    <article className="framed rise rise-2 border border-[#3a332a] bg-[#16130f] px-6 pt-8 pb-7 sm:px-8" aria-labelledby="appeal">
      <p className="kicker text-center">The appeal</p>
      <h2 id="appeal" className="lettered mt-4 text-center text-[1.7rem] leading-[1.1] sm:text-[2rem]">{hero.title}</h2>
      <p className="mx-auto mt-4 max-w-[30ch] text-center font-display text-[1.15rem] leading-snug italic text-ink-2">{hero.story.split(".")[0]}.</p>
      <div className="mt-7 flex items-end justify-between gap-4">
        <div>
          <p className="figure text-[2.6rem] text-ink">{wholeCedis(hero.raised)}</p>
          <p className="mt-1.5 text-[0.9rem] text-muted">given of {wholeCedis(hero.target)}</p>
        </div>
        <p className="figure text-[2.6rem] text-gilt">{pct}<span className="text-[1.4rem]">%</span></p>
      </div>
      <div className="mt-4"><Bar value={hero.raised} max={hero.target} tone="onDark" label="Given so far" ticks={[25, 50, 75]} height={3} /></div>
      <div className="mt-7 flex items-center justify-between gap-4">
        <Link href={`/o/${slug}/give/${hero.id}`} className="btn btn-primary flex-1 sm:flex-none">Add your name</Link>
        <a href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer" className="textlink inline-flex min-h-11 items-center">Share</a>
      </div>
    </article>
  );
}

/** What needs you, as a paper slip pinned to the board. */
function Pinned({ slug, attention }: { slug: string; attention: NonNullable<Home["attention"]> }) {
  const pay = attention.kicker === "Dues";
  return (
    <article className="slip rise relative border-l-[3px] border-crimson px-5 py-6 shadow-[0_14px_30px_-18px_rgba(0,0,0,.45)] sm:px-7">
      <p className="kicker kicker-red">{pay ? "A note on your dues" : attention.kicker}</p>
      <h2 className="mt-3 font-display text-[2rem] leading-none font-semibold">{attention.title}</h2>
      <p className="mt-3 max-w-[48ch] text-[1rem] leading-relaxed text-ink-2">{attention.body}</p>
      <Link href={attentionHref(slug, attention.href)} className={`btn mt-5 ${pay ? "btn-red" : "btn-primary"}`}>
        {pay ? "Settle it now" : "Open it"}
      </Link>
    </article>
  );
}

/** The latest notice from an officer, set like a printed notice, signed with their office. */
function Notice({ slug, notice }: { slug: string; notice: NonNullable<Home["notice"]> }) {
  const office = notice.role ? roleTitle(notice.role) : "The executive";
  return (
    <section aria-labelledby="notice">
      <div className="moulding" aria-hidden />
      <h2 id="notice" className="kicker pt-3 text-ink-2">From the {office.toLowerCase() === "the executive" ? "executive" : office}</h2>
      <Link href={`/o/${slug}/m/inbox`} className="group mt-4 block">
        <p className="font-display text-[1.75rem] leading-[1.2] italic sm:text-[2.1rem]">
          <span className="text-gilt">“</span>{notice.body}<span className="text-gilt">”</span>
        </p>
        <p className="mt-4 text-[0.95rem] text-muted">
          <span className="text-ink">{notice.from}</span>, {office} · to {notice.audience} · {timeAgo(notice.at)}
        </p>
      </Link>
    </section>
  );
}

function EmptyNotice() {
  return (
    <section>
      <div className="moulding" aria-hidden />
      <h2 className="kicker pt-3 text-ink-2">Notices</h2>
      <p className="mt-4 max-w-[40ch] font-display text-[1.4rem] leading-snug italic text-muted">The notice board is clear. When an officer writes to the year group, it is pinned here, signed.</p>
    </section>
  );
}

/** Your standing: dues and gifts, as two lines of a ledger. */
function Standing({ slug, data }: { slug: string; data: Home }) {
  const d = data.dues;
  return (
    <section aria-labelledby="standing">
      <div className="moulding" aria-hidden />
      <h2 id="standing" className="kicker pt-3 text-ink-2">Your standing</h2>
      <dl className="mt-4 space-y-3 text-[1rem]">
        {d ? (
          <Link href={`/o/${slug}/dues`} className="leader group">
            <dt>Dues{d.current ? `, ${d.current.label}` : ""}</dt>
            <span className="dots" aria-hidden />
            <dd className={`font-semibold tabular-nums ${d.outstanding > 0 ? "text-crimson-ink" : "text-paid"}`}>
              {d.outstanding > 0 ? `${wholeCedis(d.outstanding)} due` : "Paid up"}
            </dd>
          </Link>
        ) : null}
        <Link href={`/o/${slug}/me#receipts`} className="leader">
          <dt>Given, all confirmed</dt>
          <span className="dots" aria-hidden />
          <dd className="font-semibold tabular-nums">{wholeCedis(data.given.total)}</dd>
        </Link>
        <div className="leader text-muted">
          <dt>Receipts</dt>
          <span className="dots" aria-hidden />
          <dd className="tabular-nums">{data.given.count}</dd>
        </div>
      </dl>
      <div className="mt-5 flex gap-6">
        {d ? <Link href={`/o/${slug}/dues`} className="textlink inline-flex min-h-11 items-center">Your dues</Link> : null}
        <Link href={`/o/${slug}/me#receipts`} className="textlink inline-flex min-h-11 items-center">Receipts</Link>
      </div>
    </section>
  );
}

/** The next date on the calendar, set large, the way a programme prints it. */
function NextDate({ slug, next }: { slug: string; next: Home["next"] }) {
  return (
    <section aria-labelledby="next">
      <div className="moulding" aria-hidden />
      <h2 id="next" className="kicker pt-3 text-ink-2">Next on the calendar</h2>
      {next ? (
        <Link href={`/o/${slug}/m/events`} className="mt-4 grid grid-cols-[auto_1fr] items-start gap-5">
          <span className="text-center leading-none">
            <span className="figure block text-[3.6rem] text-gilt">{new Date(next.at).getDate()}</span>
            <span className="kicker mt-1 block">{new Date(next.at).toLocaleDateString("en-GB", { month: "short" })}</span>
          </span>
          <span className="min-w-0 pt-1">
            <span className="block font-display text-[1.5rem] leading-tight font-semibold">{next.title}</span>
            <span className="mt-1 block text-[0.95rem] text-muted">
              {new Date(next.at).toLocaleDateString("en-GB", { weekday: "long" })}, {new Date(next.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · {next.place}
            </span>
            <span className="mt-2 block text-[0.95rem]">
              {next.going} coming{next.mine ? <span className="text-muted"> · you said {next.mine === "no" ? "you can’t" : next.mine}</span> : <span className="text-gilt"> · will you come?</span>}
            </span>
          </span>
        </Link>
      ) : (
        <p className="mt-4 font-display text-[1.25rem] italic text-muted">Nothing on the calendar yet. The organiser posts the year’s dates here.</p>
      )}
    </section>
  );
}

/** Your houses and rooms, listed as a board lists them. */
function Rooms({ slug, circles }: { slug: string; circles: Home["circles"] }) {
  if (!circles.length) return null;
  return (
    <section aria-labelledby="rooms">
      <div className="moulding" aria-hidden />
      <h2 id="rooms" className="kicker pt-3 text-ink-2">Where you belong</h2>
      <ul className="mt-3">
        {circles.slice(0, 7).map((c) => (
          <li key={c.id}>
            <Link href={`/o/${slug}/circles/${c.id}`} className="leader min-h-11 py-1.5 text-[1rem] hover:text-gilt">
              <span className="truncate">{c.name}</span>
              <span className="dots" aria-hidden />
              <span className="shrink-0 font-display text-[1rem] italic text-muted">{c.kind === "derived" ? "where you sat" : "joined"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Letters from your circles: a column, the writer in small capitals. */
function Letters({ slug, feed }: { slug: string; feed: Home["feed"] }) {
  return (
    <section aria-labelledby="letters">
      <div className="moulding" aria-hidden />
      <div className="flex items-baseline justify-between pt-3">
        <h2 id="letters" className="kicker text-ink-2">Letters from your circles</h2>
        <Link href={`/o/${slug}/feed`} className="textlink inline-flex min-h-11 items-center">All letters</Link>
      </div>
      {feed.length === 0 ? (
        <p className="mt-4 font-display text-[1.25rem] italic text-muted">Your circles are quiet. The first letter can be yours.</p>
      ) : null}
      <ul className="mt-2 divide-y divide-line">
        {feed.slice(0, 4).map((p) => (
          <li key={p.id} className="grid grid-cols-[auto_1fr] gap-4 py-5">
            <Avatar name={p.full} size={40} />
            <div className="min-w-0">
              <p className="text-[0.72rem] font-semibold tracking-[0.16em] uppercase">
                {p.author}{p.sample ? <SampleTag /> : null}
                <span className="ml-2 font-display text-[0.95rem] font-medium tracking-normal normal-case italic text-muted">{p.circle} · {timeAgo(p.at)}</span>
              </p>
              <p className="mt-1.5 text-[1.02rem] leading-relaxed">{p.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
