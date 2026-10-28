import { cookies } from "next/headers";
import { DEMO_COOKIE, readDemoCookie } from "@/lib/demo";
import { demoMode } from "@/lib/hub/util";

/** A slim bar on every demo screen: it is a preview, who you are, and how to switch. */
export async function DemoRibbon() {
  if (!demoMode()) return null;
  const who = readDemoCookie((await cookies()).get(DEMO_COOKIE)?.value);
  const name = who ? (who.persona.memberId ? who.persona.name.replace(/ “.*”/, "") : "a new member") : "";
  return (
    <div className="relative z-40 bg-[#111] text-[#f3f1ec] print:hidden">
      <div className="mx-auto flex min-h-11 items-center justify-between gap-3 px-5 pt-[env(safe-area-inset-top)] text-[13px] lg:px-8">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="font-mono text-[10.5px] font-medium tracking-[0.16em] text-[#ff6b78] uppercase">Preview</span>
          <span className="h-3 w-px bg-white/25" aria-hidden />
          <span className="truncate text-white/80">
            {who ? <>You are <span className="font-medium text-white">{name}</span>{who.persona.memberId ? <span className="hidden sm:inline"> · {who.persona.role.toLowerCase()}</span> : null}</> : "Made-up classmates, test money"}
          </span>
        </span>
        <a href={who ? "/demo/leave" : "/demo"} className="inline-flex min-h-11 shrink-0 items-center text-[13px] font-medium text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
          {who ? "Switch person" : "Start"}
        </a>
      </div>
    </div>
  );
}
