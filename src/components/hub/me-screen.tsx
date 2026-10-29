"use client";
import {
  ArrowRight, Cake, CalendarCheck, CalendarDays, Handshake, HeartHandshake, Hourglass, Images, Landmark, LayoutDashboard, Lightbulb,
  ListChecks, Mail, MessageCircleQuestion, Newspaper, School, ShoppingBag, Sparkles, Store, Vote,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { signOut } from "@/lib/auth/client";
import { myReceipts, orgEntry, peersWaiting, phoneStart, phoneVerify } from "@/lib/hub/api";
import { hubAct } from "@/lib/hub/act";
import { Shell } from "@/components/hub/shell";
import { Avatar, Button, Field, Money, Note, Pill, Section, State, Toggle } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";

const links = [
  ["events", "Events", CalendarDays],
  ["photos", "Photos", Images],
  ["inbox", "Messages", Mail],
  ["directory", "Businesses", Store],
  ["asks", "Ask the year", MessageCircleQuestion],
  ["polls", "Polls", Vote],
  ["roll", "Roll call", ListChecks],
  ["birthdays", "Birthdays", Cake],
  ["milestones", "News", Newspaper],
  ["spotlight", "Spotlight", Sparkles],
  ["capsules", "Time capsules", Hourglass],
  ["trivia", "School trivia", Lightbulb],
  ["mentoring", "Mentoring", Handshake],
  ["welfare", "Welfare", HeartHandshake],
  ["elections", "Elections", Landmark],
  ["impact", "For the school", School],
  ["store", "Store", ShoppingBag],
] as const;

export function MeScreen({ slug }: { slug: string }) {
  const entry = useHub(`me-${slug}`, () => orgEntry({ data: slug }));
  const receipts = useHub(`rc-${slug}`, () => myReceipts({ data: slug }));
  const waiting = useHub(`wait-${slug}`, () => peersWaiting({ data: { slug } }));
  const m = entry.data?.member;
  const [changing, setChanging] = useState<"" | "phone" | "code">("");
  const [newPhone, setNewPhone] = useState("");
  const [newCode, setNewCode] = useState("");
  const [phoneMsg, setPhoneMsg] = useState("");
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [edited, setEdited] = useState<Record<string, number>>({});
  const touch = (field: string) => setEdited((e) => ({ ...e, [field]: Date.now() }));
  const [form, setForm] = useState({ nickname: "", city: "", profession: "", bio: "", phone: "", month: "", day: "", opt: false, ready: false });
  const [msg, setMsg] = useState("");
  if (m && !form.ready) {
    setForm({
      nickname: m.nickname ?? "",
      city: m.city ?? "",
      profession: m.profession ?? "",
      bio: m.bio ?? "",
      phone: m.phone ?? "",
      month: m.birthdayMonth ? String(m.birthdayMonth) : "",
      day: m.birthdayDay ? String(m.birthdayDay) : "",
      opt: m.birthdayOptOut,
      ready: true,
    });
  }
  async function confirmPerson(id: string) {
    try {
      await hubAct({ data: { type: "confirm", slug, membershipId: id } });
      setConfirmed((c) => [...c, id]);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Not confirmed.");
    }
  }
  async function sendNewCode() {
    setPhoneMsg("");
    try {
      const out = await phoneStart({ data: { slug, phone: newPhone } });
      setPhoneMsg(`Code sent to ${out.masked}.${out.devCode ? ` Demonstration code: ${out.devCode}.` : ""}`);
      setChanging("code");
    } catch (e) {
      setPhoneMsg(e instanceof Error ? e.message : "We could not send the code.");
    }
  }
  async function checkNewCode() {
    setPhoneMsg("");
    try {
      const out = await phoneVerify({ data: { slug, phone: newPhone, code: newCode } });
      if (!out.ok) return setPhoneMsg(out.message);
      setPhoneMsg(`Your number is now ${out.masked}. Money approvals wait a day after a change.`);
      setChanging("");
      setNewCode("");
    } catch (e) {
      setPhoneMsg(e instanceof Error ? e.message : "We could not check the code.");
    }
  }
  async function save() {
    setMsg("");
    try {
      await hubAct({
        data: {
          type: "profile",
          slug,
          nickname: form.nickname,
          city: form.city,
          profession: form.profession,
          bio: form.bio,
          birthdayMonth: form.month ? Number(form.month) : null,
          birthdayDay: form.day ? Number(form.day) : null,
          birthdayOptOut: form.opt,
          times: edited,
        },
      });
      setMsg("Saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Not saved.");
    }
  }
  const pending = (waiting.data ?? []).filter((w) => !confirmed.includes(w.id));
  const roleNames = entry.data?.titles ?? [];
  return (
    <Shell slug={slug} wide>
      <State loading={entry.loading} error={entry.error}>
        {m ? (
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
            <div className="min-w-0">
              <header className="rise flex items-center gap-5">
                <Avatar name={m.displayName} size={80} me />
                <div className="min-w-0">
                  <p className="kicker">{m.status === "verified" ? "Confirmed old boy" : "Claimed, not yet confirmed"}</p>
                  <h1 className="display-md mt-2 truncate">{m.nickname || m.displayName}</h1>
                  {m.nickname ? <p className="mt-1 truncate text-muted">{m.displayName}</p> : null}
                </div>
              </header>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {(roleNames.length ? roleNames : ["Member"]).map((r) => <Pill key={r} tone={r === "Member" ? "plain" : "ink"}>{r}</Pill>)}
              </div>

              {entry.data?.control ? (
                <Link href={`/o/${slug}/control/people`} className="group mt-8 flex items-center gap-4 bg-ink px-5 py-5 text-paper">
                  <span className="grid size-11 shrink-0 place-items-center border border-paper/30"><LayoutDashboard className="size-5" strokeWidth={1.75} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-semibold">Control room</span>
                    <span className="block text-sm text-paper/70">Money, people, messages and the audit trail</span>
                  </span>
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : null}

              <Link href={`/o/${slug}/dues`} className="group mt-8 flex items-center gap-4 border border-line bg-card px-5 py-4 hover:border-ink">
                <CalendarCheck className="size-5 shrink-0" strokeWidth={1.75} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">My dues</span>
                  <span className="block text-sm text-muted">What is due, what you have paid, and receipts</span>
                </span>
                <ArrowRight className="size-5 text-muted transition-transform group-hover:translate-x-0.5" />
              </Link>

              {pending.length > 0 ? (
                <Section title="Waiting for you" className="mt-10">
                  <Note>Confirm only people you know. Two cot mates, or one executive, bring them in.</Note>
                  <ul className="mt-2 ruled-list">
                    {pending.map((w) => (
                      <li key={w.id} className="flex items-center gap-3.5 py-3.5">
                        <Avatar name={w.name} size={44} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-semibold">{w.name}</span>
                          <span className="block truncate text-[13px] text-muted">{[w.house, w.dorm, w.cot ? `cot ${w.cot}` : null].filter(Boolean).join(" · ")}</span>
                        </span>
                        <Button size="sm" block={false} onClick={() => confirmPerson(w.id)}>I know them</Button>
                      </li>
                    ))}
                  </ul>
                </Section>
              ) : null}

              <Section title="The year group" className="mt-10">
                <ul className="grid grid-cols-2 border-t border-l border-line sm:grid-cols-3">
                  {links.map(([id, label, Icon]) => (
                    <li key={id} className="border-r border-b border-line">
                      <Link className="flex min-h-[5.5rem] flex-col justify-between gap-3 p-4 transition-colors hover:bg-card" href={`/o/${slug}/m/${id}`}>
                        <Icon className="size-5 text-ink-2" strokeWidth={1.6} />
                        <span className="text-[15px] font-medium">{label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Receipts" className="mt-10" id="receipts">
                {receipts.data && receipts.data.length === 0 ? <p className="py-4 text-muted">No receipts yet. They arrive here the moment the gateway confirms a gift.</p> : null}
                <ul className="ruled-list">
                  {receipts.data?.map((r) => (
                    <li key={r.number}>
                      <Link href={`/r/${r.number}`} className="flex items-center gap-4 py-3.5 hover:bg-sunk/40">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-medium">{r.purpose}</span>
                          <span className="block font-mono text-[12px] text-muted">{r.number} · {new Date(r.issuedOn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </span>
                        {r.voided ? <Pill tone="red">Void</Pill> : null}
                        <span className={`text-[15px] font-semibold tabular-nums ${r.voided ? "text-muted line-through" : ""}`}><Money value={r.amount} /></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            <aside className="mt-10 lg:mt-0">
              <Section title="Your details">
                <div className="space-y-4 pt-3">
                  <Field label="Nickname" value={form.nickname} onChange={(nickname) => { touch("nickname"); setForm({ ...form, nickname }); }} />
                  <Field label="City" value={form.city} onChange={(city) => { touch("city"); setForm({ ...form, city }); }} />
                  <Field label="Work" value={form.profession} onChange={(profession) => { touch("profession"); setForm({ ...form, profession }); }} />
                  <Field label="A line about you" value={form.bio} onChange={(bio) => { touch("bio"); setForm({ ...form, bio }); }} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Birth month" inputMode="numeric" value={form.month} onChange={(month) => { touch("birthdayMonth"); setForm({ ...form, month }); }} />
                    <Field label="Day" inputMode="numeric" value={form.day} onChange={(day) => { touch("birthdayDay"); setForm({ ...form, day }); }} />
                  </div>
                  <div className="border-y border-line">
                    <Toggle on={!form.opt} set={(v) => { touch("birthdayOptOut"); setForm({ ...form, opt: !v }); }} title="Show my birthday in my circles" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-ink-2">Phone</p>
                    <p className="mt-1 flex items-center justify-between gap-3 text-[15px]">
                      <span className="font-mono">{form.phone || "Not set"}</span>
                      {changing === "" ? <button type="button" className="min-h-11 text-sm font-medium text-crimson-ink" onClick={() => setChanging("phone")}>Change</button> : null}
                    </p>
                    <p className="text-[13px] text-muted">Verified. It changes only with a code.</p>
                  </div>
                  {changing === "phone" ? (
                    <div className="space-y-3 border border-line bg-card p-4">
                      <Field label="New number" value={newPhone} inputMode="tel" onChange={setNewPhone} />
                      <Button tone="quiet" onClick={sendNewCode} disabled={newPhone.replace(/\D/g, "").length < 9}>Send a code to the new number</Button>
                    </div>
                  ) : null}
                  {changing === "code" ? (
                    <div className="space-y-3 border border-line bg-card p-4">
                      <Field label="Code" value={newCode} inputMode="numeric" onChange={(v) => setNewCode(v.replace(/\D/g, "").slice(0, 6))} />
                      <Button tone="quiet" onClick={checkNewCode} disabled={newCode.length < 6}>Verify the new number</Button>
                    </div>
                  ) : null}
                  {phoneMsg ? <p className="text-sm text-muted">{phoneMsg}</p> : null}
                  <Button onClick={save}>Save my details</Button>
                  {msg ? <p role="status" className="text-sm text-paid">{msg}</p> : null}
                  {entry.data?.roles.includes("organisation_admin") ? (
                    <Note>You hold the officer seats this year group listed you for. Sample officers on the roll are not logins.</Note>
                  ) : null}
                  <button type="button" onClick={() => void signOut()} className="btn btn-quiet btn-block">Sign out</button>
                </div>
              </Section>
            </aside>
          </div>
        ) : null}
      </State>
    </Shell>
  );
}
