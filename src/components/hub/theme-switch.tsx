"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";
const options: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "Match my phone", icon: Monitor },
];

const listeners = new Set<() => void>();
const read = (): Theme => {
  const t = typeof document === "undefined" ? "light" : document.documentElement.dataset.theme;
  return t === "dark" || t === "system" ? t : "light";
};
function apply(t: Theme) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("hub-theme", t); } catch { /* private window: the choice lasts until the page closes */ }
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => void listeners.delete(l);
}

/** Light, Dark, or follow the phone. Light unless this person chooses otherwise; kept on this device. */
export function ThemeSwitch() {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
  return (
    <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-1 rounded-2xl bg-sunk p-1">
      {options.map(({ id, label, icon: Icon }) => {
        const on = theme === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => apply(id)}
            className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[12px] font-semibold transition-all ${on ? "bg-card text-ink shadow-[var(--shadow-card)]" : "text-muted hover:text-ink"}`}
          >
            <Icon className="size-[18px]" strokeWidth={on ? 2.2 : 1.75} />
            <span className="leading-tight">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
