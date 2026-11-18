"use client";
import { BookUser, CalendarCheck, CalendarDays, Heart, House, Images, Mail, Store, UserRound, UsersRound, Vote } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useOrgFace } from "@/components/hub/org-context";
import { Avatar, Wordmark } from "@/components/hub/ui";

const tabs = [
  { suffix: "/home", label: "Home", icon: House },
  { suffix: "/circles", label: "Circles", icon: UsersRound },
  { suffix: "/give", label: "Give", icon: Heart },
  { suffix: "/people", label: "People", icon: BookUser },
  { suffix: "/me", label: "Me", icon: UserRound },
] as const;

const more = [
  { suffix: "/dues", label: "My dues", icon: CalendarCheck },
  { suffix: "/m/events", label: "Events", icon: CalendarDays },
  { suffix: "/m/photos", label: "Photos", icon: Images },
  { suffix: "/m/polls", label: "Polls", icon: Vote },
  { suffix: "/m/directory", label: "Businesses", icon: Store },
  { suffix: "/m/inbox", label: "Messages", icon: Mail },
] as const;

/**
 * The frame of every screen. Phones: the crest and name on top, one task in the
 * middle, five tabs at the bottom. Wide screens: a sidebar with the same five,
 * plus the year group's other rooms, and a composed page beside it.
 */
export function Shell({
  slug,
  children,
  nav = true,
  wide = false,
}: {
  slug?: string;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  nav?: boolean;
  wide?: boolean;
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
      {/* Wide screens: the sidebar. */}
      {home ? (
        <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col border-r border-line px-5 py-7 lg:flex">
          <Link href={`${base}/home`} aria-label={`${name}, home`} className="px-2">
            <Wordmark name={name} motto={motto} />
          </Link>
          <nav aria-label="Main" className="mt-9">
            <ul className="space-y-0.5">
              {tabs.map((t) => {
                const on = isOn(t.suffix);
                const Icon = t.icon;
                return (
                  <li key={t.label}>
                    <Link
                      href={`${base}${t.suffix}`}
                      aria-current={on ? "page" : undefined}
                      className={`flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] transition-colors ${on ? "bg-card font-semibold text-ink shadow-[inset_0_0_0_1px_var(--line-2)]" : "text-muted hover:bg-sunk hover:text-ink"}`}
                    >
                      <Icon className={`size-[18px] ${on ? "text-crimson" : ""}`} strokeWidth={on ? 2.25 : 1.75} />
                      {t.label}
                      {t.label === "Give" && !on ? <span className="ml-auto size-1.5 rounded-full bg-crimson" aria-hidden /> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="kicker mt-9 px-3">The year group</p>
            <ul className="mt-2 space-y-0.5">
              {more.map((t) => {
                const on = isOn(t.suffix);
                const Icon = t.icon;
                return (
                  <li key={t.label}>
                    <Link href={`${base}${t.suffix}`} aria-current={on ? "page" : undefined} className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors ${on ? "bg-sunk font-medium text-ink" : "text-muted hover:bg-sunk hover:text-ink"}`}>
                      <Icon className="size-4" strokeWidth={1.75} />
                      {t.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {meName ? (
            <Link href={`${base}/me`} className="mt-auto flex items-center gap-3 border-t border-line px-2 pt-5">
              <Avatar name={meName} size={36} me />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{org?.me?.nickname || meName}</span>
                <span className="block truncate text-xs text-muted">{meName}</span>
              </span>
            </Link>
          ) : null}
        </aside>
      ) : null}

      <div className="min-w-0 flex-1">
        {/* Phones: the top bar. */}
        <header className="sticky top-0 z-20 border-b border-line/70 bg-paper/80 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex h-16 max-w-xl items-center justify-between gap-3 px-5">
            <Link href={home ? `${base}/home` : "/"} aria-label={`${name}, home`} className="min-w-0">
              <Wordmark name={name} motto={motto} />
            </Link>
            {home && meName ? (
              <Link href={`${base}/me`} aria-label="Me" className="grid size-11 place-items-center">
                <Avatar name={meName} size={34} me />
              </Link>
            ) : null}
          </div>
        </header>

        <main className={`mx-auto w-full px-5 pt-6 lg:px-12 lg:pt-12 ${wide ? "max-w-xl lg:max-w-[1120px]" : "max-w-xl lg:max-w-[760px]"} ${nav ? "pb-32 lg:pb-16" : "pb-10"}`}>
          {children}
        </main>
      </div>

      {/* Phones: the tab bar. A floating black plate; the page you are on gets a red-tinted pill. */}
      {nav && home ? (
        <nav aria-label="Main" className="pointer-events-none fixed inset-x-0 bottom-0 z-20 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] lg:hidden">
          <ul className="pointer-events-auto mx-auto flex max-w-md justify-between rounded-[26px] border border-line-2 bg-[#0e0e11]/90 px-1.5 py-1.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            {tabs.map((t) => {
              const on = isOn(t.suffix);
              const Icon = t.icon;
              return (
                <li key={t.label} className="flex-1">
                  <Link
                    href={`${base}${t.suffix}`}
                    aria-current={on ? "page" : undefined}
                    className={`flex h-[54px] flex-col items-center justify-center gap-0.5 rounded-[20px] text-[11px] font-medium tracking-[0.01em] transition-colors ${on ? "bg-crimson-fill/20 text-ink" : "text-muted active:bg-sunk"}`}
                  >
                    <Icon className={`size-[21px] ${on ? "text-crimson" : ""}`} strokeWidth={on ? 2.2 : 1.6} fill={on && t.label === "Give" ? "currentColor" : "none"} />
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
