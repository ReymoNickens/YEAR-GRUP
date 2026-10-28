"use client";
import { areaName } from "@/lib/hub/words";
import { roleTitle } from "@/lib/hub/roles";
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
  // reload() refreshes in place: the open tab, the message and the scroll position stay.
  const { data, error, loading, reload } = useHub(`ctl-${safe}`, () => controlData({ data: { slug, area: safe } }));
  const bag = (data ?? {}) as Record<string, unknown>;
  return (
    <Shell slug={slug}>
      <p className="text-xs tracking-widest text-gold uppercase">Control room</p>
      <h1 className="font-display text-4xl">{areaName(safe)}</h1>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {areas.map((a) => (
          <Link key={a} href={`/o/${slug}/control/${a}`} className={`flex h-12 shrink-0 items-center rounded-full px-4 ${a === safe ? "bg-crimson text-on-crimson" : "border border-line"}`} aria-current={a === safe ? "page" : undefined}>{areaName(a)}</Link>
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

type AudienceCircle = { id: string; name: string; kind: string; level: string | null; members: number };

const AUDIENCES = [
  { key: "year", label: "Everyone" },
  { key: "house", label: "A house" },
  { key: "dorm", label: "A dorm" },
  { key: "cot", label: "A cot" },
  { key: "class", label: "A class" },
  { key: "voluntary", label: "A circle" },
] as const;

/** Announcements: who should hear it, what to say, whether it also goes by text. One decision at a time. */
function Comms({ bag, slug, reload }: { bag: Record<string, unknown>; slug: string; reload: () => void }) {
  const circles = (bag.circles as AudienceCircle[]) ?? [];
  const recent = (bag.recent as { audience: string; body: string; at?: string }[]) ?? [];
  const events = (bag.events as { id: string; title: string }[]) ?? [];
  const levelOf = (c: AudienceCircle) => (c.kind === "voluntary" ? "voluntary" : c.level ?? "year");
  const everyone = circles.find((c) => levelOf(c) === "year");
  const [kind, setKind] = useState<(typeof AUDIENCES)[number]["key"]>("year");
  const [circleId, setCircleId] = useState(everyone?.id ?? "");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [urgent, setUrgent] = useState(false);
  const options = circles.filter((c) => levelOf(c) === kind);
  const target = circles.find((c) => c.id === circleId);

  function pickKind(k: (typeof AUDIENCES)[number]["key"]) {
    setKind(k);
    const first = circles.find((c) => levelOf(c) === k);
    setCircleId(k === "year" ? everyone?.id ?? "" : first && circles.filter((c) => levelOf(c) === k).length === 1 ? first.id : "");
  }

  async function draftReminder() {
    try {
      const r = (await aiAssist({ data: { slug, task: "reminder", eventId } })) as { draft: string; audience: number; note: string };
      setBody(r.draft);
      setMsg(`${r.audience} members have not answered yet. ${r.note}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "No draft just now.");
    }
  }

  async function send() {
    setBusy(true);
    setMsg("");
    try {
      const res = (await hubAct({ data: { type: "announce", slug, circleId, body, urgent } })) as { reached?: number };
      setMsg(`Sent to ${res.reached ?? 0} ${res.reached === 1 ? "member" : "members"}${urgent ? ", with a text copy" : " in the hub"}.`);
      setBody("");
      reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "That did not go through.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-display text-2xl">Who should hear this?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {AUDIENCES.filter((a) => circles.some((c) => levelOf(c) === a.key)).map((a) => (
            <button
              key={a.key}
              type="button"
              aria-pressed={kind === a.key}
              onClick={() => pickKind(a.key)}
              className={`h-11 rounded-full px-4 text-sm transition ${kind === a.key ? "bg-crimson text-on-crimson" : "border border-line bg-card"}`}
            >
              {a.label}
            </button>
          ))}
        </div>
        {kind !== "year" ? (
          <select
            aria-label="Choose which one"
            className="mt-3 h-12 w-full rounded-2xl border border-line bg-card px-4"
            value={circleId}
            onChange={(e) => setCircleId(e.target.value)}
          >
            <option value="">Choose which one…</option>
            {options.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.members})</option>)}
          </select>
        ) : null}
        {target ? <p className="mt-2 text-sm text-muted">Reaches {target.members} {target.members === 1 ? "member" : "members"} of {target.name}.</p> : null}
      </section>

      <section>
        <label className="block">
          <span className="font-display text-2xl">What do you want to say?</span>
          <textarea
            value={body}
            maxLength={1000}
            onChange={(e) => setBody(e.target.value)}
            className="mt-3 min-h-32 w-full rounded-3xl border border-line bg-card p-4 text-base outline-none focus:border-crimson"
            placeholder="Keep it short. It shows with your name and title, so members know it is real."
          />
        </label>
        {events.length > 0 ? (
          <details className="mt-2 rounded-2xl border border-line bg-card px-4 py-3">
            <summary className="cursor-pointer text-sm">Remind people about an event</summary>
            <div className="mt-3 space-y-2">
              <select aria-label="Event" className="h-12 w-full rounded-2xl border border-line bg-paper px-4" value={eventId} onChange={(e) => setEventId(e.target.value)}>
                {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
              <Button tone="quiet" onClick={draftReminder}>Write a reminder for me</Button>
            </div>
          </details>
        ) : null}
      </section>

      <button
        type="button"
        role="switch"
        aria-checked={urgent}
        onClick={() => setUrgent(!urgent)}
        className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 py-2 text-left"
      >
        <span>
          <span className="block">Also send it as a text message</span>
          <span className="block text-xs text-muted">For urgent news. Texts cost money and count against the monthly budget.</span>
        </span>
        <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${urgent ? "bg-crimson" : "bg-line"}`}>
          <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${urgent ? "left-6" : "left-1"}`} />
        </span>
      </button>

      <Button disabled={busy || !circleId || body.trim().length < 3} onClick={send}>
        {busy ? "Sending…" : target ? `Send to ${target.name}` : "Choose who should hear it"}
      </Button>
      {msg ? <p role="status" className="rounded-2xl bg-gold-soft px-4 py-3 text-sm">{msg}</p> : null}

      {recent.length ? (
        <section>
          <h2 className="text-xs tracking-[0.18em] text-gold uppercase">Sent recently</h2>
          <ul className="mt-3 space-y-2">
            {recent.map((a, i) => (
              <li key={i} className="rounded-2xl border border-line bg-card p-4">
                <p className="text-xs text-muted">To {a.audience}{a.at ? ` · ${new Date(a.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}</p>
                <p className="mt-1">{a.body}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Gov({ bag }: { bag: Record<string, unknown> }) {
  const roles = (bag.roles as { role: string; name: string; sample: boolean }[]) ?? [];
  return (
    <ul className="space-y-2">
      {roles.map((r, i) => (
        <li key={i} className="flex justify-between rounded-2xl bg-card px-4 py-3">
          <span>{roleTitle(r.role)}</span>
          <span>{r.name}</span>
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
