import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import pg from "pg";
import { applyScope, setTenant as setTenantGucs, toSql, type Run, type ScopeInit, type Sql } from "./scope-core";

export type { Sql } from "./scope-core";

/**
 * One pool per server instance. On Supabase, DATABASE_URL is the transaction
 * pooler (port 6543). node-postgres sends unnamed statements, which that
 * pooler accepts.
 *
 * Driver parsing: int8 (count, sums) comes back as a number and dates as
 * 'YYYY-MM-DD' text, so every value is JSON-safe for the screens.
 */
const OID_INT8 = 20;
const OID_DATE = 1082;
const OID_INTERVAL = 1186;

const globalRef = globalThis as typeof globalThis & { __hubPool__?: pg.Pool; __hubScope__?: AsyncLocalStorage<ScopeStore> };
type ScopeStore = { sql: Sql; run: Run };

function pool(): pg.Pool {
  if (!globalRef.__hubPool__) {
    const url = process.env.DATABASE_URL?.trim();
    if (!url) throw new Error("DATABASE_URL is not set.");
    pg.types.setTypeParser(OID_INT8, Number);
    pg.types.setTypeParser(OID_DATE, (v) => v);
    pg.types.setTypeParser(OID_INTERVAL, (v) => v);
    globalRef.__hubPool__ = new pg.Pool({
      connectionString: url,
      max: 5,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 10_000,
      ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false },
    });
  }
  return globalRef.__hubPool__;
}

const storage = (globalRef.__hubScope__ ??= new AsyncLocalStorage<ScopeStore>());

/**
 * The privileged client: the database owner, which bypasses row level security.
 * Only for the webhook's reference lookup, scheduled jobs and reading the
 * signed-in person's email from Supabase Auth. Request handlers use getSql().
 */
export async function getSystemSql(): Promise<Sql> {
  const p = pool();
  return toSql(async <T>(text: string, params: unknown[]) => (await p.query(text, params)).rows as T[]);
}

/**
 * Run `fn` as one request: a single transaction as the restricted hub_app role,
 * with the caller recorded for the row level security policies. Anything `fn`
 * does through getSql() joins the transaction, and an error rolls it all back.
 */
export async function withScope<T>(init: ScopeInit, fn: () => Promise<T>): Promise<T> {
  if (storage.getStore()) return fn(); // nested calls share the request transaction
  const client = await pool().connect();
  try {
    await client.query("begin");
    const run: Run = async <R>(text: string, params: unknown[]) => (await client.query(text, params)).rows as R[];
    await applyScope(run, init);
    const result = await storage.run({ sql: toSql(run), run }, fn);
    await client.query("commit");
    return result;
  } catch (err) {
    await client.query("rollback").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

/** Inside a request scope, the scoped client. Outside one, the privileged client. */
export async function getSql(): Promise<Sql> {
  return storage.getStore()?.sql ?? getSystemSql();
}

/** Tell the row level security policies which organisation and member this request acts as. */
export async function setTenant(orgId: string | null, memberId: string | null = null): Promise<void> {
  const store = storage.getStore();
  if (store) await setTenantGucs(store.run, orgId, memberId);
}
