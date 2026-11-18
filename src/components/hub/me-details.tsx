"use client";
import { useState } from "react";
import { orgEntry, phoneStart, phoneVerify } from "@/lib/hub/api";
import { hubAct } from "@/lib/hub/act";
import { Shell } from "@/components/hub/shell";
import { Back, Button, Field, Note, State, Toggle } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";

/** The member's own details: nickname, city, work, birthday and phone. */
export function MeDetails({ slug }: { slug: string }) {
  const entry = useHub(`me-${slug}`, () => orgEntry({ data: slug }));
  const m = entry.data?.member;
  const [changing, setChanging] = useState<"" | "phone" | "code">("");
  const [newPhone, setNewPhone] = useState("");
  const [newCode, setNewCode] = useState("");
  const [phoneMsg, setPhoneMsg] = useState("");
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
    <Shell slug={slug} wide>
      <Back href={`/o/${slug}/me`} label="Me" />
      <h1 className="display-md">Your details</h1>
      <State loading={entry.loading} error={entry.error}>
        {m ? (
          <div className="mt-4 max-w-md">
      <div>
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
        </div>
      </div>
          </div>
        ) : null}
      </State>
    </Shell>
  );
}
