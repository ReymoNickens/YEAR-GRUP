"use client";
import { accountName, expenseState, refundState } from "@/lib/hub/words";
import { Download } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { stepUpConfirm, stepUpStart } from "@/lib/hub/api";
import { hubAct } from "@/lib/hub/act";
import { formatGhs, parseCedisToPesewas } from "@/lib/hub/money";
import { Button, Field, Money, Note } from "@/components/hub/ui";

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
      <div className="w-full max-w-lg animate-[sheet_260ms_ease-out_both] space-y-3 rounded-t-[2rem] bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-line" aria-hidden />
        <p id="stepup-title" className="font-display text-2xl">A fresh code first</p>
        <Note>This moves money or changes roles, so we check it is you with a code sent to your phone.</Note>
        {!sent ? (
          <Button disabled={busy} onClick={send}>{busy ? "Sending…" : "Text me a code"}</Button>
        ) : (
          <>
            <p className="text-sm text-muted">Sent to {sent.masked}.</p>
            {sent.devCode ? (
              <p className="rounded-2xl bg-gold-soft px-4 py-3 text-sm">Preview: in real use this code arrives by text. It is filled in for you.</p>
            ) : null}
            <Field label="Code" value={code} inputMode="numeric" autoComplete="one-time-code" autoFocus onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))} />
            <Button disabled={busy || code.length < 6} onClick={confirm}>{busy ? "Checking…" : "Confirm and continue"}</Button>
          </>
        )}
        {note ? <p role="alert" className="text-sm text-crimson">{note}</p> : null}
        <button type="button" className="h-12 w-full text-sm text-muted" onClick={close}>Cancel</button>
      </div>
    </div>
  ) : null;

  return { run, panel, note, setNote };
}

const badge = "rounded-full bg-gold-soft px-2 py-1 text-xs";

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
      <ul className="grid grid-cols-2 gap-2">
        {counts.map((c) => <li key={c.status} className="rounded-2xl bg-card p-3"><p className="text-sm text-muted">{c.status}</p><p className="font-display text-3xl tabular-nums">{c.n}</p></li>)}
      </ul>
      <Note>{String(bag.missingPlacement ?? 0)} members have no house and no escape option.</Note>

      <h2 className="font-display text-2xl">Waiting to be confirmed</h2>
      {claims.length === 0 ? <Note>No one is waiting.</Note> : null}
      {claims.map((c) => (
        <article key={c.id} className="rounded-3xl border border-line bg-card p-4">
          <h3 className="font-display text-xl">{c.display_name}</h3>
          <p className="text-sm text-muted">{[c.house, c.dorm, c.cot ? `cot ${c.cot}` : null].filter(Boolean).join(" · ") || "No placement on record"} · {c.confirmations} confirmed so far</p>
          <Button tone="quiet" onClick={() => act(() => hubAct({ data: { type: "confirm", slug, membershipId: c.id } }), "Confirmation recorded.")}>Confirm this is them</Button>
        </article>
      ))}

      {canReview ? (
        <>
          <h2 className="font-display text-2xl">Member list</h2>
          <label className="flex h-12 cursor-pointer items-center justify-center rounded-full border border-line">
            Upload a CSV
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => void upload(e.target.files?.[0])} />
          </label>
          <Note>Columns are matched by their heading: name, phone, house, dorm, cot, class, profession, city. Nothing is guessed. Problems are listed on each row.</Note>
          {imports.map((row) => {
            const reviewable = ["normalised", "suspected_duplicate", "needs_review"].includes(row.status);
            return (
              <article key={row.id} className="rounded-3xl border border-line bg-card p-4">
                <p className="text-xs tracking-widest text-gold uppercase">{row.status.replace("_", " ")}</p>
                <h3 className="font-display text-2xl">{row.name}</h3>
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
          <h2 className="font-display text-2xl">Another name for a house or class</h2>
          <select className="h-12 w-full rounded-2xl border border-line bg-card px-4" value={alias.nodeId} onChange={(e) => setAlias({ ...alias, nodeId: e.target.value })}>
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
    <div className="space-y-4">
      {step.panel}
      <div role="tablist" aria-label="Money" className="grid grid-cols-4 gap-1 rounded-full bg-line/60 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`relative h-10 rounded-full text-sm transition ${tab === t.key ? "bg-card font-medium shadow-sm" : "text-muted"}`}
          >
            {t.label}
            {"count" in t && t.count ? <span className="absolute -top-1 right-1 grid size-5 place-items-center rounded-full bg-crimson text-[10px] text-on-crimson">{t.count}</span> : null}
          </button>
        ))}
      </div>
      {step.note && !step.panel ? <p role="status" className="rounded-2xl bg-gold-soft px-4 py-3 text-sm">{step.note}</p> : null}

      {tab === "overview" ? (
        <div className="space-y-4">
          <Note>{live ? "Live payments. Every payment here was confirmed by the gateway." : "Test payments. They follow the real ledger rules and move no cedis."}</Note>
          <div className="rounded-3xl bg-crimson p-5 text-on-crimson">
            <p className="text-xs tracking-[0.16em] text-gold-soft uppercase">Given so far</p>
            <p className="mt-1 font-display text-4xl tabular-nums"><Money value={given} /></p>
            <p className="mt-2 text-sm text-on-crimson/80">Fees taken: <Money value={Math.max(0, fees)} /> · shown on every receipt</p>
          </div>
          <ul className="grid grid-cols-2 gap-2">
            <li className="rounded-2xl border border-line bg-card p-4"><p className="text-sm text-muted">In the bank</p><p className="mt-1 font-display text-xl tabular-nums"><Money value={bank} /></p></li>
            <li className="rounded-2xl border border-line bg-card p-4"><p className="text-sm text-muted">Waiting to settle</p><p className="mt-1 font-display text-xl tabular-nums"><Money value={Math.abs(clearing)} /></p></li>
            <li className="col-span-2 rounded-2xl border border-line bg-card p-4"><p className="text-sm text-muted">Pledged, not yet paid</p><p className="mt-1 font-display text-2xl tabular-nums"><Money value={Number(bag.outstanding ?? 0)} /> <span className="text-base text-muted">from {String(bag.outstandingCount)} {Number(bag.outstandingCount) === 1 ? "member" : "members"}</span></p></li>
          </ul>
          {isTreasurer && unsettled.n > 0 ? (
            <div className="space-y-2 rounded-3xl border border-line bg-card p-4">
              <p>{unsettled.n} live payments wait for the bank: <Money value={unsettled.net} />.</p>
              <Field label="Bank settlement reference" value={form.bankRef} onChange={(bankRef) => setForm({ ...form, bankRef })} />
              <Button tone="quiet" disabled={form.bankRef.trim().length < 3} onClick={() => go("settlement", "settlement", { reference: form.bankRef }, "Settlement recorded.")}>Confirm the bank received it</Button>
            </div>
          ) : null}

          <a
            href={`/api/o/${slug}/ledger`}
            download
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-card px-5 text-sm font-medium"
          >
            <Download className="size-4" />
            Download the ledger (spreadsheet)
          </a>
          <Note>Keep your own copy each week. Every download is written to the audit log. {bag.seeNames ? "As treasurer you see the names behind anonymous gifts." : "Anonymous givers stay anonymous: only the treasurer sees their names."}</Note>
          <Button tone="quiet" onClick={async () => { try { setCheck((await hubAct({ data: { type: "reconcile", slug } })) as never); } catch (e) { step.setNote(msg(e, "Reconciliation did not run.")); } }}>Run reconciliation</Button>
          {check ? (
            <div className="rounded-3xl border border-line bg-card p-4 text-sm">
              <p className="font-display text-xl">{check.ok ? "Everything agrees." : "Something does not agree."}</p>
              <p>Unbalanced ledger transactions: {check.unbalanced}</p>
              <p>Clearing account: {formatGhs(check.clearing.actual)}, expected {formatGhs(check.clearing.expected)}</p>
              <p>{check.gateway.skipped ? "Gateway check skipped: no live gateway is connected." : `${check.gateway.checked} payments checked with the gateway.`}</p>
              {check.gateway.mismatches.map((m) => <p key={m.reference} className="text-crimson">{m.reference}: {m.problem}</p>)}
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "expenses" ? (
        <div className="space-y-3">
          <Note>The person who asks can never approve. From <Money value={Number(bag.twoApprover ?? 200000)} />, the treasurer and an executive both sign.</Note>
          {isExec ? (
            <div className="space-y-2 rounded-3xl border border-line bg-card p-4">
              <Field label="What is it for" value={form.expenseMemo} onChange={(expenseMemo) => setForm({ ...form, expenseMemo })} />
              <Field label="Amount, GH₵" value={form.expenseAmount} inputMode="decimal" onChange={(expenseAmount) => setForm({ ...form, expenseAmount })} />
              <Button tone="quiet" disabled={!parseCedisToPesewas(form.expenseAmount) || form.expenseMemo.trim().length < 4}
                onClick={() => step.run("expense_submit", async () => { await hubAct({ data: { type: "expense_submit", slug, memo: form.expenseMemo, amountPesewas: parseCedisToPesewas(form.expenseAmount) } }); setForm({ ...form, expenseMemo: "", expenseAmount: "" }); step.setNote("Expense raised."); reload(); })}>Raise an expense</Button>
            </div>
          ) : null}
          {expenses.map((e) => (
            <article key={e.id} className="rounded-3xl border border-line bg-card p-4">
              <p className="text-sm text-muted">{expenseState(e.status)} · asked by {e.requester}</p>
              <h3 className="font-display text-2xl">{e.memo}</h3>
              <p className="tabular-nums"><Money value={e.amount} /></p>
              {["submitted", "partially_approved"].includes(e.status) && !e.mine && canApprove ? (
                <button type="button" className="btn-primary mt-3" onClick={() => go("expense", "expense", { expenseId: e.id }, "Your approval is recorded.")}>Approve</button>
              ) : null}
              {e.status === "approved" && isTreasurer ? (
                <div className="mt-2 space-y-2">
                  <Field label="Payment reference" value={payRef[e.id] ?? ""} onChange={(v) => setPayRef({ ...payRef, [e.id]: v })} />
                  <Button tone="quiet" disabled={(payRef[e.id] ?? "").trim().length < 3} onClick={() => go("expense_pay", "expense_pay", { expenseId: e.id, reference: payRef[e.id] }, "Payment recorded in the ledger.")}>Record the payment</Button>
                </div>
              ) : null}
            </article>
          ))}

          {expenses.length === 0 ? <Note>No expenses yet.</Note> : null}
        </div>
      ) : null}

      {tab === "refunds" ? (
        <div className="space-y-3">
          <Note>The treasurer asks, a different executive approves. A refund can never be more than the payment.</Note>
          {isTreasurer ? (
            <div className="space-y-2 rounded-3xl border border-line bg-card p-4">
              <select className="h-12 w-full rounded-2xl border border-line bg-card px-4" value={form.payment} onChange={(e) => setForm({ ...form, payment: e.target.value })}>
                <option value="">Choose the payment</option>
                {payments.filter((p) => p.refundable > 0).map((p) => <option key={p.id} value={p.id}>{p.who} · {formatGhs(p.charge)} · up to {formatGhs(p.refundable)}</option>)}
              </select>
              <Field label="Amount to return, GH₵" value={form.amount} inputMode="decimal" onChange={(amount) => setForm({ ...form, amount })} />
              <Field label="Why" value={form.reason} onChange={(reason) => setForm({ ...form, reason })} />
              <select className="h-12 w-full rounded-2xl border border-line bg-card px-4" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                <option value="gateway">Send back through the gateway</option>
                <option value="manual">Paid out another way, I will give the reference</option>
              </select>
              <Button tone="quiet" disabled={!form.payment || !parseCedisToPesewas(form.amount) || form.reason.trim().length < 5}
                onClick={() => go("refund_request", "refund_request", { intentId: form.payment, amountPesewas: parseCedisToPesewas(form.amount), reason: form.reason, method: form.method }, "Refund requested. A different executive must approve it.")}>Ask for the refund</Button>
            </div>
          ) : null}
          {refunds.map((r) => (
            <article key={r.id} className="rounded-3xl border border-line bg-card p-4">
              <p className="text-sm text-muted">{refundState(r.status)} · asked by {r.requester} · {r.method === "manual" ? "paid outside the gateway" : "through the gateway"}</p>
              <p>{r.reason}</p>
              <p className="tabular-nums"><Money value={r.amount} /></p>
              {r.status === "awaiting_approval" && isExec && !r.mine ? (
                <div className="mt-2 space-y-2">
                  {r.method === "manual" ? <Field label="Payout reference" value={manualRef[r.id] ?? ""} onChange={(v) => setManualRef({ ...manualRef, [r.id]: v })} /> : null}
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" className="btn-primary" onClick={() => go("refund", "refund", { refundId: r.id, decision: "approved", manualReference: manualRef[r.id] }, "Refund approved and posted.")}>Approve</button>
                    <button type="button" className="btn-quiet" onClick={() => go("refund", "refund", { refundId: r.id, decision: "rejected" }, "Refund declined.")}>Decline</button>
                  </div>
                </div>
              ) : null}
            </article>
          ))}

          {refunds.length === 0 ? <Note>No refunds.</Note> : null}
        </div>
      ) : null}

      {tab === "ledger" ? (
        <div>
          <Note>The latest lines, newest first. Every gift is two or more lines that balance.</Note>
          <ul className="mt-3 divide-y divide-line rounded-3xl border border-line bg-card px-4 text-sm">
            {ledger.map((l, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block truncate">{accountName(l.account)}</span>
                  <span className="block truncate text-xs text-muted">{l.direction === "credit" ? "In" : "Out"} · {l.who}</span>
                </span>
                <span className="shrink-0 tabular-nums"><Money value={l.amount} /></span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
