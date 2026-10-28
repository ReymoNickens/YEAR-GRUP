import { cookies } from "next/headers";
import { DEMO_COOKIE, readDemoCookie } from "@/lib/demo";
import { demoMode } from "@/lib/hub/util";

/** A slim bar on every demo screen: it is a preview, who you are, and how to switch. */
export async function DemoRibbon() {
  if (!demoMode()) return null;
  const who = readDemoCookie((await cookies()).get(DEMO_COOKIE)?.value);
  return (
    <div className="bg-ink text-paper print:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-5 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 text-xs">
        <span className="min-w-0 truncate">
          <span className="mr-2 rounded-full bg-gold-soft px-2 py-0.5 font-medium text-gold">Preview</span>
          {who ? <>You are <span className="font-medium">{who.persona.memberId ? who.persona.name.replace(/ “.*”/, "") : "a new member"}</span></> : "Made-up classmates, test money"}
        </span>
        <a href={who ? "/demo/leave" : "/demo"} className="shrink-0 rounded-full border border-paper/30 px-3 py-1">
          {who ? "Switch person" : "Start"}
        </a>
      </div>
    </div>
  );
}
