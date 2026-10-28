import type { Envelope } from "./envelope";

/** Turn a server action returning an envelope back into a plain async function that throws. */
export function unwrap<R>(action: (input?: { data?: unknown }) => Promise<Envelope<R>>) {
  return async (input?: { data?: unknown }): Promise<R> => {
    const out = await action(input);
    if (!out.ok) throw new Error(out.message);
    return out.value;
  };
}
