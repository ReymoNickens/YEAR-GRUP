import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, House, UserRound, Users, Waypoints } from "lucide-react";
import type { ReactNode } from "react";
import { Crest } from "@/components/hub/ui";

const items = [
  { to: "/o/$slug/home", label: "Home", icon: House, suffix: "/home" },
  { to: "/o/$slug/circles", label: "Circles", icon: Users, suffix: "/circles" },
  { to: "/o/$slug/people", label: "People", icon: Waypoints, suffix: "/people" },
  { to: "/o/$slug/give", label: "Give", icon: Heart, suffix: "/give" },
  { to: "/o/$slug/me", label: "Me", icon: UserRound, suffix: "/me" },
] as const;

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
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex w-full max-w-lg items-center gap-3 px-5 pt-5">
        <Crest />
        <div>
          <p className="text-xs tracking-[0.18em] text-gold uppercase">{eyebrow ?? "Your year group"}</p>
          <p className="font-display text-xl leading-none">{title ?? "Year Group Hub"}</p>
        </div>
      </header>
      <main className={`mx-auto w-full max-w-lg px-5 pt-6 ${nav ? "pb-28" : "pb-10"}`}>{children}</main>
      {nav && slug ? (
        <nav className="fixed inset-x-0 bottom-0 border-t border-line bg-card/95 backdrop-blur">
          <ul className="mx-auto flex max-w-lg justify-between px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
            {items.map((item) => {
              const active = path.includes(item.suffix);
              const Icon = item.icon;
              return (
                <li key={item.label} className="flex-1">
                  <Link
                    to={item.to}
                    params={{ slug }}
                    className={`flex h-14 flex-col items-center justify-center gap-0.5 text-xs ${active ? "text-crimson" : "text-muted"}`}
                  >
                    <Icon className="size-5" strokeWidth={1.75} />
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
