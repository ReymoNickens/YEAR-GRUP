"use client";
import { ArrowRight, Briefcase, CalendarDays, GraduationCap, House, MapPin, Phone, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { circleDetail, circleList, peoplePage, personDetail } from "@/lib/hub/api";
import { hubAct } from "@/lib/hub/act";
import { Shell } from "@/components/hub/shell";
import { Avatar, Back, Button, Callout, Kicker, Note, PageHead, Pill, SampleTag, Section, State, TextArea } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";
import { memberState } from "@/lib/hub/words";
import { timeAgo } from "@/lib/hub/words-money";

/** Where you sat comes first, in the order the school was lived: year, house, dorm, cot, programme, class. */
const SCHOOL_ORDER = ["year", "house", "dorm", "cot", "programme", "class"];
const LEVEL: Record<string, string> = { year: "Everyone", house: "House", dorm: "Dorm", cot: "Cot", programme: "Programme", class: "Class" };

type CircleRow = { id: string; name: string; kind: string; visibility: string; purpose: string; joined: boolean; level: string | null; members: number };

function CircleLine({ slug, c, tag }: { slug: string; c: CircleRow; tag?: string }) {
  return (
    <li>
      <Link href={`/o/${slug}/circles/${c.id}`} className="group flex items-center gap-4 py-4 hover:bg-sunk/40">
        <span className="min-w-0 flex-1">
          {tag ? <span className="kicker block">{tag}</span> : null}
          <span className={`block font-display text-[1.6rem] leading-[1.05] tracking-[-0.01em] ${tag ? "mt-1.5" : ""}`}>{c.name}</span>
          <span className="mt-1 block truncate text-sm text-muted">{c.purpose}</span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-mono text-[13px] tabular-nums">{c.members}</span>
          <span className="block text-[11px] text-muted">{c.members === 1 ? "member" : "members"}</span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
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
      <PageHead kicker="Circles" title="Your people" sub="House, dorm, cot and class follow where you sat. The others you choose." />
      <State loading={loading} error={error} onRetry={reload}>
        <Section title="Where you sat">
          {school.length ? (
            <ul className="ruled-list">{school.map((c) => <CircleLine key={c.id} slug={slug} c={c} tag={c.level ? LEVEL[c.level] : undefined} />)}</ul>
          ) : (
            <p className="border border-dashed border-line-2 p-5 text-sm text-muted">Your house, dorm, cot and class open here once your place is confirmed.</p>
          )}
        </Section>
        {mine.length ? (
          <Section title="You chose" className="mt-12">
            <ul className="ruled-list">{mine.map((c) => <CircleLine key={c.id} slug={slug} c={c} />)}</ul>
          </Section>
        ) : null}
        {open.length ? (
          <Section title="Open to join" className="mt-12">
            <ul className="ruled-list">{open.map((c) => <CircleLine key={c.id} slug={slug} c={c} />)}</ul>
          </Section>
        ) : null}
        {elsewhere.length ? (
          browse ? (
            <Section title="Other houses and classes" className="mt-12">
              <ul className="ruled-list">{elsewhere.map((c) => <CircleLine key={c.id} slug={slug} c={c} tag={c.level ? LEVEL[c.level] : undefined} />)}</ul>
            </Section>
          ) : (
            <div className="mt-10"><Button tone="quiet" onClick={() => setBrowse(true)}>Browse other houses and classes</Button></div>
          )
        ) : null}
      </State>
    </Shell>
  );
}

export function CirclePage({ slug, circleId }: { slug: string; circleId: string }) {
  const { data, error, loading, reload } = useReload(`circle-${circleId}`, () => circleDetail({ data: { slug, id: circleId } }));
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function post() {
    setErr("");
    setBusy(true);
    try {
      await hubAct({ data: { type: "post", slug, circleId, body } });
      setBody("");
      reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "The note did not send.");
    } finally {
      setBusy(false);
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
    <Shell slug={slug} wide>
      <Back href={`/o/${slug}/circles`} label="Circles" />
      <State loading={loading} error={error} onRetry={reload}>
        {data ? (
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
            <div className="min-w-0">
              <header className="rise">
                <Kicker>{data.kind === "derived" ? "Where you sat" : data.visibility === "hidden" ? "Private circle" : "Circle"}</Kicker>
                <h1 className="display-lg mt-3">{data.name}</h1>
                <p className="mt-3 max-w-[48ch] text-[15px] text-muted">{data.purpose}</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {data.members.slice(0, 5).map((m) => <Avatar key={m.id} name={m.full} size={32} className="ring-2 ring-paper" />)}
                  </div>
                  <span className="text-sm text-muted">{data.members.length} {data.members.length === 1 ? "member" : "members"}</span>
                  {data.joined ? <span className="ml-auto"><Pill tone="paid">You’re in</Pill></span> : null}
                </div>
              </header>

              {!data.joined && data.kind === "voluntary" ? <div className="mt-6"><Button onClick={join}>Join this circle</Button></div> : null}

              {data.standing ? (
                <div className="mt-6">
                  <Callout>
                    {data.standing.shown && data.standing.total != null
                      ? "This circle’s giving shows on the appeal, as a group. No one’s gift is singled out."
                      : "The giving total stays hidden until enough people have given."}
                  </Callout>
                </div>
              ) : null}

              {data.events.length ? (
                <Section title="Coming up" className="mt-10">
                  <ul className="ruled-list">
                    {data.events.map((e) => (
                      <li key={e.id}>
                        <Link href={`/o/${slug}/m/events`} className="flex items-center gap-4 py-4 hover:bg-sunk/40">
                          <span className="grid size-11 shrink-0 place-items-center bg-ink text-paper"><CalendarDays className="size-5" strokeWidth={1.75} /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-medium">{e.title}</span>
                            <span className="block text-sm text-muted">{e.place}</span>
                          </span>
                          <ArrowRight className="size-4 text-muted" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Section>
              ) : null}

              <Section title="Notes" className="mt-10">
                {data.canPost ? (
                  <div className="border border-line bg-card p-4">
                    <TextArea value={body} onChange={setBody} placeholder={`Say something to ${data.name}`} rows={3} />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-[13px] text-muted">Only members of this circle see it.</p>
                      <Button onClick={post} disabled={!body.trim() || busy} size="sm" block={false}>{busy ? "Posting…" : "Post"}</Button>
                    </div>
                  </div>
                ) : null}
                {err ? <p role="alert" className="mt-3 text-sm text-crimson-ink">{err}</p> : null}
                {data.posts.length === 0 ? <p className="py-6 text-muted">No notes yet. The first one can be yours.</p> : null}
                <ul className="ruled-list">
                  {data.posts.map((p) => (
                    <li key={p.id} className="flex gap-3.5 py-4">
                      <Link href={`/o/${slug}/people/${p.authorId}`} aria-label={p.author}><Avatar name={p.full} size={40} /></Link>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="font-semibold">{p.author}{p.sample ? <SampleTag /> : null}</span>
                          <span className="shrink-0 font-mono text-[11px] text-muted">{timeAgo(p.at)}</span>
                        </p>
                        <p className="mt-1 text-[15px] leading-relaxed">{p.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            <aside className="mt-12 lg:mt-0">
              <Section title="People">
                <ul className="ruled-list">
                  {data.members.map((m) => (
                    <li key={m.id}>
                      <Link href={`/o/${slug}/people/${m.id}`} className="flex items-center gap-3 py-2.5 hover:bg-sunk/40">
                        <Avatar name={m.full} size={36} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-medium">{m.name}{m.sample ? <SampleTag /> : null}</span>
                          <span className="block truncate text-[13px] text-muted">{m.full}{m.city ? ` · ${m.city}` : ""}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>
            </aside>
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
      <PageHead kicker="The roll" title="The boys" sub="Find any of the boys by nickname, city or work." />
      <label className="relative block">
        <span className="sr-only">Search nickname, city or work</span>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => { setCursor(null); setQ(e.target.value); }}
          placeholder="Search nickname, city or work"
          className="input pl-12"
        />
      </label>
      <div className="mt-4">
        <State loading={loading} error={error} empty={data && data.people.length === 0 ? "No one matches that." : null}>
          <ul className="ruled-list border-b border-line">
            {data?.people.map((p) => (
              <li key={p.id}>
                <Link href={`/o/${slug}/people/${p.id}`} className="flex items-center gap-3.5 py-3.5 hover:bg-sunk/40">
                  <Avatar name={p.full} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{p.name}{p.sample ? <SampleTag /> : null}</span>
                    <span className="block truncate text-[13px] text-muted">{p.full}</span>
                    <span className="block truncate text-[13px] text-muted">{[p.profession, p.city, p.house].filter(Boolean).join(" · ")}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {data?.hasMore ? <div className="mt-6"><Button tone="quiet" onClick={() => setCursor(data.cursor)}>Show more</Button></div> : null}
        </State>
      </div>
    </Shell>
  );
}

export function PersonPage({ slug, memberId }: { slug: string; memberId: string }) {
  const { data, error, loading } = useHub(`person-${memberId}`, () => personDetail({ data: { slug, id: memberId } }));
  const p = data?.person;
  const facts = p
    ? ([
        [Briefcase, "Work", p.profession],
        [MapPin, "City", p.city],
        [House, "House", p.houseName],
        [GraduationCap, "Class", p.className],
        [Phone, "Phone", p.phone],
      ] as const).filter(([, , v]) => v)
    : [];
  return (
    <Shell slug={slug}>
      <Back href={`/o/${slug}/people`} label="People" />
      <State loading={loading} error={error}>
        {p ? (
          <div className="rise">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end">
              <Avatar name={p.displayName} size={88} />
              <div className="min-w-0">
                <p className="kicker">
                  {p.sample ? <span className="demo-hide">Sample classmate · </span> : null}
                  {memberState(p.status)}
                </p>
                <h1 className="display-lg mt-2">{p.nickname || p.displayName}</h1>
                {p.nickname ? <p className="mt-2 text-lg text-muted">{p.displayName}</p> : null}
              </div>
            </div>
            {p.bio ? <p className="mt-7 font-display text-[1.5rem] leading-[1.3] tracking-[-0.01em]">“{p.bio}”</p> : null}

            <dl className="mt-8 ruled-list border-y border-line">
              {facts.map(([Icon, label, value]) => (
                <div key={label} className="flex items-center gap-4 py-3.5">
                  <Icon className="size-[18px] shrink-0 text-muted" strokeWidth={1.75} />
                  <dt className="w-20 shrink-0 text-[13px] text-muted">{label}</dt>
                  <dd className="min-w-0 flex-1 truncate text-[15px] font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            {!p.phone ? <div className="mt-3"><Note>Phone numbers stay with the executives, unless this is you.</Note></div> : null}

            {data?.circles.length ? (
              <Section title="Circles" className="mt-10">
                <ul className="flex flex-wrap gap-2 pt-2">
                  {data.circles.map((c) => (
                    <li key={c.id}>
                      <Link className="inline-flex min-h-11 items-center border border-line-2 bg-card px-3.5 text-sm hover:border-ink" href={`/o/${slug}/circles/${c.id}`}>{c.name}</Link>
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}
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
