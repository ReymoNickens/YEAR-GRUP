import { currentUser } from "@/lib/auth/supabase";
import { getSql, withScope } from "@/lib/db";
import { isOfficer, isTreasurer, requireMember } from "@/lib/hub/core";
import { ledgerCsv } from "@/lib/hub/ledger-export";

/** Download the ledger as a spreadsheet. Officers only; every download is in the audit log. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await currentUser();
  if (!user) return new Response("Sign in first.", { status: 401 });
  try {
    const out = await withScope({ userId: user.userId }, async () => {
      const sql = await getSql();
      const { org, member, roles } = await requireMember(sql, slug, user.userId);
      if (!isOfficer(roles)) return null;
      return { ...(await ledgerCsv(sql, org.id, member.id, isTreasurer(roles))), slug: org.slug };
    });
    if (!out) return new Response("The ledger export is for officers of this year group.", { status: 403 });
    const day = new Date().toISOString().slice(0, 10);
    return new Response(out.csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${out.slug}-ledger-${day}.csv"`,
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error && !("code" in e) ? e.message : "The export did not finish. Try again.";
    return new Response(message, { status: 400 });
  }
}
