"use client";
import { accountName } from "@/lib/hub/words";
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
function useStepUp(slug: string, testMode: boolean) {
  const [pending, setPending] = useState<null | { action: string }>(null);
  const [sent, setSent] = useState<null | { masked: string; devCode: string | null }>(null);
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const retry = useRef<null | (() => Promise<void>)>(null);
  const phrase = useRef(""); // read by the retry closure, so it must not go stale
  const [phraseText, setPhraseText] = useState("");

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

  const panel: ReactNode = pending ? (
    <div className="space-y-3 rounded-3xl border border-gold bg-card p-4">
      <p className="font-display text-xl">A fresh code first</p>
      <Note>This action moves money or roles, so it asks for a code sent to your verified phone.</Note>
      {!sent ? (
        <Button disabled={busy} onClick={send}>{busy ? "Sending" : "Text me a code"}</Button>
      ) : (
        <>
          <p className="text-sm text-muted">Sent to {sent.masked}.{sent.devCode ? ` Demonstration code: ${sent.devCode}.` : ""}</p>
          <Field label="Code" value={code} inputMode="numeric" onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))} />
          <Button disabled={busy || code.length < 6} onClick={confirm}>{busy ? "Checking" : "Confirm and continue"}</Button>
        </>
      )}
      {testMode ? (
        <Field label="Demonstration only: type CONFIRM instead" value={phraseText} onChange={(v) => { phrase.current = v; setPhraseText(v); setNote(""); }} />
      ) : null}
      <button type="button" className="h-10 text-sm text-muted" onClick={() => { setPending(null); setSent(null); }}>Cancel</button>
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
                    <button type="button" className="h-12 rounded-full bg-crimson text-on-crimson" onClick={() => act(() => hubAct({ data: { type: "import_review", slug, importId: row.id, to: "approved", notDuplicate: notDup[row.id] === true } }), "Approved. An unclaimed place is waiting.")}>Approve</button>
                  ) : null}
                  {row.status === "approved" ? (
                    <button type="button" className="h-12 rounded-full bg-crimson text-on-crimson" onClick={() => act(() => hubAct({ data: { type: "import_review", slug, importId: row.id, to: "invited" } }), "Invitation queued.")}>Invite by text</button>
                  ) : null}
                  {reviewable || row.status === "approved" ? (
                    <button type="button" className="h-12 rounded-full border border-line" onClick={() => act(() => hubAct({ data: { type: "import_review", slug, importId: row.id, to: "needs_review" } }), "Sent back for review.")}>Send back</button>
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
  const live = bag.paymentMode === "live";
  const step = useStepUp(slug, bag.testStepUp === true);
  const [check, setCheck] = useState<null | { ok: boolean; unbalanced: number; clearing: { actual: number; expected: number }; gateway: { checked: number; skipped: boolean; mismatches: { reference: string; problem: string }[] } }>(null);
  const [form, setForm] = useState({ payment: "", amount: "", reason: "", method: "gateway", expenseMemo: "", expenseAmount: "", bankRef: "" });
  const [manualRef, setManualRef] = useState<Record<string, string>>({});
  const [payRef, setPayRef] = useState<Record<string, string>>({});

  const go = (action: string, type: string, body: Record<string, unknown>, done: string) =>
    step.run(action, async (phrase) => {
      await hubAct({ data: { type, slug, phrase, ...body } });
      step.setNote(done);
      reload();
    });

  return (
    <div className="space-y-4">
      <Note>{live ? "Live payments. Every payment here was confirmed by the gateway." : "Demonstration payments. They follow the real ledger rules and move no cedis."}</Note>
      {step.panel}
      {step.note ? <p className="text-sm">{step.note}</p> : null}
      <ul className="grid grid-cols-2 gap-2">
        {Object.entries(accounts).map(([k, v]) => (
          <li key={k} className="rounded-2xl bg-card p-3"><p className="text-sm text-muted">{accountName(k)}</p><p className="text-sm tabular-nums">{formatGhs(Math.abs(v))} {v < 0 ? "credit" : "debit"}</p></li>
        ))}
      </ul>
      <p>Outstanding pledges: {String(bag.outstandingCount)} · <Money value={Number(bag.outstanding ?? 0)} /></p>
      <p className="text-sm text-muted">{bag.seeNames ? "You can see names." : "Anonymous names stay with the treasurer. You are not the treasurer."}</p>
      <a
        href={`/api/o/${slug}/ledger`}
        download
        className="flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-card px-5 text-sm font-medium"
      >
        <Download className="size-4" />
        Download the ledger (spreadsheet)
      </a>
      <Note>Keep your own copy each week. Every download is written to the audit log.</Note>

      {isTreasurer && unsettled.n > 0 ? (
        <div className="space-y-2 rounded-3xl border border-line bg-card p-4">
          <p>{unsettled.n} live payments wait for the bank: <Money value={unsettled.net} />.</p>
          <Field label="Bank settlement reference" value={form.bankRef} onChange={(bankRef) => setForm({ ...form, bankRef })} />
          <Button tone="quiet" disabled={form.bankRef.trim().length < 3} onClick={() => go("settlement", "settlement", { reference: form.bankRef }, "Settlement recorded.")}>Confirm the bank received it</Button>
        </div>
      ) : null}

      <h2 className="font-display text-2xl">Expenses</h2>
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
          <p className="text-sm text-muted">{e.status.replace("_", " ")} · {e.requester}</p>
          <h3 className="font-display text-2xl">{e.memo}</h3>
          <p className="tabular-nums"><Money value={e.amount} /></p>
          {["submitted", "partially_approved"].includes(e.status) && !e.mine && isExec ? (
            <button type="button" className="mt-2 h-12 text-crimson" onClick={() => go("expense", "expense", { expenseId: e.id }, "Your approval is recorded.")}>Approve</button>
          ) : null}
          {e.status === "approved" && isTreasurer ? (
            <div className="mt-2 space-y-2">
              <Field label="Payment reference" value={payRef[e.id] ?? ""} onChange={(v) => setPayRef({ ...payRef, [e.id]: v })} />
              <Button tone="quiet" disabled={(payRef[e.id] ?? "").trim().length < 3} onClick={() => go("expense_pay", "expense_pay", { expenseId: e.id, reference: payRef[e.id] }, "Payment recorded in the ledger.")}>Record the payment</Button>
            </div>
          ) : null}
        </article>
      ))}

      <h2 className="font-display text-2xl">Refunds</h2>
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
          <p className="text-sm text-muted">{r.status.replace("_", " ")} · asked by {r.requester} · {r.method === "manual" ? "paid outside the gateway" : "through the gateway"}</p>
          <p>{r.reason}</p>
          <p className="tabular-nums"><Money value={r.amount} /></p>
          {r.status === "awaiting_approval" && isExec && !r.mine ? (
            <div className="mt-2 space-y-2">
              {r.method === "manual" ? <Field label="Payout reference" value={manualRef[r.id] ?? ""} onChange={(v) => setManualRef({ ...manualRef, [r.id]: v })} /> : null}
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="h-12 rounded-full bg-crimson text-on-crimson" onClick={() => go("refund", "refund", { refundId: r.id, decision: "approved", manualReference: manualRef[r.id] }, "Refund approved and posted.")}>Approve</button>
                <button type="button" className="h-12 rounded-full border border-line" onClick={() => go("refund", "refund", { refundId: r.id, decision: "rejected" }, "Refund declined.")}>Decline</button>
              </div>
            </div>
          ) : null}
        </article>
      ))}

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
      <h2 className="font-display text-2xl">Latest ledger lines</h2>
      <ul className="space-y-2 text-sm">
        {ledger.map((l, i) => (
          <li key={i} className="flex justify-between gap-3 border-b border-line py-2">
            <span>{l.account} {l.direction} · {l.who}</span>
            <span className="tabular-nums"><Money value={l.amount} /></span>
          </li>
        ))}
      </ul>
    </div>
  );
}
