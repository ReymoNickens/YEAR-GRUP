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
    <Shell nav={false}>
      <div className="mx-auto max-w-md">
        {data ? (
          <>
            <p className="kicker">Check a receipt</p>
            <h1 className="display-md mt-3">{data.voided ? "This receipt was voided." : "This receipt is real."}</h1>
            <article className="receipt mt-8">
              <div className="perf" aria-hidden />
              <div className="relative px-6 pt-5 pb-7">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-[10px] tracking-[0.14em] text-[#6b6355] uppercase">Official receipt</p>
                  <span className={`stamp text-[11px] ${data.voided ? "" : "stamp-paid"}`} style={{ color: data.voided ? "#b3261e" : "#137a48" }}>{data.voided ? "Void" : "Valid"}</span>
                </div>
                <p className="mt-3 font-mono text-xl font-semibold text-[#b3261e]">No. {data.number}</p>
                <dl className="mt-6 space-y-2 font-mono text-[13px]">
                  <div className="flex justify-between gap-4 border-b border-[#1a1712]/15 pb-2"><dt className="text-[#6b6355]">For</dt><dd className="text-right">{data.purpose}</dd></div>
                  <div className="flex justify-between gap-4 border-b border-[#1a1712]/15 pb-2"><dt className="text-[#6b6355]">Issued</dt><dd>{data.issuedOn}</dd></div>
                  <div className="flex justify-between gap-4 pt-1 text-base font-semibold"><dt>Amount</dt><dd><Money value={data.amount} /></dd></div>
                </dl>
              </div>
              <div className="perf rotate-180" aria-hidden />
            </article>
            <p className="mt-6 text-sm text-muted">This page shows the receipt number, purpose, amount and date. It never shows who paid.</p>
            <div className="mt-6"><PrintButton /></div>
          </>
        ) : (
          <div className="border-l-[3px] border-crimson bg-card p-5">
            <p className="kicker kicker-red">Check a receipt</p>
            <h1 className="display-sm mt-2">Receipt not found</h1>
            <p className="mt-2 text-muted">{error}</p>
          </div>
        )}
      </div>
    </Shell>
  );
}
