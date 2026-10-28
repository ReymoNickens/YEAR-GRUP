import { redirect } from "next/navigation";
import { PlatformConsole } from "@/components/hub/platform-console";
import { currentUser } from "@/lib/auth/supabase";

export const metadata = { title: "Platform" };

export default async function Page() {
  if (!(await currentUser())) redirect("/login?next=/platform");
  return <PlatformConsole />;
}
