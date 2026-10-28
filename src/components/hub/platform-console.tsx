"use client";
import { platformOverview } from "@/lib/hub/api";
import { formatGhs } from "@/lib/hub/money";
import { Shell } from "@/components/hub/shell";
import { Note, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";

/** For EvolveIT: operating figures across organisations. No posts, donors or profiles, and nothing here moves money. */
export function PlatformConsole() {
  const { data, error, loading, reload } = useHub("platform", () => platformOverview());
  return (
    <Shell nav={false} title="Platform" eyebrow="Operations">
      <State loading={loading} error={error} onRetry={reload}>
        <Note>Figures only. No posts, donors or profiles, and nothing here moves money.</Note>
        <div className="mt-4 space-y-3">
          {data?.map((o) => (
            <article key={o.id} className="border border-line bg-card p-5">
              <h2 className="display-sm pt-4">{o.name}</h2>
              <p className="text-sm text-muted">/{o.slug}</p>
              <p className="mt-2 text-sm">{o.members} members, {o.verified} confirmed · {o.payments} payments, {formatGhs(o.volume)}</p>
              <p className={`text-sm ${o.dead > 0 ? "text-crimson" : "text-muted"}`}>Messages: {o.queued} waiting, {o.dead} could not be sent</p>
            </article>
          ))}
        </div>
      </State>
    </Shell>
  );
}
