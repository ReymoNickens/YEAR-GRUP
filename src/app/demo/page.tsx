import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Avatar, Crest } from "@/components/hub/ui";
import { PERSONAS, demoSlug } from "@/lib/demo";
import { getSystemSql } from "@/lib/db";
import { ensureDemoDatabase } from "@/lib/demo-bootstrap";
import { demoMode } from "@/lib/hub/util";
import { wholeCedis } from "@/lib/hub/words-money";

export const metadata = { title: "Executive preview" };

const PROMISES = [
  { title: "Everyone in their place", body: "House, dorm, cot and class, the way we lived it. Cot mates confirm each other, so every member is a real old boy." },
  { title: "Every cedi in the open", body: "Each gift goes through the gateway onto a ledger. Fees on their own line. Nothing is typed in by hand." },
  { title: "Made for our phones", body: "One task per screen, light on data, quick on a weak signal. The chat stays on WhatsApp." },
];

const TRY = [
  ["Join as a new old boy", "and find your cot."],
  ["Give ₵200 to the library as Kwame,", "and watch the total and the house cup move."],
  ["Approve the reunion cards expense", "as the treasurer, then download the ledger."],
  ["Send an announcement to one house", "as an executive."],
  ["Open Photos, Polls and Businesses", "from the sidebar or the Me tab."],
];

/** The front page of the executive demo: what this is, who you can be, and what to try. */
export default async function DemoHome() {
  if (!demoMode()) notFound();
  let org: { id: string; name: string; branding: Record<string, string> } | undefined;
  let numbers = { members: 0, verified: 0, raised: 0, target: 0 };
  try {
    await ensureDemoDatabase();
    const sql = await getSystemSql();
    const slug = demoSlug();
    const rows = await sql<{ id: string; name: string; branding: Record<string, string> }>`
      select id, name, branding from organisation where listed and (${slug} = '' or slug = ${slug}) order by created_at limit 1
    `;
    org = rows[0];
    if (org) {
      const n = await sql<{ members: number; verified: number; raised: number; target: number }>`
        select
          (select count(*)::int from membership where organisation_id = ${org.id}) as members,
          (select count(*)::int from membership where organisation_id = ${org.id} and status = 'verified') as verified,
          coalesce((select sum(case when l.direction = 'credit' then l.amount_pesewas else -l.amount_pesewas end)::int
             from ledger_entry l join purpose p on p.id = l.purpose_id
             where l.organisation_id = ${org.id} and l.account = 'fund' and p.hero), 0) as raised,
          coalesce((select target_pesewas from purpose where organisation_id = ${org.id} and hero limit 1), 0) as target
      `;
      if (n[0]) numbers = n[0];
    }
  } catch (e) {
    console.error("[demo] database not reachable", e);
    return <NotConnected />;
  }
  const name = org?.branding?.shortName ?? org?.name ?? "Year Group Hub";
  const motto = org?.branding?.motto ?? "";
  const crest = org?.branding?.crest ?? "";
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto w-full max-w-[1200px] px-5 pb-20 lg:px-12">
        <header className="flex items-center gap-3 border-b border-line py-5">
          <Crest src={crest} className="h-12 w-11" label={`${name} crest`} />
          <div className="leading-none">
            <p className="text-[15px] font-semibold tracking-[-0.01em]">{name}</p>
            {motto ? <p className="kicker mt-1.5">{motto}</p> : null}
          </div>
          <p className="kicker ml-auto hidden sm:block">Executive preview</p>
        </header>

        <div className="lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <section className="rise pt-10 lg:pt-16">
            <p className="kicker kicker-red">A preview for the executives</p>
            <h1 className="display-xl mt-5">The year group, <span className="serif-italic">in one place.</span></h1>
            <p className="mt-6 max-w-[34ch] text-lg leading-relaxed text-ink-2">
              Tap through it as a member would. The classmates and the money here are made up, so press anything.
            </p>

            <dl className="mt-10 grid grid-cols-3 border-y border-line">
              <div className="py-4 pr-3">
                <dt className="kicker">On the roll</dt>
                <dd className="figure mt-2 text-[1.75rem]">{numbers.members}</dd>
              </div>
              <div className="border-l border-line px-3 py-4">
                <dt className="kicker">Confirmed</dt>
                <dd className="figure mt-2 text-[1.75rem]">{numbers.verified}</dd>
              </div>
              <div className="border-l border-line py-4 pl-3">
                <dt className="kicker">Appeal</dt>
                <dd className="figure mt-2 text-[1.75rem]">{numbers.target ? `${Math.floor((numbers.raised / numbers.target) * 100)}%` : wholeCedis(numbers.raised)}</dd>
              </div>
            </dl>

            <ol className="mt-12 hidden space-y-8 lg:block">
              {PROMISES.map((p, i) => (
                <li key={p.title} className="grid grid-cols-[3rem_1fr] gap-2">
                  <span className="font-mono text-[13px] text-crimson-ink">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block text-[17px] font-semibold tracking-[-0.01em]">{p.title}</span>
                    <span className="mt-1 block text-[15px] leading-relaxed text-muted">{p.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rise rise-2 pt-12 lg:pt-16" aria-labelledby="who">
            <div className="rule-top pt-3">
              <h2 id="who" className="display-sm">Who would you like to be?</h2>
              <p className="mt-2 text-[15px] text-muted">Pick one. You can switch any time from the bar at the top.</p>
            </div>
            <ul className="mt-4 ruled-list border-b border-line">
              {PERSONAS.map((p, i) => (
                <li key={p.key}>
                  {/* A full page load, so the cookie and the ribbon change together. */}
                  <a href={`/demo/enter?as=${p.key}`} className="group flex items-center gap-4 py-5 transition-colors hover:bg-sunk/50">
                    {i === 0 ? (
                      <span className="grid size-14 shrink-0 place-items-center rounded-full border-[1.5px] border-dashed border-crimson text-2xl text-crimson">+</span>
                    ) : (
                      <Avatar name={p.name} size={56} />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className={`kicker block ${i === 0 ? "kicker-red" : ""}`}>{p.role}</span>
                      <span className="mt-1.5 block font-display text-[1.75rem] leading-[1.02] tracking-[-0.01em]">{p.name}</span>
                      <span className="mt-1.5 block text-sm leading-snug text-muted">{p.blurb}</span>
                    </span>
                    <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-12">
              <div className="rule-top pt-3"><h2 className="display-sm">Five things to try</h2></div>
              <ol className="mt-3 ruled-list">
                {TRY.map(([a, b], i) => (
                  <li key={a} className="grid grid-cols-[2.5rem_1fr] py-3.5 text-[15px] leading-snug">
                    <span className="font-mono text-[13px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <span><span className="font-medium">{a}</span> <span className="text-muted">{b}</span></span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </div>

        <ol className="mt-14 space-y-6 lg:hidden">
          {PROMISES.map((p, i) => (
            <li key={p.title} className="grid grid-cols-[2.5rem_1fr] gap-1 border-t border-line pt-4">
              <span className="font-mono text-[13px] text-crimson-ink">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="block text-[17px] font-semibold tracking-[-0.01em]">{p.title}</span>
                <span className="mt-1 block text-[15px] leading-relaxed text-muted">{p.body}</span>
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-16 border-t border-line pt-6 text-sm text-muted">A preview, not the finished hub. Your comments decide what we build next.</p>
      </div>
    </div>
  );
}

/** Shown instead of a crash while the preview's database is not connected yet. */
function NotConnected() {
  return (
    <div className="min-h-dvh bg-paper px-5 pt-16 text-ink">
      <div className="mx-auto max-w-lg">
        <Crest className="h-14 w-12" />
        <h1 className="display-lg mt-6">Almost ready</h1>
        <p className="mt-4 text-lg">The preview is built, but it cannot reach its database yet.</p>
        <p className="mt-3 text-muted">
          In Vercel, the project needs a <code className="rounded bg-card px-1">DATABASE_URL</code> setting: the Supabase
          connection string (Connect → Transaction pooler) with the database password filled in. Then redeploy. The demo
          data loads itself on the first visit.
        </p>
      </div>
    </div>
  );
}
