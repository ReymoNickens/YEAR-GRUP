import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { OrgProvider } from "@/components/hub/org-context";
import { currentUser } from "@/lib/auth/supabase";
import { getSystemSql } from "@/lib/db";
import { demoMode } from "@/lib/hub/util";

/**
 * Every screen inside a year group needs a signed-in person. The year group's
 * name and motto are loaded once here, so every header shows them.
 */
export default async function OrgLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{3,60}$/.test(slug)) notFound();
  if (!(await currentUser())) {
    if (demoMode()) redirect("/demo");
    const path = (await headers()).get("x-hub-path") ?? `/o/${slug}`;
    redirect(`/login?next=${encodeURIComponent(path)}`);
  }
  const sql = await getSystemSql();
  const rows = await sql<{ name: string; branding: Record<string, string> }>`select name, branding from organisation where slug = ${slug}`;
  if (!rows[0]) notFound();
  const b = rows[0].branding ?? {};
  return <OrgProvider org={{ slug, name: b.shortName ?? rows[0].name, motto: b.motto ?? "", place: b.place ?? "" }}>{children}</OrgProvider>;
}
