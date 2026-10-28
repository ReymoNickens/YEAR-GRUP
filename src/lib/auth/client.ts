"use client";
import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

/** Supabase in the browser. Used only to start Google sign-in and to sign out. */
export function supabaseBrowser() {
  client ??= createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  return client;
}

/** Only same-site paths, so a crafted link cannot send someone elsewhere after sign-in. */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function signInWithGoogle(next = "/") {
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}`;
  const { error } = await supabaseBrowser().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, queryParams: { prompt: "select_account" } },
  });
  if (error) throw error;
}

/** Sign out here, and forget what this device saved for offline reading. */
export async function signOut() {
  try {
    for (const key of Object.keys(localStorage)) if (key.startsWith("ygh:")) localStorage.removeItem(key);
  } catch {
    /* storage unavailable */
  }
  await supabaseBrowser().auth.signOut();
  window.location.assign("/");
}
