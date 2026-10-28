/** Small, pure helpers for the giving screens. */

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function under1000(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h) parts.push(`${ONES[h]} hundred`);
  if (rest) {
    const words = rest < 20 ? ONES[rest] : `${TENS[Math.floor(rest / 10)]}${rest % 10 ? `-${ONES[rest % 10]}` : ""}`;
    parts.push(h ? `and ${words}` : words);
  }
  return parts.join(" ");
}

function wholeInWords(n: number): string {
  if (n === 0) return "zero";
  const parts: string[] = [];
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;
  if (millions) parts.push(`${under1000(millions)} million`);
  if (thousands) parts.push(`${under1000(thousands)} thousand`);
  if (rest) parts.push(rest < 100 && parts.length ? `and ${under1000(rest)}` : under1000(rest));
  return parts.join(" ");
}

/** "Two hundred Ghana cedis and fifty pesewas", as a receipt book writes it. */
export function cedisInWords(pesewas: number): string {
  const cedis = Math.floor(pesewas / 100);
  const p = pesewas % 100;
  const text = `${wholeInWords(cedis)} Ghana ${cedis === 1 ? "cedi" : "cedis"}${p ? ` and ${wholeInWords(p)} pesewas` : ""}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "just now", "12 minutes ago", "3 hours ago", "2 days ago", then a date. */
export function timeAgo(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} ${m === 1 ? "minute" : "minutes"} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ${h === 1 ? "hour" : "hours"} ago`;
  const d = Math.round(h / 24);
  if (d < 14) return d === 1 ? "yesterday" : `${d} days ago`;
  return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** The three parts of a pledge, matching how the server splits it. */
export function pledgeParts(gift: number): [number, number, number] {
  const part = Math.floor(gift / 3);
  return [part, part, gift - 2 * part];
}

/** 0244123456 or +233244123456 -> "024 412 3456". */
export function localPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("233") ? `0${digits.slice(3)}` : digits;
  return local.length === 10 ? `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}` : local;
}

/** Headline figures without the pesewas: "GH₵19,400". */
export function wholeCedis(pesewas: number): string {
  return `GH₵${Math.floor(pesewas / 100).toLocaleString("en-GH")}`;
}
