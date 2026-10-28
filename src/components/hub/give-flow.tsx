"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { purposeDetail, purposeList, startPayment } from "@/lib/hub/api";
import { planCollection, parseCedisToPesewas } from "@/lib/hub/money";
import { Shell } from "@/components/hub/shell";
import { Back, Bar, Button, Field, Money, Note, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";

export function GiveList({ slug }: { slug: string }) {
  const { data, error, loading } = useHub(`give-${slug}`, () => purposeList({ data: slug }));
  return (
    <Shell slug={slug}>
      <State loading={loading} error={error}>
        <h1 className="font-display text-4xl">Give</h1>
        <Note>The screen asks. Only a verified gateway event marks a gift as paid. This hub is in test mode, so nothing here is real money.</Note>
        <div className="mt-5 space-y-3">
          {data?.purposes.filter((p) => p.type !== "other").map((p) => (
            <Link key={p.id} href={`/o/${slug}/give/${p.id}`} className="block rounded-3xl border border-line bg-card p-4">
              <p className="text-xs tracking-widest text-gold uppercase">{p.type}</p>
              <h2 className="font-display text-2xl">{p.title}</h2>
              {p.target > 0 ? (
                <p className="mt-2 text-sm text-muted"><Money value={p.raised} /> of <Money value={p.target} /></p>
              ) : null}
            </Link>
          ))}
        </div>
      </State>
    </Shell>
  );
}

export function GivePurpose({ slug, purposeId }: { slug: string; purposeId: string }) {
  const router = useRouter();
  const { data, error, loading } = useHub(`p-${purposeId}`, () => purposeDetail({ data: { slug, id: purposeId } }));
  const [step, setStep] = useState<"amount" | "review">("amount");
  const [amount, setAmount] = useState("");
  const [cover, setCover] = useState(false);
  const [anon, setAnon] = useState(false);
  const [pledge, setPledge] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const pesewas = parseCedisToPesewas(amount);
  const quote = data && pesewas
    ? planCollection({ gift: pesewas, gatewayBps: data.gatewayFeeBps, platformBps: data.platformFeeBps, coverFees: cover })
    : null;

  async function pay() {
    if (!pesewas || !data) return;
    setBusy(true);
    setErr("");
    try {
      const res = await startPayment({
        data: {
          slug,
          purposeId,
          giftPesewas: pesewas,
          coverFees: cover,
          anonymous: anon,
          pledge,
          clientRef: crypto.randomUUID().replaceAll("-", "").slice(0, 24),
        },
      });
      if (res.authorizationUrl) {
        window.location.href = res.authorizationUrl; // the live gateway's own page
        return;
      }
      router.push(`/o/${slug}/pay/${res.intentId}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "The payment did not start.");
      setBusy(false);
    }
  }

  return (
    <Shell slug={slug} nav={false}>
      <Back href={`/o/${slug}/give`} label="Give" />
      <State loading={loading} error={error}>
        {data && step === "amount" ? (
          <section className="space-y-4">
            <h1 className="font-display text-4xl">{data.title}</h1>
            <p>{data.story}</p>
            {data.target > 0 ? <Bar value={data.raised} max={data.target} /> : null}
            <Field label="Amount in cedis" value={amount} inputMode="decimal" onChange={setAmount} placeholder="200" />
            <Button disabled={!quote} onClick={() => setStep("review")}>Review</Button>
            {data.hero && data.boards ? <Boards houses={data.boards.houses} classes={data.boards.classes} min={data.boards.minGivers} /> : null}
          </section>
        ) : null}
        {data && quote && step === "review" ? (
          <section className="space-y-4">
            <h1 className="font-display text-4xl">Check this.</h1>
            <ul className="space-y-2 rounded-3xl border border-line bg-card p-4">
              <li className="flex justify-between"><span>Gift</span><Money value={quote.gift} /></li>
              <li className="flex justify-between text-sm text-muted"><span>Gateway fee</span><Money value={quote.gatewayFee} /></li>
              <li className="flex justify-between text-sm text-muted"><span>Platform fee</span><Money value={quote.platformFee} /></li>
              <li className="flex justify-between font-medium"><span>You pay</span><Money value={quote.charge} /></li>
            </ul>
            <Toggle on={cover} label="I will cover the fees" set={setCover} />
            <Toggle on={anon} label="Give without my name" set={setAnon} />
            <Toggle on={pledge} label="Pledge it in three parts. Pay the first today." set={setPledge} />
            <Note>Anonymous gifts still count for a house or class, once at least {data.boards?.minGivers ?? 5} people have given. Only the treasurer can see the name.</Note>
            {err ? <p className="text-sm text-crimson">{err}</p> : null}
            <Button disabled={busy} onClick={pay}>{busy ? "Starting" : "Continue to pay"}</Button>
            <button type="button" className="h-12 text-sm text-muted" onClick={() => setStep("amount")}>Back</button>
          </section>
        ) : null}
      </State>
    </Shell>
  );
}

function Toggle({ on, label, set }: { on: boolean; label: string; set: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => set(!on)} className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-line bg-card px-4 text-left">
      <span>{label}</span>
      <span className={`rounded-full px-3 py-1 text-sm ${on ? "bg-crimson text-on-crimson" : "bg-line"}`}>{on ? "Yes" : "No"}</span>
    </button>
  );
}

function Boards({
  houses,
  classes,
  min,
}: {
  houses: { id: string; name: string; shown: boolean; total: number | null }[];
  classes: { id: string; name: string; shown: boolean; total: number | null }[];
  min: number;
}) {
  return (
    <div className="space-y-4 pt-4">
      <Board title="Houses" rows={houses} min={min} />
      <Board title="Classes" rows={classes} min={min} />
    </div>
  );
}

function Board({ title, rows, min }: { title: string; rows: { id: string; name: string; shown: boolean; total: number | null }[]; min: number }) {
  const top = Math.max(...rows.map((r) => r.total ?? 0), 1);
  return (
    <section>
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="text-sm text-muted">Group totals only. Under {min} givers, the total stays hidden.</p>
      <ul className="mt-3 space-y-3">
        {rows.map((r) => (
          <li key={r.id}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{r.name}</span>
              <span className="tabular-nums">{r.shown && r.total != null ? <Money value={r.total} /> : "Not enough givers"}</span>
            </div>
            <Bar value={r.shown ? r.total ?? 0 : 0} max={top} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PayScreen({ slug, intentId }: { slug: string; intentId: string }) {
  const { data, error, loading } = useHub(`pay-${intentId}`, async () => {
    const { intentState } = await import("@/lib/hub/api");
    return intentState({ data: { slug, id: intentId } });
  });
  const [view, setView] = useState<typeof data>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const current = view ?? data;

  const keep = (next: NonNullable<typeof data> extends infer D ? Partial<D> : never) =>
    setView((prev) => ({ ...(prev ?? data)!, ...next }) as NonNullable<typeof data>);

  async function simulate() {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setErr("A gift needs a connection. It is not saved to send later.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const { testGateway } = await import("@/lib/hub/api");
      keep(await testGateway({ data: { slug, id: intentId } }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "The gateway did not confirm it.");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setErr("");
    try {
      const { verifyIntent } = await import("@/lib/hub/api");
      keep(await verifyIntent({ data: { slug, id: intentId } }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "We could not check with the gateway just now.");
    }
  }

  // While a live payment is pending, ask the gateway every few seconds; the member does not have to press anything.
  useEffect(() => {
    if (current?.status !== "pending" || current.provider !== "paystack") return;
    const timer = window.setInterval(() => void verify(), 6000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.status, current?.provider]);

  return (
    <Shell slug={slug} nav={false}>
      <State loading={loading} error={error}>
        {current ? (
          <section className="space-y-4">
            <p className="text-xs tracking-widest text-gold uppercase">{current.status}</p>
            <h1 className="font-display text-4xl">{current.title}</h1>
            <p className="font-display text-3xl tabular-nums"><Money value={current.charge} /></p>
            <p className="text-sm text-muted">Reference {current.reference}</p>
            {current.status === "pending" && current.provider === "paystack" && current.authorizationUrl ? (
              <a className="inline-flex h-12 items-center rounded-2xl bg-crimson px-5 text-white" href={current.authorizationUrl}>Continue to the payment page</a>
            ) : null}
            {current.status === "pending" && current.canSimulate ? (
              <>
                <Note>Demonstration only. This posts the real ledger rules and moves no cedis. It is switched off on a live hub.</Note>
                <Button disabled={busy} onClick={simulate}>{busy ? "Waiting for the gateway" : "Pay with test mobile money"}</Button>
              </>
            ) : null}
            {current.status === "pending" ? (
              <Button tone="quiet" onClick={verify}>I have paid, but it still shows pending</Button>
            ) : null}
            {current.status === "succeeded" ? (
              <div className="rounded-3xl border border-line bg-card p-4">
                <p>The gateway confirmed it. Thank you.</p>
                {current.receipt ? <Link className="mt-2 inline-block text-crimson" href={`/r/${current.receipt}`}>Receipt {current.receipt}</Link> : null}
              </div>
            ) : null}
            {current.status === "failed" || current.status === "abandoned" ? (
              <p className="text-sm text-muted">This payment did not go through and nothing was taken. You can start again from Give.</p>
            ) : null}
            {err ? <p className="text-sm text-crimson">{err}</p> : null}
            <Link href={`/o/${slug}/home`} className="inline-flex h-12 items-center text-sm text-muted">Home</Link>
          </section>
        ) : null}
      </State>
    </Shell>
  );
}
