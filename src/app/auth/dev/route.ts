import { NextResponse, type NextRequest } from "next/server";

/** Local testing only (HUB_DEV_AUTH=1, never in production): /auth/dev?email=a@b.c signs in as that email. */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production" || process.env.HUB_DEV_AUTH !== "1") return new Response("Not found.", { status: 404 });
  const url = new URL(request.url);
  const email = url.searchParams.get("email") ?? "";
  const next = url.searchParams.get("next") ?? "/";
  const res = NextResponse.redirect(new URL(next.startsWith("/") && !next.startsWith("//") ? next : "/", url.origin));
  if (email) res.cookies.set("hub_dev_user", email, { httpOnly: true, sameSite: "lax", path: "/" });
  else res.cookies.delete("hub_dev_user");
  return res;
}
