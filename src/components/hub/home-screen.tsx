"use client";
import Link from "next/link";
import { homeData } from "@/lib/hub/api";
import { Shell } from "@/components/hub/shell";
import { Bar, Cover, Money, Note, SampleTag, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";

function attentionHref(slug: string, href: string) {
  if (href === "control") return `/o/${slug}/control/money`;
  if (href === "give") return `/o/${slug}/give`;
  if (href === "me") return `/o/${slug}/me`;
  return `/o/${slug}/m/events`;
}

export function HomeScreen({ slug }: { slug: string }) {
  const { data, error, loading } = useHub(`home-${slug}`, () => homeData({ data: slug }));
  return (
    <Shell slug={slug} title={data?.org.name} eyebrow={data?.org.branding.motto}>
      <State loading={loading} error={error}>
        {data ? (
          <div className="space-y-6">
            <p className="rounded-2xl bg-gold-soft px-4 py-3 text-sm text-gold">
              Classmates marked Sample are fictional, so the school is not empty. They leave when the real list is imported.
            </p>
            {data.attention ? (
              <Link href={attentionHref(slug, data.attention.href)} className="block rounded-3xl border border-line bg-card p-5">
                <p className="text-xs tracking-widest text-gold uppercase">{data.attention.kicker}</p>
                <h2 className="mt-1 font-display text-3xl">{data.attention.title}</h2>
                <p className="mt-2 text-muted">{data.attention.body}</p>
              </Link>
            ) : null}
            {data.hero ? (
              <section className="overflow-hidden rounded-3xl bg-crimson text-on-crimson">
                <Cover motif="field" alt="" className="h-48" />
                <div className="p-5">
                <p className="text-xs tracking-widest uppercase text-gold-soft">The appeal</p>
                <h1 className="mt-2 font-display text-4xl">{data.hero.title}</h1>
                <p className="mt-3">{data.hero.story}</p>
                <p className="mt-5 font-display text-3xl tabular-nums">
                  <Money value={data.hero.raised} />
                </p>
                <p className="mb-3 text-sm text-gold-soft">of <Money value={data.hero.target} /></p>
                <Bar value={data.hero.raised} max={data.hero.target} tone="onDark" label="Raised so far" />
                <Link href={`/o/${slug}/give/${data.hero.id}`} className="mt-5 flex h-12 items-center justify-center rounded-full bg-card text-ink">
                  Give
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
