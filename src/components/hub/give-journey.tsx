"use client";
import { ArrowLeft, BedSingle, Lock, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Shell } from "@/components/hub/shell";
import { Cover, Field, Money, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";
import { purposeDetail, startPayment } from "@/lib/hub/api";
import { formatGhs, parseCedisToPesewas, planCollection } from "@/lib/hub/money";
import { pledgeParts, timeAgo, wholeCedis } from "@/lib/hub/words-money";

type Detail = Awaited<ReturnType<typeof purposeDetail>>;
type Step = "story" | "amount" | "check";

/** Common gifts, one tap each (brief section 11: quick buttons plus custom). */
const QUICK_CEDIS = [50, 100, 200, 500, 1000, 2000];
const MILESTONES = [25, 50, 75];

/**
 * Giving, in three short screens: why (the appeal and who has already given),
 * how much (and whether in bits), then a check of exactly what happens to the money.
 * Every number on these screens comes from the ledger.
 */
export function GivePurpose({ slug, purposeId }: { slug: string; purposeId: string }) {
  const router = useRouter();
  const { data, error, loading, reload } = useHub(`p-${purposeId}`, () => purposeDetail({ data: { slug, id: purposeId } }));
  const [step, setStep] = useState<Step>("story");
  const [amount, setAmount] = useState("");
  const [inBits, setInBits] = useState(false);
  const [cover, setCover] = useState(false);
  const [anon, setAnon] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const gift = parseCedisToPesewas(amount) ?? 0;
  const today = inBits ? pledgeParts(gift)[0] : gift;
  const quote = data && today > 0 ? planCollection({ gift: today, gatewayBps: data.gatewayFeeBps, platformBps: data.platformFeeBps, coverFees: cover }) : null;

  async function pay() {
    if (!gift || !data) return;
    setBusy(true);
    setErr("");
    try {
      const res = await startPayment({
        data: { slug, purposeId, giftPesewas: gift, coverFees: cover, anonymous: anon, pledge: inBits, clientRef: crypto.randomUUID().replaceAll("-", "").slice(0, 24) },
      });
      if (res.authorizationUrl) {
        window.location.assign(res.authorizationUrl); // the live gateway's own page
        return;
      }
      router.push(`/o/${slug}/pay/${res.intentId}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "The payment did not start.");
      setBusy(false);
    }
  }

  const back = step === "story" ? null : () => setStep(step === "check" ? "amount" : "story");

  return (
    <Shell slug={slug} nav={false}>
      {back ? (
        <button type="button" onClick={back} className="mb-4 inline-flex h-12 items-center gap-2 text-sm text-muted">
          <ArrowLeft className="size-5" /> Back
        </button>
      ) : (
        <Link href={`/o/${slug}/give`} className="mb-4 inline-flex h-12 items-center gap-2 text-sm text-muted">
          <ArrowLeft className="size-5" /> Give
        </Link>
      )}
      <State loading={loading} error={error} onRetry={reload}>
        {data && step === "story" ? <Story data={data} onGive={() => setStep("amount")} /> : null}
        {data && step === "amount" ? (
          <section className="space-y-6 pb-28">
            <div>
              <p className="text-xs tracking-[0.18em] text-gold uppercase">{data.title}</p>
              <h1 className="mt-1 font-display text-5xl uppercase">How much?</h1>
            </div>
            <p aria-live="polite" className={`stencil text-center text-7xl tabular-nums ${gift ? "text-ink" : "text-line"}`}>
              ₵{gift ? (gift / 100).toLocaleString("en-GH", { maximumFractionDigits: 2 }) : "0"}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_CEDIS.map((c) => {
                const on = amount === String(c);
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setAmount(String(c))}
                    className={`h-14 rounded-lg border-[1.5px] font-display text-2xl tabular-nums transition ${on ? "border-ink bg-ink text-paper" : "border-line bg-card"}`}
                  >
                    {c.toLocaleString("en-GH")}
                  </button>
                );
              })}
            </div>
            <Field label="Another amount, in cedis" value={amount} inputMode="decimal" onChange={setAmount} placeholder="e.g. 250" />

            <fieldset>
              <legend className="mb-2 text-sm text-muted">When</legend>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { bits: false, title: "All today", sub: gift ? formatGhs(gift) : "One payment" },
                  { bits: true, title: "In three bits", sub: gift ? `${formatGhs(pledgeParts(gift)[0])} today` : "Over two months" },
                ].map((o) => (
                  <button
                    key={o.title}
                    type="button"
                    aria-pressed={inBits === o.bits}
                    onClick={() => setInBits(o.bits)}
                    className={`rounded-lg border-[1.5px] p-3 text-left transition ${inBits === o.bits ? "border-ink bg-card" : "border-line bg-transparent"}`}
                  >
                    <span className="block font-display text-xl uppercase">{o.title}</span>
                    <span className="block text-sm text-muted tabular-nums">{o.sub}</span>
                  </button>
                ))}
              </div>
              {inBits && gift ? <BitsPlan gift={gift} /> : null}
            </fieldset>

            <StickyAction disabled={!quote} onClick={() => setStep("check")}>
              {quote ? <>Continue · {formatGhs(today)}{inBits ? " today" : ""}</> : "Choose an amount"}
            </StickyAction>
          </section>
        ) : null}
        {data && quote && step === "check" ? (
          <section className="space-y-5 pb-28">
            <h1 className="font-display text-5xl uppercase">Check it</h1>
            <PaySlip
              rows={[
                { label: inBits ? "Today's part of your pledge" : "Your gift", value: quote.gift, strong: false },
                { label: "Gateway fee", value: quote.gatewayFee, muted: true },
                { label: "Platform fee", value: quote.platformFee, muted: true },
                { label: "You pay now", value: quote.charge, strong: true },
                { label: `${data.title} receives`, value: cover ? quote.gift : quote.charge - quote.gatewayFee - quote.platformFee },
              ]}
            />
            <Switch on={cover} set={setCover} title="I'll cover the fees" detail={cover ? "The whole gift arrives." : "Otherwise the fees come out of the gift."} />
            <Switch on={anon} set={setAnon} title="Give without my name" detail={`Still counts for your house once ${data.boards?.minGivers ?? 5} have given. Only the treasurer sees the name.`} />
            {inBits ? <BitsPlan gift={gift} /> : null}
            {err ? <p role="alert" className="text-sm text-stamp">{err}</p> : null}
            <StickyAction disabled={busy} onClick={pay}>
              <Lock className="size-4" /> {busy ? "Opening checkout…" : `Pay ${formatGhs(quote.charge)}`}
            </StickyAction>
          </section>
        ) : null}
      </State>
    </Shell>
  );
}

/** The appeal itself: the money so far, who has given lately, your cot, and the house cup. */
function Story({ data, onGive }: { data: Detail; onGive: () => void }) {
  const pct = data.target > 0 ? Math.min(100, (data.raised / data.target) * 100) : 0;
  const houses = data.boards?.houses ?? [];
  const ranked = houses.filter((h) => h.shown).sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
  const waiting = houses.filter((h) => !h.shown);
  const min = data.boards?.minGivers ?? 5;
  const top = Math.max(1, ...ranked.map((h) => h.total ?? 0));
  return (
    <section className="space-y-6 pb-28">
      <div className="relative -mx-5 overflow-hidden">
        <Cover motif="class" alt="" className="h-56" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
        <div className="absolute inset-x-5 bottom-4 text-paper">
          <p className="text-xs tracking-[0.2em] text-gold-soft uppercase">The appeal</p>
          <h1 className="mt-1 font-display text-5xl uppercase leading-[0.92] text-white">{data.title}</h1>
        </div>
      </div>

      {data.target > 0 ? (
        <div>
          <p className="text-xs tracking-[0.18em] text-muted uppercase">Raised so far</p>
          <p className="stencil mt-1 text-5xl tabular-nums">{wholeCedis(data.raised)}</p>
          <p className="mt-1 text-sm text-muted">of a {wholeCedis(data.target)} goal</p>
          <div className="relative mt-3 h-3 overflow-hidden rounded-sm bg-line" role="progressbar" aria-label="Raised so far" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-crimson transition-[width] duration-1000 ease-out" style={{ width: `${Math.max(pct, 1.5)}%` }} />
            {MILESTONES.map((m) => <span key={m} className="absolute top-0 h-full w-px bg-paper/80" style={{ left: `${m}%` }} aria-hidden />)}
          </div>
          <p className="mt-2 flex justify-between text-sm">
            <span><span className="font-semibold">{data.givers}</span> old boys have given</span>
            <span className="text-muted">{Math.floor(pct)}% there</span>
          </p>
        </div>
      ) : null}

      {(data.mine ?? 0) > 0 ? (
        <div className="flex items-center gap-4 rounded-lg border border-line bg-card p-4">
          <span className="stamp stamp-paid text-sm">Thank you</span>
          <p className="text-sm">You have given <Money value={data.mine} /> to this appeal.</p>
        </div>
      ) : null}

      {data.cot && data.cot.mates > 1 ? <CotNudge cot={data.cot} givenByMe={data.mine > 0} /> : null}

      {data.recent?.length ? (
        <div>
          <h2 className="font-display text-2xl uppercase">On the noticeboard</h2>
          <ul className="mt-3 space-y-2">
            {data.recent.map((r, i) => (
              <li key={i} className={`flex items-center justify-between gap-3 rounded-md border-l-4 bg-card px-4 py-3 text-sm ${i % 2 ? "-rotate-[0.4deg]" : "rotate-[0.3deg]"} ${r.me ? "border-crimson" : "border-gold"}`}>
                <span>{r.me ? "You gave" : `An old boy from ${r.house ?? "the year group"} gave`}</span>
                <span className="shrink-0 text-xs text-muted">{timeAgo(r.at)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {ranked.length || waiting.length ? (
        <div className="rounded-lg border border-line bg-card p-4">
          <h2 className="flex items-center gap-2 font-display text-2xl uppercase">
            <Trophy className="size-5 text-gold" /> The house cup
          </h2>
          <ol className="mt-4 space-y-3">
            {ranked.map((h, i) => (
              <li key={h.id}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className={h.id === data.myHouseId ? "font-semibold" : ""}>
                    <span className="stencil mr-2 inline-block w-5 text-gold">{i + 1}</span>
                    {h.name}{h.id === data.myHouseId ? " · yours" : ""}
                  </span>
                  <span className="tabular-nums"><Money value={h.total ?? 0} /></span>
                </div>
                <div className="mt-1 ml-7 h-1.5 overflow-hidden rounded-sm bg-line">
                  <div className={`h-full ${h.id === data.myHouseId ? "bg-crimson" : "bg-ink/70"}`} style={{ width: `${((h.total ?? 0) / top) * 100}%` }} />
                </div>
              </li>
            ))}
          </ol>
          {waiting.length ? (
            <ul className="mt-4 space-y-1 border-t border-dashed border-line pt-3 text-sm text-muted">
              {waiting.map((h) => (
                <li key={h.id} className={h.id === data.myHouseId ? "font-medium text-ink" : ""}>
                  {h.name}: {Math.max(0, min - h.givers) === 1 ? "one more giver" : `${Math.max(0, min - h.givers)} more givers`} to join the board
                </li>
              ))}
            </ul>
          ) : null}
          <p className="note-hand mt-3 text-sm text-muted">Totals show once {min} from a house have given, so no one is singled out.</p>
        </div>
      ) : null}

      <p className="note-hand text-lg leading-relaxed">{data.story}</p>

      <StickyAction onClick={onGive}>Give to {data.title.replace(/^The /, "the ")}</StickyAction>
    </section>
  );
}

/** Your cot, drawn as beds: the people you slept beside, and how many have given. */
function CotNudge({ cot, givenByMe }: { cot: { name: string; mates: number; given: number }; givenByMe: boolean }) {
  const left = Math.max(0, cot.mates - cot.given);
  return (
    <div className="rounded-lg border border-line bg-card p-4">
      <p className="text-xs tracking-[0.18em] text-gold uppercase">Your cot</p>
      <p className="mt-1 font-display text-2xl uppercase">{cot.name}</p>
      <div className="mt-3 flex flex-wrap gap-1.5" aria-label={`${cot.given} of ${cot.mates} have given`}>
        {Array.from({ length: cot.mates }, (_, i) => (
          <span key={i} className={`grid size-9 place-items-center rounded-md border ${i < cot.given ? "border-crimson bg-crimson text-on-crimson" : "border-dashed border-muted text-muted"}`}>
            <BedSingle className="size-4" />
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm">
        <span className="font-semibold">{cot.given} of {cot.mates}</span> from your cot {cot.given === 1 ? "has" : "have"} given.{" "}
        {left === 0 ? "Every bed is in. Well done." : givenByMe ? `Nudge the ${left === 1 ? "last one" : `other ${left}`}.` : "Will you be next?"}
      </p>
    </div>
  );
}

function BitsPlan({ gift }: { gift: number }) {
  const parts = pledgeParts(gift);
  const [now] = useState(() => Date.now());
  const day = (offset: number) => new Date(now + offset * 86_400_000).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return (
    <ol className="mt-3 divide-y divide-dashed divide-line rounded-lg border border-line bg-card px-4 text-sm">
      {parts.map((p, i) => (
        <li key={i} className="flex justify-between py-2.5">
          <span>{i === 0 ? "Today" : day(i * 30)}</span>
          <span className="tabular-nums">{formatGhs(p)}</span>
        </li>
      ))}
      <li className="py-2.5 text-xs text-muted">We send a reminder with a one-tap pay link before each part. Nothing is taken automatically.</li>
    </ol>
  );
}

/** A paying-in slip: each line, then what you pay and what arrives. */
export function PaySlip({ rows }: { rows: { label: string; value: number; strong?: boolean; muted?: boolean }[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-card">
      <div className="perf bg-line/40" aria-hidden />
      <ul className="space-y-2 px-4 py-4">
        {rows.map((r) => (
          <li key={r.label} className={`flex justify-between gap-3 ${r.strong ? "border-t border-ink/80 pt-2 font-semibold" : ""} ${r.muted ? "text-sm text-muted" : ""}`}>
            <span>{r.label}</span>
            <span className="tabular-nums"><Money value={r.value} /></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Switch({ on, set, title, detail }: { on: boolean; set: (v: boolean) => void; title: string; detail: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => set(!on)} className="flex min-h-16 w-full items-center justify-between gap-3 rounded-lg border border-line bg-card px-4 py-3 text-left">
      <span>
        <span className="block font-medium">{title}</span>
        <span className="block text-xs text-muted">{detail}</span>
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-crimson" : "bg-line"}`}>
        <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}

/** The one action of the screen, always within thumb reach. */
function StickyAction({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
      <div className="mx-auto max-w-lg">
        <button type="button" className="btn-primary" disabled={disabled} onClick={onClick}>{children}</button>
      </div>
    </div>
  );
}
