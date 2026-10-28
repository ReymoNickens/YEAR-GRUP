"use client";
import Link from "next/link";
import { useState } from "react";
import { circleDetail, circleList, peoplePage, personDetail } from "@/lib/hub/api";
import { hubAct } from "@/lib/hub/act";
import { Shell } from "@/components/hub/shell";
import { Back, Button, Field, Note, SampleTag, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";
import { memberState } from "@/lib/hub/words";

/** Where you sat comes first, in the order the school was lived: year, house, dorm, cot, programme, class. */
const SCHOOL_ORDER = ["year", "house", "dorm", "cot", "programme", "class"];

type CircleRow = { id: string; name: string; kind: string; visibility: string; purpose: string; joined: boolean; level: string | null; members: number };

function CircleCard({ slug, c, tag }: { slug: string; c: CircleRow; tag?: string }) {
  return (
    <li>
      <Link href={`/o/${slug}/circles/${c.id}`} className="flex items-center justify-between gap-3 rounded-3xl border border-line bg-card p-4 transition active:scale-[0.99]">
        <span className="min-w-0">
          <span className="block font-display text-2xl leading-tight">{c.name}</span>
          <span className="mt-1 block truncate text-sm text-muted">{tag ? `${tag} · ` : ""}{c.purpose}</span>
        </span>
        <span className="shrink-0 rounded-full bg-paper px-3 py-1 text-xs text-muted tabular-nums">{c.members} {c.members === 1 ? "member" : "members"}</span>
      </Link>
    </li>
  );
}

export function CircleIndex({ slug }: { slug: string }) {
  const { data, error, loading, reload } = useHub(`circles-${slug}`, () => circleList({ data: slug }));
  const [browse, setBrowse] = useState(false);
  const rows = (data ?? []) as CircleRow[];
  const rank = (c: CircleRow) => (c.level ? SCHOOL_ORDER.indexOf(c.level) : 99);
  const school = rows.filter((c) => c.joined && c.kind === "derived").sort((a, b) => rank(a) - rank(b));
  const mine = rows.filter((c) => c.joined && c.kind !== "derived");
  const open = rows.filter((c) => !c.joined && c.kind === "voluntary").sort((a, b) => b.members - a.members);
  const elsewhere = rows.filter((c) => !c.joined && c.kind === "derived" && c.level !== "cot").sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  return (
    <Shell slug={slug}>
      <h1 className="font-display text-4xl">Circles</h1>
      <Note>House, dorm, cot and class follow where you sat. The others you choose.</Note>
      <State loading={loading} error={error} onRetry={reload}>
        <section className="mt-6">
          <h2 className="text-xs tracking-[0.18em] text-gold uppercase">Where you sat</h2>
          {school.length ? (
            <ul className="mt-3 space-y-3">{school.map((c) => <CircleCard key={c.id} slug={slug} c={c} tag={c.level === "year" ? "Everyone" : c.level ? c.level[0].toUpperCase() + c.level.slice(1) : undefined} />)}</ul>
          ) : (
            <p className="mt-3 rounded-3xl border border-dashed border-line p-4 text-sm text-muted">Your house, dorm, cot and class open here once your place is confirmed.</p>
          )}
        </section>
        {mine.length ? (
          <section className="mt-8">
            <h2 className="text-xs tracking-[0.18em] text-gold uppercase">You chose</h2>
            <ul className="mt-3 space-y-3">{mine.map((c) => <CircleCard key={c.id} slug={slug} c={c} />)}</ul>
          </section>
        ) : null}
        {open.length ? (
          <section className="mt-8">
            <h2 className="text-xs tracking-[0.18em] text-gold uppercase">Join a circle</h2>
            <ul className="mt-3 space-y-3">{open.map((c) => <CircleCard key={c.id} slug={slug} c={c} />)}</ul>
          </section>
        ) : null}
        {elsewhere.length ? (
          <section className="mt-8">
            {browse ? (
              <>
                <h2 className="text-xs tracking-[0.18em] text-gold uppercase">Other houses and classes</h2>
                <ul className="mt-3 space-y-3">{elsewhere.map((c) => <CircleCard key={c.id} slug={slug} c={c} />)}</ul>
              </>
            ) : (
              <button type="button" onClick={() => setBrowse(true)} className="h-12 w-full rounded-full border border-line text-sm text-muted">
                Browse other houses and classes
              </button>
            )}
          </section>
        ) : null}
      </State>
    </Shell>
  );
}

export function CirclePage({ slug, circleId }: { slug: string; circleId: string }) {
  const { data, error, loading, reload } = useReload(`circle-${circleId}`, () => circleDetail({ data: { slug, id: circleId } }));
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  async function post() {
    setErr("");
    try {
      await hubAct({ data: { type: "post", slug, circleId, body } });
      setBody("");
      reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "The note did not send.");
    }
  }
  async function join() {
    try {
      await hubAct({ data: { type: "join", slug, circleId } });
      reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "You could not join.");
    }
  }
  return (
    <Shell slug={slug}>
      <Back href={`/o/${slug}/circles`} label="Circles" />
      <State loading={loading} error={error}>
        {data ? (
          <div className="space-y-5">
            <h1 className="font-display text-4xl">{data.name}</h1>
            <p>{data.purpose}</p>
            {data.standing ? (
              <p className="rounded-2xl bg-gold-soft px-4 py-3 text-sm">
                {data.standing.shown && data.standing.total != null
                  ? "This circle's giving total is on the appeal, as a group."
                  : "The giving total stays hidden until enough people have given."}
              </p>
            ) : null}
            {!data.joined && data.kind === "voluntary" ? <Button onClick={join}>Join</Button> : null}
            {data.events.map((e) => (
              <Link key={e.id} href={`/o/${slug}/m/events`} className="block rounded-3xl border border-line bg-card p-4">
                <p className="text-sm text-muted">{e.place}</p>
                <p className="font-display text-2xl">{e.title}</p>
              </Link>
            ))}
            {data.canPost ? (
              <div className="space-y-3">
                <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="A note for this circle" className="min-h-28 w-full rounded-3xl border border-line bg-card p-4" />
                <Button onClick={post} disabled={!body.trim()}>Post</Button>
              </div>
            ) : null}
            {err ? <p className="text-sm text-crimson">{err}</p> : null}
            {data.posts.map((p) => (
              <article key={p.id} className="rounded-3xl border border-line bg-card p-4">
                <p className="text-sm text-muted">{p.author} {p.sample ? <SampleTag /> : null}</p>
                <p className="mt-2">{p.body}</p>
              </article>
            ))}
            <h2 className="font-display text-2xl">People</h2>
            <ul className="space-y-2">
              {data.members.map((m) => (
                <li key={m.id}>
                  <Link href={`/o/${slug}/people/${m.id}`} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
                    <span>{m.name}</span>
                    {m.sample ? <SampleTag /> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </State>
    </Shell>
  );
}

export function PeopleIndex({ slug }: { slug: string }) {
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const { data, error, loading } = useHub(`people-${slug}-${q}-${cursor}`, () => peoplePage({ data: { slug, q, cursor } }));
  return (
    <Shell slug={slug}>
      <h1 className="font-display text-4xl">People</h1>
      <div className="mt-4">
        <Field label="Search nickname, city or work" value={q} onChange={(v) => { setCursor(null); setQ(v); }} />
      </div>
      <State loading={loading} error={error} empty={data && data.people.length === 0 ? "No one matches that." : null}>
        <ul className="mt-4 space-y-3">
          {data?.people.map((p) => (
            <li key={p.id}>
              <Link href={`/o/${slug}/people/${p.id}`} className="block rounded-3xl border border-line bg-card p-4">
                <span className="flex items-center gap-2 font-display text-2xl">{p.name} {p.sample ? <SampleTag /> : null}</span>
                <span className="text-sm text-muted">{p.full} · {[p.profession, p.city, p.house].filter(Boolean).join(" · ")}</span>
              </Link>
            </li>
          ))}
        </ul>
        {data?.hasMore ? <div className="mt-4"><Button tone="quiet" onClick={() => setCursor(data.cursor)}>Load more</Button></div> : null}
      </State>
    </Shell>
  );
}

export function PersonPage({ slug, memberId }: { slug: string; memberId: string }) {
  const { data, error, loading } = useHub(`person-${memberId}`, () => personDetail({ data: { slug, id: memberId } }));
  const p = data?.person;
  return (
    <Shell slug={slug}>
      <Back href={`/o/${slug}/people`} label="People" />
      <State loading={loading} error={error}>
        {p ? (
          <div className="space-y-4">
            <p className="text-sm text-gold">
              {p.sample ? <span className="demo-hide">Sample classmate. Not a real old boy. </span> : null}
              <span className={p.sample ? "hidden [[data-demo]_&]:inline" : ""}>{memberState(p.status)}</span>
            </p>
            <h1 className="font-display text-4xl">{p.nickname || p.displayName}</h1>
            <p className="text-muted">{p.displayName}</p>
            <p>{[p.profession, p.city, p.houseName, p.className].filter(Boolean).join(" · ")}</p>
            {p.bio ? <p>{p.bio}</p> : null}
            {p.phone ? <p className="text-sm">Phone {p.phone}</p> : <Note>Phone numbers stay with the executives, unless this is you.</Note>}
            <ul className="flex flex-wrap gap-2">
              {data?.circles.map((c) => (
                <li key={c.id}><Link className="inline-flex h-10 items-center rounded-full border border-line px-3 text-sm" href={`/o/${slug}/circles/${c.id}`}>{c.name}</Link></li>
              ))}
            </ul>
          </div>
        ) : null}
      </State>
    </Shell>
  );
}

function useReload<T>(key: string, load: () => Promise<T>) {
  const [tick, setTick] = useState(0);
  const state = useHub(`${key}-${tick}`, load);
  return { ...state, reload: () => setTick((n) => n + 1) };
}
