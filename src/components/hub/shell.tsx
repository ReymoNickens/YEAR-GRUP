"use client";
import { BookUser, Heart, House, UserRound, UsersRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useOrgFace } from "@/components/hub/org-context";
import { Crest } from "@/components/hub/ui";

const items = [
  { suffix: "/home", label: "Home", icon: House },
  { suffix: "/circles", label: "Circles", icon: UsersRound },
  { suffix: "/people", label: "People", icon: BookUser },
  { suffix: "/give", label: "Give", icon: Heart },
  { suffix: "/me", label: "Me", icon: UserRound },
] as const;

/**
 * The frame of every screen: the crest and the year group's name on top, one
 * task in the middle, and the five tabs at the bottom (brief section 11).
 * Inside a year group the header always shows its name and motto, so a member
 * always knows where they are.
 */
export function Shell({
  slug,
  eyebrow,
  title,
  children,
  nav = true,
}: {
  slug?: string;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  nav?: boolean;
}) {
  const path = usePathname() ?? "";
  const org = useOrgFace();
  const heading = org?.name ?? title ?? "Year Group Hub";
  const kicker = org ? org.motto || eyebrow : eyebrow ?? "Your year group";
  const home = slug ?? org?.slug;
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="mx-auto flex w-full max-w-lg items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <Link href={home ? `/o/${home}/home` : "/"} className="flex items-center gap-3 rounded-2xl" aria-label={`${heading}, home`}>
          <Crest />
          <div>
            <p className="text-xs tracking-[0.18em] text-gold uppercase">{kicker}</p>
            <p className="font-display text-xl leading-none">{heading}</p>
          </div>
        </Link>
      </header>
      <main className={`mx-auto w-full max-w-lg px-5 pt-6 ${nav ? "pb-28" : "pb-10"}`}>{children}</main>
      {nav && home ? (
        <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 backdrop-blur">
          <ul className="mx-auto flex max-w-lg justify-between px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {items.map((item) => {
              const active = path.includes(`/o/${home}${item.suffix}`);
              const Icon = item.icon;
              return (
                <li key={item.label} className="flex-1">
                  <Link
                    href={`/o/${home}${item.suffix}`}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex h-14 flex-col items-center justify-center gap-0.5 text-xs transition-colors ${active ? "font-medium text-crimson" : "text-muted"}`}
                  >
                    {active ? <span aria-hidden className="absolute top-0 h-0.5 w-8 rounded-full bg-crimson" /> : null}
                    <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                    {item.label}
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
