"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useOrgFace } from "@/components/hub/org-context";
import { Avatar, Crest } from "@/components/hub/ui";

const tabs = [
  { suffix: "/home", label: "Home" },
  { suffix: "/circles", label: "Circles" },
  { suffix: "/give", label: "Give" },
  { suffix: "/people", label: "Roll" },
  { suffix: "/me", label: "Me" },
] as const;

const more = [
  { suffix: "/dues", label: "My dues" },
  { suffix: "/m/events", label: "Calendar" },
  { suffix: "/m/inbox", label: "Notices" },
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
 * The frame of every screen, as an honours board. Wide screens: a dark board down
 * the left with the crest, the year group lettered, and the rooms in small capitals.
 * Phones: the board across the top, the page below, and five words at the bottom.
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
  /** The page brings its own board band at the very top (Home), so the main area starts flush. */
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
        <aside className="board sticky top-0 hidden h-dvh w-[272px] shrink-0 flex-col border-r border-[#2f2a23] px-7 py-8 lg:flex">
          <Link href={`${base}/home`} aria-label={`${name}, home`} className="block">
            <Crest className="h-16 w-14" />
            <span className="lettered mt-5 block text-[1.15rem]">{name}</span>
            {motto ? <span className="mt-1 block font-display text-[1.05rem] italic text-muted">{motto}</span> : null}
          </Link>
          <div className="moulding mt-6" aria-hidden />
          <nav aria-label="Main" className="mt-5">
            <ul>
              {tabs.map((t) => {
                const on = isOn(t.suffix);
                return (
                  <li key={t.label}>
                    <Link
                      href={`${base}${t.suffix}`}
                      aria-current={on ? "page" : undefined}
                      className={`group flex h-11 items-center gap-3 text-[0.78rem] font-semibold tracking-[0.2em] uppercase transition-colors ${on ? "text-gilt" : "text-ink-2 hover:text-gilt-hi"}`}
                    >
                      <span aria-hidden className={`h-px transition-all duration-300 ${on ? "w-6 bg-gilt" : "w-3 bg-[#4a4135] group-hover:w-5 group-hover:bg-gilt-line"}`} />
                      {t.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-8 font-display text-[1rem] italic text-muted">The year group</p>
            <ul className="mt-2">
              {more.map((t) => {
                const on = isOn(t.suffix);
                return (
                  <li key={t.label}>
                    <Link href={`${base}${t.suffix}`} aria-current={on ? "page" : undefined} className={`flex h-9 items-center text-[0.95rem] transition-colors ${on ? "text-gilt" : "text-muted hover:text-ink"}`}>
                      {t.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {meName ? (
            <Link href={`${base}/me`} className="mt-auto flex items-center gap-3 border-t border-[#2f2a23] pt-5">
              <Avatar name={meName} size={38} me />
              <span className="min-w-0">
                <span className="block truncate text-[0.95rem]">{org?.me?.nickname || meName}</span>
                <span className="block truncate text-[0.8rem] text-muted">{org?.me?.nickname ? meName : "Your page"}</span>
              </span>
            </Link>
          ) : null}
        </aside>
      ) : null}

      <div className="min-w-0 flex-1">
        <header className="board sticky top-0 z-20 border-b border-[#2f2a23] lg:hidden">
          <div className="mx-auto flex h-16 max-w-xl items-center justify-between gap-3 px-5">
            <Link href={home ? `${base}/home` : "/"} aria-label={`${name}, home`} className="flex min-w-0 items-center gap-3">
              <Crest className="h-10 w-9 shrink-0" />
              <span className="min-w-0 leading-none">
                <span className="lettered block truncate text-[0.92rem]">{name}</span>
                {motto ? <span className="mt-1 block truncate font-display text-[0.95rem] italic text-muted">{motto}</span> : null}
              </span>
            </Link>
            {home && meName ? (
              <Link href={`${base}/me`} aria-label="Me" className="grid size-11 place-items-center">
                <Avatar name={meName} size={34} me />
              </Link>
            ) : null}
          </div>
        </header>

        <main className={`mx-auto w-full ${bleed ? "" : "px-5 pt-7 lg:px-14 lg:pt-14"} ${wide || bleed ? "max-w-xl lg:max-w-[1160px]" : "max-w-xl lg:max-w-[780px]"} ${nav ? "pb-28 lg:pb-20" : "pb-12"}`}>
          {children}
        </main>
      </div>

      {nav && home ? (
        <nav aria-label="Main" className="board fixed inset-x-0 bottom-0 z-20 border-t border-[#2f2a23] lg:hidden">
          <ul className="mx-auto flex max-w-xl justify-between px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
            {tabs.map((t) => {
              const on = isOn(t.suffix);
              return (
                <li key={t.label} className="flex-1">
                  <Link
                    href={`${base}${t.suffix}`}
                    aria-current={on ? "page" : undefined}
                    className={`relative flex h-[58px] items-center justify-center text-[0.7rem] font-semibold tracking-[0.18em] uppercase transition-colors ${on ? "text-gilt" : "text-muted"}`}
                  >
                    <span aria-hidden className={`absolute top-0 h-[2px] transition-all duration-300 ${on ? "w-8 bg-gilt" : "w-0 bg-transparent"}`} />
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
