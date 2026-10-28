"use client";
import { ArrowLeft, RotateCw } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { signInWithGoogle } from "@/lib/auth/client";
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
  // eslint-disable-next-line @next/next/no-img-element -- small local photos; next/image would add a server round trip on 3G
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={`w-full bg-line object-cover ${className}`} />;
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
        className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-line bg-white px-5 text-base font-medium text-[#1f1f1f] shadow-sm transition active:scale-[0.99] disabled:opacity-60"
      >
        <GoogleMark />
        {busy ? "Opening Google…" : "Continue with Google"}
      </button>
      {error ? <p role="alert" className="mt-3 text-sm text-crimson">{error}</p> : null}
      <p className="mt-4 text-center text-xs text-muted">We only read your name and email from Google. Nothing is posted.</p>
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
        className="h-12 w-full rounded-2xl border border-line bg-card px-4 text-base outline-none transition-colors focus:border-crimson"
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
        <button
          type="button"
          onClick={onRetry ?? (() => window.location.reload())}
          className="mt-4 inline-flex h-12 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium"
        >
          <RotateCw className="size-4" />
          Try again
        </button>
      </div>
    );
  }
  if (empty) return <p className="rounded-3xl border border-line bg-card p-5 text-muted">{empty}</p>;
  return children;
}

export function Back({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-4 inline-flex h-12 items-center gap-2 text-sm text-muted">
      <ArrowLeft className="size-5" />
      {label}
    </Link>
  );
}

export function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.max(4, Math.min(100, Math.round((value / max) * 100))) : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-line">
      <div className="h-full rounded-full bg-crimson transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
    </div>
  );
}
