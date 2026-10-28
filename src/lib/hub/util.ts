/** Small helpers shared by the hub modules. No framework imports, so Node tests can load it. */

export function num(v: unknown): number {
  const n = typeof v === "bigint" ? Number(v) : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function str(v: unknown): string | null {
  return v == null ? null : String(v);
}

export function nid(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

export function fail(message: string): never {
  throw new Error(message);
}

export function like(q: string): string {
  return `%${q.trim().replace(/[%_\\]/g, "").slice(0, 60)}%`;
}

/** ISO week key such as 2026-W41, used for idempotent weekly jobs. */
export function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * The executive demo (HUB_DEMO=1): a hosted copy with fictional classmates and
 * test money, where visitors choose who to be instead of signing in. Never set
 * it on the real hub; live payments refuse to start while it is on.
 */
export function demoMode(): boolean {
  return process.env.HUB_DEMO === "1";
}

/** What the demo switches on: codes on screen, the test gateway, and CONFIRM in place of a text code. */
const DEMO_CONVENIENCES = new Set(["HUB_DEV_OTP", "HUB_ALLOW_TEST_GATEWAY", "HUB_ALLOW_TEST_STEPUP"]);

/** Dev conveniences (test gateway, on-screen codes) are off in production, except in the demo. */
export function devFlag(name: string): boolean {
  if (demoMode() && DEMO_CONVENIENCES.has(name)) return true;
  return !isProduction() && process.env[name] === "1";
}
