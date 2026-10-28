import { useState } from "react";
import { circleDetail, circleList, peoplePage, personDetail } from "@/lib/hub/api";
import { hubAct } from "@/lib/hub/act";
import { Shell } from "@/components/hub/shell";
import { Back, Button, Field, Note, SampleTag, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";

export function CircleIndex({ slug }: { slug: string }) {
  const { data, error, loading } = useHub(`circles-${slug}`, () => circleList({ data: slug }));
  return (
    <Shell slug={slug}>
      <h1 className="font-display text-4xl">Circles</h1>
      <Note>House, dorm, cot and class follow where you sat. The others you join.</Note>
      <State loading={loading} error={error}>
        <ul className="mt-4 space-y-3">
          {data?.map((c) => (
            <li key={c.id}>
              <a href={`/o/${slug}/circles/${c.id}`} className="block rounded-3xl border border-line bg-card p-4">
                <p className="font-display text-2xl">{c.name}</p>
                <p className="text-sm text-muted">{c.joined ? "Yours" : "Open"} · {c.purpose}</p>
              </a>
            </li>
          ))}
        </ul>
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
              <a key={e.id} href={`/o/${slug}/m/events`} className="block rounded-3xl border border-line bg-card p-4">
                <p className="text-sm text-muted">{e.place}</p>
                <p className="font-display text-2xl">{e.title}</p>
              </a>
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
                  <a href={`/o/${slug}/people/${m.id}`} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
                    <span>{m.name}</span>
                    {m.sample ? <SampleTag /> : null}
                  </a>
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
              <a href={`/o/${slug}/people/${p.id}`} className="block rounded-3xl border border-line bg-card p-4">
                <span className="flex items-center gap-2 font-display text-2xl">{p.name} {p.sample ? <SampleTag /> : null}</span>
                <span className="text-sm text-muted">{p.full} · {[p.profession, p.city, p.house].filter(Boolean).join(" · ")}</span>
              </a>
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
            <p className="text-sm text-gold">{p.sample ? "Sample classmate. Not a real old boy." : p.status}</p>
            <h1 className="font-display text-4xl">{p.nickname || p.displayName}</h1>
            <p className="text-muted">{p.displayName}</p>
            <p>{[p.profession, p.city, p.houseName, p.className].filter(Boolean).join(" · ")}</p>
            {p.bio ? <p>{p.bio}</p> : null}
            {p.phone ? <p className="text-sm">Phone {p.phone}</p> : <Note>Phone numbers stay with the executives, unless this is you.</Note>}
            <ul className="flex flex-wrap gap-2">
              {data?.circles.map((c) => (
                <li key={c.id}><a className="inline-flex h-10 items-center rounded-full border border-line px-3 text-sm" href={`/o/${slug}/circles/${c.id}`}>{c.name}</a></li>
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
