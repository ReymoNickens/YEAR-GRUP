"use client";
import { accountName, expenseState, memberState, refundState } from "@/lib/hub/words";
import { Download, Plus, Scale } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { stepUpConfirm, stepUpStart } from "@/lib/hub/api";
import { hubAct } from "@/lib/hub/act";
import { formatGhs, parseCedisToPesewas } from "@/lib/hub/money";
import { Button, Field, Money, Note, Pill } from "@/components/hub/ui";

type Reload = () => void;
const FRESH = /fresh text-message code/i;
const msg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

/**
 * Run an action that may need a fresh code. If the server says it does, show the
 * code panel for that action, and run the action again once the code is accepted.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the CONFIRM phrase stays a server-side test convenience
function useStepUp(slug: string, testMode: boolean) {
  const [pending, setPending] = useState<null | { action: string }>(null);
  const [sent, setSent] = useState<null | { masked: string; devCode: string | null }>(null);
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const retry = useRef<null | (() => Promise<void>)>(null);
  const phrase = useRef(""); // read by the retry closure, so it must not go stale

  async function run(action: string, fn: (phrase?: string) => Promise<void>) {
    retry.current = () => fn(phrase.current || undefined);
    try {
      await fn(phrase.current || undefined);
      setPending(null);
      setNote("");
    } catch (e) {
      if (FRESH.test(msg(e, ""))) {
        setPending({ action });
        setNote("");
      } else setNote(msg(e, "That did not go through."));
    }
  }

  async function send() {
    if (!pending) return;
    setBusy(true);
    try {
      const out = await stepUpStart({ data: { slug, action: pending.action } });
      setSent({ masked: out.masked, devCode: out.devCode });
      if (out.devCode) setCode(out.devCode);
      setNote("");
    } catch (e) {
      setNote(msg(e, "We could not send the code."));
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!pending) return;
    setBusy(true);
    try {
      const out = await stepUpConfirm({ data: { slug, action: pending.action, code } });
      if (!out.ok) {
        setNote(out.message);
        return;
      }
      setCode("");
      setSent(null);
      setPending(null);
      await retry.current?.();
    } catch (e) {
      setNote(msg(e, "That did not go through."));
    } finally {
      setBusy(false);
    }
  }

  const close = () => { setPending(null); setSent(null); setCode(""); };
  const panel: ReactNode = pending ? (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="stepup-title">
      <div className="w-full max-w-lg animate-[sheet_260ms_ease-out_both] space-y-3 bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-line" aria-hidden />
        <p id="stepup-title" className="display-sm">A fresh code first</p>
        <Note>This moves money or changes roles, so we check it is you with a code sent to your phone.</Note>
        {!sent ? (
          <Button disabled={busy} onClick={send}>{busy ? "Sending…" : "Text me a code"}</Button>
        ) : (
          <>
            <p className="text-sm text-muted">Sent to {sent.masked}.</p>
            {sent.devCode ? (
              <p className="border-l-[3px] border-ink bg-card px-4 py-3 text-sm">Preview: in real use this code arrives by text. It is filled in for you.</p>
            ) : null}
            <Field label="Code" value={code} inputMode="numeric" autoComplete="one-time-code" autoFocus onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))} />
            <Button disabled={busy || code.length < 6} onClick={confirm}>{busy ? "Checking…" : "Confirm and continue"}</Button>
          </>
        )}
        {note ? <p role="alert" className="text-sm text-crimson-ink">{note}</p> : null}
        <button type="button" className="h-12 w-full text-sm text-muted" onClick={close}>Cancel</button>
      </div>
    </div>
  ) : null;

  return { run, panel, note, setNote };
}

const badge = "inline-flex h-6 items-center border border-line-2 px-2 font-mono text-[10.5px] tracking-[0.08em] uppercase";

export function People({ bag, slug, reload }: { bag: Record<string, unknown>; slug: string; reload: Reload }) {
  const counts = (bag.counts as { status: string; n: number }[]) ?? [];
  const imports = (bag.imports as { id: string; name: string; status: string; note: string; issues: string[] }[]) ?? [];
  const claims = (bag.claims as { id: string; display_name: string; cot: string | null; dorm: string | null; house: string | null; confirmations: number }[]) ?? [];
  const nodes = (bag.aliasNodes as { id: string; name: string; level: string }[]) ?? [];
  const canReview = bag.canReview === true;
  const [note, setNote] = useState("");
  const [alias, setAlias] = useState({ nodeId: "", text: "" });
  const [notDup, setNotDup] = useState<Record<string, boolean>>({});

  async function act(fn: () => Promise<unknown>, ok: string) {
    try { await fn(); setNote(ok); reload(); } catch (e) { setNote(msg(e, "That did not work.")); }
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    const csv = await file.text();
    await act(async () => {
      const r = (await hubAct({ data: { type: "import_upload", slug, csv, fileName: file.name } })) as { rows: number; counts: Record<string, number> };
      setNote(`${r.rows} rows read. ${Object.entries(r.counts).map(([k, v]) => `${v} ${k.replace("_", " ")}`).join(", ")}.`);
    }, "");
  }

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 border-t border-l border-line sm:grid-cols-4">
        {counts.map((c) => <div key={c.status} className="border-r border-b border-line p-4"><dt className="text-[13px] text-muted">{memberState(c.status)}</dt><dd className="figure mt-2 text-[2rem]">{c.n}</dd></div>)}
      </dl>
      <Note>{String(bag.missingPlacement ?? 0)} members have no house and no escape option.</Note>

      <h2 className="display-sm pt-4">Waiting to be confirmed</h2>
      {claims.length === 0 ? <Note>No one is waiting.</Note> : null}
      {claims.map((c) => (
        <article key={c.id} className="border border-line bg-card p-5">
          <h3 className="text-[17px] font-semibold tracking-[-0.01em]">{c.display_name}</h3>
          <p className="text-sm text-muted">{[c.house, c.dorm, c.cot ? `cot ${c.cot}` : null].filter(Boolean).join(" · ") || "No placement on record"} · {c.confirmations} confirmed so far</p>
          <Button tone="quiet" onClick={() => act(() => hubAct({ data: { type: "confirm", slug, membershipId: c.id } }), "Confirmation recorded.")}>Confirm this is them</Button>
        </article>
      ))}

      {canReview ? (
        <>
          <h2 className="display-sm pt-4">Member list</h2>
          <label className="flex h-12 cursor-pointer items-center justify-center border border-line-2">
            Upload a CSV
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => void upload(e.target.files?.[0])} />
          </label>
          <Note>Columns are matched by their heading: name, phone, house, dorm, cot, class, profession, city. Nothing is guessed. Problems are listed on each row.</Note>
          {imports.map((row) => {
            const reviewable = ["normalised", "suspected_duplicate", "needs_review"].includes(row.status);
            return (
              <article key={row.id} className="border border-line bg-card p-5">
                <p className="kicker">{row.status.replace("_", " ")}</p>
                <h3 className="text-[17px] font-semibold tracking-[-0.01em]">{row.name}</h3>
                <div className="mt-1 flex flex-wrap gap-1">{row.issues.map((i) => <span key={i} className={badge}>{i.replaceAll("_", " ")}</span>)}</div>
                <p className="mt-1 text-sm text-muted">{row.note}</p>
                {row.status === "suspected_duplicate" ? (
                  <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={notDup[row.id] === true} onChange={(e) => setNotDup({ ...notDup, [row.id]: e.target.checked })} /> This is not the same person</label>
                ) : null}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {reviewable ? (
                    <button type="button" className="btn-primary" onClick={() => act(() => hubAct({ data: { type: "import_review", slug, importId: row.id, to: "approved", notDuplicate: notDup[row.id] === true } }), "Approved. An unclaimed place is waiting.")}>Approve</button>
                  ) : null}
                  {row.status === "approved" ? (
                    <button type="button" className="btn-primary" onClick={() => act(() => hubAct({ data: { type: "import_review", slug, importId: row.id, to: "invited" } }), "Invitation queued.")}>Invite by text</button>
                  ) : null}
                  {reviewable || row.status === "approved" ? (
                    <button type="button" className="btn-quiet" onClick={() => act(() => hubAct({ data: { type: "import_review", slug, importId: row.id, to: "needs_review" } }), "Sent back for review.")}>Send back</button>
                  ) : null}
                </div>
              </article>
            );
          })}
          <h2 className="display-sm pt-4">Another name for a house or class</h2>
          <select className="input" value={alias.nodeId} onChange={(e) => setAlias({ ...alias, nodeId: e.target.value })}>
            <option value="">Choose one</option>
            {nodes.map((n) => <option key={n.id} value={n.id}>{n.name} ({n.level})</option>)}
          </select>
          <Field label="Other name" value={alias.text} onChange={(text) => setAlias({ ...alias, text })} />
          <Button tone="quiet" disabled={!alias.nodeId || alias.text.trim().length < 2} onClick={() => act(() => hubAct({ data: { type: "alias", slug, nodeId: alias.nodeId, alias: alias.text } }), "Saved. Future imports will use it.")}>Save the name</Button>
        </>
      ) : null}
      {note ? <p className="text-sm">{note}</p> : null}
    </div>
  );
}

type Row = { id: string; amount: number; memo?: string; reason?: string; status: string; requester: string; mine: boolean; method?: string };

export function MoneyDesk({ bag, slug, reload }: { bag: Record<string, unknown>; slug: string; reload: Reload }) {
  const accounts = (bag.accounts as Record<string, number>) ?? {};
  const expenses = (bag.expenses as Row[]) ?? [];
  const refunds = (bag.refunds as Row[]) ?? [];
  const payments = (bag.payments as { id: string; reference: string; charge: number; who: string; refundable: number }[]) ?? [];
  const ledger = (bag.ledger as { account: string; direction: string; amount: number; memo: string; who: string }[]) ?? [];
  const unsettled = (bag.unsettled as { n: number; net: number }) ?? { n: 0, net: 0 };
  const isTreasurer = bag.isTreasurer === true;
  const isExec = bag.isExec === true;
  const canApprove = bag.canApproveExpenses === true;
  const live = bag.paymentMode === "live";
  const step = useStepUp(slug, bag.testStepUp === true);
  const [check, setCheck] = useState<null | { ok: boolean; unbalanced: number; clearing: { actual: number; expected: number }; gateway: { checked: number; skipped: boolean; mismatches: { reference: string; problem: string }[] } }>(null);
  const [form, setForm] = useState({ payment: "", amount: "", reason: "", method: "gateway", expenseMemo: "", expenseAmount: "", bankRef: "" });
  const [manualRef, setManualRef] = useState<Record<string, string>>({});
  const [payRef, setPayRef] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"overview" | "expenses" | "refunds" | "ledger">("overview");

  const go = (action: string, type: string, body: Record<string, unknown>, done: string) =>
    step.run(action, async (phrase) => {
      await hubAct({ data: { type, slug, phrase, ...body } });
      step.setNote(done);
      reload();
    });

  const waitingExpenses = expenses.filter((e) => ["submitted", "partially_approved"].includes(e.status)).length;
  const waitingRefunds = refunds.filter((r) => r.status === "awaiting_approval").length;
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "expenses", label: "Expenses", count: waitingExpenses },
    { key: "refunds", label: "Refunds", count: waitingRefunds },
    { key: "ledger", label: "Ledger" },
  ] as const;
  const given = Math.abs(accounts.fund ?? 0);
  const bank = accounts.org_bank ?? 0;
  const fees = Math.abs(accounts.fees_expense ?? 0) - Math.abs(accounts.fees_recovered ?? 0);
  const clearing = accounts.clearing ?? 0;

  return (
    <div>
      {step.panel}
      <div role="tablist" aria-label="Money" className="rail -mx-5 flex gap-6 overflow-x-auto border-b border-line px-5 sm:mx-0 sm:px-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`relative flex h-12 shrink-0 items-center gap-2 text-[15px] transition-colors ${tab === t.key ? "font-semibold text-ink" : "text-muted hover:text-ink"}`}
          >
            {t.label}
            {"count" in t && t.count ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-crimson-fill px-1.5 font-mono text-[11px] text-white">{t.count}</span> : null}
            <span aria-hidden className={`absolute inset-x-0 -bottom-px h-[2px] ${tab === t.key ? "bg-ink" : "bg-transparent"}`} />
          </button>
        ))}
      </div>
      {step.note && !step.panel ? <p role="status" className="mt-5 border-l-[3px] border-paid bg-card px-4 py-3 text-sm">{step.note}</p> : null}

      {tab === "overview" ? (
        <div className="mt-6 space-y-8">
          <div className="flex items-center gap-2">
            <Pill tone={live ? "paid" : "red"}>{live ? "Live payments" : "Test payments"}</Pill>
            <span className="text-[13px] text-muted">{live ? "Every payment here was confirmed by the gateway." : "They follow the real ledger rules and move no cedis."}</span>
          </div>

          <div>
            <p className="kicker">Given so far</p>
            <p className="figure mt-3 text-[3rem] lg:text-[3.75rem]"><Money value={given} /></p>
            <p className="mt-2 text-[15px] text-muted">Fees taken <span className="font-medium text-ink tabular-nums"><Money value={Math.max(0, fees)} /></span>, shown on every receipt.</p>
          </div>

          <dl className="grid grid-cols-2 border-t border-l border-line lg:grid-cols-3">
            {[
              ["In the bank", bank, null],
              ["Waiting to settle", Math.abs(clearing), null],
              ["Pledged, not yet paid", Number(bag.outstanding ?? 0), `from ${String(bag.outstandingCount)} ${Number(bag.outstandingCount) === 1 ? "member" : "members"}`],
            ].map(([label, value, sub], i) => (
              <div key={String(label)} className={`border-r border-b border-line p-4 ${i === 2 ? "col-span-2 lg:col-span-1" : ""}`}>
                <dt className="text-[13px] text-muted">{label}</dt>
                <dd className="figure mt-2 text-[1.25rem] sm:text-[1.5rem]"><Money value={Number(value)} /></dd>
                {sub ? <dd className="mt-1 text-[13px] text-muted">{sub}</dd> : null}
              </div>
            ))}
          </dl>

          {isTreasurer && unsettled.n > 0 ? (
            <div className="space-y-3 border border-line bg-card p-5">
              <p>{unsettled.n} live payments wait for the bank: <Money value={unsettled.net} />.</p>
              <Field label="Bank settlement reference" value={form.bankRef} onChange={(bankRef) => setForm({ ...form, bankRef })} />
              <Button tone="quiet" disabled={form.bankRef.trim().length < 3} onClick={() => go("settlement", "settlement", { reference: form.bankRef }, "Settlement recorded.")}>Confirm the bank received it</Button>
            </div>
          ) : null}

          <div className="grid gap-2.5 sm:grid-cols-2">
            <a href={`/api/o/${slug}/ledger`} download className="btn btn-primary">
              <Download className="size-[18px]" />
              Download the ledger
            </a>
            <button type="button" className="btn btn-quiet" onClick={async () => { try { setCheck((await hubAct({ data: { type: "reconcile", slug } })) as never); } catch (e) { step.setNote(msg(e, "Reconciliation did not run.")); } }}>
              <Scale className="size-[18px]" />
              Check the books
            </button>
          </div>
          <Note>A spreadsheet of every line. Keep your own copy each week; each download is written to the audit log. {bag.seeNames ? "As treasurer you see the names behind anonymous gifts." : "Anonymous givers stay anonymous: only the treasurer sees their names."}</Note>
          {check ? (
            <div className={`border-l-[3px] bg-card p-5 text-sm ${check.ok ? "border-paid" : "border-crimson"}`}>
              <p className="text-[17px] font-semibold">{check.ok ? "Everything agrees." : "Something does not agree."}</p>
              <ul className="mt-3 space-y-1.5 text-muted">
                <li>Unbalanced ledger transactions: <span className="font-mono text-ink">{check.unbalanced}</span></li>
                <li>Clearing account: <span className="font-mono text-ink">{formatGhs(check.clearing.actual)}</span>, expected <span className="font-mono text-ink">{formatGhs(check.clearing.expected)}</span></li>
                <li>{check.gateway.skipped ? "Gateway check skipped: no live gateway is connected." : `${check.gateway.checked} payments checked with the gateway.`}</li>
              </ul>
              {check.gateway.mismatches.map((m) => <p key={m.reference} className="mt-2 text-crimson-ink">{m.reference}: {m.problem}</p>)}
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "expenses" ? (
        <div className="mt-6 space-y-6">
          <Note>The person who asks can never approve. From <Money value={Number(bag.twoApprover ?? 200000)} />, the treasurer and an executive both sign.</Note>
          {isExec ? (
            <details className="group border border-line bg-card">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-5 text-[15px] font-medium">
                Raise an expense <Plus className="size-4 transition-transform group-open:rotate-45" />
              </summary>
              <div className="space-y-3 border-t border-line p-5">
                <Field label="What is it for" value={form.expenseMemo} onChange={(expenseMemo) => setForm({ ...form, expenseMemo })} />
                <Field label="Amount, GH₵" value={form.expenseAmount} inputMode="decimal" onChange={(expenseAmount) => setForm({ ...form, expenseAmount })} />
                <Button disabled={!parseCedisToPesewas(form.expenseAmount) || form.expenseMemo.trim().length < 4}
                  onClick={() => step.run("expense_submit", async () => { await hubAct({ data: { type: "expense_submit", slug, memo: form.expenseMemo, amountPesewas: parseCedisToPesewas(form.expenseAmount) } }); setForm({ ...form, expenseMemo: "", expenseAmount: "" }); step.setNote("Expense raised."); reload(); })}>Raise it</Button>
              </div>
            </details>
          ) : null}
          <ul className="ruled-list border-y border-line">
            {expenses.map((e) => {
              const waiting = ["submitted", "partially_approved"].includes(e.status);
              return (
                <li key={e.id} className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold">{e.memo}</p>
                      <p className="mt-0.5 text-[13px] text-muted">Asked by {e.requester}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[15px] font-semibold tabular-nums"><Money value={e.amount} /></p>
                      <div className="mt-1.5"><Pill tone={e.status === "paid" ? "paid" : waiting ? "red" : e.status === "approved" ? "ink" : "plain"}>{expenseState(e.status)}</Pill></div>
                    </div>
                  </div>
                  {waiting && !e.mine && canApprove ? (
                    <div className="mt-3"><Button size="sm" onClick={() => go("expense", "expense", { expenseId: e.id }, "Your approval is recorded.")}>Approve {formatGhs(e.amount)}</Button></div>
                  ) : null}
                  {e.status === "approved" && isTreasurer ? (
                    <div className="mt-3 space-y-2">
                      <Field label="Payment reference" value={payRef[e.id] ?? ""} onChange={(v) => setPayRef({ ...payRef, [e.id]: v })} />
                      <Button tone="quiet" size="sm" disabled={(payRef[e.id] ?? "").trim().length < 3} onClick={() => go("expense_pay", "expense_pay", { expenseId: e.id, reference: payRef[e.id] }, "Payment recorded in the ledger.")}>Record the payment</Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {expenses.length === 0 ? <Note>No expenses yet.</Note> : null}
        </div>
      ) : null}

      {tab === "refunds" ? (
        <div className="mt-6 space-y-6">
          <Note>The treasurer asks, a different executive approves. A refund can never be more than the payment.</Note>
          {isTreasurer ? (
            <details className="group border border-line bg-card">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-5 text-[15px] font-medium">
                Ask for a refund <Plus className="size-4 transition-transform group-open:rotate-45" />
              </summary>
              <div className="space-y-3 border-t border-line p-5">
                <select aria-label="Payment" className="input" value={form.payment} onChange={(e) => setForm({ ...form, payment: e.target.value })}>
                  <option value="">Choose the payment</option>
                  {payments.filter((p) => p.refundable > 0).map((p) => <option key={p.id} value={p.id}>{p.who} · {formatGhs(p.charge)} · up to {formatGhs(p.refundable)}</option>)}
                </select>
                <Field label="Amount to return, GH₵" value={form.amount} inputMode="decimal" onChange={(amount) => setForm({ ...form, amount })} />
                <Field label="Why" value={form.reason} onChange={(reason) => setForm({ ...form, reason })} />
                <select aria-label="How it is paid back" className="input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  <option value="gateway">Send back through the gateway</option>
                  <option value="manual">Paid out another way, I will give the reference</option>
                </select>
                <Button disabled={!form.payment || !parseCedisToPesewas(form.amount) || form.reason.trim().length < 5}
                  onClick={() => go("refund_request", "refund_request", { intentId: form.payment, amountPesewas: parseCedisToPesewas(form.amount), reason: form.reason, method: form.method }, "Refund requested. A different executive must approve it.")}>Ask for the refund</Button>
              </div>
            </details>
          ) : null}
          <ul className="ruled-list border-y border-line">
            {refunds.map((r) => (
              <li key={r.id} className="py-4">
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold">{r.reason}</p>
                    <p className="mt-0.5 text-[13px] text-muted">Asked by {r.requester} · {r.method === "manual" ? "paid outside the gateway" : "through the gateway"}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-semibold tabular-nums"><Money value={r.amount} /></p>
                    <div className="mt-1.5"><Pill tone={r.status === "awaiting_approval" ? "red" : r.status === "rejected" ? "plain" : "paid"}>{refundState(r.status)}</Pill></div>
                  </div>
                </div>
                {r.status === "awaiting_approval" && isExec && !r.mine ? (
                  <div className="mt-3 space-y-2">
                    {r.method === "manual" ? <Field label="Payout reference" value={manualRef[r.id] ?? ""} onChange={(v) => setManualRef({ ...manualRef, [r.id]: v })} /> : null}
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" onClick={() => go("refund", "refund", { refundId: r.id, decision: "approved", manualReference: manualRef[r.id] }, "Refund approved and posted.")}>Approve</Button>
                      <Button size="sm" tone="quiet" onClick={() => go("refund", "refund", { refundId: r.id, decision: "rejected" }, "Refund declined.")}>Decline</Button>
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
          {refunds.length === 0 ? <Note>No refunds.</Note> : null}
        </div>
      ) : null}

      {tab === "ledger" ? (
        <div className="mt-6">
          <Note>The latest lines, newest first. Every gift is two or more lines that balance.</Note>
          <table className="mt-4 w-full border-y border-line text-sm">
            <thead>
              <tr className="text-left">
                <th className="kicker py-3 font-medium">Account</th>
                <th className="kicker hidden py-3 font-medium sm:table-cell">Who</th>
                <th className="kicker py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((l, i) => (
                <tr key={i} className="border-t border-line">
                  <td className="py-3 pr-3">
                    <span className="block">{accountName(l.account)}</span>
                    <span className="block text-[12px] text-muted sm:hidden">{l.who}</span>
                  </td>
                  <td className="hidden py-3 pr-3 text-muted sm:table-cell">{l.who}</td>
                  <td className={`py-3 text-right font-mono whitespace-nowrap ${l.direction === "credit" ? "text-paid" : ""}`}>{l.direction === "credit" ? "+" : "−"}<Money value={l.amount} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
