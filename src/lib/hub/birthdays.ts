/** Birthdays coming up: how many days from today (a yyyy-mm-dd date) to each person's next birthday. */
export type BirthdayRow = { month: number; day: number };

export function daysUntilBirthday(month: number, day: number, today: string): number | null {
  if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const [y, m, d] = today.split("-").map(Number);
  const start = Date.UTC(y, m - 1, d);
  // 29 February is kept on 1 March in years without it.
  const on = (year: number) => {
    const t = new Date(Date.UTC(year, month - 1, day));
    return t.getUTCMonth() === month - 1 ? t.getTime() : Date.UTC(year, 2, 1);
  };
  let next = on(y);
  if (next < start) next = on(y + 1);
  return Math.round((next - start) / 86_400_000);
}

/** The rows whose birthday falls within the next `days` days (today counts as 0), soonest first. */
export function upcoming<T extends BirthdayRow>(rows: T[], today: string, days: number): (T & { inDays: number })[] {
  return rows
    .map((r) => ({ ...r, inDays: daysUntilBirthday(r.month, r.day, today) }))
    .filter((r): r is T & { inDays: number } => r.inDays !== null && r.inDays <= days)
    .sort((a, b) => a.inDays - b.inDays);
}
