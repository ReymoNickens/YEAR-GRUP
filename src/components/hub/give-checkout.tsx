"use client";
import { Check, CreditCard, Delete, Lock, Share2, Smartphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Shell } from "@/components/hub/shell";
import { Money, Note, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";
import { useOrgFace } from "@/components/hub/org-context";
import { abandonIntent, intentState, purposeDetail, testGateway, verifyIntent } from "@/lib/hub/api";
import { formatGhs } from "@/lib/hub/money";
import { cedisInWords, localPhone } from "@/lib/hub/words-money";

type View = Awaited<ReturnType<typeof intentState>>;
const NETWORKS = ["MTN MoMo", "Telecel Cash", "AirtelTigo Money"] as const;

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
          <section className="space-y-4 pt-6 text-center">
            <h1 className="font-display text-5xl uppercase">Not paid</h1>
            <p className="text-lg">Your payment did not go through. You have not been charged.</p>
            <Link href={`/o/${slug}/give/${current.purposeId}`} className="btn-primary">Try again</Link>
            <Link href={`/o/${slug}/home`} className="btn-quiet">Home</Link>
          </section>
        ) : null}
        {current?.status === "pending" && current.canSimulate ? <TestCheckout slug={slug} v={current} onDone={keep} /> : null}
        {current?.status === "pending" && !current.canSimulate ? (
          <section className="space-y-4">
            <p className="text-xs tracking-[0.18em] text-gold uppercase">Waiting for the gateway</p>
            <h1 className="font-display text-5xl uppercase">{current.title}</h1>
            <p className="stencil text-4xl tabular-nums"><Money value={current.charge} /></p>
            {current.authorizationUrl ? <a className="btn-primary" href={current.authorizationUrl}>Continue to the payment page</a> : null}
            <Note>We are checking with the gateway. You can leave this screen: your receipt arrives as a message when it is confirmed.</Note>
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
    <section className="space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-medium"><Lock className="size-4" /> Checkout</p>
        <span className="rounded-sm bg-gold-soft px-2 py-1 text-xs font-semibold text-gold">TEST MONEY · NOTHING IS CHARGED</span>
      </div>
      <div className="rounded-lg border border-line bg-card p-5 text-center">
        <p className="text-sm text-muted">{org?.name ?? "Your year group"} · {v.title}</p>
        <p className="stencil mt-2 text-6xl tabular-nums"><Money value={v.charge} /></p>
        {v.pledged ? <p className="mt-1 text-sm text-muted">The first part of your pledge</p> : null}
      </div>

      <div role="tablist" aria-label="How to pay" className="grid grid-cols-2 gap-1 rounded-lg bg-line/60 p-1">
        {([["momo", "Mobile money", Smartphone], ["card", "Card", CreditCard]] as const).map(([k, label, Icon]) => (
          <button key={k} role="tab" type="button" aria-selected={method === k} onClick={() => setMethod(k)} className={`flex h-11 items-center justify-center gap-2 rounded-md text-sm transition ${method === k ? "bg-card font-semibold shadow-sm" : "text-muted"}`}>
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      {method === "momo" ? (
        <div className="space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm text-muted">Network</legend>
            <div className="grid grid-cols-3 gap-2">
              {NETWORKS.map((n) => (
                <button key={n} type="button" aria-pressed={network === n} onClick={() => setNetwork(n)} className={`min-h-14 rounded-lg border-[1.5px] px-2 text-sm leading-tight transition ${network === n ? "border-ink bg-card font-semibold" : "border-line"}`}>
                  {n}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="mb-2 block text-sm text-muted">Mobile money number</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel-national" className="h-14 w-full rounded-lg border border-line bg-card px-4 text-lg tracking-wide tabular-nums outline-none focus:border-ink" />
          </label>
          <button type="button" className="btn-primary" disabled={phone.replace(/\D/g, "").length < 10} onClick={() => setPrompt(true)}>
            Send the approval prompt
          </button>
          <Note>Your phone shows a prompt from {network}. You approve it with your own PIN. The hub never sees your PIN.</Note>
        </div>
      ) : (
        <CardForm amount={v.charge} busy={busy} onPay={confirm} />
      )}
      {err ? <p role="alert" className="text-sm text-stamp">{err}</p> : null}
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
      <div className="w-full max-w-xs animate-[sheet_260ms_ease-out_both] overflow-hidden rounded-xl bg-[#f4f4f4] font-mono text-[#111] shadow-2xl">
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
                    <button key={k} type="button" onClick={() => (k === "del" ? setPin((p) => p.slice(0, -1)) : press(k))} className="grid h-11 place-items-center rounded-md bg-white text-lg shadow-sm active:bg-[#ddd]" aria-label={k === "del" ? "Delete" : k}>
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
  const box = "h-14 w-full rounded-lg border border-line bg-card px-4 text-lg tracking-wide tabular-nums outline-none focus:border-ink";
  return (
    <div className="space-y-3">
      <label className="block"><span className="mb-2 block text-sm text-muted">Card number</span><input className={box} value={card} onChange={(e) => setCard(e.target.value)} inputMode="numeric" autoComplete="cc-number" /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><span className="mb-2 block text-sm text-muted">Expiry</span><input className={box} value={exp} onChange={(e) => setExp(e.target.value)} inputMode="numeric" autoComplete="cc-exp" /></label>
        <label className="block"><span className="mb-2 block text-sm text-muted">CVV</span><input className={box} value={cvv} onChange={(e) => setCvv(e.target.value)} inputMode="numeric" autoComplete="cc-csc" /></label>
      </div>
      <button type="button" className="btn-primary" disabled={busy} onClick={onPay}>
        <Lock className="size-4" /> {busy ? "Checking with the bank…" : `Pay ${formatGhs(amount)}`}
      </button>
      <Note>A test card is filled in. On the real hub, card details go straight to the gateway; the hub never stores them.</Note>
    </div>
  );
}

/**
 * Paid. The receipt as the treasurer's receipt book would write it, then what
 * the gift did: the appeal's new total, your house in the cup, your cot.
 */
function ReceiptBook({ slug, v }: { slug: string; v: View }) {
  const org = useOrgFace();
  const after = useHub(`p-${v.purposeId}`, () => purposeDetail({ data: { slug, id: v.purposeId } }));
  const d = after.data;
  const houses = (d?.boards?.houses ?? []).filter((h) => h.shown).sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
  const rank = d?.myHouseId ? houses.findIndex((h) => h.id === d.myHouseId) + 1 : 0;
  const pct = d && d.target > 0 ? Math.floor((d.raised / d.target) * 100) : null;
  const link = typeof window !== "undefined" ? `${window.location.origin}/o/${slug}/give/${v.purposeId}` : "";
  const share = `I have just given to ${v.title} for ${org?.name ?? "our year group"}.${pct != null ? ` We are ${pct}% of the way there.` : ""} Join me: ${link}`;
  const paidOn = v.paidAt ? new Date(v.paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "Today";

  return (
    <section className="space-y-6 pb-6">
      <div className="flex items-center gap-3 pt-2">
        <span className="grid size-12 animate-[pop_420ms_cubic-bezier(.2,.9,.3,1.3)_both] place-items-center rounded-full bg-paid text-white"><Check className="size-6" strokeWidth={3} /></span>
        <div>
          <h1 className="font-display text-4xl uppercase leading-none">Thank you</h1>
          <p className="text-sm text-muted">Confirmed by the gateway and written to the ledger.</p>
        </div>
      </div>

      <article className="relative overflow-hidden rounded-md border border-line bg-card shadow-[3px_4px_0_rgb(var(--shadow)/0.08)]">
        <div className="perf bg-line/40" aria-hidden />
        <div className="space-y-4 px-5 pt-4 pb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] tracking-[0.2em] text-muted uppercase">{org?.name ?? "Year group"} · official receipt</p>
              <p className="stencil mt-1 text-2xl whitespace-nowrap text-stamp">No. {v.receipt}</p>
            </div>
            <p className="text-right text-xs text-muted">{paidOn}</p>
          </div>
          <div className="ruled rounded-sm py-1 text-[15px]">
            <p>Received from <span className="note-hand text-lg">{v.anonymous ? "an old boy (anonymous)" : v.payer}</span></p>
            <p>the sum of <span className="note-hand text-lg">{cedisInWords(v.gift)}</span></p>
            <p>being <span className="note-hand text-lg">{v.pledged ? `the first part of a pledge to ${v.title}` : `a gift to ${v.title}`}</span></p>
          </div>
          <ul className="space-y-1 text-sm">
            <li className="flex justify-between font-semibold"><span>Paid</span><span className="tabular-nums"><Money value={v.charge} /></span></li>
            <li className="flex justify-between text-muted"><span>Fees {v.coverFees ? "(you covered them)" : "(taken from the gift)"}</span><span className="tabular-nums"><Money value={v.gatewayFee + v.platformFee} /></span></li>
            <li className="flex justify-between border-t border-ink/70 pt-1"><span>For {v.title.replace(/^The /, "the ")}</span><span className="tabular-nums"><Money value={v.coverFees ? v.gift : v.charge - v.gatewayFee - v.platformFee} /></span></li>
          </ul>
          <div className="flex items-end justify-between pt-2">
            <div>
              <p className="note-hand text-xl leading-none">Treasurer</p>
              <p className="mt-1 w-32 border-t border-ink/60 pt-1 text-[11px] text-muted">for the executives</p>
            </div>
            <span className="stamp stamp-paid text-base">Received with thanks</span>
          </div>
        </div>
      </article>

      {d ? (
        <ul className="space-y-2">
          {pct != null ? <Impact big={`${pct}%`} text={`${v.title} is now at ${formatGhs(d.raised)}.`} /> : null}
          {rank > 0 ? <Impact big={`#${rank}`} text={`${v.house ?? "Your house"} in the house cup.`} /> : null}
          {d.cot && d.cot.mates > 1 ? <Impact big={`${d.cot.given}/${d.cot.mates}`} text="of your cot have given." /> : null}
        </ul>
      ) : null}

      <a className="btn-primary" href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer">
        <Share2 className="size-4" /> Tell your cot on WhatsApp
      </a>
      <div className="grid grid-cols-2 gap-2">
        <Link href={`/r/${v.receipt}`} className="btn-quiet">Save receipt</Link>
        <Link href={`/o/${slug}/home`} className="btn-quiet">Home</Link>
      </div>
    </section>
  );
}

function Impact({ big, text }: { big: string; text: string }) {
  return (
    <li className="flex items-center gap-4 rounded-lg border border-line bg-card px-4 py-3">
      <span className="stencil w-20 shrink-0 text-3xl text-crimson tabular-nums">{big}</span>
      <span className="text-sm">{text}</span>
    </li>
  );
}
