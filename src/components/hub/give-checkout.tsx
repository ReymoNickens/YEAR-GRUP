"use client";
import { CreditCard, Delete, Lock, Share2, Smartphone, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Shell } from "@/components/hub/shell";
import { Crest, Kicker, Money, Note, Pill, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";
import { useOrgFace } from "@/components/hub/org-context";
import { abandonIntent, intentState, purposeDetail, testGateway, verifyIntent } from "@/lib/hub/api";
import { formatGhs } from "@/lib/hub/money";
import { cedisInWords, localPhone } from "@/lib/hub/words-money";

type View = Awaited<ReturnType<typeof intentState>>;
const NETWORKS = ["MTN MoMo", "Telecel Cash", "AirtelTigo Money"] as const;
const NETWORK_COLOUR: Record<(typeof NETWORKS)[number], string> = { "MTN MoMo": "#ffcb05", "Telecel Cash": "#e4002b", "AirtelTigo Money": "#0057b8" };

/**
 * The payment screen. On a live hub it hands over to the gateway's own page and
 * waits for the gateway's word. On a test hub (the executive preview) it plays the
 * real experience end to end: choose mobile money or card, approve the prompt on
 * the phone, and the test gateway confirms it through the same code a real
 * confirmation takes. Nothing here decides that money arrived.
 */
export function PayScreen({ slug, intentId }: { slug: string; intentId: string }) {
  const { data, error, loading, reload } = useHub(`pay-${intentId}`, () => intentState({ data: { slug, id: intentId } }));
  const [view, setView] = useState<View | null>(null);
  const current = view ?? data;
  // Gateway answers carry the payment, not the screen's own flags; keep those from the first load.
  const keep = (next: Partial<View>) => setView((prev) => ({ ...(prev ?? data)!, ...next }));

  // While a live payment is pending, ask the gateway every few seconds; the member does not have to press anything.
  useEffect(() => {
    if (current?.status !== "pending" || current.provider !== "paystack") return;
    const timer = window.setInterval(async () => {
      try {
        keep(await verifyIntent({ data: { slug, id: intentId } }));
      } catch {
        /* keep waiting */
      }
    }, 6000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keep() only merges into state
  }, [current?.status, current?.provider, slug, intentId]);

  return (
    <Shell slug={slug} nav={false}>
      <State loading={loading} error={error} onRetry={reload}>
        {current?.status === "succeeded" ? <ReceiptBook slug={slug} v={current} /> : null}
        {current && (current.status === "failed" || current.status === "abandoned") ? (
          <section className="rise mx-auto max-w-lg pt-10">
            <span className="grid size-16 place-items-center rounded-full border-2 border-crimson text-crimson"><X className="size-7" strokeWidth={2.5} /></span>
            <h1 className="display-lg mt-6">Not paid</h1>
            <p className="mt-3 text-lg text-muted">The payment did not go through, and nothing was taken. You can try again whenever you like.</p>
            <div className="mt-8 space-y-2.5">
              <Link href={`/o/${slug}/give/${current.purposeId}`} className="btn btn-primary btn-block">Try again</Link>
              <Link href={`/o/${slug}/home`} className="btn btn-quiet btn-block">Home</Link>
            </div>
          </section>
        ) : null}
        {current?.status === "pending" && current.canSimulate ? <TestCheckout slug={slug} v={current} onDone={keep} /> : null}
        {current?.status === "pending" && !current.canSimulate ? (
          <section className="rise mx-auto max-w-lg pt-6">
            <Kicker>Waiting for the gateway</Kicker>
            <h1 className="display-md mt-3">{current.title}</h1>
            <p className="figure mt-6 text-[3rem]"><Money value={current.charge} /></p>
            <div className="mt-8 space-y-4">
              {current.authorizationUrl ? <a className="btn btn-primary btn-block" href={current.authorizationUrl}>Continue to the payment page</a> : null}
              <Note>We are checking with the gateway. You can leave this screen: your receipt arrives as a message when it is confirmed.</Note>
            </div>
          </section>
        ) : null}
      </State>
    </Shell>
  );
}

/** The preview's checkout: the same choices a member meets at the real gateway, with test money. */
function TestCheckout({ slug, v, onDone }: { slug: string; v: View; onDone: (v: Partial<View>) => void }) {
  const org = useOrgFace();
  const [method, setMethod] = useState<"momo" | "card">("momo");
  const [network, setNetwork] = useState<(typeof NETWORKS)[number]>("MTN MoMo");
  const [phone, setPhone] = useState(localPhone(v.payerPhone));
  const [prompt, setPrompt] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function confirm() {
    setBusy(true);
    setErr("");
    try {
      await new Promise((r) => setTimeout(r, 1400)); // the network's approval round trip, so it feels like the real thing
      onDone(await testGateway({ data: { slug, id: v.id } }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "The gateway did not confirm it.");
      setBusy(false);
      setPrompt(false);
    }
  }

  async function decline() {
    setPrompt(false);
    await abandonIntent({ data: { slug, id: v.id } }).catch(() => undefined);
    onDone({ status: "abandoned" });
  }

  return (
    <section className="rise mx-auto max-w-lg pb-6">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-ink-2"><Lock className="size-3.5" /> Secure checkout</p>
        <Pill tone="red">Test money</Pill>
      </div>

      <div className="mt-6 border-b border-line pb-6">
        <p className="text-[13px] text-muted">{org?.name ?? "Your year group"} · {v.title}</p>
        <p className="figure mt-2 text-[3.25rem]"><Money value={v.charge} /></p>
        {v.pledged ? <p className="mt-1 text-sm text-muted">The first part of your pledge</p> : null}
      </div>

      <div role="tablist" aria-label="How to pay" className="mt-6 grid grid-cols-2 border border-line-2">
        {([["momo", "Mobile money", Smartphone], ["card", "Card", CreditCard]] as const).map(([k, label, Icon]) => (
          <button key={k} role="tab" type="button" aria-selected={method === k} onClick={() => setMethod(k)} className={`flex h-12 items-center justify-center gap-2 text-[15px] transition-colors ${method === k ? "bg-ink font-semibold text-paper" : "bg-card text-ink-2 hover:bg-sunk/50"}`}>
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      {method === "momo" ? (
        <div className="mt-6 space-y-5">
          <fieldset>
            <legend className="mb-2 text-[13px] font-medium text-ink-2">Network</legend>
            <div className="grid grid-cols-3 gap-2">
              {NETWORKS.map((n) => (
                <button key={n} type="button" aria-pressed={network === n} onClick={() => setNetwork(n)} className={`flex min-h-[4.5rem] flex-col items-start justify-between border p-3 text-left text-[13px] leading-tight transition-colors ${network === n ? "border-ink bg-card font-semibold shadow-[inset_0_0_0_1px_var(--ink)]" : "border-line-2 bg-card hover:border-ink"}`}>
                  <span aria-hidden className="size-3 rounded-full" style={{ background: NETWORK_COLOUR[n] }} />
                  {n}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-ink-2">Mobile money number</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel-national" className="input font-mono text-lg tracking-wider" />
          </label>
          <button type="button" className="btn btn-red btn-block" disabled={phone.replace(/\D/g, "").length < 10} onClick={() => setPrompt(true)}>
            Send the approval prompt
          </button>
          <Note>Your phone shows a prompt from {network}. You approve it with your own PIN. The hub never sees your PIN.</Note>
        </div>
      ) : (
        <div className="mt-6"><CardForm amount={v.charge} busy={busy} onPay={confirm} /></div>
      )}
      {err ? <p role="alert" className="mt-4 border-l-[3px] border-crimson bg-card px-4 py-3 text-sm">{err}</p> : null}
      {prompt ? <PhonePrompt network={network} amount={v.charge} payee={org?.name ?? "Year Group Hub"} busy={busy} onApprove={confirm} onDecline={decline} /> : null}
    </section>
  );
}

/** What the member's phone shows: the network's approval prompt, with a PIN pad. */
function PhonePrompt({ network, amount, payee, busy, onApprove, onDecline }: { network: string; amount: number; payee: string; busy: boolean; onApprove: () => void; onDecline: () => void }) {
  const [pin, setPin] = useState("");
  const press = (d: string) => setPin((p) => (p.length < 4 ? p + d : p));
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${network} approval`}>
      <div className="w-full max-w-xs animate-[sheet_260ms_ease-out_both] overflow-hidden rounded-[14px] bg-[#f4f4f4] font-sans text-[#111] shadow-2xl">
        <div className="bg-[#e3e3e3] px-4 py-2 text-[11px] tracking-wide text-[#555] uppercase">Test prompt · on your phone</div>
        <div className="space-y-3 px-4 py-4 text-sm leading-relaxed">
          {busy ? (
            <p className="py-6 text-center">Approving…<br /><span className="text-xs text-[#666]">Waiting for {network}</span></p>
          ) : (
            <>
              <p>{network}: Pay GHS {(amount / 100).toFixed(2)} to {payee}.</p>
              <p>Enter your PIN to approve.</p>
              <div className="flex justify-center gap-3 py-1" aria-label={`${pin.length} of 4 digits`}>
                {[0, 1, 2, 3].map((i) => <span key={i} className={`size-3.5 rounded-full border border-[#111] ${i < pin.length ? "bg-[#111]" : ""}`} />)}
              </div>
              <div className="grid grid-cols-3 gap-1.5 font-sans">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((k) =>
                  k === "" ? <span key="blank" /> : (
                    <button key={k} type="button" onClick={() => (k === "del" ? setPin((p) => p.slice(0, -1)) : press(k))} className="grid h-11 place-items-center rounded-[8px] bg-white text-lg shadow-sm active:bg-[#ddd]" aria-label={k === "del" ? "Delete" : k}>
                      {k === "del" ? <Delete className="size-5" /> : k}
                    </button>
                  ),
                )}
              </div>
              <p className="text-center text-[11px] text-[#666]">Any four digits. This is the preview.</p>
            </>
          )}
        </div>
        {!busy ? (
          <div className="grid grid-cols-2 border-t border-[#d6d6d6] text-sm">
            <button type="button" className="h-12 border-r border-[#d6d6d6]" onClick={onDecline}>Cancel</button>
            <button type="button" className="h-12 font-semibold disabled:opacity-40" disabled={pin.length < 4} onClick={onApprove}>Send</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CardForm({ amount, busy, onPay }: { amount: number; busy: boolean; onPay: () => void }) {
  const [card, setCard] = useState("4084 0840 8408 4081");
  const [exp, setExp] = useState("12/30");
  const [cvv, setCvv] = useState("408");
  const box = "input font-mono tracking-wider";
  return (
    <div className="space-y-3">
      <label className="block"><span className="mb-2 block text-[13px] font-medium text-ink-2">Card number</span><input className={box} value={card} onChange={(e) => setCard(e.target.value)} inputMode="numeric" autoComplete="cc-number" /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><span className="mb-2 block text-[13px] font-medium text-ink-2">Expiry</span><input className={box} value={exp} onChange={(e) => setExp(e.target.value)} inputMode="numeric" autoComplete="cc-exp" /></label>
        <label className="block"><span className="mb-2 block text-[13px] font-medium text-ink-2">CVV</span><input className={box} value={cvv} onChange={(e) => setCvv(e.target.value)} inputMode="numeric" autoComplete="cc-csc" /></label>
      </div>
      <button type="button" className="btn btn-red btn-block" disabled={busy} onClick={onPay}>
        <Lock className="size-4" /> {busy ? "Checking with the bank…" : `Pay ${formatGhs(amount)}`}
      </button>
      <Note>A test card is filled in. On the real hub, card details go straight to the gateway; the hub never stores them.</Note>
    </div>
  );
}

/**
 * Paid. A thank-you, the receipt as the treasurer's receipt book would write it,
 * then what the gift did: the appeal's new total, your house in the cup, your cot.
 */
function ReceiptBook({ slug, v }: { slug: string; v: View }) {
  const org = useOrgFace();
  const after = useHub(`p-${v.purposeId}`, () => purposeDetail({ data: { slug, id: v.purposeId } }));
  const d = after.data;
  const houses = (d?.boards?.houses ?? []).filter((h) => h.shown).sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
  const rank = d?.myHouseId ? houses.findIndex((h) => h.id === d.myHouseId) + 1 : 0;
  const pct = d && d.target > 0 ? Math.floor((d.raised / d.target) * 100) : null;
  const dues = v.kind === "dues";
  const link = typeof window !== "undefined" ? `${window.location.origin}/o/${slug}/${dues ? "dues" : `give/${v.purposeId}`}` : "";
  const share = dues
    ? `I have just paid my ${org?.name ?? "year group"} dues. Two taps and the receipt comes back. Yours: ${link}`
    : `I have just given to ${v.title} for ${org?.name ?? "our year group"}.${pct != null ? ` We are ${pct}% of the way there.` : ""} Join me: ${link}`;
  const paidOn = v.paidAt ? new Date(v.paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "Today";
  const first = org?.me?.nickname || v.payer.split(" ")[0];
  const arrives = v.coverFees ? v.gift : v.charge - v.gatewayFee - v.platformFee;

  return (
    <section className="mx-auto max-w-lg pb-6">
      <div className="pt-2 text-center">
        <svg viewBox="0 0 64 64" className="mx-auto size-20 animate-[pop_.5s_cubic-bezier(.2,.9,.3,1.3)_both]" aria-hidden>
          <circle cx="32" cy="32" r="30" className="fill-paid" />
          <path d="M19 33l9 9 18-19" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="48" style={{ animation: "draw .45s .35s ease-out both" }} />
        </svg>
        <p className="kicker mt-6">Confirmed by the gateway</p>
        <h1 className="display-lg mt-3">Thank you, <span className="serif-italic">{v.anonymous ? "old boy" : first}</span>.</h1>
        <p className="mt-3 text-[15px] text-muted">{v.kind === "dues" ? <><Money value={v.gift} /> is counted towards your dues.</> : <><Money value={arrives} /> is on its way to {v.title.replace(/^The /, "the ")}.</>}</p>
      </div>

      <article className="receipt rise rise-2 mt-9" aria-label={`Receipt number ${v.receipt}`}>
        <div className="perf" aria-hidden />
        <div className="relative px-6 pt-5 pb-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Crest className="h-10 w-9" />
              <div className="leading-tight">
                <p className="text-[13px] font-semibold">{org?.name ?? "Year group"}</p>
                <p className="font-mono text-[10px] tracking-[0.14em] text-[#6b6355] uppercase">Official receipt</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] tracking-[0.14em] text-[#6b6355] uppercase">No.</p>
              <p className="font-mono text-lg font-semibold whitespace-nowrap text-[#b3261e]">{v.receipt}</p>
            </div>
          </div>

          <div className="ruled mt-6 text-[15px]">
            <p>Received from <span className="font-display text-[1.35rem] italic">{v.anonymous ? "an old boy (anonymous)" : v.payer}</span></p>
            <p>the sum of <span className="font-display text-[1.35rem] italic">{cedisInWords(v.gift)}</span></p>
            <p>being <span className="font-display text-[1.35rem] italic">{v.kind === "dues" ? "year group dues" : v.pledged ? `the first part of a pledge to ${v.title}` : `a gift to ${v.title}`}</span></p>
            <p>on <span className="font-display text-[1.35rem] italic">{paidOn}</span></p>
          </div>

          <dl className="mt-6 space-y-1.5 font-mono text-[13px]">
            <div className="flex justify-between"><dt>Paid</dt><dd><Money value={v.charge} /></dd></div>
            <div className="flex justify-between text-[#6b6355]"><dt>Fees {v.coverFees ? "(you covered them)" : "(from the gift)"}</dt><dd><Money value={v.gatewayFee + v.platformFee} /></dd></div>
            <div className="flex justify-between border-t border-[#1a1712]/70 pt-1.5 font-semibold"><dt>To {v.title.replace(/^The /, "the ")}</dt><dd><Money value={arrives} /></dd></div>
          </dl>

          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-2xl leading-none italic">Treasurer</p>
              <p className="mt-1.5 w-36 border-t border-[#1a1712]/60 pt-1 font-mono text-[10px] tracking-[0.1em] text-[#6b6355] uppercase">For the executives</p>
            </div>
            <span className="stamp stamp-paid text-[11px]" style={{ color: "#137a48" }}>Received<br />with thanks</span>
          </div>
        </div>
        <div className="perf rotate-180" aria-hidden />
      </article>

      {dues ? (
        <Link href={`/o/${slug}/dues`} className="rise rise-3 mt-9 flex items-center justify-between gap-3 border-y border-line py-4 text-[15px] font-medium hover:bg-sunk/40">
          See your dues, year by year <span aria-hidden>→</span>
        </Link>
      ) : null}
      {d && !dues ? (
        <div className="rise rise-3 mt-9 grid grid-cols-3 divide-x divide-line border-y border-line">
          {pct != null ? <Impact big={`${pct}%`} text="of the goal" /> : null}
          {rank > 0 ? <Impact big={`#${rank}`} text={`${v.house ?? "Your house"}`} /> : null}
          {d.cot && d.cot.mates > 1 ? <Impact big={`${d.cot.given}/${d.cot.mates}`} text="of your cot" /> : null}
        </div>
      ) : null}

      <div className="mt-8 space-y-2.5">
        <a className="btn btn-block bg-[#1fa855] text-white hover:bg-[#178a45]" href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer">
          <Share2 className="size-[18px]" /> {dues ? "Remind your cot on WhatsApp" : "Tell your cot on WhatsApp"}
        </a>
        <div className="grid grid-cols-2 gap-2.5">
          <Link href={`/r/${v.receipt}`} className="btn btn-quiet">Save receipt</Link>
          <Link href={`/o/${slug}/home`} className="btn btn-quiet">Home</Link>
        </div>
      </div>
    </section>
  );
}

function Impact({ big, text }: { big: string; text: string }) {
  return (
    <div className="px-3 py-4 text-center">
      <p className="figure text-[1.75rem] text-crimson">{big}</p>
      <p className="mt-1 truncate text-[12px] text-muted">{text}</p>
    </div>
  );
}
