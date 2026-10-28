import { Shell } from "@/components/hub/shell";
import { PrintButton } from "@/components/hub/print-button";
import { Money } from "@/components/hub/ui";
import { publicReceipt } from "@/lib/hub/core";

export const metadata = { title: "Receipt" };

/** Anyone holding a receipt number can check it is real. It never shows who paid. */
export default async function Receipt({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  let data: Awaited<ReturnType<typeof publicReceipt>> | null = null;
  let error = "";
  try {
    data = await publicReceipt({ data: { number } });
  } catch (e) {
    error = e instanceof Error && !("code" in e) ? e.message : "We could not check that receipt just now.";
  }
  return (
    <Shell nav={false} title="Receipt" eyebrow="Check a receipt">
      {data ? (
        <article className="rounded-3xl border border-line bg-card p-5">
          <p className={`text-xs tracking-widest uppercase ${data.voided ? "text-crimson" : "text-gold"}`}>{data.voided ? "Void" : "Valid receipt"}</p>
          <h1 className="mt-2 font-display text-4xl">{data.number}</h1>
          <p className="mt-3">{data.purpose}</p>
          <p className="mt-4 font-display text-3xl"><Money value={data.amount} /></p>
          <p className="mt-2 text-sm text-muted">Issued {data.issuedOn}</p>
          <p className="mt-4 text-sm text-muted">This page shows the receipt number, purpose, amount and date. It does not show who paid.</p>
        </article>
      ) : null}
      {data ? (
        <div className="mt-4">
          <PrintButton />
        </div>
      ) : null}
      {!data ? (
        <div className="rounded-3xl border border-line bg-card p-5">
          <h1 className="font-display text-2xl">Receipt not found</h1>
          <p className="mt-2 text-muted">{error}</p>
        </div>
      ) : null}
    </Shell>
  );
}
