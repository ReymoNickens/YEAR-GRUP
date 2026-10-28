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
    <div className="rounded-3xl border border-dashed border-gold bg-gold-soft/60 p-4">
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
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-paper disabled:opacity-60"
      >
        <Sparkles className="size-4" />
        {busy ? "Confirming…" : "Confirm me now (preview only)"}
      </button>
      {err ? <p role="alert" className="mt-2 text-sm text-crimson">{err}</p> : null}
    </div>
  );
}
