"use client";
import { CalendarCheck, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DemoConfirm } from "@/components/hub/demo-confirm";
import { Shell } from "@/components/hub/shell";
import { Back, Callout, Choice, Kicker, Money, Pill, Section, Sheet, State, Toggle } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";
import { duesData, startPayment } from "@/lib/hub/api";
import { formatGhs, parseCedisToPesewas, planCollection } from "@/lib/hub/money";

type Dues = Awaited<ReturnType<typeof duesData>>;
type Pick = { key: string; title: string; detail: string; amount: number };

const per = (period: string) => (period === "month" ? "a month" : "a year");

/**
 * My dues, as a statement: what is due now, each year (or month) with what was paid
 * towards it, a two-tap way to pay, and the receipts. Payments apply to the oldest
 * period first, and only the gateway's confirmation counts.
 */
export function DuesScreen({ slug }: { slug: string }) {
  const { data, error, loading, reload } = useHub(`dues-${slug}`, () => duesData({ data: slug }));
  return (
    <Shell slug={slug} wide>
      <Back href={`/o/${slug}/home`} label="Home" />
      <State loading={loading} error={error} onRetry={reload}>
        {data ? <DuesBody slug={slug} data={data} reload={reload} /> : null}
      </State>
    </Shell>
  );
}

function DuesBody({ slug, data, reload }: { slug: string; data: Dues; reload: () => void }) {
  const s = data.statement;
  const behind = s.periods.filter((p) => p.state !== "paid");
  const current = s.periods.find((p) => p.current);
  const picks: Pick[] = [];
  if (s.outstanding > 0) {
    picks.push({ key: "all", title: `Everything due · ${formatGhs(s.outstanding)}`, detail: behind.length > 1 ? `Clears ${behind.map((p) => p.label).join(" and ")}` : `Clears ${behind[0]?.label ?? "what is due"}`, amount: s.outstanding });
    const oldest = behind[0];
    if (behind.length > 1 && oldest) picks.push({ key: "oldest", title: `${oldest.label} only · ${formatGhs(oldest.due - oldest.paid)}`, detail: "The oldest first, the rest later", amount: oldest.due - oldest.paid });
  } else if (s.rate > 0) {
    picks.push({ key: "ahead", title: `Pay ${s.period === "month" ? "next month" : "next year"} ahead · ${formatGhs(s.rate)}`, detail: "It counts the moment the new period starts", amount: s.rate });
  }
  const [picked, setChoice] = useState(picks[0]?.key ?? "other");
  // After a payment the choices change (everything due becomes pay ahead); fall back to the first.
  const choice = picked === "other" || picks.some((p) => p.key === picked) ? picked : picks[0]?.key ?? "other";
  const [other, setOther] = useState("");
  const [open, setOpen] = useState(false);
  const amount = choice === "other" ? parseCedisToPesewas(other) ?? 0 : picks.find((p) => p.key === choice)?.amount ?? 0;

  if (!data.open) {
    return (
      <header className="rise">
        <Kicker>Dues</Kicker>
        <h1 className="display-lg mt-3">No dues are set yet.</h1>
        <p className="mt-3 max-w-[46ch] text-muted">When the executive sets the year group’s dues, what you owe and what you have paid will show here.</p>
      </header>
    );
  }

  const status = (
    <div className={`rise rise-1 border p-6 sm:p-7 ${s.outstanding > 0 ? "border-ink bg-card" : "border-paid bg-paid-soft"}`}>
      {s.outstanding > 0 ? (
        <>
          <p className="kicker kicker-red">Due now</p>
          <p className="figure mt-3 text-[3.25rem] sm:text-[4rem]">{formatGhs(s.outstanding)}</p>
          <p className="mt-2 text-[15px] text-muted">For {behind.map((p) => p.label).join(" and ")} · dues are {formatGhs(s.rate)} {per(s.period)}</p>
        </>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="kicker" style={{ color: "var(--paid)" }}>All paid up</p>
            <p className="figure mt-3 text-[2.5rem]">Thank you.</p>
            <p className="mt-2 text-[15px] text-ink-2">
              Paid through {current?.label ?? s.periods[s.periods.length - 1]?.label}
              {s.ahead > 0 ? <>, with {formatGhs(s.ahead)} paid ahead</> : null}.
            </p>
          </div>
          <span className="stamp stamp-paid shrink-0">Paid up</span>
        </div>
      )}
      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-4 text-[15px]">
        <div><dt className="text-[13px] text-muted">Asked since {data.since ? new Date(data.since).getFullYear() : ""}</dt><dd className="mt-1 font-semibold tabular-nums">{formatGhs(s.owed)}</dd></div>
        <div><dt className="text-[13px] text-muted">You have paid</dt><dd className="mt-1 font-semibold text-paid tabular-nums">{formatGhs(s.paid)}</dd></div>
      </dl>
    </div>
  );

  const pay = data.verified ? (
    <section className="rise rise-2" aria-labelledby="pay-dues">
      <h2 id="pay-dues" className="display-sm">{s.outstanding > 0 ? "Pay your dues" : "Pay ahead"}</h2>
      <div className="mt-4 space-y-2">
        {picks.map((p) => <Choice key={p.key} title={p.title} detail={p.detail} selected={choice === p.key} onClick={() => setChoice(p.key)} />)}
        <Choice title="Another amount" detail="Pay part now; it goes to the oldest period first" selected={choice === "other"} onClick={() => setChoice("other")} />
        {choice === "other" ? (
          <label className="relative block">
            <span className="sr-only">Amount in cedis</span>
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-muted">GH₵</span>
            <input autoFocus inputMode="decimal" value={other} onChange={(e) => setOther(e.target.value)} placeholder="100" className="input pl-16 text-lg" />
          </label>
        ) : null}
      </div>
      <button type="button" className="btn btn-red btn-block mt-5" disabled={amount < 100} onClick={() => setOpen(true)}>
        {amount >= 100 ? `Pay ${formatGhs(amount)}` : "Choose an amount"}
      </button>
      <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[12px] text-muted"><ShieldCheck className="size-3.5" /> Mobile money or card. The receipt comes straight back.</p>
    </section>
  ) : (
    <div className="space-y-3">
      <Callout tone="red">
        <p className="font-semibold">Paying opens once your place is confirmed.</p>
        <p className="mt-1 text-muted">Two cot mates, or an executive, confirm that you are you. Your dues still show here.</p>
      </Callout>
      <DemoConfirm slug={slug} onDone={reload} />
    </div>
  );

  return (
    <div>
      <header className="rise mb-7 lg:mb-10">
        <Kicker>Dues</Kicker>
        <h1 className="display-lg mt-3">Your dues</h1>
        <p className="mt-3 max-w-[52ch] text-[15px] text-muted">{data.story || "What keeps the year group able to meet, write and show up."}</p>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
        <div className="min-w-0 space-y-10">
          {status}
          <div className="lg:hidden">{pay}</div>

          <Section title="Year by year">
            <ul className="ruled-list border-b border-line">
              {[...s.periods].reverse().map((p) => (
                <li key={p.key} className="flex items-center gap-4 py-4">
                  <span className={`grid size-11 shrink-0 place-items-center border ${p.state === "paid" ? "border-paid bg-paid-soft text-paid" : p.state === "part" ? "border-ink" : "border-crimson text-crimson-ink"}`}>
                    <CalendarCheck className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-semibold tracking-[-0.01em]">{p.label}{p.current ? <span className="ml-2 font-mono text-[10.5px] font-medium tracking-widest text-muted uppercase">This {s.period}</span> : null}</span>
                    <span className="block text-[13px] text-muted tabular-nums">
                      {p.state === "paid" ? `${formatGhs(p.due)} paid` : p.state === "part" ? `${formatGhs(p.paid)} of ${formatGhs(p.due)} paid` : `${formatGhs(p.due)} not yet paid`}
                    </span>
                  </span>
                  <Pill tone={p.state === "paid" ? "paid" : p.state === "part" ? "ink" : "red"}>{p.state === "paid" ? "Paid" : p.state === "part" ? "Part paid" : "Due"}</Pill>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] text-muted">Payments go to the oldest period first. Only payments the gateway has confirmed are counted.</p>
          </Section>

          <Section title="Dues payments" id="dues-receipts">
            {data.history.length === 0 ? <p className="py-4 text-muted">None yet. Your first dues receipt will appear here.</p> : null}
            <ul className="ruled-list">
              {data.history.map((h) => (
                <li key={h.id}>
                  <Link href={h.receipt ? `/r/${h.receipt}` : "#"} className="flex items-center gap-4 py-3.5 hover:bg-sunk/40">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium">{new Date(h.at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                      <span className="block font-mono text-[12px] text-muted">{h.receipt ?? "Receipt on its way"}</span>
                    </span>
                    <span className="text-[15px] font-semibold tabular-nums"><Money value={h.amount} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-12 border border-line bg-card p-7">{pay}</div>
        </aside>
      </div>

      <PaySheet slug={slug} data={data} amount={amount} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

/** The check before paying: what you pay, what reaches the dues, and whether you cover the fee. */
function PaySheet({ slug, data, amount, open, onClose }: { slug: string; data: Dues; amount: number; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [cover, setCover] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const quote = amount >= 100 && data.purposeId ? planCollection({ gift: amount, gatewayBps: data.gatewayFeeBps, platformBps: data.platformFeeBps, coverFees: cover }) : null;

  async function pay() {
    if (!quote || !data.purposeId) return;
    setBusy(true);
    setErr("");
    try {
      const res = await startPayment({
        data: { slug, purposeId: data.purposeId, giftPesewas: amount, coverFees: cover, anonymous: false, pledge: false, clientRef: crypto.randomUUID().replaceAll("-", "").slice(0, 24) },
      });
      if (res.authorizationUrl) {
        window.location.assign(res.authorizationUrl);
        return;
      }
      router.push(`/o/${slug}/pay/${res.intentId}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "The payment did not start.");
      setBusy(false);
    }
  }

  return (
    <Sheet open={open && !!quote} onClose={onClose} title="Check your payment" label="Check your dues payment">
      {quote ? (
        <>
          <dl className="space-y-2.5 text-[15px]">
            <div className="flex justify-between gap-3"><dt>Towards your dues</dt><dd className="font-medium tabular-nums">{formatGhs(quote.gift)}</dd></div>
            <div className="flex justify-between gap-3 text-muted"><dt>Gateway and platform fee</dt><dd className="tabular-nums">{formatGhs(quote.gatewayFee + quote.platformFee)}</dd></div>
            <div className="flex justify-between gap-3 border-t border-line pt-3 text-[17px] font-semibold"><dt>You pay now</dt><dd className="tabular-nums">{formatGhs(quote.charge)}</dd></div>
          </dl>
          <div className="mt-4 border-y border-line">
            <Toggle on={cover} set={setCover} title="Add the fee on top" detail={cover ? "Your dues are counted in full." : "The fee is paid from the year group’s funds."} />
          </div>
          {err ? <p role="alert" className="mt-4 border-l-[3px] border-crimson bg-paper px-4 py-3 text-sm">{err}</p> : null}
          <button type="button" className="btn btn-red btn-block mt-6" disabled={busy} onClick={pay}>
            <Lock className="size-4" /> {busy ? "Opening checkout…" : `Pay ${formatGhs(quote.charge)}`}
          </button>
          <p className="mt-3 text-center text-[12px] text-muted">Only the gateway’s confirmation marks it paid.</p>
        </>
      ) : null}
    </Sheet>
  );
}
