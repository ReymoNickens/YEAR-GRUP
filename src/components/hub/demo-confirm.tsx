"use client";
import { Sparkles } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { hubAct } from "@/lib/hub/act";

/** True on the executive demo (the root layout marks <html data-demo>). */
export function useDemo(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => document.documentElement.hasAttribute("data-demo"),
    () => false,
  );
}

/**
 * In the demo, a new member does not have to wait for two cot mates: one tap
 * confirms them through the same path a cot mate's confirmation takes.
 */
export function DemoConfirm({ slug, onDone }: { slug: string; onDone: () => void }) {
  const demo = useDemo();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (!demo) return null;
  return (
    <div className="border border-dashed border-line-2 bg-card p-4">
      <p className="text-sm">In the real hub, two of your cot mates confirm you. For this preview you can skip the wait.</p>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setErr("");
          try {
            await hubAct({ data: { type: "demo_confirm", slug } });
            onDone();
          } catch (e) {
            setErr(e instanceof Error ? e.message : "That did not go through.");
            setBusy(false);
          }
        }}
        className="btn btn-primary btn-sm btn-block mt-3"
      >
        <Sparkles className="size-4" />
        {busy ? "Confirming…" : "Confirm me now (preview only)"}
      </button>
      {err ? <p role="alert" className="mt-2 text-sm text-crimson-ink">{err}</p> : null}
    </div>
  );
}
