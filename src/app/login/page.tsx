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
      <p className="kicker kicker-red mt-6">Sign in</p>
      <h1 className="display-lg mt-4">Sign in to take your <span className="serif-italic">place.</span></h1>
      <p className="mt-3 text-muted">Use your Google account. After that we confirm your phone number once, so your classmates know it is you.</p>
      {error ? (
        <p role="alert" className="mt-5 border-l-[3px] border-crimson bg-card px-4 py-3 text-sm text-ink">
          That sign-in did not finish. Nothing was saved. Try again.
        </p>
      ) : null}
      <div className="mt-8">
        <YearSignIn next={next} />
      </div>
    </Shell>
  );
}
