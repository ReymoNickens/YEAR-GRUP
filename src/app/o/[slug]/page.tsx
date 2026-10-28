import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth/supabase";
import { getSystemSql } from "@/lib/db";

/** The year group's door: members go home, everyone else starts joining. */
export default async function OrgDoor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await currentUser();
  const sql = await getSystemSql();
  const rows = await sql<{ id: string }>`
    select m.id from membership m join organisation o on o.id = m.organisation_id
    where o.slug = ${slug} and m.user_id = ${user?.userId ?? ""}
  `;
  redirect(rows[0] ? `/o/${slug}/home` : `/o/${slug}/join`);
}
