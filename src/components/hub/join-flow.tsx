"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { phoneStart, phoneStatus, phoneVerify, registerMember, structure } from "@/lib/hub/api";
import { Shell } from "@/components/hub/shell";
import { Button, Choice, Field, Note, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";

type Step = "name" | "phone" | "code" | "programme" | "class" | "house" | "dorm" | "cot" | "work" | "circles";

const order: Step[] = ["name", "phone", "code", "programme", "class", "house", "dorm", "cot", "work", "circles"];

type Draft = {
  displayName: string;
  phone: string;
  programmeId: string;
  classId: string;
  residence: "placed" | "day" | "unsure";
  houseId: string;
  dormId: string;
  cotNumber: number | null;
  profession: string;
  city: string;
  circleIds: string[];
};

const empty: Draft = {
  displayName: "",
  phone: "",
  programmeId: "",
  classId: "",
  residence: "placed",
  houseId: "",
  dormId: "",
  cotNumber: null,
  profession: "",
  city: "",
  circleIds: [],
};

export function JoinFlow({ slug }: { slug: string }) {
  const router = useRouter();
  const storeKey = `ygh-join-${slug}`;
  const [step, setStep] = useState<Step>("name");
  const [draft, setDraft] = useState<Draft>(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const loaded = useHub(slug, () => structure({ data: slug }));
  const [verified, setVerified] = useState(false);
  const [masked, setMasked] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<null | { verified: boolean }>(null);

  useEffect(() => {
    phoneStatus({ data: slug })
      .then((s) => {
        if (s.member) router.push(`/o/${slug}/home`);
        setVerified(s.verified);
        setMasked(s.masked ?? "");
      })
      .catch(() => undefined);
  }, [slug, router]);

  // Restore a half-finished join on this device first, and only then start saving,
  // so the empty first screen never overwrites the saved progress.
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) {
        const saved = JSON.parse(raw) as { step: Step; draft: Draft };
        // localStorage is not readable during render, so this runs after mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraft({ ...empty, ...saved.draft });
        if (order.includes(saved.step)) setStep(saved.step);
      }
    } catch {
      /* keep empty */
    }
    setRestored(true);
  }, [storeKey]);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(storeKey, JSON.stringify({ step, draft }));
    } catch {
      /* storage unavailable: the join still works, it just will not survive a reload */
    }
  }, [restored, storeKey, step, draft]);

  const data = loaded.data;
  const programme = data?.programmes.find((p) => p.id === draft.programmeId);
  const house = data?.houses.find((h) => h.id === draft.houseId);
  const dorm = house?.dorms.find((d) => d.id === draft.dormId);
  const terms = data?.org.terminology;

  const visible = useMemo(() => {
    return order.filter((s) => {
      if ((s === "dorm" || s === "cot") && draft.residence !== "placed") return false;
      if ((s === "phone" || s === "code") && verified) return false;
      return true;
    });
  }, [draft.residence, verified]);

  async function sendCode() {
    setBusy(true);
    setError("");
    try {
      const sent = await phoneStart({ data: { slug, phone: draft.phone } });
      setDevCode(sent.devCode);
      setMasked(sent.masked);
      go("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function checkCode() {
    setBusy(true);
    setError("");
    try {
      const res = await phoneVerify({ data: { slug, phone: draft.phone, code } });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setVerified(true);
      setMasked(res.masked);
      if (res.claimed) {
        localStorage.removeItem(storeKey);
        setClaimed(res.claimed);
        return;
      }
      go("programme");
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not check the code.");
    } finally {
      setBusy(false);
    }
  }

  function go(next: Step) {
    setError("");
    setStep(next);
  }
  function prev() {
    const i = visible.indexOf(step);
    if (i <= 0) return;
    go(visible[i - 1]);
  }

  async function finish(circleIds: string[]) {
    setBusy(true);
    setError("");
    try {
      await registerMember({
        data: {
          slug,
          displayName: draft.displayName,
          programmeId: draft.programmeId,
          classId: draft.classId,
          residence: draft.residence,
          houseId: draft.residence === "placed" ? draft.houseId : null,
          dormId: draft.residence === "placed" ? draft.dormId : null,
          cotNumber: draft.cotNumber,
          profession: draft.profession,
          city: draft.city,
          circleIds,
        },
      });
      localStorage.removeItem(storeKey);
      router.push(`/o/${slug}/home`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not save your place.");
      setBusy(false);
    }
  }

  // The counter always includes the phone steps, so it never jumps backwards once the number is verified.
  const counted = order.filter((s) => !((s === "dorm" || s === "cot") && draft.residence !== "placed"));
  const index = Math.max(1, counted.indexOf(step) + 1);
  if (claimed) {
    return (
      <Shell slug={slug} nav={false} title={data?.org.name} eyebrow={data?.org.branding.motto}>
        <section className="mt-3 space-y-4">
          <h1 className="display-md">We found your place.</h1>
          <Note>
            {claimed.verified
              ? "Your number matched the list, and you are confirmed. Welcome in."
              : "Your number matched the list. Two of your cot mates, or an executive, now confirm it is you. You will hear when they have."}
          </Note>
          <Button onClick={() => router.push(`/o/${slug}/home`)}>Go to the home screen</Button>
        </section>
      </Shell>
    );
  }
  return (
    <Shell slug={slug} nav={false} title={data?.org.name} eyebrow={data?.org.branding.motto}>
      <State loading={loaded.loading} error={loaded.error}>
        <div className="flex items-center gap-3" aria-label={`Step ${index} of ${counted.length}`}>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-crimson transition-[width] duration-500 ease-out" style={{ width: `${(index / counted.length) * 100}%` }} />
          </div>
          <p className="text-xs text-muted tabular-nums" aria-hidden>
            {index} of {counted.length}
          </p>
        </div>
        {step === "name" && (
          <section className="mt-3 space-y-4">
            <h1 className="display-md">What should we call you?</h1>
            <Field label="Name" value={draft.displayName} autoComplete="name" onChange={(displayName) => setDraft({ ...draft, displayName })} />
            <Button onClick={() => go(verified ? "programme" : "phone")} disabled={draft.displayName.trim().length < 2}>
              Continue
            </Button>
          </section>
        )}
        {step === "phone" && (
          <section className="mt-3 space-y-4">
            <h1 className="display-md">Your phone number.</h1>
            <Note>We send one text-message code. If your number is on the year-group list, your place is waiting for you.</Note>
            <Field label="Phone" value={draft.phone} inputMode="tel" autoComplete="tel-national" placeholder="024 000 0000" onChange={(phone) => setDraft({ ...draft, phone })} />
            {error ? <p className="text-sm text-crimson-ink">{error}</p> : null}
            <Button onClick={sendCode} disabled={busy || draft.phone.replace(/\D/g, "").length < 9}>{busy ? "Sending" : "Send the code"}</Button>
          </section>
        )}
        {step === "code" && (
          <section className="mt-3 space-y-4">
            <h1 className="display-md">Enter the code.</h1>
            <Note>We sent six digits to {masked || "your phone"}. It lasts ten minutes.</Note>
            {devCode ? <Note>Demonstration mode: your code is {devCode}.</Note> : null}
            <Field label="Code" value={code} inputMode="numeric" autoComplete="one-time-code" autoFocus placeholder="123456" onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))} />
            {error ? <p className="text-sm text-crimson-ink">{error}</p> : null}
            <Button onClick={checkCode} disabled={busy || code.length < 6}>{busy ? "Checking" : "Verify"}</Button>
            <Button tone="quiet" onClick={() => { setCode(""); go("phone"); }}>Use a different number</Button>
          </section>
        )}
        {step === "programme" && (
          <section className="mt-3 space-y-3">
            <h1 className="display-md">Which {terms?.programme?.toLowerCase() ?? "programme"}?</h1>
            {data?.programmes.map((p) => (
              <Choice key={p.id} title={p.name} selected={draft.programmeId === p.id} onClick={() => { setDraft({ ...draft, programmeId: p.id, classId: "" }); go("class"); }} />
            ))}
          </section>
        )}
        {step === "class" && (
          <section className="mt-3 space-y-3">
            <h1 className="display-md">Your {terms?.class?.toLowerCase() ?? "class"}.</h1>
            <div className="grid grid-cols-3 gap-3">
              {programme?.classes.map((c) => (
                <button key={c.id} type="button" className="h-14 border border-line-2 bg-card text-lg font-medium hover:border-ink" onClick={() => { setDraft({ ...draft, classId: c.id }); go("house"); }}>
                  {c.name}
                </button>
              ))}
            </div>
          </section>
        )}
        {step === "house" && (
          <section className="mt-3 space-y-3">
            <h1 className="display-md">Which {terms?.house?.toLowerCase() ?? "house"}?</h1>
            {data?.houses.map((h) => (
              <Choice key={h.id} title={h.name} detail={`${h.dorms.length} dorms`} onClick={() => { setDraft({ ...draft, houseId: h.id, dormId: "", residence: "placed", cotNumber: null }); go("dorm"); }} />
            ))}
            <Choice title="Day student, or did not board" onClick={() => { setDraft({ ...draft, residence: "day", houseId: "", dormId: "", cotNumber: null }); go("work"); }} />
            <Choice title="Not sure" onClick={() => { setDraft({ ...draft, residence: "unsure", houseId: "", dormId: "", cotNumber: null }); go("work"); }} />
          </section>
        )}
        {step === "dorm" && (
          <section className="mt-3 space-y-3">
            <h1 className="display-md">{house?.name}</h1>
            <Note>Choose the dorm.</Note>
            <div className="flex flex-wrap gap-3">
              {house?.dorms.map((d) => (
                <button key={d.id} type="button" className="h-12 border border-line-2 bg-card px-5 font-medium hover:border-ink" onClick={() => { setDraft({ ...draft, dormId: d.id, cotNumber: null }); go("cot"); }}>
                  {d.name}
                </button>
              ))}
            </div>
          </section>
        )}
        {step === "cot" && (
          <section className="mt-3 space-y-4">
            <h1 className="display-md">Cot number</h1>
            <Note>{dorm?.name}. Cot circles open when someone is actually in them.</Note>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: dorm?.cotCount ?? 8 }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button" className={`h-14 border text-xl font-semibold tabular-nums transition-colors ${draft.cotNumber === n ? "border-ink bg-ink text-paper" : "border-line-2 bg-card hover:border-ink"}`} onClick={() => setDraft({ ...draft, cotNumber: n })}>
                  {n}
                </button>
              ))}
            </div>
            <Button onClick={() => go("work")} disabled={draft.cotNumber == null}>This cot</Button>
            <Button tone="quiet" onClick={() => { setDraft({ ...draft, cotNumber: null }); go("work"); }}>Not sure</Button>
          </section>
        )}
        {step === "work" && (
          <section className="mt-3 space-y-4">
            <h1 className="display-md">Work, and the city you are in.</h1>
            <Field label="Profession" value={draft.profession} onChange={(profession) => setDraft({ ...draft, profession })} />
            <Field label="City" value={draft.city} autoComplete="address-level2" onChange={(city) => setDraft({ ...draft, city })} />
            <Button disabled={!draft.profession.trim() || !draft.city.trim()} onClick={() => go("circles")}>Continue</Button>
          </section>
        )}
        {step === "circles" && (
          <section className="mt-3 space-y-3">
            <h1 className="display-md">Any other circles?</h1>
            <Note>Optional. Faith circles stay hidden from everyone who is not in them.</Note>
            {data?.voluntary.map((c) => {
              const on = draft.circleIds.includes(c.id);
              return (
                <Choice
                  key={c.id}
                  title={c.name}
                  detail={c.visibility === "hidden" ? "Hidden. Only members see it." : c.purpose}
                  selected={on}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      circleIds: on ? draft.circleIds.filter((id) => id !== c.id) : [...draft.circleIds, c.id],
                    })
                  }
                />
              );
            })}
            {error ? <p className="text-sm text-crimson-ink">{error}</p> : null}
            <Button disabled={busy} onClick={() => finish(draft.circleIds)}>{busy ? "Saving" : "Enter the year group"}</Button>
          </section>
        )}
        {step !== "name" ? (
          <button type="button" className="mt-6 h-12 text-sm text-muted" onClick={prev}>
            Back
          </button>
        ) : null}
        {step !== "circles" && error ? <p className="mt-3 text-sm text-crimson-ink">{error}</p> : null}
      </State>
    </Shell>
  );
}
