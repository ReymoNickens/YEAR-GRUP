import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell } from "@/components/hub/shell";
import { YearSignIn } from "@/components/hub/ui";
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
        <p className="kicker kicker-red mt-6">Find your year group</p>
        <h1 className="display-lg mt-4">The year group, <span className="serif-italic">in one place.</span></h1>
        <p className="mt-4 text-lg text-muted">Take your place by house, dorm and cot. See every cedi given and where it went. The chat stays on WhatsApp.</p>
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
      <h1 className="display-md">Your year group</h1>
      <ul className="mt-6 space-y-3">
        {orgs.map((org) => (
          <li key={org.slug}>
            <Link href={`/o/${org.slug}`} className="block border border-line bg-card p-5">
              <span className="display-sm">{org.name}</span>
              <span className="mt-1 block text-sm text-muted">{org.branding.motto} · {org.branding.place}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
