"use client";
import Link from "next/link";
import { myReceipts } from "@/lib/hub/api";
import { Shell } from "@/components/hub/shell";
import { Back, Money, Pill, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";

/** Every receipt the member has been issued, newest first. */
export function MeReceipts({ slug }: { slug: string }) {
  const receipts = useHub(`rc-${slug}`, () => myReceipts({ data: slug }));
  return (
    <Shell slug={slug} wide>
      <Back href={`/o/${slug}/me`} label="Me" />
      <h1 className="display-md">Receipts</h1>
      <State loading={receipts.loading} error={receipts.error} onRetry={receipts.reload}>
        {receipts.data && receipts.data.length === 0 ? <p className="py-4 text-muted">No receipts yet. They arrive here the moment the gateway confirms a gift.</p> : null}
        <ul className="ruled-list mt-4">
          {receipts.data?.map((r) => (
            <li key={r.number}>
              <Link href={`/r/${r.number}`} className="flex min-h-12 items-center gap-4 py-3.5 hover:bg-sunk/40">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium">{r.purpose}</span>
                  <span className="block font-mono text-[12px] text-muted">{r.number} · {new Date(r.issuedOn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </span>
                {r.voided ? <Pill tone="red">Void</Pill> : null}
                <span className={`text-[15px] font-semibold tabular-nums ${r.voided ? "text-muted line-through" : ""}`}><Money value={r.amount} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </State>
    </Shell>
  );
}
