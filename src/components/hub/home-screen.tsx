"use client";
import { ArrowRight, ArrowUpRight, CalendarDays, Heart, Images, Mail, Share2 } from "lucide-react";
import Link from "next/link";
import { homeData } from "@/lib/hub/api";
import { roleTitle } from "@/lib/hub/roles";
import { timeAgo, wholeCedis } from "@/lib/hub/words-money";
import { DemoConfirm } from "@/components/hub/demo-confirm";
import { Shell } from "@/components/hub/shell";
import { Avatar, Bar, Kicker, SampleTag, Section, SectionLink, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";

type Home = Awaited<ReturnType<typeof homeData>>;

function attentionHref(slug: string, href: string) {
  if (href === "control") return `/o/${slug}/control/money`;
  if (href === "give") return `/o/${slug}/give`;
  if (href === "me") return `/o/${slug}/me`;
  return `/o/${slug}/m/events`;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/**
 * Home: where you stand, at a glance. What needs you, the appeal and how close it
 * is, what you have given, then what your circles are saying.
 */
export function HomeScreen({ slug }: { slug: string }) {
  const { data, error, loading, reload } = useHub(`home-${slug}`, () => homeData({ data: slug }));
  return (
    <Shell slug={slug} wide>
      <State loading={loading} error={error} onRetry={reload}>
        {data ? <HomeBody slug={slug} data={data} reload={reload} /> : null}
      </State>
    </Shell>
  );
}

function HomeBody({ slug, data, reload }: { slug: string; data: Home; reload: () => void }) {
  const first = data.member.nickname || data.member.displayName.split(" ")[0];
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
      <div className="min-w-0">
        <header className="rise">
          <Kicker>{today}</Kicker>
          <h1 className="display-lg mt-3">
            {greeting()}, <span className="serif-italic">{first}</span>.
          </h1>
        </header>

        {data.attention ? (
          <Link href={attentionHref(slug, data.attention.href)} className="rise rise-1 group mt-6 flex items-center gap-4 border-l-[3px] border-crimson bg-card py-4 pr-4 pl-4 transition-colors hover:bg-sunk/50">
            <span className="min-w-0 flex-1">
              <span className="kicker kicker-red block">{data.attention.kicker}</span>
              <span className="mt-1.5 block text-[17px] font-semibold tracking-[-0.01em]">{data.attention.title}</span>
              <span className="mt-0.5 block text-sm text-muted">{data.attention.body}</span>
            </span>
            <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : null}
        {data.attention?.kicker === "Your place" ? <div className="mt-3"><DemoConfirm slug={slug} onDone={reload} /></div> : null}

        {data.hero ? <AppealPoster slug={slug} hero={data.hero} org={data.org.name} /> : null}

        <QuickActions slug={slug} />

        <div className="lg:hidden">
          <YourGiving slug={slug} given={data.given} />
          {data.notice ? <Notice slug={slug} notice={data.notice} /> : null}
        </div>

        <Section title="Latest from your circles" action={<SectionLink href={`/o/${slug}/feed`}>See all</SectionLink>} className="mt-12">
          {data.feed.length === 0 ? <p className="py-6 text-muted">Your circles are quiet. The first note can be yours.</p> : null}
          <ul className="ruled-list">
            {data.feed.map((p) => (
              <li key={p.id} className="flex gap-3.5 py-4">
                <Avatar name={p.author} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">
                      <span className="font-semibold">{p.author}</span>
                      {p.sample ? <SampleTag /> : null}
                      <span className="text-muted"> in {p.circle}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-muted">{timeAgo(p.at)}</span>
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-12 space-y-0">
          <YourGiving slug={slug} given={data.given} />
          {data.notice ? <Notice slug={slug} notice={data.notice} /> : null}
          <MyCircles slug={slug} circles={data.circles} />
        </div>
      </aside>

      <div className="lg:hidden">
        <MyCircles slug={slug} circles={data.circles} />
      </div>
    </div>
  );
}

/** The appeal, as a poster: what it is for, how close it is, and the two things to do. */
function AppealPoster({ slug, hero, org }: { slug: string; hero: NonNullable<Home["hero"]>; org: string }) {
  const pct = hero.target > 0 ? Math.floor((hero.raised / hero.target) * 100) : 0;
  const link = typeof window !== "undefined" ? `${window.location.origin}/o/${slug}/give/${hero.id}` : "";
  const share = `${hero.title} for ${org}: ${wholeCedis(hero.raised)} raised so far, ${pct}% of the way. Add yours: ${link}`;
  return (
    <section className="poster rise rise-2 mt-6 -mx-5 px-5 pt-6 pb-6 sm:mx-0 sm:px-7 sm:pt-7" aria-labelledby="appeal-title">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] font-medium tracking-[0.16em] text-white/80 uppercase">The appeal</span>
        <span className="font-mono text-[11px] font-medium tracking-[0.16em] text-white/80 uppercase">{pct}% there</span>
      </div>
      <h2 id="appeal-title" className="mt-8 font-display text-[3.25rem] leading-[0.92] tracking-[-0.02em] sm:text-[4rem]">{hero.title}</h2>
      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <p className="figure text-[2.75rem] sm:text-[3.25rem]">{wholeCedis(hero.raised)}</p>
          <p className="mt-2 text-sm text-white/80">raised of {wholeCedis(hero.target)}</p>
        </div>
        <div className="text-right">
          <p className="figure text-[1.75rem]">{hero.givers}</p>
          <p className="mt-2 text-sm text-white/80">old boys have given</p>
        </div>
      </div>
      <div className="mt-5">
        <Bar value={hero.raised} max={hero.target} tone="onDark" label="Raised so far" ticks={[25, 50, 75]} height={8} />
      </div>
      <div className="mt-6 grid grid-cols-[1fr_auto] gap-2.5">
        <Link href={`/o/${slug}/give/${hero.id}`} className="btn btn-white">
          <Heart className="size-[18px]" strokeWidth={2.25} /> Give to the appeal
        </Link>
        <a href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light px-4" aria-label="Share on WhatsApp">
          <Share2 className="size-[18px]" />
          <span className="hidden sm:inline">Share</span>
        </a>
      </div>
    </section>
  );
}

const QUICK = [
  { href: "give", label: "Give", icon: Heart },
  { href: "m/events", label: "Events", icon: CalendarDays },
  { href: "m/photos", label: "Photos", icon: Images },
  { href: "m/inbox", label: "Messages", icon: Mail },
] as const;

function QuickActions({ slug }: { slug: string }) {
  return (
    <nav aria-label="Shortcuts" className="rise rise-3 mt-6 grid grid-cols-4 gap-2 lg:hidden">
      {QUICK.map(({ href, label, icon: Icon }) => (
        <Link key={label} href={`/o/${slug}/${href}`} className="flex aspect-square flex-col items-center justify-center gap-2 border border-line bg-card text-[13px] font-medium transition-colors hover:border-ink active:bg-sunk">
          <Icon className="size-[22px]" strokeWidth={1.75} />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function YourGiving({ slug, given }: { slug: string; given: Home["given"] }) {
  return (
    <Section title="Your giving" action={<SectionLink href={`/o/${slug}/me#receipts`}>Receipts</SectionLink>} className="mt-12 lg:mt-0">
      <div className="grid grid-cols-2 gap-4 py-3">
        <div>
          <p className="figure text-[2rem]">{wholeCedis(given.total)}</p>
          <p className="mt-1.5 text-[13px] text-muted">given, all confirmed</p>
        </div>
        <div>
          <p className="figure text-[2rem]">{given.count}</p>
          <p className="mt-1.5 text-[13px] text-muted">{given.count === 1 ? "gift" : "gifts"} with receipts</p>
        </div>
      </div>
      <p className="border-t border-line pt-3 text-[13px] text-muted">Only the payment gateway marks a gift paid. Every one is on the ledger.</p>
    </Section>
  );
}

function Notice({ slug, notice }: { slug: string; notice: NonNullable<Home["notice"]> }) {
  const role = notice.role ? roleTitle(notice.role) : "Executive";
  return (
    <Section title="From the executive" className="mt-12">
      <Link href={`/o/${slug}/m/inbox`} className="group block py-3">
        <p className="font-display text-[1.6rem] leading-[1.18] tracking-[-0.01em]">
          <span className="text-crimson">“</span>{notice.body}<span className="text-crimson">”</span>
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Avatar name={notice.from} size={32} />
          <p className="min-w-0 text-[13px] leading-tight">
            <span className="block font-medium">{notice.from}</span>
            <span className="block text-muted">{role} · to {notice.audience} · {timeAgo(notice.at)}</span>
          </p>
          <ArrowUpRight className="ml-auto size-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </Link>
    </Section>
  );
}

function MyCircles({ slug, circles }: { slug: string; circles: Home["circles"] }) {
  if (!circles.length) return null;
  return (
    <Section title="Your circles" action={<SectionLink href={`/o/${slug}/circles`}>All</SectionLink>} className="mt-12">
      <ul className="ruled-list">
        {circles.slice(0, 6).map((c) => (
          <li key={c.id}>
            <Link href={`/o/${slug}/circles/${c.id}`} className="flex min-h-14 items-center justify-between gap-3 py-3 hover:bg-sunk/40">
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-medium">{c.name}</span>
                <span className="block truncate text-[13px] text-muted">{c.kind === "derived" ? "Where you sat" : "You joined"}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
