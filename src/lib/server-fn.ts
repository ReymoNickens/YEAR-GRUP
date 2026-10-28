import "server-only";
import { currentUser, type SessionUser } from "@/lib/auth/supabase";
import { withScope } from "@/lib/db";
import { fail } from "@/lib/hub/util";

/**
 * A small stand-in for the server-function builder the hub was first written
 * against, so the business code reads the same:
 *
 *   createServerFn({ method: "POST" }).validator(parse).middleware([authMiddleware]).handler(fn)
 *
 * With authMiddleware, the handler runs only for a signed-in person, inside one
 * row-level-security transaction (withScope), with `context.userId` set.
 * Next.js server actions in src/lib/hub/actions.ts expose these to the screens.
 */
export const authMiddleware = { kind: "auth" } as const;
type AuthMiddleware = typeof authMiddleware;

export type AuthContext = SessionUser;
type Handler<D, C, R> = (args: { data: D; context: C }) => Promise<R> | R;
export type ServerFn<R> = (input?: { data?: unknown }) => Promise<R>;

interface Builder<D, C> {
  validator<D2>(parse: (input: unknown) => D2): Builder<D2, C>;
  middleware(list: readonly AuthMiddleware[]): Builder<D, AuthContext>;
  handler<R>(fn: Handler<D, C, R>): ServerFn<R>;
}

function build<D, C>(parse: ((input: unknown) => D) | null, auth: boolean): Builder<D, C> {
  return {
    validator: (next) => build(next, auth),
    middleware: (list) => build(parse, auth || list.includes(authMiddleware)) as never,
    handler: (fn) => async (input) => {
      const data = (parse ? parse(input?.data) : input?.data) as D;
      if (!auth) return fn({ data, context: {} as C });
      const user = await currentUser();
      if (!user) fail("Sign in to continue.");
      return withScope({ userId: user.userId }, async () => fn({ data, context: user as C }));
    },
  };
}

// The options argument is accepted for the original call shape; every call is a POST.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createServerFn(_options?: { method?: "GET" | "POST" }): Builder<unknown, Record<string, never>> {
  return build<unknown, Record<string, never>>(null, false);
}
