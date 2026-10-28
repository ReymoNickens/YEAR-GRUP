"use client";
import Link from "next/link";
import { useState } from "react";
import { aiAssist, controlData } from "@/lib/hub/api";
import { hubAct } from "@/lib/hub/act";
import { formatGhs } from "@/lib/hub/money";
import { Shell } from "@/components/hub/shell";
import { Button, Money, Note, State } from "@/components/hub/ui";
import { MoneyDesk, People } from "@/components/hub/control-desks";
import { useHub } from "@/components/hub/use-hub";

const areas = ["people", "money", "community", "communication", "governance", "events", "reports"] as const;

export function ControlScreen({ slug, area }: { slug: string; area: string }) {
  const safe = areas.includes(area as (typeof areas)[number]) ? area : "people";
  const [tick, setTick] = useState(0);
  const { data, error, loading } = useHub(`ctl-${safe}-${tick}`, () => controlData({ data: { slug, area: safe } }));
  const reload = () => setTick((n) => n + 1);
  const bag = (data ?? {}) as Record<string, unknown>;
  return (
    <Shell slug={slug}>
      <p className="text-xs tracking-widest text-gold uppercase">Control room</p>
      <h1 className="font-display text-4xl capitalize">{safe}</h1>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {areas.map((a) => (
          <Link key={a} href={`/o/${slug}/control/${a}`} className={`flex h-12 shrink-0 items-center rounded-full px-4 ${a === safe ? "bg-crimson text-on-crimson" : "border border-line"}`}>{a}</Link>
        ))}
      </div>
            <div className="mt-4">
        <State loading={loading} error={error}>
          {safe === "people" ? <People bag={bag} slug={slug} reload={reload} /> : null}
          {safe === "money" ? <MoneyDesk bag={bag} slug={slug} reload={reload} /> : null}
          {safe === "community" ? <Community bag={bag} slug={slug} reload={reload} /> : null}
          {safe === "communication" ? <Comms bag={bag} slug={slug} reload={reload} /> : null}
          {safe === "governance" ? <Gov bag={bag} /> : null}
          {safe === "events" ? <Events bag={bag} /> : null}
          {safe === "reports" ? <Reports bag={bag} slug={slug} /> : null}
        </State>
      </div>
    </Shell>
  );
}

function Community({ bag, slug, reload }: { bag: Record<string, unknown>; slug: string; reload: () => void }) {
  const quiet = (bag.quiet as { name: string; n: number }[]) ?? [];
  const reports = (bag.reports as { id: string; reason: string; body: string }[]) ?? [];
  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl">Quieter circles</h2>
      {quiet.map((c) => <p key={c.name} className="flex justify-between"><span>{c.name}</span><span className="tabular-nums">{c.n}</span></p>)}
      {reports.map((r) => (
        <article key={r.id} className="rounded-3xl border border-line bg-card p-4">
          <p>{r.body}</p>
          <p className="text-sm text-muted">{r.reason}</p>
          <button type="button" className="mt-2 h-10 text-crimson" onClick={async () => { await hubAct({ data: { type: "dismiss-report", slug, reportId: r.id } }); reload(); }}>Dismiss</button>
        </article>
      ))}
    </div>
  );
}

function Comms({ bag, slug, reload }: { bag: Record<string, unknown>; slug: string; reload: () => void }) {
  const circles = (bag.circles as { id: string; name: string }[]) ?? [];
  const recent = (bag.recent as { audience: string; body: string }[]) ?? [];
  const [circleId, setCircleId] = useState(circles[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const events = (bag.events as { id: string; title: string }[]) ?? [];
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [urgent, setUrgent] = useState(false);
  async function draftReminder() {
    try {
      const r = (await aiAssist({ data: { slug, task: "reminder", eventId } })) as { draft: string; audience: number; note: string };
      setBody(r.draft);
      setMsg(`${r.audience} members have not answered. ${r.note}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "No draft just now.");
    }
  }
  return (
    <div className="space-y-3">
      <Note>Messages appear in the hub at once. Urgent ones also go by text, within the monthly text budget, and quiet hours apply to the rest.</Note>
      <select className="h-12 w-full rounded-2xl border border-line bg-card px-3" value={circleId} onChange={(e) => setCircleId(e.target.value)}>
        {circles.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-28 w-full rounded-3xl border border-line bg-card p-4" placeholder="The announcement" />
      {events.length > 0 ? (
        <div className="flex gap-2">
          <select className="h-12 min-w-0 flex-1 rounded-2xl border border-line bg-card px-3" value={eventId} onChange={(e) => setEventId(e.target.value)}>
            {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <Button tone="quiet" onClick={draftReminder}>Draft a reminder</Button>
        </div>
      ) : null}
      <button type="button" className="h-10 text-left text-sm" onClick={() => setUrgent(!urgent)}>{urgent ? "Urgent: also send by text" : "Send in the hub only"}</button>
      <Button onClick={async () => {
        const res = await hubAct({ data: { type: "announce", slug, circleId, body, urgent } }) as { reached?: number };
        setMsg(`Sent to ${res.reached ?? 0}${urgent ? ", with a text copy" : " in the hub"}.`);
        setBody("");
        reload();
      }}>Send</Button>
      {msg ? <p>{msg}</p> : null}
      {recent.map((a, i) => <article key={i} className="rounded-2xl bg-card p-4"><p className="text-sm text-muted">{a.audience}</p><p>{a.body}</p></article>)}
    </div>
  );
}

function Gov({ bag }: { bag: Record<string, unknown> }) {
  const roles = (bag.roles as { role: string; name: string; sample: boolean }[]) ?? [];
  return (
    <ul className="space-y-2">
      {roles.map((r, i) => (
        <li key={i} className="flex justify-between rounded-2xl bg-card px-4 py-3">
          <span>{r.role.replaceAll("_", " ")}</span>
          <span>{r.name} {r.sample ? "· sample" : ""}</span>
        </li>
      ))}
    </ul>
  );
}

function Events({ bag }: { bag: Record<string, unknown> }) {
  const events = (bag.events as { title: string; place: string; startsAt: string; going: number }[]) ?? [];
  return (
    <ul className="space-y-3">
      {events.map((e) => (
        <li key={e.title} className="rounded-3xl border border-line bg-card p-4">
          <p className="font-display text-2xl">{e.title}</p>
          <p className="text-sm text-muted">{e.place} · {e.going} going</p>
        </li>
      ))}
    </ul>
  );
}

function Reports({ bag, slug }: { bag: Record<string, unknown>; slug: string }) {
  const usage = (bag.usage as { name: string; n: number }[]) ?? [];
  const funds = (bag.funds as { title: string; net: number }[]) ?? [];
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl">What people did</h2>
      {usage.map((u) => <p key={u.name} className="flex justify-between"><span>{u.name.replaceAll("_", " ")}</span><span className="tabular-nums">{u.n}</span></p>)}
      <h2 className="font-display text-2xl">Funds</h2>
      {funds.map((f) => <p key={f.title} className="flex justify-between gap-3"><span>{f.title}</span><Money value={f.net} /></p>)}
      <Link className="text-sm text-crimson" href={`/o/${slug}/m/impact`}>Open the school page</Link>
    </div>
  );
}
