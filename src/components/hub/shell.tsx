"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useOrgFace } from "@/components/hub/org-context";
import { Avatar, Crest } from "@/components/hub/ui";

// The boys come first: the people, the meet-ups and the circles. Money is in the list below, not on the bar.
const tabs = [
  { suffix: "/home", label: "Home" },
  { suffix: "/people", label: "Boys" },
  { suffix: "/m/events", label: "Meet" },
  { suffix: "/circles", label: "Circles" },
  { suffix: "/me", label: "Me" },
] as const;

const more = [
  { suffix: "/m/inbox", label: "Notices" },
  { suffix: "/dues", label: "My dues" },
  { suffix: "/give", label: "Give" },
  { suffix: "/m/photos", label: "Photographs" },
  { suffix: "/m/polls", label: "Polls" },
  { suffix: "/m/directory", label: "Businesses" },
] as const;

/** Years since the cohort left school, in Roman numerals for the lettering. */
export function roman(n: number) {
  const map: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}

/**
 * The frame of every screen. Wide screens: a blackboard down the left, the year group
 * chalked at the top and the rooms in painted letters. Phones: a black bar at the top
 * with the crest, the page below, and five painted words at the bottom.
 */
export function Shell({
  slug,
  children,
  nav = true,
  wide = false,
  bleed = false,
}: {
  slug?: string;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  nav?: boolean;
  wide?: boolean;
  /** The page brings its own blackboard band at the very top (Home), so the main area starts flush. */
  bleed?: boolean;
}) {
  const path = usePathname() ?? "";
  const org = useOrgFace();
  const home = slug ?? org?.slug;
  const name = org?.name ?? "Year Group Hub";
  const motto = org?.motto ?? "";
  const meName = org?.me ? org.me.name : "";
  const base = home ? `/o/${home}` : "";
  const isOn = (suffix: string) => path.startsWith(`${base}${suffix}`);

  return (
    <div className="min-h-dvh bg-paper text-ink lg:flex">
      {home ? (
        <aside className="board sticky top-0 hidden h-dvh w-[280px] shrink-0 flex-col border-r-[10px] border-[#141212] px-7 py-8 lg:flex">
          <Link href={`${base}/home`} aria-label={`${name}, home`} className="block">
            <Crest className="h-16 w-14" />
            <span className="lettered mt-5 block text-[1.2rem] text-[#f4efe2]">{name}</span>
            {motto ? <span className="chalk mt-1.5 block text-[1.15rem]">{motto}</span> : null}
          </Link>
          <div className="chalk-line mt-5 w-24" aria-hidden />
          <nav aria-label="Main" className="mt-6">
            <ul>
              {tabs.map((t) => {
                const on = isOn(t.suffix);
                return (
                  <li key={t.label}>
                    <Link
                      href={`${base}${t.suffix}`}
                      aria-current={on ? "page" : undefined}
                      className={`group flex h-12 items-center gap-3 font-sign text-[1.05rem] uppercase transition-colors ${on ? "text-[#ff4d5e]" : "text-[#eeede6] hover:text-white"}`}
                    >
                      <span aria-hidden className={`h-[3px] rounded-full transition-all duration-300 ${on ? "w-6 bg-[#ff4d5e]" : "w-2 bg-[#535956] group-hover:w-4 group-hover:bg-[#eeede6]"}`} />
                      {t.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="chalk mt-8 text-[1.1rem]">Also on the board</p>
            <ul className="mt-1">
              {more.map((t) => {
                const on = isOn(t.suffix);
                return (
                  <li key={t.label}>
                    <Link href={`${base}${t.suffix}`} aria-current={on ? "page" : undefined} className={`typed flex h-10 items-center text-[0.9rem] transition-colors ${on ? "text-[#ff8a93]" : "text-[#a5a89f] hover:text-[#eeede6]"}`}>
                      {t.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {meName ? (
            <Link href={`${base}/me`} className="mt-auto flex items-center gap-3 border-t border-[#363b39] pt-5">
              <Avatar name={meName} size={40} me />
              <span className="min-w-0">
                <span className="block truncate font-sign text-[1rem] uppercase">{org?.me?.nickname || meName}</span>
                <span className="block truncate text-[0.82rem] text-[#a5a89f]">{org?.me?.nickname ? meName : "Your page"}</span>
              </span>
            </Link>
          ) : null}
        </aside>
      ) : null}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b-[3px] border-[#c8102e] bg-[#141212] text-[#f4efe2] lg:hidden">
          <div className="mx-auto flex h-16 max-w-xl items-center justify-between gap-3 px-5">
            <Link href={home ? `${base}/home` : "/"} aria-label={`${name}, home`} className="flex min-w-0 items-center gap-3">
              <Crest className="h-10 w-9 shrink-0" />
              <span className="min-w-0 leading-none">
                <span className="lettered block truncate text-[0.95rem] text-[#f4efe2]">{name}</span>
                {motto ? <span className="mt-1 block truncate font-display text-[0.95rem] text-[#b8b1a3]">{motto}</span> : null}
              </span>
            </Link>
            {home && meName ? (
              <Link href={`${base}/me`} aria-label="Me" className="grid size-12 place-items-center">
                <Avatar name={meName} size={36} me />
              </Link>
            ) : null}
          </div>
        </header>

        <main className={`mx-auto w-full ${bleed ? "" : "px-5 pt-7 lg:px-14 lg:pt-14"} ${wide || bleed ? "max-w-xl lg:max-w-[1160px]" : "max-w-xl lg:max-w-[780px]"} ${nav ? "pb-28 lg:pb-20" : "pb-12"}`}>
          {children}
        </main>
      </div>

      {nav && home ? (
        <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 border-t-[3px] border-[#c8102e] bg-[#141212] lg:hidden">
          <ul className="mx-auto flex max-w-xl justify-between px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
            {tabs.map((t) => {
              const on = isOn(t.suffix);
              return (
                <li key={t.label} className="flex-1">
                  <Link
                    href={`${base}${t.suffix}`}
                    aria-current={on ? "page" : undefined}
                    className={`relative flex h-[58px] items-center justify-center font-sign text-[0.78rem] tracking-[0.03em] uppercase transition-colors ${on ? "text-[#ff4d5e]" : "text-[#b8b1a3]"}`}
                  >
                    <span aria-hidden className={`absolute bottom-2 h-[3px] rounded-full transition-all duration-300 ${on ? "w-7 bg-[#ff4d5e]" : "w-0 bg-transparent"}`} />
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
