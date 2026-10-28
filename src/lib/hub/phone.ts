import { createHash, randomInt, timingSafeEqual } from "node:crypto";

/**
 * Normalise to E.164. Ghana numbers may be written 024..., 24..., 233..., +233...
 * Numbers that start with + and look international (members abroad) pass through.
 */
export function normalisePhone(input: string): string | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;
  const plus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (plus) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  if (digits.startsWith("00")) {
    const rest = digits.slice(2);
    return rest.length >= 8 && rest.length <= 15 ? `+${rest}` : null;
  }
  if (digits.startsWith("233") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+233${digits.slice(1)}`;
  if (digits.length === 9 && /^[235]/.test(digits)) return `+233${digits}`;
  return null;
}

export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashCode(code: string, salt: string, pepper = process.env.HUB_OTP_PEPPER ?? ""): string {
  return createHash("sha256").update(`${pepper}:${salt}:${code}`).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function maskPhone(phone: string): string {
  return phone.length <= 6 ? phone : `${phone.slice(0, 4)}${"•".repeat(phone.length - 7)}${phone.slice(-3)}`;
}
