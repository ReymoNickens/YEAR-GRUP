"use client";
import { BadgeCheck } from "lucide-react";
import { roleTitle } from "@/lib/hub/roles";
import { wholeCedis } from "@/lib/hub/words-money";
import Link from "next/link";
import { homeData } from "@/lib/hub/api";
import { Shell } from "@/components/hub/shell";
import { Bar, Cover, Money, Note, SampleTag, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";
import { DemoConfirm } from "@/components/hub/demo-confirm";

function attentionHref(slug: string, href: string) {
  if (href === "control") return `/o/${slug}/control/money`;
  if (href === "give") return `/o/${slug}/give`;
  if (href === "me") return `/o/${slug}/me`;
  return `/o/${slug}/m/events`;
}

export function HomeScreen({ slug }: { slug: string }) {
  const { data, error, loading, reload } = useHub(`home-${slug}`, () => homeData({ data: slug }));
  return (
    <Shell slug={slug} title={data?.org.name} eyebrow={data?.org.branding.motto}>
      <State loading={loading} error={error}>
        {data ? (
          <div className="space-y-6">
            <p className="demo-hide rounded-2xl bg-gold-soft px-4 py-3 text-sm text-gold">
              Classmates marked Sample are fictional, so the school is not empty. They leave when the real list is imported.
            </p>
            {data.attention ? (
              <Link href={attentionHref(slug, data.attention.href)} className="block rounded-3xl border border-line bg-card p-5">
                <p className="text-xs tracking-widest text-gold uppercase">{data.attention.kicker}</p>
                <h2 className="mt-1 font-display text-3xl">{data.attention.title}</h2>
                <p className="mt-2 text-muted">{data.attention.body}</p>
              </Link>
            ) : null}
            {data.attention?.kicker === "Your place" ? <DemoConfirm slug={slug} onDone={reload} /> : null}
            {data.notice ? (
              <Link href={`/o/${slug}/m/inbox`} className="relative block -rotate-[0.6deg] rounded-sm border border-line bg-[#fffbea] p-5 text-[#1c1a14] shadow-[2px_4px_0_rgb(var(--shadow)/0.12)] dark:bg-[#2a2718] dark:text-ink">
                <span aria-hidden className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full bg-stamp shadow-[0_2px_0_rgb(0_0_0/0.25)]" />
                <p className="flex items-center gap-1.5 text-xs tracking-widest text-gold uppercase">
                  <BadgeCheck className="size-4" aria-hidden />
                  From the {data.notice.role ? roleTitle(data.notice.role).toLowerCase() : "executive"} · to {data.notice.audience}
                </p>
                <p className="note-hand mt-2 text-xl leading-snug">{data.notice.body}</p>
                <p className="mt-3 text-sm text-muted">{data.notice.from}{data.notice.role ? `, ${roleTitle(data.notice.role)}` : ""} · verified sender</p>
              </Link>
            ) : null}
            {data.hero ? (
              <section className="overflow-hidden rounded-lg bg-crimson text-on-crimson">
                <div className="relative">
                  <Cover motif="class" alt="" className="h-44" />
                  <div className="absolute inset-0 bg-gradient-to-t from-crimson via-crimson/30 to-transparent" />
                  <div className="absolute inset-x-5 bottom-3">
                    <p className="text-xs tracking-[0.2em] text-gold-soft uppercase">The appeal</p>
                    <h1 className="mt-1 font-display text-4xl uppercase leading-[0.92]">{data.hero.title}</h1>
                  </div>
                </div>
                <div className="p-5 pt-3">
                  <p className="text-on-crimson/85">{data.hero.story}</p>
                  <p className="stencil mt-5 text-4xl tabular-nums">{wholeCedis(data.hero.raised)}</p>
                  <p className="mb-3 text-sm text-gold-soft">
                    of {wholeCedis(data.hero.target)}
                    {data.hero.target > 0 ? ` · we are ${Math.floor((data.hero.raised / data.hero.target) * 100)}% there` : ""}
                  </p>
                  <Bar value={data.hero.raised} max={data.hero.target} tone="onDark" label="Raised so far" />
                  <Link href={`/o/${slug}/give/${data.hero.id}`} className="mt-5 flex h-13 min-h-12 items-center justify-center rounded-lg bg-paper font-display text-xl font-extrabold tracking-wide text-ink uppercase">
                    See the appeal and give
                  </Link>
                </div>
              </section>
            ) : null}
            <section>
              <h2 className="font-display text-2xl">My circles</h2>
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {data.circles.map((c) => (
                  <Link key={c.id} href={`/o/${slug}/circles/${c.id}`} className="min-w-40 rounded-3xl border border-line bg-card p-4">
                    <p className="font-display text-xl leading-tight">{c.name}</p>
                    <p className="mt-2 text-sm text-muted">{c.kind === "derived" ? "From your placement" : "You joined"}</p>
                  </Link>
                ))}
              </div>
            </section>
            <section className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-2xl">Latest</h2>
                <Link href={`/o/${slug}/feed`} className="text-sm text-crimson">All of it</Link>
              </div>
              {data.feed.length === 0 ? <Note>Your circles are quiet. The first note can be yours.</Note> : null}
              {data.feed.map((p) => (
                <article key={p.id} className="rounded-3xl border border-line bg-card p-4">
                  <p className="text-sm text-muted">{p.circle} · {p.author} {p.sample ? <SampleTag /> : null}</p>
                  <p className="mt-2">{p.body}</p>
                </article>
              ))}
            </section>
          </div>
        ) : null}
      </State>
    </Shell>
  );
}
