import "server-only";
import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { demoMode } from "@/lib/hub/util";

/**
 * The executive demo. Instead of signing in, a visitor chooses who to be. The
 * choice lives in a signed cookie; the people are fictional classmates from the
 * sample cohort, and "new" gives each browser its own fresh account.
 */
export const DEMO_COOKIE = "hub_demo";
/** Which year group the demo opens. HUB_DEMO_SLUG, or the first listed year group when unset. */
export function demoSlug(): string {
  const slug = process.env.HUB_DEMO_SLUG?.trim();
  return slug && /^[a-z0-9-]{3,60}$/.test(slug) ? slug : "";
}

export type Persona = {
  key: string;
  memberId: string | null;
  name: string;
  role: string;
  blurb: string;
  /** Where they land, under /o/<slug>. */
  start: string;
};

export const PERSONAS: Persona[] = [
  {
    key: "new",
    memberId: null,
    name: "A new old boy",
    role: "Joining for the first time",
    blurb: "Sign up the way every member will: phone code, programme, class, house, dorm and cot. About two minutes.",
    start: "/join",
  },
  {
    key: "kwame",
    memberId: "mem_01",
    name: "Kwame “Killer” Mensah",
    role: "House captain, Balmer-Acquaah",
    blurb: "A confirmed member: his circles, his cot mates, the library appeal, giving and receipts.",
    start: "/home",
  },
  {
    key: "treasurer",
    memberId: "mem_11",
    name: "Paa Kwesi “Banker” Arthur",
    role: "Treasurer",
    blurb: "The money desk: every cedi in and out, expenses waiting for approval, the ledger download.",
    start: "/control/money",
  },
  {
    key: "executive",
    memberId: "mem_19",
    name: "Kweku “Bench” Annan",
    role: "Executive",
    blurb: "The control room: who has joined, claims to confirm, announcements by house or cot, the audit trail.",
    start: "/control/people",
  },
];

function secret(): string {
  const s = process.env.DEMO_SECRET?.trim() || process.env.CRON_SECRET?.trim();
  if (!s || s.length < 16) throw new Error("Set DEMO_SECRET (at least 16 characters) to run the demo.");
  return s;
}

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

/** A stable Supabase-shaped user id for a persona, or for one browser's new account. */
export function demoUserId(subject: string): string {
  const h = createHash("sha256").update(`demo:${subject}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

/** The cookie value for a persona. "new" gets a random subject, so each browser joins as its own person. */
export function demoCookieFor(key: string): string | null {
  if (!PERSONAS.some((p) => p.key === key)) return null;
  const subject = key === "new" ? `new-${randomUUID()}` : key;
  return `${subject}.${sign(subject)}`;
}

/** Read and check the cookie. Returns the persona and user id, or null. */
export function readDemoCookie(raw: string | undefined): { subject: string; persona: Persona; userId: string } | null {
  if (!demoMode() || !raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot < 1) return null;
  const subject = raw.slice(0, dot);
  const given = Buffer.from(raw.slice(dot + 1));
  const want = Buffer.from(sign(subject));
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;
  const persona = PERSONAS.find((p) => (subject.startsWith("new-") ? p.key === "new" : p.key === subject));
  if (!persona) return null;
  return { subject, persona, userId: demoUserId(subject) };
}
