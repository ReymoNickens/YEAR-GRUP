import { cookies } from "next/headers";
import { DEMO_COOKIE, readDemoCookie } from "@/lib/demo";
import { demoMode } from "@/lib/hub/util";

/** A slim bar on every demo screen: it is a preview, who you are, and how to switch. */
export async function DemoRibbon() {
  if (!demoMode()) return null;
  const who = readDemoCookie((await cookies()).get(DEMO_COOKIE)?.value);
  const name = who ? (who.persona.memberId ? who.persona.name.replace(/ “.*”/, "") : "a new member") : "";
  return (
    <div className="relative z-40 border-b border-line bg-[#0d0d10] text-[#f3f1ec] print:hidden">
      <div className="mx-auto flex min-h-11 items-center justify-between gap-3 px-5 pt-[env(safe-area-inset-top)] text-[13px] lg:px-8">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.14em] text-[#ff6a7e] uppercase"><span className="size-1.5 rounded-full bg-[#ef2b4c] shadow-[0_0_8px_#ef2b4c]" aria-hidden />Preview</span>
          <span className="truncate text-white/80">
            {who ? <>You are <span className="font-medium text-white">{name}</span>{who.persona.memberId ? <span className="hidden sm:inline"> · {who.persona.role}</span> : null}</> : "Made-up classmates, test money"}
          </span>
        </span>
        <a href={who ? "/demo/leave" : "/demo"} className="inline-flex min-h-11 shrink-0 items-center text-[13px] font-medium text-white/80 hover:text-white">
          {who ? "Switch person" : "Start"}<span aria-hidden className="ml-1">→</span>
        </a>
      </div>
    </div>
  );
}
