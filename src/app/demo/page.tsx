import { ArrowRight, Eye, HandCoins, Smartphone, UsersRound } from "lucide-react";
import { notFound } from "next/navigation";
import { Cover, Crest } from "@/components/hub/ui";
import { PERSONAS, demoSlug } from "@/lib/demo";
import { getSystemSql } from "@/lib/db";
import { demoMode } from "@/lib/hub/util";

export const metadata = { title: "Executive preview" };

const PROMISES = [
  { icon: UsersRound, title: "Everyone in their place", body: "House, dorm, cot and class, the way we lived it. Cot mates confirm each other." },
  { icon: Eye, title: "Every cedi in the open", body: "Each gift on a ledger anyone can check. Fees on their own line. Nothing typed in by hand." },
  { icon: Smartphone, title: "Made for our phones", body: "One task per screen, light on data, works on a weak signal. The chat stays on WhatsApp." },
];

const TRY = [
  "Join as a new old boy and find your cot.",
  "As Kwame, give ₵100 to the library and watch the total move.",
  "As the treasurer, approve the reunion cards expense and download the ledger.",
  "As an executive, send an announcement to one house only.",
  "Open Photos, Polls and the Business directory from the Me tab.",
];

/** The front page of the executive demo: what this is, who you can be, and what to try. */
export default async function DemoHome() {
  if (!demoMode()) notFound();
  const sql = await getSystemSql();
  const slug = demoSlug();
  const rows = await sql<{ name: string; branding: Record<string, string> }>`
    select name, branding from organisation where listed and (${slug} = '' or slug = ${slug}) order by created_at limit 1
  `;
  const org = rows[0];
  const name = org?.branding?.shortName ?? org?.name ?? "Year Group Hub";
  const motto = org?.branding?.motto ?? "";
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto w-full max-w-lg px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-16">
        <header className="flex items-center gap-3">
          <Crest />
          <div>
            <p className="text-xs tracking-[0.18em] text-gold uppercase">{motto}</p>
            <p className="font-display text-xl leading-none">{name}</p>
          </div>
        </header>

        <section className="mt-6">
          <Cover motif="field" alt="The school on the hill at Kwabotwe, in the late light" className="h-56 rounded-3xl" />
          <p className="mt-6 text-xs tracking-[0.18em] text-gold uppercase">A preview for the executives</p>
          <h1 className="mt-2 font-display text-[2.6rem] leading-[1.05]">The year group, in one place.</h1>
          <p className="mt-4 text-lg text-muted">Tap through it as a member would. The classmates and the money here are made up, so press anything.</p>
        </section>

        <ul className="mt-8 space-y-3">
          {PROMISES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-4 rounded-3xl border border-line bg-card p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gold-soft text-gold">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block font-medium">{title}</span>
                <span className="mt-0.5 block text-sm text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ul>

        <section className="mt-10">
          <h2 className="font-display text-3xl">Who would you like to be?</h2>
          <p className="mt-2 text-muted">Pick one. You can switch at any time from the bar at the top.</p>
          <ul className="mt-5 space-y-3">
            {PERSONAS.map((p, i) => (
              <li key={p.key}>
                {/* A full page load, so the cookie and the ribbon change together. */}
                <a
                  href={`/demo/enter?as=${p.key}`}
                  className={`group flex items-center gap-4 rounded-3xl border p-4 transition active:scale-[0.99] ${i === 0 ? "border-crimson bg-crimson text-on-crimson" : "border-line bg-card"}`}
                >
                  <span className="min-w-0 flex-1">
                    <span className={`block text-xs tracking-[0.14em] uppercase ${i === 0 ? "text-gold-soft" : "text-gold"}`}>{p.role}</span>
                    <span className="mt-1 block font-display text-2xl leading-tight">{p.name}</span>
                    <span className={`mt-1 block text-sm ${i === 0 ? "text-on-crimson/80" : "text-muted"}`}>{p.blurb}</span>
                  </span>
                  <ArrowRight className="size-5 shrink-0 transition group-hover:translate-x-0.5" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-3xl border border-line bg-card p-5">
          <h2 className="flex items-center gap-2 font-display text-2xl">
            <HandCoins className="size-5 text-gold" />
            Five things to try
          </h2>
          <ol className="mt-4 space-y-3">
            {TRY.map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-paper text-sm font-medium tabular-nums">{i + 1}</span>
                <span className="pt-0.5">{t}</span>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-8 text-center text-sm text-muted">
          A preview, not the finished hub. Your comments decide what we build next.
        </p>
      </div>
    </div>
  );
}
