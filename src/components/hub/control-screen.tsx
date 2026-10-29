"use client";
import { areaName } from "@/lib/hub/words";
import { roleTitle } from "@/lib/hub/roles";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { aiAssist, controlData, orgEntry } from "@/lib/hub/api";
import { hubAct } from "@/lib/hub/act";
import { Shell } from "@/components/hub/shell";
import { Button, Money, State, Toggle } from "@/components/hub/ui";
import { MoneyDesk, People } from "@/components/hub/control-desks";
import { useHub } from "@/components/hub/use-hub";

const areas = ["people", "money", "community", "communication", "governance", "events", "reports"] as const;

export function ControlScreen({ slug, area }: { slug: string; area: string }) {
  const safe = areas.includes(area as (typeof areas)[number]) ? area : "people";
  // reload() refreshes in place: the open tab, the message and the scroll position stay.
  const { data, error, loading, reload } = useHub(`ctl-${safe}`, () => controlData({ data: { slug, area: safe } }));
  const bag = (data ?? {}) as Record<string, unknown>;
  // Show only the desks this officer can use; the server checks again on every call.
  const entry = useHub(`me-${slug}`, () => orgEntry({ data: slug }));
  const keys = entry.data?.roles ?? [];
  const money = keys.some((r) => ["organisation_admin", "executive", "treasurer", "secretary"].includes(r));
  const shown = areas.filter((a) => a !== "money" || money || !entry.data);
  return (
    <Shell slug={slug} wide>
      <header className="rise">
        <p className="kicker kicker-red">Control room</p>
        <h1 className="display-lg mt-3">{areaName(safe)}</h1>
      </header>
      <nav aria-label="Control room" className="rail -mx-5 mt-6 flex gap-1.5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        {shown.map((a) => (
          <Link key={a} href={`/o/${slug}/control/${a}`} className={`flex h-10 shrink-0 items-center border px-3.5 text-sm transition-colors ${a === safe ? "border-ink bg-ink font-medium text-paper" : "border-line-2 text-ink-2 hover:border-ink"}`} aria-current={a === safe ? "page" : undefined}>{areaName(a)}</Link>
        ))}
      </nav>
      <div className="mt-8">
        <State loading={loading} error={error}>
          {safe === "people" ? <People bag={bag} slug={slug} reload={reload} /> : null}
          {safe === "money" ? <MoneyDesk bag={bag} slug={slug} reload={reload} /> : null}
          {safe === "community" ? <Community bag={bag} slug={slug} reload={reload} /> : null}
          {safe === "communication" ? <Comms bag={bag} slug={slug} reload={reload} /> : null}
          {safe === "governance" ? <Gov bag={bag} /> : null}
          {safe === "events" ? <Events bag={bag} slug={slug} reload={reload} /> : null}
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
      <h2 className="display-sm pt-4">Quieter circles</h2>
      {quiet.map((c) => <p key={c.name} className="flex justify-between"><span>{c.name}</span><span className="tabular-nums">{c.n}</span></p>)}
      {reports.map((r) => (
        <article key={r.id} className="border border-line bg-card p-5">
          <p>{r.body}</p>
          <p className="text-sm text-muted">{r.reason}</p>
          <button type="button" className="mt-2 min-h-11 text-sm font-medium text-crimson-ink" onClick={async () => { await hubAct({ data: { type: "dismiss-report", slug, reportId: r.id } }); reload(); }}>Dismiss</button>
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
  const asked = useSearchParams().get("event");
  const [eventId, setEventId] = useState(asked && events.some((e) => e.id === asked) ? asked : events[0]?.id ?? "");
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
        <h2 className="display-sm">Who should hear this?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {AUDIENCES.filter((a) => circles.some((c) => levelOf(c) === a.key)).map((a) => (
            <button
              key={a.key}
              type="button"
              aria-pressed={kind === a.key}
              onClick={() => pickKind(a.key)}
              className={`h-11 border px-4 text-sm transition-colors ${kind === a.key ? "border-ink bg-ink font-medium text-paper" : "border-line-2 bg-card hover:border-ink"}`}
            >
              {a.label}
            </button>
          ))}
        </div>
        {kind !== "year" ? (
          <select
            aria-label="Choose which one"
            className="mt-3 input"
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
          <span className="display-sm">What do you want to say?</span>
          <textarea
            value={body}
            maxLength={1000}
            onChange={(e) => setBody(e.target.value)}
            className="mt-3 min-h-32 w-full border border-line bg-card p-5 text-base outline-none focus:border-crimson"
            placeholder="Keep it short. It shows with your name and title, so members know it is real."
          />
        </label>
        {events.length > 0 ? (
          <details className="mt-2 border border-line bg-card px-4 py-3" open={!!asked}>
            <summary className="cursor-pointer text-sm font-medium">Remind people about an event</summary>
            <div className="mt-3 space-y-2">
              <select aria-label="Event" className="input" value={eventId} onChange={(e) => setEventId(e.target.value)}>
                {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
              <Button tone="quiet" onClick={draftReminder}>Write a reminder for me</Button>
            </div>
          </details>
        ) : null}
      </section>

      <div className="border-y border-line">
        <Toggle on={urgent} set={setUrgent} title="Also send it as a text message" detail="For urgent news. Texts cost money and count against the monthly budget." />
      </div>

      <Button disabled={busy || !circleId || body.trim().length < 3} onClick={send}>
        {busy ? "Sending…" : target ? `Send to ${target.name}` : "Choose who should hear it"}
      </Button>
      {msg ? <p role="status" className="border-l-[3px] border-paid bg-card px-4 py-3 text-sm">{msg}</p> : null}

      {recent.length ? (
        <section>
          <h2 className="kicker">Sent recently</h2>
          <ul className="mt-3 space-y-2">
            {recent.map((a, i) => (
              <li key={i} className="border border-line bg-card p-4">
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
        <li key={i} className="flex justify-between border-b border-line py-3">
          <span>{roleTitle(r.role)}</span>
          <span>{r.name}</span>
        </li>
      ))}
    </ul>
  );
}

type EventRow = {
  id: string; title: string; place: string; startsAt: string; story: string; audience: string | null;
  capacity: number | null; price: number | null; going: number; maybe: number; declined: number; invited: number;
  houses: { house: string; n: number }[];
};

/** The organiser's desk: put an event on the calendar, see who is coming by house, and remind the rest. */
function Events({ bag, slug, reload }: { bag: Record<string, unknown>; slug: string; reload: () => void }) {
  const events = (bag.events as EventRow[]) ?? [];
  const audiences = (bag.audiences as { id: string; name: string }[]) ?? [];
  const canCreate = bag.canCreate === true;
  const [form, setForm] = useState({ title: "", place: "", startsAt: "", story: "", circleId: audiences[0]?.id ?? "", capacity: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [now] = useState(() => Date.now());
  const upcoming = events.filter((e) => new Date(e.startsAt).getTime() >= now - 86_400_000);
  const past = events.filter((e) => new Date(e.startsAt).getTime() < now - 86_400_000);

  async function create() {
    setBusy(true);
    setMsg("");
    try {
      await hubAct({ data: { type: "event_create", slug, ...form, startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : "" } });
      setForm({ ...form, title: "", place: "", startsAt: "", story: "", capacity: "" });
      setMsg("It is on the calendar. Members can say if they are coming.");
      reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "The event was not saved.");
    } finally {
      setBusy(false);
    }
  }

  const card = (e: EventRow) => {
    const answered = e.going + e.maybe + e.declined;
    const silent = Math.max(0, e.invited - answered);
    const top = Math.max(1, ...e.houses.map((h) => h.n));
    const d = new Date(e.startsAt);
    return (
      <li key={e.id} className="py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="kicker">{d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · {d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
            <h3 className="mt-2 font-display text-[1.75rem] leading-[1.02] tracking-[-0.01em]">{e.title}</h3>
            <p className="mt-1 text-[13px] text-muted">{e.place}{e.audience ? ` · for ${e.audience}` : ""}{e.capacity ? ` · ${e.capacity} seats` : ""}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="figure text-[2rem]">{e.going}</p>
            <p className="text-[12px] text-muted">coming</p>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-4 border-t border-l border-line text-center">
          {[["Coming", e.going], ["Maybe", e.maybe], ["Can’t", e.declined], ["Not yet", silent]].map(([k, v]) => (
            <div key={String(k)} className="border-r border-b border-line px-1 py-2.5">
              <dt className="text-[11px] text-muted">{k}</dt>
              <dd className="mt-0.5 font-mono text-[15px] font-semibold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        {e.houses.length ? (
          <ul className="mt-4 space-y-2" aria-label="Coming, by house">
            {e.houses.map((h) => (
              <li key={h.house} className="grid grid-cols-[9rem_1fr_2rem] items-center gap-3 text-[13px]">
                <span className="truncate">{h.house}</span>
                <span className="h-1.5 bg-sunk"><span className="block h-full bg-ink" style={{ width: `${(h.n / top) * 100}%` }} /></span>
                <span className="text-right font-mono tabular-nums">{h.n}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {silent > 0 ? (
          <Link href={`/o/${slug}/control/communication?event=${e.id}`} className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-crimson-ink underline underline-offset-4">
            Remind the {silent} who have not answered
          </Link>
        ) : null}
      </li>
    );
  };

  return (
    <div className="space-y-10">
      {canCreate ? (
        <details className="group border border-line bg-card" open={events.length === 0}>
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-5 text-[15px] font-medium">
            Put an event on the calendar <span aria-hidden className="text-xl transition-transform group-open:rotate-45">+</span>
          </summary>
          <div className="space-y-4 border-t border-line p-5">
            <label className="block"><span className="mb-2 block text-[13px] font-medium text-ink-2">What is it</span><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Founders day thanksgiving" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="mb-2 block text-[13px] font-medium text-ink-2">Where</span><input className="input" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="Cape Coast" /></label>
              <label className="block"><span className="mb-2 block text-[13px] font-medium text-ink-2">When</span><input type="datetime-local" className="input" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} /></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="mb-2 block text-[13px] font-medium text-ink-2">Who is it for</span>
                <select className="input" value={form.circleId} onChange={(e) => setForm({ ...form, circleId: e.target.value })}>
                  {audiences.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className="block"><span className="mb-2 block text-[13px] font-medium text-ink-2">Seats (optional)</span><input className="input" inputMode="numeric" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value.replace(/\D/g, "") })} placeholder="120" /></label>
            </div>
            <label className="block"><span className="mb-2 block text-[13px] font-medium text-ink-2">A line for members</span><textarea className="input min-h-24" value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} placeholder="What to bring, what to expect." /></label>
            <Button disabled={busy || form.title.trim().length < 3 || form.place.trim().length < 2 || !form.startsAt || !form.circleId} onClick={create}>{busy ? "Saving…" : "Put it on the calendar"}</Button>
            {msg ? <p role="status" className="border-l-[3px] border-paid bg-paper px-4 py-3 text-sm">{msg}</p> : null}
          </div>
        </details>
      ) : null}

      <section>
        <h2 className="display-sm">Coming up</h2>
        {upcoming.length === 0 ? <p className="py-4 text-muted">Nothing on the calendar yet.</p> : null}
        <ul className="mt-2 ruled-list border-y border-line">{upcoming.map(card)}</ul>
      </section>
      {past.length ? (
        <section>
          <h2 className="display-sm">Already held</h2>
          <ul className="mt-2 ruled-list border-y border-line opacity-80">{past.map(card)}</ul>
        </section>
      ) : null}
    </div>
  );
}

function Reports({ bag, slug }: { bag: Record<string, unknown>; slug: string }) {
  const usage = (bag.usage as { name: string; n: number }[]) ?? [];
  const funds = (bag.funds as { title: string; net: number }[]) ?? [];
  return (
    <div className="space-y-4">
      <h2 className="display-sm pt-4">What people did</h2>
      {usage.map((u) => <p key={u.name} className="flex justify-between"><span>{u.name.replaceAll("_", " ")}</span><span className="tabular-nums">{u.n}</span></p>)}
      <h2 className="display-sm pt-4">Funds</h2>
      {funds.map((f) => <p key={f.title} className="flex justify-between gap-3"><span>{f.title}</span><Money value={f.net} /></p>)}
      <Link className="text-sm text-crimson-ink" href={`/o/${slug}/m/impact`}>Open the school page</Link>
    </div>
  );
}
