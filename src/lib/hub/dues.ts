/**
 * Dues: what a member owes, what they have paid, and what is left, period by period.
 * Pure arithmetic on whole pesewas. "Paid" is always the gateway-confirmed total from
 * the ledger; nothing here decides that money arrived.
 */

export type DuesPeriodKind = "year" | "month";

export type DuesPlan = {
  /** Whole pesewas due each period. */
  amount: number;
  period: DuesPeriodKind;
  /** First day this rate applies, YYYY-MM-DD. A later plan replaces it from its own start. */
  startsOn: string;
};

export type DuesPeriod = {
  key: string;
  label: string;
  due: number;
  paid: number;
  state: "paid" | "part" | "due";
  current: boolean;
};

export type DuesStatement = {
  periods: DuesPeriod[];
  owed: number;
  paid: number;
  outstanding: number;
  /** Paid beyond what is owed so far: it counts towards the periods to come. */
  ahead: number;
  /** The rate for the period we are in now, if any plan applies. */
  rate: number;
  period: DuesPeriodKind;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseDay(day: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(day);
  if (!m) throw new Error("Dates must be YYYY-MM-DD.");
  return { y: Number(m[1]), m: Number(m[2]) };
}

/** The periods from the first plan's start to today's period, inclusive, oldest first. */
function periodsBetween(kind: DuesPeriodKind, from: string, to: string) {
  const a = parseDay(from);
  const b = parseDay(to);
  const out: { key: string; label: string; start: string }[] = [];
  if (kind === "year") {
    for (let y = a.y; y <= b.y; y++) out.push({ key: String(y), label: String(y), start: `${y}-01-01` });
    return out;
  }
  let y = a.y;
  let m = a.m;
  while (y < b.y || (y === b.y && m <= b.m)) {
    const mm = String(m).padStart(2, "0");
    out.push({ key: `${y}-${mm}`, label: `${MONTHS[m - 1]} ${y}`, start: `${y}-${mm}-01` });
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return out;
}

/**
 * The statement for one member. Plans may change over time (a new rate from a new
 * date); each period is charged at the plan in force on its first day. Payments are
 * applied to the oldest unpaid period first.
 */
export function duesStatement(plans: DuesPlan[], paidTotal: number, today: string): DuesStatement {
  if (!Number.isInteger(paidTotal) || paidTotal < 0) throw new Error("Paid must be whole pesewas.");
  const sorted = [...plans].filter((p) => p.amount > 0).sort((x, y) => x.startsOn.localeCompare(y.startsOn));
  if (!sorted.length) return { periods: [], owed: 0, paid: paidTotal, outstanding: 0, ahead: paidTotal, rate: 0, period: "year" };
  for (const p of sorted) if (!Number.isInteger(p.amount)) throw new Error("Dues must be whole pesewas.");
  const kind = sorted[sorted.length - 1].period;
  const first = sorted[0].startsOn;
  const rateOn = (start: string) => {
    let rate = 0;
    for (const p of sorted) if (p.startsOn.slice(0, kind === "year" ? 4 : 7) <= start.slice(0, kind === "year" ? 4 : 7)) rate = p.amount;
    return rate;
  };
  const list = first > today ? [] : periodsBetween(kind, first, today);
  const todayKey = kind === "year" ? today.slice(0, 4) : today.slice(0, 7);
  let left = paidTotal;
  const periods: DuesPeriod[] = [];
  for (const p of list) {
    const due = rateOn(p.start);
    if (due <= 0) continue;
    const paid = Math.min(due, left);
    left -= paid;
    periods.push({ key: p.key, label: p.label, due, paid, state: paid >= due ? "paid" : paid > 0 ? "part" : "due", current: p.key === todayKey });
  }
  const owed = periods.reduce((n, p) => n + p.due, 0);
  const paid = Math.min(paidTotal, owed);
  return { periods, owed, paid: paidTotal, outstanding: owed - paid, ahead: left, rate: rateOn(`${todayKey}${kind === "year" ? "-01-01" : "-01"}`), period: kind };
}
