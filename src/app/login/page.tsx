import { redirect } from "next/navigation";
import { Shell } from "@/components/hub/shell";
import { YearSignIn } from "@/components/hub/ui";
import { currentUser } from "@/lib/auth/supabase";
import { demoMode } from "@/lib/hub/util";

export const metadata = { title: "Sign in" };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next: raw, error } = await searchParams;
  const next = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  if (await currentUser()) redirect(next);
  if (demoMode()) redirect("/demo");
  return (
    <Shell nav={false} title="Year Group Hub" eyebrow="Sign in">
      <h1 className="font-display text-4xl">Sign in to take your place.</h1>
      <p className="mt-3 text-muted">Use your Google account. After that we confirm your phone number once, so your classmates know it is you.</p>
      {error ? (
        <p role="alert" className="mt-5 rounded-2xl bg-gold-soft px-4 py-3 text-sm text-ink">
          That sign-in did not finish. Nothing was saved. Try again.
        </p>
      ) : null}
      <div className="mt-8">
        <YearSignIn next={next} />
      </div>
    </Shell>
  );
}
