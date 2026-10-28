import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Supabase client for server code, reading and refreshing the session cookie. */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) store.set(name, value, options);
        } catch {
          // Called from a server component, where cookies are read-only. proxy.ts refreshes them.
        }
      },
    },
  });
}

export type SessionUser = { userId: string; email: string | null; name: string | null; avatar: string | null };

/** The verified signed-in person, or null. getClaims checks the token signature. */
export async function currentUser(): Promise<SessionUser | null> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;
  const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
  return {
    userId: String(claims.sub),
    email: typeof claims.email === "string" ? claims.email : null,
    name: typeof meta.full_name === "string" ? meta.full_name : typeof meta.name === "string" ? meta.name : null,
    avatar: typeof meta.avatar_url === "string" ? meta.avatar_url : null,
  };
}
