"use client";
import { BedSingle, Delete, Heart, Lock, Share2, ShieldCheck, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useOrgFace } from "@/components/hub/org-context";
import { Shell } from "@/components/hub/shell";
import { Avatar, Back, BackButton, Bar, Kicker, Money, Section, State, Toggle } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";
import { purposeDetail, startPayment } from "@/lib/hub/api";
import { formatGhs, parseCedisToPesewas, planCollection } from "@/lib/hub/money";
import { pledgeParts, timeAgo, wholeCedis } from "@/lib/hub/words-money";

type Detail = Awaited<ReturnType<typeof purposeDetail>>;
type Step = "story" | "amount" | "check";

/** Common gifts, one tap each (brief section 11: quick buttons plus custom). */
const QUICK_CEDIS = [50, 100, 200, 500, 1000, 2000];
const KIND: Record<string, string> = { campaign: "The appeal", event: "Event ticket", dues: "Dues", welfare: "Welfare", store: "Store" };

/**
 * Giving, in three short screens: why (the appeal and who has already given),
 * how much (a keypad, and whether in bits), then a check of exactly what happens
 * to the money. Every number on these screens comes from the ledger.
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

  // Each step starts at the top, as a new screen would.
  useEffect(() => { window.scrollTo({ top: 0 }); }, [step]);

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

  return (
    <Shell slug={slug} nav={step === "story"} wide={step === "story"}>
      {step === "story" ? <Back href={`/o/${slug}/give`} label="Give" /> : <BackButton onClick={() => setStep(step === "check" ? "amount" : "story")} />}
      <State loading={loading} error={error} onRetry={reload}>
        {data && step === "story" ? <Story slug={slug} data={data} onGive={() => setStep("amount")} /> : null}
        {data && step === "amount" ? (
          <Amount
            data={data}
            amount={amount}
            setAmount={setAmount}
            inBits={inBits}
            setInBits={setInBits}
            gift={gift}
            today={today}
            onNext={() => quote && setStep("check")}
            ready={!!quote}
          />
        ) : null}
        {data && quote && step === "check" ? (
          <section className="mx-auto max-w-lg pb-6">
            <Kicker>{data.title}</Kicker>
            <h1 className="display-md mt-3">Check your gift</h1>

            <div className="mt-7 border border-line bg-card">
              <div className="flex items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="text-[13px] text-muted">{inBits ? "Today, the first of three parts" : "Your gift"}</p>
                  <p className="figure mt-2 text-[2.75rem]">{formatGhs(quote.gift)}</p>
                </div>
                <span className="grid size-11 shrink-0 place-items-center bg-crimson-fill text-white"><Heart className="size-5" strokeWidth={2.25} /></span>
              </div>
              <dl className="space-y-2.5 border-t border-dashed border-line-2 px-5 py-4 text-[15px]">
                <Line label="Gateway fee" value={quote.gatewayFee} muted />
                <Line label="Platform fee" value={quote.platformFee} muted />
                <div className="flex justify-between gap-3 border-t border-line pt-3 text-[17px] font-semibold">
                  <dt>You pay now</dt>
                  <dd className="tabular-nums"><Money value={quote.charge} /></dd>
                </div>
                <div className="flex justify-between gap-3 text-paid">
                  <dt>{data.title} receives</dt>
                  <dd className="font-medium tabular-nums"><Money value={cover ? quote.gift : quote.charge - quote.gatewayFee - quote.platformFee} /></dd>
                </div>
              </dl>
            </div>

            <div className="mt-4 ruled-list border-y border-line">
              <Toggle on={cover} set={setCover} title="I’ll cover the fees" detail={cover ? "The whole gift arrives." : "Otherwise the fees come out of the gift."} />
              <Toggle on={anon} set={setAnon} title="Give without my name" detail={`Your house still gets the credit once ${data.boards?.minGivers ?? 5} have given. Only the treasurer sees your name.`} />
            </div>

            {inBits ? <BitsPlan gift={gift} /> : null}
            {err ? <p role="alert" className="mt-4 border-l-[3px] border-crimson bg-card px-4 py-3 text-sm">{err}</p> : null}

            <div className="h-28 lg:h-0" aria-hidden />
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/92 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:p-0">
              <div className="mx-auto max-w-lg">
                <button type="button" className="btn btn-red btn-block" disabled={busy} onClick={pay}>
                  <Lock className="size-4" /> {busy ? "Opening checkout…" : `Pay ${formatGhs(quote.charge)}`}
                </button>
                <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[12px] text-muted">
                  <ShieldCheck className="size-3.5" /> Paid through the gateway. Only its confirmation marks it paid.
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </State>
    </Shell>
  );
}

function Line({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${muted ? "text-muted" : ""}`}>
      <dt>{label}</dt>
      <dd className="tabular-nums"><Money value={value} /></dd>
    </div>
  );
}

/* ── Step 1: the appeal ───────────────────────────────────────────── */

function Story({ slug, data, onGive }: { slug: string; data: Detail; onGive: () => void }) {
  const org = useOrgFace();
  const pct = data.target > 0 ? Math.min(100, (data.raised / data.target) * 100) : 0;
  const link = typeof window !== "undefined" ? `${window.location.origin}/o/${slug}/give/${data.id}` : "";
  const share = `${data.title} for ${org?.name ?? "our year group"}: ${wholeCedis(data.raised)} raised, ${Math.floor(pct)}% of the way. Add yours: ${link}`;

  const progress = (
    <div>
      {data.target > 0 ? (
        <>
          <p className="figure text-[2.75rem] lg:text-[3rem]">{wholeCedis(data.raised)}</p>
          <p className="mt-2 text-[15px] text-muted">raised of a {wholeCedis(data.target)} goal</p>
          <div className="mt-4"><Bar value={data.raised} max={data.target} label="Raised so far" ticks={[25, 50, 75]} height={8} /></div>
          <div className="mt-3 flex justify-between text-[13px]">
            <span><span className="font-semibold">{data.givers}</span> <span className="text-muted">old boys have given</span></span>
            <span className="font-mono text-muted">{Math.floor(pct)}%</span>
          </div>
        </>
      ) : (
        <p className="text-[15px] text-muted">{data.givers} {data.givers === 1 ? "person has" : "people have"} paid.</p>
      )}
    </div>
  );

  const actions = (
    <div className="grid grid-cols-[1fr_auto] gap-2.5">
      <button type="button" onClick={onGive} className="btn btn-red">
        <Heart className="size-[18px]" strokeWidth={2.25} /> Give now
      </button>
      <a href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer" className="btn btn-quiet px-5" aria-label="Share on WhatsApp">
        <Share2 className="size-[18px]" /> <span className="hidden sm:inline">Share</span>
      </a>
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
      <article className="min-w-0">
        <header className="poster rise -mx-5 px-5 pt-6 pb-8 sm:mx-0 sm:px-8 sm:pt-8 sm:pb-10">
          <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-white/80 uppercase">{KIND[data.type] ?? "Give"} · {org?.name}</p>
          <h1 className="mt-10 font-display text-[3.5rem] leading-[0.9] tracking-[-0.025em] sm:text-[5rem]">{data.title}</h1>
        </header>

        <div className="rise rise-1 mt-7 lg:hidden">
          {progress}
        </div>

        {(data.mine ?? 0) > 0 ? (
          <div className="rise rise-2 mt-8 flex items-center gap-4 border-l-[3px] border-paid bg-paid-soft px-4 py-4">
            <span className="stamp stamp-paid shrink-0">Thank you</span>
            <p className="text-[15px]">You have given <span className="font-semibold"><Money value={data.mine} /></span> to this.</p>
          </div>
        ) : null}

        <p className="rise rise-2 mt-9 font-display text-[1.65rem] leading-[1.25] tracking-[-0.01em] lg:text-[1.9rem]">{data.story}</p>

        {data.cot && data.cot.mates > 1 ? <CotNudge cot={data.cot} givenByMe={data.mine > 0} /> : null}
        <HouseCup data={data} />
        <div className="lg:hidden"><Recent data={data} /></div>
      </article>

      <aside className="hidden lg:block">
        <div className="sticky top-12 border border-line bg-card p-7">
          {progress}
          <div className="mt-7">{actions}</div>
          <p className="mt-4 flex items-center gap-1.5 text-[12px] text-muted"><ShieldCheck className="size-3.5" /> Every gift is on the ledger, with its fees.</p>
          <Recent data={data} compact />
        </div>
      </aside>

      <div className="lg:hidden">
        <div className="h-24" aria-hidden />
        <div className="fixed inset-x-0 bottom-[calc(60px+max(0.25rem,env(safe-area-inset-bottom)))] z-20 border-t border-line bg-paper/92 px-5 py-3 backdrop-blur-md">
          <div className="mx-auto max-w-xl">{actions}</div>
        </div>
      </div>
    </div>
  );
}

/** Who has given lately: houses and times only. A giver's name or amount never shows. */
function Recent({ data, compact = false }: { data: Detail; compact?: boolean }) {
  if (!data.recent?.length) return null;
  const list = (
    <ul className="ruled-list">
      {data.recent.map((r, i) => (
        <li key={i} className="flex items-center gap-3 py-3">
          {r.me ? <Avatar name="You" size={36} me /> : <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sunk"><Heart className="size-4 text-crimson" strokeWidth={2} /></span>}
          <span className="min-w-0 flex-1 text-[14px] leading-snug">
            <span className="block font-medium">{r.me ? "You gave" : "An old boy gave"}</span>
            <span className="block truncate text-muted">{r.house ?? "The year group"}</span>
          </span>
          <span className="shrink-0 font-mono text-[11px] text-muted">{timeAgo(r.at)}</span>
        </li>
      ))}
    </ul>
  );
  if (compact) {
    return (
      <div className="mt-7 border-t border-line pt-5">
        <p className="kicker">Just now</p>
        <div className="mt-1">{list}</div>
      </div>
    );
  }
  return (
    <Section title="Just given" action={<span className="text-[13px] text-muted">Names stay private</span>} className="mt-12">
      {list}
    </Section>
  );
}

/** Your cot, drawn as beds: the people you slept beside, and how many have given. */
function CotNudge({ cot, givenByMe }: { cot: { name: string; mates: number; given: number }; givenByMe: boolean }) {
  const left = Math.max(0, cot.mates - cot.given);
  return (
    <Section title="Your cot" className="mt-12">
      <p className="text-[15px] text-muted">{cot.name}</p>
      <div className="mt-4 flex flex-wrap gap-2" aria-label={`${cot.given} of ${cot.mates} have given`}>
        {Array.from({ length: cot.mates }, (_, i) => (
          <span key={i} className={`grid size-12 place-items-center border ${i < cot.given ? "border-crimson-fill bg-crimson-fill text-white" : "border-dashed border-line-2 text-muted"}`}>
            <BedSingle className="size-5" strokeWidth={1.75} />
          </span>
        ))}
      </div>
      <p className="mt-4 text-[15px]">
        <span className="font-semibold">{cot.given} of {cot.mates}</span> {cot.given === 1 ? "has" : "have"} given.{" "}
        <span className="text-muted">{left === 0 ? "Every bed is in. Well done." : givenByMe ? `Nudge the ${left === 1 ? "last one" : `other ${left}`}.` : "Will you be next?"}</span>
      </p>
    </Section>
  );
}

/** The house cup: houses ranked by what they have given, shown once enough have given. */
function HouseCup({ data }: { data: Detail }) {
  const houses = data.boards?.houses ?? [];
  const ranked = houses.filter((h) => h.shown).sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
  const waiting = houses.filter((h) => !h.shown);
  const min = data.boards?.minGivers ?? 5;
  const top = Math.max(1, ...ranked.map((h) => h.total ?? 0));
  if (!ranked.length && !waiting.length) return null;
  return (
    <Section title={<span className="inline-flex items-center gap-2.5">The house cup <Trophy className="size-5 text-gold" strokeWidth={1.75} /></span>} className="mt-12">
      <ol className="ruled-list">
        {ranked.map((h, i) => {
          const mine = h.id === data.myHouseId;
          return (
            <li key={h.id} className="py-3.5">
              <div className="flex items-baseline gap-3">
                <span className={`w-6 font-mono text-[13px] ${i === 0 ? "text-crimson" : "text-muted"}`}>{String(i + 1).padStart(2, "0")}</span>
                <span className={`min-w-0 flex-1 truncate text-[15px] ${mine ? "font-semibold" : ""}`}>{h.name}{mine ? <span className="ml-2 font-mono text-[10.5px] tracking-widest text-crimson-ink uppercase">Yours</span> : null}</span>
                <span className="text-[15px] font-medium tabular-nums"><Money value={h.total ?? 0} /></span>
              </div>
              <div className="mt-2 ml-9 h-1 bg-sunk">
                <div className={`h-full ${mine ? "bg-crimson" : "bg-ink"}`} style={{ width: `${((h.total ?? 0) / top) * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ol>
      {waiting.length ? (
        <ul className="mt-2 space-y-1.5 border-t border-dashed border-line-2 pt-4 text-sm text-muted">
          {waiting.map((h) => {
            const need = Math.max(0, min - h.givers);
            return (
              <li key={h.id} className={h.id === data.myHouseId ? "font-medium text-ink" : ""}>
                {h.name}: {need === 1 ? "one more giver" : `${need} more givers`} to join the board
              </li>
            );
          })}
        </ul>
      ) : null}
      <p className="mt-4 text-[13px] text-muted">A house shows once {min} of its old boys have given, so no one is singled out.</p>
    </Section>
  );
}

/* ── Step 2: how much ─────────────────────────────────────────────── */

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"] as const;

function Amount({
  data,
  amount,
  setAmount,
  inBits,
  setInBits,
  gift,
  today,
  onNext,
  ready,
}: {
  data: Detail;
  amount: string;
  setAmount: (v: string) => void;
  inBits: boolean;
  setInBits: (v: boolean) => void;
  gift: number;
  today: number;
  onNext: () => void;
  ready: boolean;
}) {
  const press = useCallback(
    (k: string) => {
      if (k === "del") return setAmount(amount.slice(0, -1));
      if (k === ".") return amount.includes(".") ? undefined : setAmount((amount || "0") + ".");
      if (/\.\d\d$/.test(amount)) return;
      if (amount.replace(".", "").length >= 7) return;
      setAmount(amount === "0" ? k : amount + k);
    },
    [amount, setAmount],
  );

  // A keyboard works too, for anyone giving from a laptop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "." || e.key === ",") press(".");
      else if (e.key === "Backspace") press("del");
      else if (e.key === "Enter" && ready) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, ready, onNext]);

  const shown = amount || "0";
  const [whole, frac] = shown.split(".");
  return (
    <section className="mx-auto flex max-w-lg flex-col">
      <Kicker>{data.title}</Kicker>
      <h1 className="display-md mt-3">How much?</h1>

      <div className="mt-8 flex min-h-[7.5rem] items-start justify-center" aria-live="polite" aria-label={`${formatGhs(gift)}`}>
        <span className={`figure mt-3 mr-1 text-[2rem] ${gift ? "text-ink" : "text-line-2"}`}>GH₵</span>
        <span className={`figure text-[5.5rem] sm:text-[6.5rem] ${gift ? "text-ink" : "text-line-2"}`}>
          {Number(whole || 0).toLocaleString("en-GH")}
          {frac !== undefined ? <span>.{frac}</span> : null}
        </span>
      </div>
      <p className="mt-1 text-center text-[13px] text-muted">
        {inBits && gift ? <>Today <span className="font-medium text-ink tabular-nums">{formatGhs(today)}</span>, then two more parts</> : "Tap a figure or type your own"}
      </p>

      <div className="rail mt-6 -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-6 sm:px-0">
        {QUICK_CEDIS.map((c) => {
          const on = amount === String(c);
          return (
            <button key={c} type="button" aria-pressed={on} onClick={() => setAmount(String(c))} className={`h-11 shrink-0 border px-4 text-[15px] font-semibold tabular-nums transition-colors ${on ? "border-ink bg-ink text-paper" : "border-line-2 bg-card hover:border-ink"}`}>
              {c.toLocaleString("en-GH")}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 border border-line-2" role="radiogroup" aria-label="When to pay">
        {[
          { bits: false, title: "All today", sub: gift ? formatGhs(gift) : "One payment" },
          { bits: true, title: "In three bits", sub: gift ? `${formatGhs(pledgeParts(gift)[0])} today` : "Over two months" },
        ].map((o) => (
          <button key={o.title} type="button" role="radio" aria-checked={inBits === o.bits} onClick={() => setInBits(o.bits)} className={`px-4 py-3 text-left transition-colors ${inBits === o.bits ? "bg-ink text-paper" : "bg-card hover:bg-sunk/50"}`}>
            <span className="block text-[15px] font-semibold">{o.title}</span>
            <span className={`block text-[13px] tabular-nums ${inBits === o.bits ? "text-paper/70" : "text-muted"}`}>{o.sub}</span>
          </button>
        ))}
      </div>
      {inBits && gift ? <BitsPlan gift={gift} /> : null}

      <div className="mt-5 grid grid-cols-3 gap-1 select-none" aria-label="Keypad">
        {KEYS.map((k) => (
          <button key={k} type="button" onClick={() => press(k)} aria-label={k === "del" ? "Delete" : k === "." ? "Point" : k} className="grid h-[3.75rem] place-items-center text-[1.6rem] font-medium tabular-nums transition-colors hover:bg-sunk active:bg-line">
            {k === "del" ? <Delete className="size-6" strokeWidth={1.75} /> : k}
          </button>
        ))}
      </div>

      <button type="button" className="btn btn-primary btn-block mt-5 mb-4" disabled={!ready} onClick={onNext}>
        {ready ? <>Continue · {formatGhs(today)}{inBits ? " today" : ""}</> : "Choose an amount"}
      </button>
    </section>
  );
}

function BitsPlan({ gift }: { gift: number }) {
  const parts = pledgeParts(gift);
  const [now] = useState(() => Date.now());
  const day = (offset: number) => new Date(now + offset * 86_400_000).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return (
    <div className="mt-4 border border-line bg-card px-4">
      <ol className="ruled-list text-[15px]">
        {parts.map((p, i) => (
          <li key={i} className="flex items-center justify-between py-2.5">
            <span className="flex items-center gap-3">
              <span className={`grid size-6 place-items-center rounded-full font-mono text-[11px] ${i === 0 ? "bg-ink text-paper" : "border border-line-2 text-muted"}`}>{i + 1}</span>
              {i === 0 ? "Today" : day(i * 30)}
            </span>
            <span className="tabular-nums">{formatGhs(p)}</span>
          </li>
        ))}
      </ol>
      <p className="border-t border-line py-3 text-[13px] text-muted">A reminder with a one-tap pay link comes before each part. Nothing is taken automatically.</p>
    </div>
  );
}

/** A paying-in slip: each line, then what you pay and what arrives. */
export function PaySlip({ rows }: { rows: { label: string; value: number; strong?: boolean; muted?: boolean }[] }) {
  return (
    <dl className="space-y-2.5 border border-line bg-card p-5 text-[15px]">
      {rows.map((r) => (
        <div key={r.label} className={`flex justify-between gap-3 ${r.strong ? "border-t border-line pt-3 font-semibold" : ""} ${r.muted ? "text-muted" : ""}`}>
          <dt>{r.label}</dt>
          <dd className="tabular-nums"><Money value={r.value} /></dd>
        </div>
      ))}
    </dl>
  );
}
