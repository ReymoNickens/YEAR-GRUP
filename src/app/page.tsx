import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell } from "@/components/hub/shell";
import { Cover, YearSignIn } from "@/components/hub/ui";
import { currentUser } from "@/lib/auth/supabase";
import { getSystemSql } from "@/lib/db";
import { demoMode } from "@/lib/hub/util";

/** The front door. Signed out: one promise and one button. Signed in: straight to your year group. */
export default async function Door() {
  const user = await currentUser();
  if (demoMode() && !user) redirect("/demo");
  if (!user) {
    return (
      <Shell nav={false} title="Year Group Hub" eyebrow="Find your year group">
        <Cover motif="field" alt="The hill at Kwabotwe in the late light" className="h-56 rounded-3xl" />
        <h1 className="mt-6 font-display text-4xl leading-tight">The year group, in one place.</h1>
        <p className="mt-3 text-muted">Take your place by house, dorm and cot. See every cedi given and where it went. The chat stays on WhatsApp.</p>
        <div className="mt-8">
          <YearSignIn />
        </div>
      </Shell>
    );
  }
  const sql = await getSystemSql();
  const orgs = await sql<{ slug: string; name: string; branding: Record<string, string> }>`
    select slug, name, branding from organisation where listed = true order by name
  `;
  if (orgs.length === 1) redirect(`/o/${orgs[0].slug}`);
  return (
    <Shell nav={false} title="Year Group Hub" eyebrow="Find your year group">
      <h1 className="font-display text-4xl">Your year group</h1>
      <ul className="mt-6 space-y-3">
        {orgs.map((org) => (
          <li key={org.slug}>
            <Link href={`/o/${org.slug}`} className="block rounded-3xl border border-line bg-card p-4">
              <span className="font-display text-2xl">{org.name}</span>
              <span className="mt-1 block text-sm text-muted">{org.branding.motto} · {org.branding.place}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
