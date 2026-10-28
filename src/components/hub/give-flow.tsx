"use client";
import { DemoConfirm } from "@/components/hub/demo-confirm";
import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { purposeDetail, purposeList, startPayment } from "@/lib/hub/api";
import { planCollection, parseCedisToPesewas } from "@/lib/hub/money";
import { Shell } from "@/components/hub/shell";
import { Back, Bar, Button, Field, Money, Note, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";

const PURPOSE_KIND: Record<string, string> = { campaign: "Appeal", event: "Event ticket", dues: "Dues", welfare: "Welfare", store: "Store" };

export function GiveList({ slug }: { slug: string }) {
  const { data, error, loading, reload } = useHub(`give-${slug}`, () => purposeList({ data: slug }));
  const waiting = /once your place is confirmed/i.test(error);
  return (
    <Shell slug={slug}>
      <h1 className="font-display text-4xl">Give</h1>
      {waiting ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-3xl border border-line bg-card p-5">
            <h2 className="font-display text-2xl">Giving opens once your place is confirmed.</h2>
            <p className="mt-2 text-muted">Two of your cot mates, or an executive, confirm that you are you. It keeps every cedi traceable to a real old boy.</p>
          </div>
          <DemoConfirm slug={slug} onDone={reload} />
        </div>
      ) : (
        <State loading={loading} error={error} onRetry={reload}>
          <Note>Only the payment gateway can mark a gift as paid, never this screen.</Note>
          <div className="mt-5 space-y-3">
            {data?.purposes.filter((p) => p.type !== "other").map((p) => (
              <Link key={p.id} href={`/o/${slug}/give/${p.id}`} className="block rounded-3xl border border-line bg-card p-4 transition active:scale-[0.99]">
                <p className="text-xs tracking-widest text-gold uppercase">{PURPOSE_KIND[p.type] ?? p.type}</p>
                <h2 className="font-display text-2xl">{p.title}</h2>
                {p.target > 0 ? (
                  <div className="mt-3 space-y-2">
                    <Bar value={p.raised} max={p.target} label={`${p.title}: raised so far`} />
                    <p className="text-sm text-muted"><Money value={p.raised} /> of <Money value={p.target} /></p>
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        </State>
      )}
    </Shell>
  );
}






