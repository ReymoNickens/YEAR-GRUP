import "server-only";

export type Envelope<T> = { ok: true; value: T } | { ok: false; message: string };

/**
 * Plain Errors carry messages written for members (fail(), money rules).
 * Database and driver errors carry a `code`; those are logged and replaced
 * with a calm general message, so nothing internal reaches the screen.
 */
export async function envelope<T>(fn: () => Promise<T>): Promise<Envelope<T>> {
  try {
    return { ok: true, value: await fn() };
  } catch (e) {
    const err = e as Error & { code?: unknown };
    if (err instanceof Error && err.code === undefined && err.constructor === Error && err.message) {
      return { ok: false, message: err.message };
    }
    console.error("[hub] unexpected error", e);
    return { ok: false, message: "Something went wrong on our side. Try again in a moment." };
  }
}
