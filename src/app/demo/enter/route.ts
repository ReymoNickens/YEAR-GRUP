import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, PERSONAS, demoCookieFor, demoSlug, demoUserId } from "@/lib/demo";
import { getSystemSql } from "@/lib/db";
import { ensureDemoDatabase } from "@/lib/demo-bootstrap";
import { demoMode } from "@/lib/hub/util";

/** /demo/enter?as=kwame: become that person for this browser, then open their first screen. */
export async function GET(request: NextRequest) {
  if (!demoMode()) return new Response("Not found.", { status: 404 });
  const key = request.nextUrl.searchParams.get("as") ?? "";
  const persona = PERSONAS.find((p) => p.key === key);
  const value = persona ? demoCookieFor(persona.key) : null;
  if (!persona || !value) return NextResponse.redirect(new URL("/demo", request.url));
  await ensureDemoDatabase();
  if (persona.memberId) {
    // Tie the fictional classmate to this persona's login. Only a sample membership that is unclaimed,
    // or held by a demo login (a persona that was renamed), moves; a real account is never taken over.
    const sql = await getSystemSql();
    const demoLogins = [...PERSONAS.map((p) => p.key), "treasurer", "executive"].map(demoUserId);
    await sql`
      update membership set user_id = ${demoUserId(persona.key)}
      where id = ${persona.memberId} and sample = true and (user_id is null or user_id = any(${demoLogins}))
    `;
    // Their phone counts as verified long ago, so approvals can send the (on-screen) code.
    await sql`
      insert into phone_identity (id, user_id, phone, is_primary, verified_at)
      select ${`ph_demo_${persona.key}`}, ${demoUserId(persona.key)}, m.phone, true, now() - interval '30 days'
      from membership m where m.id = ${persona.memberId} and m.phone is not null
      on conflict do nothing
    `;
  }
  const db = await getSystemSql();
  const first = await db<{ slug: string }>`select slug from organisation where listed order by created_at limit 1`;
  const slug = demoSlug() || first[0]?.slug;
  if (!slug) return new Response("The demo has no year group yet. Load the sample data first.", { status: 503 });
  const res = NextResponse.redirect(new URL(`/o/${slug}${persona.start}`, request.url));
  res.cookies.set(DEMO_COOKIE, value, { httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 60 * 60 * 24 * 14 });
  return res;
}
