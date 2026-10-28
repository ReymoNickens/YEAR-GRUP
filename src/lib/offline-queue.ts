/**
 * Writes that are safe to delay (a post, an RSVP, a profile edit) wait on the
 * device when there is no connection and are sent when it returns. Money never
 * goes through here: a gift needs a live connection and an explicit status.
 *
 * Every queued action carries a client-generated id. The server remembers ids it
 * has applied, so a retry after a dropped reply never duplicates anything.
 */
export const QUEUEABLE = new Set(["post", "rsvp", "profile", "ask", "reply", "report", "support", "vote", "trivia", "milestone"]);

type Item = { clientId: string; payload: Record<string, unknown>; queuedAt: number; tries: number };
const KEY = "ygh:queue";
const FAILED = "ygh:queue-failed";
const EVENT = "ygh:queue-changed";
const MAX_TRIES = 3;

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;
const store = (): Store | null => (typeof localStorage === "undefined" ? null : localStorage);

function read<T>(key: string): T[] {
  try { return JSON.parse(store()?.getItem(key) ?? "[]") as T[]; } catch { return []; }
}
function write(key: string, items: unknown[]) {
  store()?.setItem(key, JSON.stringify(items));
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

export const queued = () => read<Item>(KEY);
export const failed = () => read<{ type: string; message: string }>(FAILED);
export const onQueueChange = (fn: () => void) => {
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
};

export function isNetworkError(e: unknown): boolean {
  if (e instanceof TypeError) return true;
  const m = e instanceof Error ? e.message : "";
  return /failed to fetch|networkerror|load failed|network request failed/i.test(m);
}

const newId = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export function enqueue(payload: Record<string, unknown>): string {
  const clientId = String(payload.clientId ?? newId());
  write(KEY, [...queued(), { clientId, payload: { ...payload, clientId }, queuedAt: Date.now(), tries: 0 }]);
  return clientId;
}

/** Send now if there is a connection; otherwise, or if the connection drops mid-send, queue it. */
export async function sendOrQueue<T>(send: (payload: Record<string, unknown>) => Promise<T>, payload: Record<string, unknown>): Promise<T | { queued: true }> {
  const withId = { ...payload, clientId: newId() };
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    enqueue(withId);
    return { queued: true };
  }
  try {
    return await send(withId);
  } catch (e) {
    if (isNetworkError(e)) {
      enqueue(withId);
      return { queued: true };
    }
    throw e;
  }
}

let flushing = false;
/** Send what is waiting, oldest first. Stops at the first connection failure. */
export async function flush(send: (payload: Record<string, unknown>) => Promise<unknown>): Promise<{ sent: number; left: number }> {
  if (flushing) return { sent: 0, left: queued().length };
  flushing = true;
  let sent = 0;
  try {
    for (const item of queued()) {
      try {
        await send(item.payload);
        write(KEY, queued().filter((i) => i.clientId !== item.clientId));
        sent++;
      } catch (e) {
        if (isNetworkError(e)) break;
        const tries = item.tries + 1;
        if (tries >= MAX_TRIES) {
          write(KEY, queued().filter((i) => i.clientId !== item.clientId));
          write(FAILED, [...failed(), { type: String(item.payload.type), message: e instanceof Error ? e.message : "The server refused it." }]);
        } else write(KEY, queued().map((i) => (i.clientId === item.clientId ? { ...i, tries } : i)));
      }
    }
  } finally {
    flushing = false;
  }
  return { sent, left: queued().length };
}

export const dismissFailed = () => write(FAILED, []);

/** Called on sign-out so nothing readable is left on a shared phone. */
export function clearOfflineData() {
  const s = store();
  if (!s) return;
  const keys: string[] = [];
  for (let i = 0; i < s.length; i++) { const k = s.key(i); if (k && k.startsWith("ygh")) keys.push(k); }
  keys.forEach((k) => s.removeItem(k));
}
