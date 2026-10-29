"use client";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DemoConfirm } from "@/components/hub/demo-confirm";
import { Shell } from "@/components/hub/shell";
import { useOrgFace } from "@/components/hub/org-context";
import { Back, Callout, Choice, Money, Sheet, State, Toggle } from "@/components/hub/ui";
import { wholeCedis } from "@/lib/hub/words-money";
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
  const org = useOrgFace();
  const s = data.statement;
  const behind = s.periods.filter((p) => p.state !== "paid");
  const current = s.periods.find((p) => p.current);
  const picks: Pick[] = [];
  if (s.outstanding > 0) {
    picks.push({ key: "all", title: `All that is due · ${formatGhs(s.outstanding)}`, detail: `Clears ${behind.map((p) => p.label).join(" and ")}`, amount: s.outstanding });
    const oldest = behind[0];
    if (behind.length > 1 && oldest) picks.push({ key: "oldest", title: `${oldest.label} first · ${formatGhs(oldest.due - oldest.paid)}`, detail: "The oldest year now, the rest later", amount: oldest.due - oldest.paid });
  } else if (s.rate > 0) {
    picks.push({ key: "ahead", title: `${s.period === "month" ? "Next month" : "Next year"}, ahead · ${formatGhs(s.rate)}`, detail: "Counted the day the new period opens", amount: s.rate });
  }
  const [picked, setChoice] = useState(picks[0]?.key ?? "other");
  // After a payment the choices change (all that is due becomes paying ahead); fall back to the first.
  const choice = picked === "other" || picks.some((p) => p.key === picked) ? picked : picks[0]?.key ?? "other";
  const [other, setOther] = useState("");
  const [open, setOpen] = useState(false);
  const amount = choice === "other" ? parseCedisToPesewas(other) ?? 0 : picks.find((p) => p.key === choice)?.amount ?? 0;

  if (!data.open) {
    return (
      <header className="rise">
        <p className="kicker">Dues</p>
        <h1 className="display-lg mt-4">No dues are set yet.</h1>
        <p className="mt-4 max-w-[44ch] font-display text-[1.3rem] leading-snug italic text-muted">When the Financial Secretary sets the year’s dues, your ledger opens here.</p>
      </header>
    );
  }

  const owing = s.outstanding > 0;
  const since = data.since ? new Date(data.since).getFullYear() : null;

  const pay = data.verified ? (
    <section className="rise rise-2" aria-labelledby="pay-dues">
      <p id="pay-dues" className="kicker">{owing ? "Settle your dues" : "Pay ahead"}</p>
      <div className="mt-4 space-y-2">
        {picks.map((p) => <Choice key={p.key} title={p.title} detail={p.detail} selected={choice === p.key} onClick={() => setChoice(p.key)} />)}
        <Choice title="Another amount" detail="Goes to the oldest year first" selected={choice === "other"} onClick={() => setChoice("other")} />
        {choice === "other" ? (
          <label className="relative block">
            <span className="sr-only">Amount in cedis</span>
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-muted">GH₵</span>
            <input autoFocus inputMode="decimal" value={other} onChange={(e) => setOther(e.target.value)} placeholder="100" className="input pl-16 text-lg" />
          </label>
        ) : null}
      </div>
      <button type="button" className={`btn btn-block mt-5 ${owing ? "btn-red" : "btn-primary"}`} disabled={amount < 100} onClick={() => setOpen(true)}>
        {amount >= 100 ? `Pay ${formatGhs(amount)}` : "Choose an amount"}
      </button>
      <p className="mt-3 text-center font-display text-[1rem] italic text-muted">Mobile money or card. Your receipt comes back at once.</p>
    </section>
  ) : (
    <div className="space-y-3">
      <Callout tone="red">
        <p className="font-semibold">Paying opens once your place is confirmed.</p>
        <p className="mt-1 text-muted">Two of your cot mates, or an executive, will vouch for you. Your ledger still shows here.</p>
      </Callout>
      <DemoConfirm slug={slug} onDone={reload} />
    </div>
  );

  return (
    <div>
      <header className="rise mb-9 lg:mb-12">
        <p className="kicker">Dues{since ? ` · since ${since}` : ""}</p>
        <h1 className="display-lg mt-4">Your dues</h1>
        <p className="mt-4 max-w-[46ch] font-display text-[1.3rem] leading-snug italic text-ink-2">
          {data.story || "What keeps the year group able to meet, to write and to turn up for one another."}
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
        <div className="min-w-0 space-y-12">
          {/* Where you stand, lettered on the board */}
          <section className="board framed rise rise-1 border border-[#3a332a] px-6 pt-8 pb-7 sm:px-8" aria-label="Where you stand">
            {owing ? (
              <>
                <p className="kicker" style={{ color: "#ec7e83" }}>Outstanding</p>
                <p className="figure mt-4 text-[3.6rem] text-ink sm:text-[4.5rem]">{formatGhs(s.outstanding)}</p>
                <p className="mt-3 text-[1rem] text-ink-2">For {behind.map((p) => p.label).join(" and ")}. Dues are {formatGhs(s.rate)} {per(s.period)}.</p>
              </>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="kicker">Paid up</p>
                  <p className="mt-4 font-display text-[2.6rem] leading-none italic text-ink">Thank you{org?.me?.nickname ? `, ${org.me.nickname}` : ""}.</p>
                  <p className="mt-3 text-[1rem] text-ink-2">
                    Your dues are settled through {current?.label ?? s.periods[s.periods.length - 1]?.label}
                    {s.ahead > 0 ? <>, with {formatGhs(s.ahead)} paid ahead</> : null}.
                  </p>
                </div>
                <span className="stamp shrink-0" style={{ color: "#c9a45c" }}>Settled</span>
              </div>
            )}
          </section>

          <div className="lg:hidden">{pay}</div>

          {/* The ledger, on paper */}
          <section className="slip rise rise-2 px-5 pt-6 pb-5 shadow-[0_18px_40px_-24px_rgba(0,0,0,.5)] sm:px-7" aria-labelledby="ledger">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="ledger" className="kicker text-ink-2">The ledger</h2>
              <p className="font-display text-[1rem] italic text-muted">{org?.name}</p>
            </div>
            <table className="mt-4 w-full text-[0.98rem]">
              <thead>
                <tr className="border-y border-ink text-left">
                  <th className="py-2 pr-2 text-[0.68rem] font-semibold tracking-[0.18em] uppercase">Year</th>
                  <th className="py-2 pr-2 text-right text-[0.68rem] font-semibold tracking-[0.18em] uppercase">Asked</th>
                  <th className="py-2 pr-2 text-right text-[0.68rem] font-semibold tracking-[0.18em] uppercase">Paid</th>
                  <th className="py-2 text-right text-[0.68rem] font-semibold tracking-[0.18em] uppercase">Owed</th>
                </tr>
              </thead>
              <tbody>
                {s.periods.map((p) => (
                  <tr key={p.key} className="border-b border-line">
                    <td className="py-3 pr-2">
                      <span className="font-display text-[1.25rem] font-semibold">{p.label}</span>
                      {p.current ? <span className="ml-2 font-display text-[0.95rem] italic text-muted">this {s.period}</span> : null}
                    </td>
                    <td className="py-3 pr-2 text-right tabular-nums">{wholeCedis(p.due)}</td>
                    <td className="py-3 pr-2 text-right tabular-nums">{p.paid ? wholeCedis(p.paid) : "–"}</td>
                    <td className={`py-3 text-right font-semibold tabular-nums ${p.state === "paid" ? "text-paid" : "text-crimson-ink"}`}>
                      {p.state === "paid" ? "Settled" : wholeCedis(p.due - p.paid)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-[3px] border-double border-ink">
                  <td className="py-3 pr-2 text-[0.68rem] font-semibold tracking-[0.18em] uppercase">Total</td>
                  <td className="py-3 pr-2 text-right font-semibold tabular-nums">{wholeCedis(s.owed)}</td>
                  <td className="py-3 pr-2 text-right font-semibold tabular-nums">{wholeCedis(Math.min(s.paid, s.owed))}</td>
                  <td className={`py-3 text-right font-semibold tabular-nums ${owing ? "text-crimson-ink" : "text-paid"}`}>{wholeCedis(s.outstanding)}</td>
                </tr>
              </tfoot>
            </table>
            <p className="mt-3 text-[0.88rem] text-muted">Each payment settles the oldest year first. Only payments the gateway has confirmed are entered.</p>
          </section>

          <section aria-labelledby="dues-receipts">
            <div className="moulding" aria-hidden />
            <h2 id="dues-receipts" className="kicker pt-3 text-ink-2">Your dues receipts</h2>
            {data.history.length === 0 ? <p className="mt-4 font-display text-[1.2rem] italic text-muted">None yet. Your first dues receipt will be entered here.</p> : null}
            <ul className="mt-3">
              {data.history.map((h) => (
                <li key={h.id}>
                  <Link href={h.receipt ? `/r/${h.receipt}` : "#"} className="leader min-h-12 py-2 text-[1rem] hover:text-gilt">
                    <span>{new Date(h.at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                    <span className="dots" aria-hidden />
                    <span className="hidden text-[0.85rem] tracking-[0.08em] text-muted sm:inline">{h.receipt ?? "receipt on its way"}</span>
                    <span className="font-semibold tabular-nums"><Money value={h.amount} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-14">{pay}</div>
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
