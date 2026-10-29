"use client";
import { ArrowLeft, ChevronRight, RotateCw, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { signInWithGoogle } from "@/lib/auth/client";
import { formatGhs } from "@/lib/hub/money";
import { useOrgFace } from "@/components/hub/org-context";

/* ── Identity ─────────────────────────────────────────────────────── */

/**
 * The school's crest. The organisation's own file when it has one; until it loads
 * (or if it is missing) a plain shield in the crest's colours holds its place.
 */
export function Crest({ src, className = "h-11 w-10", label }: { src?: string; className?: string; label?: string }) {
  const org = useOrgFace();
  const file = src ?? org?.crest ?? "";
  const [failed, setFailed] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  // A file that failed before the page came alive never fires onError; check once on mount.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);
  if (file && !failed) {
    // eslint-disable-next-line @next/next/no-img-element -- a small local file; next/image adds nothing here
    return <img ref={img} src={file} alt={label ?? ""} className={`${className} object-contain`} onError={() => setFailed(true)} />;
  }
  return (
    <svg viewBox="0 0 40 46" className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <path d="M3 3h34v17c0 12-8 19-17 23C11 39 3 32 3 20z" fill="#c8102e" stroke="#111" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M20 3v40M3 20h34" stroke="#111" strokeWidth="2.2" />
    </svg>
  );
}

/** Crest, name and motto: the year group's signature, lettered as on a board. */
export function Wordmark({ name, motto, crest, size = "md" }: { name: string; motto?: string; crest?: string; size?: "md" | "lg" }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Crest src={crest} className={size === "lg" ? "h-14 w-12 shrink-0" : "h-10 w-9 shrink-0"} />
      <span className="min-w-0 leading-none">
        <span className={`lettered block truncate ${size === "lg" ? "text-[1.1rem]" : "text-[0.95rem]"}`}>{name}</span>
        {motto ? <span className="mt-1.5 block truncate font-display text-[1rem] text-muted">{motto}</span> : null}
      </span>
    </span>
  );
}

export function initialsOf(name: string) {
  const parts = name.replace(/[“”"'][^“”"']*[“”"']/g, "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "·";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "")).toUpperCase();
}

/** A monogram painted in slab capitals on a black disc ringed in red. Your own is red. */
export function Avatar({ name, size = 40, me = false, className = "" }: { name: string; size?: number; me?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-grid shrink-0 place-items-center rounded-full font-sign leading-none tracking-[0.02em] ${me ? "bg-[#c8102e] text-white" : "border-2 border-[#c8102e] bg-[#141212] text-[#f4efe2]"} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initialsOf(name)}
    </span>
  );
}

/* ── Page structure ───────────────────────────────────────────────── */

export function Kicker({ children, red = false, className = "" }: { children: ReactNode; red?: boolean; className?: string }) {
  return <p className={`kicker ${red ? "kicker-red" : ""} ${className}`}>{children}</p>;
}

/** The top of a screen: a kicker, a serif title at poster size, one line under it. */
export function PageHead({ kicker, title, sub, action, size = "lg" }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode; action?: ReactNode; size?: "lg" | "md" }) {
  return (
    <header className="rise mb-7 flex items-end justify-between gap-4 lg:mb-10">
      <div className="min-w-0">
        {kicker ? <Kicker className="mb-3">{kicker}</Kicker> : null}
        <h1 className={size === "lg" ? "display-lg" : "display-md"}>{title}</h1>
        {sub ? <p className="mt-3 max-w-[46ch] text-[15px] text-muted lg:text-base">{sub}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

/** A titled block: a slab heading as on a painted sign, an optional action on the right. */
export function Section({ title, action, children, className = "", id }: { title: ReactNode; action?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section className={`mt-12 first:mt-0 ${className}`} aria-labelledby={id}>
      <div className="flex items-baseline justify-between gap-3 border-b-2 border-ink pb-2">
        <h2 id={id} className="font-sign text-[1.15rem] leading-tight uppercase">{title}</h2>
        {action}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function SectionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="textlink inline-flex min-h-11 items-center">
      {children}
    </Link>
  );
}

/**
 * One line in a ruled list: something on the left (an avatar or icon), a title and a
 * line under it, and a value or chevron on the right. The whole row is the target.
 */
export function Row({
  href,
  onClick,
  lead,
  title,
  sub,
  trail,
  chevron,
  className = "",
}: {
  href?: string;
  onClick?: () => void;
  lead?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  trail?: ReactNode;
  chevron?: boolean;
  className?: string;
}) {
  const inner = (
    <>
      {lead ? <span className="shrink-0">{lead}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium leading-snug">{title}</span>
        {sub ? <span className="mt-0.5 block text-sm leading-snug text-muted">{sub}</span> : null}
      </span>
      {trail ? <span className="shrink-0 text-right text-[15px]">{trail}</span> : null}
      {chevron ?? (href || onClick) ? <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden /> : null}
    </>
  );
  const cls = `group flex min-h-16 w-full items-center gap-3.5 py-3 text-left transition-colors ${className}`;
  if (href) return <Link href={href} className={`${cls} hover:bg-sunk/40`}>{inner}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={`${cls} hover:bg-sunk/40`}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

export function List({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`ruled-list ${className}`}>{children}</div>;
}

/* ── Actions ──────────────────────────────────────────────────────── */

type Tone = "primary" | "quiet" | "red";
const toneClass: Record<Tone, string> = { primary: "btn-primary", quiet: "btn-quiet", red: "btn-red" };

export function Button({
  children,
  onClick,
  type = "button",
  disabled,
  tone = "primary",
  size = "lg",
  block = true,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  tone?: Tone;
  size?: "lg" | "sm";
  block?: boolean;
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`btn ${toneClass[tone]} ${size === "sm" ? "btn-sm" : ""} ${block ? "btn-block" : ""}`}>
      {children}
    </button>
  );
}

export function ButtonLink({ href, children, tone = "primary", size = "lg", block = true, external }: { href: string; children: ReactNode; tone?: Tone; size?: "lg" | "sm"; block?: boolean; external?: boolean }) {
  const cls = `btn ${toneClass[tone]} ${size === "sm" ? "btn-sm" : ""} ${block ? "btn-block" : ""}`;
  if (external) return <a href={href} className={cls} target="_blank" rel="noopener noreferrer">{children}</a>;
  return <Link href={href} className={cls}>{children}</Link>;
}

/** The one action of the screen, pinned within thumb reach on phones; inline on desktop. */
export function Dock({ children, desktopInline = true }: { children: ReactNode; desktopInline?: boolean }) {
  return (
    <>
      <div className="h-24 lg:hidden" aria-hidden />
      <div className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/92 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md ${desktopInline ? "lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none" : ""}`}>
        <div className="mx-auto max-w-xl lg:max-w-none">{children}</div>
      </div>
    </>
  );
}

/* ── Inputs ───────────────────────────────────────────────────────── */

export function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  autoComplete,
  autoFocus,
  hint,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "text" | "tel" | "decimal" | "numeric" | "email" | "search";
  autoComplete?: string;
  autoFocus?: boolean;
  hint?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-ink-2">{label}</span>
      <input
        type={type}
        value={value}
        inputMode={inputMode}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
      {hint ? <span className="mt-2 block text-[13px] text-muted">{hint}</span> : null}
    </label>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows = 4 }: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-[13px] font-medium text-ink-2">{label}</span> : null}
      <textarea value={value} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="input resize-y leading-relaxed" />
    </label>
  );
}

/** A choice in a list of choices: a ruled row that fills black when picked. */
export function Choice({ title, detail, onClick, selected }: { title: string; detail?: string; onClick: () => void; selected?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative flex min-h-16 w-full items-center justify-between gap-3 border px-4 py-3.5 text-left transition-colors ${selected ? "border-ink bg-card shadow-[inset_4px_0_0_var(--gilt)]" : "border-line-2 bg-card hover:border-ink"}`}
    >
      <span className="min-w-0">
        <span className="block text-[17px] font-semibold leading-tight">{title}</span>
        {detail ? <span className="mt-1 block text-sm text-muted">{detail}</span> : null}
      </span>
      <span aria-hidden className={`grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] ${selected ? "border-gilt" : "border-line-2"}`}>
        {selected ? <span className="size-2.5 rounded-full bg-gilt" /> : null}
      </span>
    </button>
  );
}

export function Toggle({ on, set, title, detail }: { on: boolean; set: (v: boolean) => void; title: string; detail?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => set(!on)} className="flex min-h-16 w-full items-center justify-between gap-4 py-3 text-left">
      <span className="min-w-0">
        <span className="block text-[15px] font-medium">{title}</span>
        {detail ? <span className="mt-0.5 block text-sm text-muted">{detail}</span> : null}
      </span>
      <span className={`relative h-[30px] w-[50px] shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-gilt" : "bg-line-2"}`}>
        <span className={`absolute top-[3px] size-6 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,.2)] transition-all duration-200 ${on ? "left-[23px]" : "left-[3px]"}`} />
      </span>
    </button>
  );
}

/* ── Sheets ───────────────────────────────────────────────────────── */

/** A bottom sheet on phones, a centred panel on wide screens. Escape and the backdrop close it. */
export function Sheet({ open, onClose, title, children, label }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; label?: string }) {
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", key); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center" role="dialog" aria-modal="true" aria-label={label}>
      <button type="button" aria-label="Close" className="absolute inset-0 animate-[fade_.2s_ease-out_both] bg-black/45 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative max-h-[92dvh] w-full max-w-xl animate-[sheet_.32s_cubic-bezier(.2,.8,.2,1)_both] overflow-y-auto bg-card px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-20px_60px_rgba(0,0,0,.25)] lg:animate-[rise_.25s_ease-out_both] lg:p-8">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line-2 lg:hidden" aria-hidden />
        {title ? (
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 className="display-sm">{title}</h2>
            <button type="button" onClick={onClose} className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center text-muted hover:text-ink" aria-label="Close">
              <X className="size-5" />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

/* ── Numbers ──────────────────────────────────────────────────────── */

export function Money({ value }: { value: number }) {
  return <span className="tabular-nums">{formatGhs(value)}</span>;
}

/** A big number and what it counts. */
export function Stat({ value, label, tone }: { value: ReactNode; label: ReactNode; tone?: "red" | "paid" }) {
  return (
    <div>
      <p className={`figure text-[2rem] ${tone === "red" ? "text-crimson" : tone === "paid" ? "text-paid" : ""}`}>{value}</p>
      <p className="mt-1.5 text-[13px] text-muted">{label}</p>
    </div>
  );
}

/** Progress: a gilt line on a dark track, drawn in on arrival, with optional milestone ticks. */
export function Bar({ value, max, tone = "light", label, ticks, height = 6 }: { value: number; max: number; tone?: "light" | "onDark"; label?: string; ticks?: number[]; height?: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const shown = pct > 0 ? Math.max(1.5, pct) : 0;
  const track = tone === "onDark" ? "bg-[#363b39]" : "bg-sunk";
  const fill = tone === "onDark" ? "bg-[#f3f1ea]" : "bg-gilt";
  return (
    <div role="progressbar" aria-label={label ?? "Progress"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} className={`relative overflow-hidden ${track}`} style={{ height }}>
      <div className={`grow h-full ${fill} transition-[width] duration-1000 ease-out`} style={{ width: `${shown}%` }} />
      {ticks?.map((t) => <span key={t} aria-hidden className={`absolute top-0 h-full w-0.5 ${tone === "onDark" ? "bg-[#1b1e1d]" : "bg-paper"}`} style={{ left: `${t}%` }} />)}
    </div>
  );
}

/* ── Small things ─────────────────────────────────────────────────── */

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted">{children}</p>;
}

export function Callout({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "red" | "paid" }) {
  const bar = tone === "red" ? "border-crimson" : tone === "paid" ? "border-paid" : "border-ink";
  return <div className={`border-l-[3px] ${bar} bg-card px-4 py-3.5 text-[15px] leading-relaxed`}>{children}</div>;
}

export function SampleTag() {
  return <span className="demo-hide ml-1 inline-block border border-line-2 px-1.5 py-0.5 align-middle text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">Sample</span>;
}

export function Pill({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "red" | "paid" | "ink" }) {
  const cls = {
    plain: "border-line-2 text-ink-2",
    red: "border-crimson text-crimson-ink",
    paid: "border-paid text-paid",
    ink: "border-gilt text-gilt",
  }[tone];
  return <span className={`inline-flex h-6 items-center border px-2 text-[10.5px] font-semibold tracking-[0.14em] whitespace-nowrap uppercase ${cls}`}>{children}</span>;
}

export function State({
  loading,
  error,
  empty,
  children,
  onRetry,
}: {
  loading?: boolean;
  error?: string;
  empty?: string | null;
  children: ReactNode;
  onRetry?: () => void;
}) {
  if (loading) {
    return (
      <div className="space-y-5" aria-busy="true" aria-label="Loading">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-12 w-3/4" />
        <div className="skeleton h-40 w-full" />
        <div className="space-y-4 pt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton size-10 rounded-full" />
              <div className="flex-1 space-y-2"><div className="skeleton h-3 w-1/2" /><div className="skeleton h-3 w-3/4" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rise border-l-[3px] border-crimson bg-card p-5">
        <p className="kicker kicker-red">Not this time</p>
        <h2 className="display-sm mt-2">That did not go through</h2>
        <p className="mt-2 text-muted">{error}</p>
        <button type="button" onClick={onRetry ?? (() => window.location.reload())} className="btn btn-quiet btn-sm mt-5">
          <RotateCw className="size-4" />
          Try again
        </button>
      </div>
    );
  }
  if (empty) return <p className="border border-dashed border-line-2 p-6 text-center text-muted">{empty}</p>;
  return children;
}

export function Back({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="-ml-1 mb-5 inline-flex min-h-11 items-center gap-1.5 pr-3 text-sm font-medium text-ink-2 hover:text-ink">
      <ArrowLeft className="size-[18px]" />
      {label}
    </Link>
  );
}

export function BackButton({ onClick, label = "Back" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="-ml-1 mb-5 inline-flex min-h-11 items-center gap-1.5 pr-3 text-sm font-medium text-ink-2 hover:text-ink">
      <ArrowLeft className="size-[18px]" />
      {label}
    </button>
  );
}

/** Photographs from the sample album. Real albums use members' own photos. */
const covers: Record<string, string> = {
  field: "/media/campus.jpg",
  cape: "/media/campus.jpg",
  class: "/media/library.jpg",
  dorm: "/media/album.jpg",
  chapel: "/media/library.jpg",
  jersey: "/media/jersey.jpg",
  hoodie: "/media/hoodie.jpg",
  tie: "/media/dinner.jpg",
};

export function Cover({ motif, alt, className = "h-40" }: { motif?: string; alt: string; className?: string }) {
  const src = covers[motif ?? ""] ?? "/media/campus.jpg";
  // eslint-disable-next-line @next/next/no-img-element -- small local photos; next/image would add a server round trip on 3G
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={`w-full bg-sunk object-cover ${className}`} />;
}

/** Google sign-in, styled to Google's own button guidance so members recognise it. */
export function YearSignIn({ next = "/" }: { next?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await signInWithGoogle(next);
          } catch {
            setBusy(false);
            setError("Google did not answer. Check your connection and try again.");
          }
        }}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-[#747775] bg-white px-5 text-base font-medium text-[#1f1f1f] transition active:scale-[0.99] disabled:opacity-60"
      >
        <GoogleMark />
        {busy ? "Opening Google…" : "Continue with Google"}
      </button>
      {error ? <p role="alert" className="mt-3 text-sm text-crimson-ink">{error}</p> : null}
      <p className="mt-4 text-center text-[13px] text-muted">We only read your name and email from Google. Nothing is posted.</p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}
