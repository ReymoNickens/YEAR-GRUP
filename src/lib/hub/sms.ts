/** SMS providers behind one interface, so a vendor can be swapped without touching features. */

export type SmsResult = { ok: boolean; id?: string; error?: string };
export interface SmsProvider {
  name: string;
  configured: boolean;
  send(to: string, text: string): Promise<SmsResult>;
}

type Fetch = typeof fetch;
type Env = Record<string, string | undefined>;

const devProvider: SmsProvider = {
  name: "dev",
  configured: false,
  async send(to) {
    return { ok: true, id: `dev-${to}` };
  },
};

/** Arkesel v2 and mNotify quick-send. Check the vendor docs before going live. */
export function createSmsProvider(env: Env = process.env, fetchImpl: Fetch = fetch): SmsProvider {
  const name = (env.SMS_PROVIDER ?? "dev").toLowerCase();
  const key = env.SMS_API_KEY?.trim();
  const sender = env.SMS_SENDER?.trim() || "YearHub";
  if (name === "dev" || !key) return devProvider;

  if (name === "arkesel") {
    return {
      name,
      configured: true,
      async send(to, text) {
        try {
          const res = await fetchImpl(env.SMS_API_URL?.trim() || "https://sms.arkesel.com/api/v2/sms/send", {
            method: "POST",
            headers: { "api-key": key, "content-type": "application/json" },
            body: JSON.stringify({ sender, message: text, recipients: [to.replace(/^\+/, "")] }),
          });
          const body = (await res.json().catch(() => ({}))) as { status?: string; message?: string; data?: unknown };
          if (!res.ok || (body.status && body.status !== "success")) {
            return { ok: false, error: body.message ?? `Arkesel returned ${res.status}` };
          }
          return { ok: true, id: JSON.stringify(body.data ?? "").slice(0, 80) || "arkesel" };
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : "SMS request failed" };
        }
      },
    };
  }

  if (name === "mnotify") {
    return {
      name,
      configured: true,
      async send(to, text) {
        try {
          const base = env.SMS_API_URL?.trim() || "https://api.mnotify.com/api/sms/quick";
          const res = await fetchImpl(`${base}?key=${encodeURIComponent(key)}`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ recipient: [to.replace(/^\+/, "")], sender, message: text, is_schedule: false, schedule_date: "" }),
          });
          const body = (await res.json().catch(() => ({}))) as { status?: string; message?: string; code?: string };
          if (!res.ok || (body.status && body.status !== "success")) {
            return { ok: false, error: body.message ?? `mNotify returned ${res.status}` };
          }
          return { ok: true, id: body.code ?? "mnotify" };
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : "SMS request failed" };
        }
      },
    };
  }

  // Generic JSON gateway: POST { to, message, from } with a bearer key.
  const url = env.SMS_API_URL?.trim();
  if (!url) return devProvider;
  return {
    name: name || "http",
    configured: true,
    async send(to, text) {
      try {
        const res = await fetchImpl(url, {
          method: "POST",
          headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
          body: JSON.stringify({ to, message: text, from: sender }),
        });
        if (!res.ok) return { ok: false, error: `SMS gateway returned ${res.status}` };
        const body = (await res.json().catch(() => ({}))) as { id?: string };
        return { ok: true, id: body.id ?? "http" };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "SMS request failed" };
      }
    },
  };
}
