import { useState } from "react";
import { UserButton } from "@/lib/auth/gates";
import { myReceipts, orgEntry, peersWaiting, phoneStart, phoneVerify } from "@/lib/hub/api";
import { hubAct } from "@/lib/hub/act";
import { Shell } from "@/components/hub/shell";
import { Button, Field, Money, Note, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";

const links = [
  ["directory", "Businesses"],
  ["asks", "Ask the year"],
  ["events", "Events"],
  ["photos", "Photos"],
  ["polls", "Polls"],
  ["roll", "Roll call"],
  ["birthdays", "Birthdays"],
  ["milestones", "News"],
  ["spotlight", "Spotlight"],
  ["capsules", "Time capsules"],
  ["trivia", "Trivia"],
  ["mentoring", "Mentoring"],
  ["welfare", "Welfare"],
  ["elections", "Elections"],
  ["impact", "For the school"],
  ["store", "Store"],
  ["inbox", "Messages"],
];

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
  return (
    <Shell slug={slug} title={entry.data?.org.name} eyebrow={entry.data?.org.branding.motto}>
      <State loading={entry.loading} error={entry.error}>
        {m ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-4xl">{m.nickname || m.displayName}</h1>
                <p className="text-muted">{m.displayName}</p>
                <p className="mt-2 text-sm">{entry.data?.roles.join(" · ") || "Member"}</p>
              </div>
              <UserButton />
            </div>
            {entry.data?.roles.includes("organisation_admin") ? (
              <Note>You hold the officer seats this year group listed you for. Sample officers on the roll are not logins.</Note>
            ) : null}
            {(waiting.data ?? []).filter((w) => !confirmed.includes(w.id)).length > 0 ? (
              <section className="space-y-3">
                <h2 className="font-display text-2xl">Waiting for you</h2>
                <Note>Confirm only people you know. Two cot mates, or one executive, bring them in.</Note>
                {(waiting.data ?? []).filter((w) => !confirmed.includes(w.id)).map((w) => (
                  <article key={w.id} className="rounded-3xl border border-line bg-card p-4">
                    <h3 className="font-display text-xl">{w.name}</h3>
                    <p className="text-sm text-muted">{[w.house, w.dorm, w.cot ? `cot ${w.cot}` : null].filter(Boolean).join(" · ")}</p>
                    <Button tone="quiet" onClick={() => confirmPerson(w.id)}>Yes, I know them</Button>
                  </article>
                ))}
              </section>
            ) : null}
            {m.status !== "verified" ? <Note>Your place is claimed, not yet confirmed.</Note> : null}
            <div className="space-y-3">
              <Field label="Nickname" value={form.nickname} onChange={(nickname) => { touch("nickname"); setForm({ ...form, nickname }); }} />
              <Field label="City" value={form.city} onChange={(city) => { touch("city"); setForm({ ...form, city }); }} />
              <Field label="Work" value={form.profession} onChange={(profession) => { touch("profession"); setForm({ ...form, profession }); }} />
              <p className="text-sm text-muted">Phone {form.phone || "not set"} (verified). It changes only with a code.</p>
              {changing === "" ? <button type="button" className="h-10 text-left text-sm text-crimson" onClick={() => setChanging("phone")}>Change my number</button> : null}
              {changing === "phone" ? (
                <div className="space-y-2 rounded-2xl border border-line p-3">
                  <Field label="New number" value={newPhone} inputMode="tel" onChange={setNewPhone} />
                  <Button tone="quiet" onClick={sendNewCode} disabled={newPhone.replace(/\D/g, "").length < 9}>Send a code to the new number</Button>
                </div>
              ) : null}
              {changing === "code" ? (
                <div className="space-y-2 rounded-2xl border border-line p-3">
                  <Field label="Code" value={newCode} inputMode="numeric" onChange={(v) => setNewCode(v.replace(/\D/g, "").slice(0, 6))} />
                  <Button tone="quiet" onClick={checkNewCode} disabled={newCode.length < 6}>Verify the new number</Button>
                </div>
              ) : null}
              {phoneMsg ? <p className="text-sm text-muted">{phoneMsg}</p> : null}
              <Field label="A line about you" value={form.bio} onChange={(bio) => { touch("bio"); setForm({ ...form, bio }); }} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Birth month" value={form.month} onChange={(month) => { touch("birthdayMonth"); setForm({ ...form, month }); }} />
                <Field label="Day" value={form.day} onChange={(day) => { touch("birthdayDay"); setForm({ ...form, day }); }} />
              </div>
              <button type="button" className="h-12 text-left text-sm" onClick={() => { touch("birthdayOptOut"); setForm({ ...form, opt: !form.opt }); }}>
                {form.opt ? "Birthdays are off" : "Show my birthday in my circles"}
              </button>
              <Button onClick={save}>Save</Button>
              {msg ? <p className="text-sm text-muted">{msg}</p> : null}
            </div>
            {entry.data?.control ? (
              <a href={`/o/${slug}/control/people`} className="flex h-14 items-center rounded-3xl bg-crimson px-4 text-on-crimson">Control room</a>
            ) : null}
            <ul className="divide-y divide-line rounded-3xl border border-line bg-card">
              {links.map(([id, label]) => (
                <li key={id}><a className="flex h-12 items-center px-4" href={`/o/${slug}/m/${id}`}>{label}</a></li>
              ))}
            </ul>
            <section>
              <h2 className="font-display text-2xl">Receipts</h2>
              <ul className="mt-2 space-y-2">
                {receipts.data?.map((r) => (
                  <li key={r.number}>
                    <a href={`/r/${r.number}`} className="flex items-center justify-between text-sm">
                      <span>{r.number} {r.voided ? "· void" : ""}</span>
                      <Money value={r.amount} />
                    </a>
                  </li>
                ))}
                {receipts.data && receipts.data.length === 0 ? <Note>No receipts yet.</Note> : null}
              </ul>
            </section>
          </div>
        ) : null}
      </State>
    </Shell>
  );
}
