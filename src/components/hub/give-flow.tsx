"use client";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { DemoConfirm } from "@/components/hub/demo-confirm";
import { Shell } from "@/components/hub/shell";
import { Bar, Callout, PageHead, Section, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";
import { purposeList } from "@/lib/hub/api";
import { wholeCedis } from "@/lib/hub/words-money";

const KIND: Record<string, string> = { campaign: "Appeal", event: "Event ticket", dues: "Dues", welfare: "Welfare", store: "Store" };

/** Everything you can pay into: the appeal first, as a poster, then the rest as a ruled list. */
export function GiveList({ slug }: { slug: string }) {
  const { data, error, loading, reload } = useHub(`give-${slug}`, () => purposeList({ data: slug }));
  const waiting = /once your place is confirmed/i.test(error);
  const purposes = (data?.purposes ?? []).filter((p) => p.type !== "other");
  const hero = purposes.find((p) => p.hero);
  const rest = purposes.filter((p) => p !== hero);
  return (
    <Shell slug={slug}>
      <PageHead kicker="Give" title="Where the money goes" sub="Every gift goes through the gateway and onto the ledger, with its fees on their own line." />
      {waiting ? (
        <div className="space-y-4">
          <Callout tone="red">
            <p className="font-semibold">Giving opens once your place is confirmed.</p>
            <p className="mt-1 text-muted">Two of your cot mates, or an executive, confirm that you are you. It keeps every cedi traceable to a real old boy.</p>
          </Callout>
          <DemoConfirm slug={slug} onDone={reload} />
        </div>
      ) : (
        <State loading={loading} error={error} onRetry={reload}>
          {hero ? (
            <Link href={`/o/${slug}/give/${hero.id}`} className="poster rise group -mx-5 block px-5 pt-6 pb-6 sm:mx-0 sm:px-7">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-medium tracking-[0.16em] text-white/80 uppercase">The appeal</span>
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </div>
              <h2 className="mt-8 font-display text-[3rem] leading-[0.92] tracking-[-0.02em]">{hero.title}</h2>
              <p className="figure mt-6 text-[2.25rem]">{wholeCedis(hero.raised)}</p>
              <p className="mt-1.5 mb-4 text-sm text-white/80">raised of {wholeCedis(hero.target)} · {hero.target > 0 ? Math.floor((hero.raised / hero.target) * 100) : 0}%</p>
              <Bar value={hero.raised} max={hero.target} tone="onDark" label={`${hero.title}: raised so far`} />
            </Link>
          ) : null}

          <Section title="Also open" className="mt-12">
            <ul className="ruled-list">
              {rest.map((p) => (
                <li key={p.id}>
                  <Link href={p.type === "dues" ? `/o/${slug}/dues` : `/o/${slug}/give/${p.id}`} className="group flex items-center gap-4 py-5 hover:bg-sunk/40">
                    <span className="min-w-0 flex-1">
                      <span className="kicker block">{KIND[p.type] ?? p.type}</span>
                      <span className="mt-2 block font-display text-[1.75rem] leading-[1.02] tracking-[-0.01em]">{p.title}</span>
                      {p.type === "dues" ? (
                        <span className="mt-1.5 block text-[13px] text-muted">See what you owe, what you have paid, and pay what is due.</span>
                      ) : p.target > 0 ? (
                        <span className="mt-3 block">
                          <Bar value={p.raised} max={p.target} label={`${p.title}: raised so far`} height={4} />
                          <span className="mt-2 block text-[13px] text-muted tabular-nums">{wholeCedis(p.raised)} of {wholeCedis(p.target)}</span>
                        </span>
                      ) : (
                        <span className="mt-1.5 block text-[13px] text-muted">{p.story}</span>
                      )}
                    </span>
                    <ArrowRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </Section>

          <p className="mt-8 flex items-start gap-2 text-[13px] text-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            Only the payment gateway can mark a gift as paid, never this screen. Card and mobile money details go straight to the gateway.
          </p>
        </State>
      )}
    </Shell>
  );
}
