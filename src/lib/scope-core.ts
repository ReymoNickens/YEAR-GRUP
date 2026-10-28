/**
 * Framework-free pieces of the request scope, shared by the server database
 * layer and by the test harness (which runs under plain Node, without Vite).
 *
 * A request scope is one database transaction that:
 *   1. drops to the `hub_app` role, which is subject to row level security, and
 *   2. records who is calling (`app.user_id`) and which organisation and member
 *      the request acts as (`app.org_id`, `app.member_id`).
 * Every row level security policy reads those settings, so tenant isolation does
 * not depend on each query remembering its own organisation filter.
 */

export interface Sql {
  <T = Record<string, unknown>>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]>;
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
}

export type Run = <T>(text: string, params: unknown[]) => Promise<T[]>;

/** Wrap a query runner in the tagged-template and `.query()` surface. */
export function toSql(run: Run): Sql {
  const sql = (async <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]> => {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return run<T>(text, values);
  }) as unknown as Sql;
  sql.query = <T = Record<string, unknown>>(text: string, params: unknown[] = []) => run<T>(text, params);
  return sql;
}

export type ScopeInit = {
  userId: string | null;
  orgId?: string | null;
  memberId?: string | null;
};

/** Settings are transaction-local, so they vanish when the request ends. */
export async function applyScope(run: Run, init: ScopeInit): Promise<void> {
  await run("set local role hub_app", []);
  await setTenant(run, init.orgId ?? null, init.memberId ?? null, init.userId);
}

export async function setTenant(
  run: Run,
  orgId: string | null,
  memberId: string | null,
  userId?: string | null,
): Promise<void> {
  if (userId !== undefined) {
    await run(
      "select set_config('app.user_id', $1, true), set_config('app.org_id', $2, true), set_config('app.member_id', $3, true)",
      [userId ?? "", orgId ?? "", memberId ?? ""],
    );
  } else {
    await run("select set_config('app.org_id', $1, true), set_config('app.member_id', $2, true)", [
      orgId ?? "",
      memberId ?? "",
    ]);
  }
}
