import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { formatGhs } from "@/lib/hub/money";

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
  return <img src={src} alt={alt} className={`w-full object-cover ${className}`} />;
}

export function YearSignIn() {
  return (
    <div className="space-y-3">
      {GROK_PROVIDERS.map((p) => (
        <button
          key={p.providerId}
          type="button"
          onClick={() => signIn(p.providerId, { callbackURL: "/" })}
          className="flex h-12 w-full items-center justify-center rounded-full bg-crimson px-5 text-on-crimson"
        >
          Continue with {p.label}
        </button>
      ))}
    </div>
  );
}

export function Crest({ className = "h-12 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 80" className={className} aria-hidden="true">
      <path d="M8 6h48l4 10-28 58L4 16z" className="fill-crimson" />
      <path d="M12 18h40L32 68z" className="fill-gold-soft" />
      <path d="M32 28l10 8h-20z" className="fill-crimson" />
      <path d="M18 44h28v3H18z" className="fill-gold" />
    </svg>
  );
}

export function Money({ value }: { value: number }) {
  return <span className="tabular-nums">{formatGhs(value)}</span>;
}

export function Button({
  children,
  onClick,
  type = "button",
  disabled,
  tone = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  tone?: "primary" | "quiet";
}) {
  const look =
    tone === "primary"
      ? "bg-crimson text-on-crimson"
      : "bg-card text-ink border border-line";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 w-full items-center justify-center rounded-full px-5 text-base font-medium transition disabled:opacity-50 ${look}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "text" | "tel" | "decimal" | "numeric";
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      <input
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-2xl border border-line bg-card px-4 outline-none"
      />
    </label>
  );
}

export function Choice({
  title,
  detail,
  onClick,
  selected,
}: {
  title: string;
  detail?: string;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-16 w-full rounded-3xl border px-4 py-3 text-left ${selected ? "border-crimson bg-gold-soft" : "border-line bg-card"}`}
    >
      <span className="block font-display text-2xl leading-tight">{title}</span>
      {detail ? <span className="mt-1 block text-sm text-muted">{detail}</span> : null}
    </button>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}

export function SampleTag() {
  return <span className="rounded-full bg-gold-soft px-2 py-0.5 text-xs font-medium text-gold">Sample</span>;
}

export function State({
  loading,
  error,
  empty,
  children,
}: {
  loading?: boolean;
  error?: string;
  empty?: string | null;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="h-8 w-40 animate-pulse rounded-full bg-line" />
        <div className="h-28 animate-pulse rounded-3xl bg-line" />
        <div className="h-20 animate-pulse rounded-3xl bg-line" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-3xl border border-line bg-card p-5">
        <h2 className="font-display text-2xl">That did not go through</h2>
        <p className="mt-2 text-muted">{error}</p>
      </div>
    );
  }
  if (empty) return <p className="rounded-3xl border border-line bg-card p-5 text-muted">{empty}</p>;
  return children;
}

export function Back({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="mb-4 inline-flex h-12 items-center gap-2 text-sm text-muted">
      <ArrowLeft className="size-5" />
      {label}
    </a>
  );
}

export function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.max(4, Math.min(100, Math.round((value / max) * 100))) : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-line">
      <div className="h-full rounded-full bg-crimson" style={{ width: `${pct}%` }} />
    </div>
  );
}
