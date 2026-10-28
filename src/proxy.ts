import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Keeps the Supabase session cookie fresh on every page request. It does not
 * authorise anything: every server action checks the session itself, and the
 * database enforces who may see what.
 */
export async function proxy(request: NextRequest) {
  // Pages that need a sign-in send people back to where they were going.
  request.headers.set("x-hub-path", request.nextUrl.pathname + request.nextUrl.search);
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
      },
    },
  });
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api/paystack|api/cron|media|sw.js|offline.html|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
