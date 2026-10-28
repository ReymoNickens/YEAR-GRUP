import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, getSystemSql } from "@/lib/db";
import { fail, num } from "@/lib/hub/util";

/** Platform staff are listed by email in PLATFORM_ADMIN_EMAILS. No organisation role ever grants this. */
export function isPlatformAdmin(email: string | null, list = process.env.PLATFORM_ADMIN_EMAILS): boolean {
  if (!email || !list) return false;
  return list.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
}

/**
 * Operating figures only: members, payment volume, queue health. The query is a
 * database function that returns counts and totals. It has no access to posts,
 * donors, profiles or any action that moves money.
 */
export const platformOverview = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sys = await getSystemSql();
    const who = await sys<{ email: string | null }>`select email from "user" where id = ${context.userId}`;
    if (!isPlatformAdmin(who[0]?.email ?? null)) fail("This console is for the platform team.");
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`select * from platform_overview()`;
    return rows.map((r) => ({
      id: String(r.organisation_id), name: String(r.name), slug: String(r.slug),
      members: num(r.members), verified: num(r.verified), payments: num(r.succeeded_payments),
      volume: num(r.volume_pesewas), queued: num(r.queued_messages), dead: num(r.dead_messages),
    }));
  });
