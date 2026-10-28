/**
 * Test harness: an in-process Postgres (PGlite) with every migration applied,
 * and a scoped runner that behaves exactly like a production request scope
 * (drops to hub_app, so row level security is really enforced).
 */
import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { applyScope, setTenant, toSql, type Run, type ScopeInit, type Sql } from "../scope-core.ts";

const OID_INT8 = 20;
const OID_DATE = 1082;
const OID_INTERVAL = 1186;
const identity = (v: string) => v;

export type TestDb = {
  pg: PGlite;
  /** Privileged client: owner, bypasses row level security. */
  system: Sql;
  /** Run `fn` as one request: hub_app role, one transaction, tenant settings applied. */
  scoped<T>(init: ScopeInit, fn: (sql: Sql, tenant: (orgId: string | null, memberId?: string | null) => Promise<void>) => Promise<T>): Promise<T>;
};

export async function createTestDb(): Promise<TestDb> {
  const pg = new PGlite({ parsers: { [OID_INT8]: Number, [OID_DATE]: identity, [OID_INTERVAL]: identity } });
  await pg.waitReady;
  // The roles Supabase creates for its REST API, so the lock-down migration applies as it does there.
  // Also the auth schema it owns, so tests can prove the request role cannot read it.
  await pg.exec("create role anon nologin; create role authenticated nologin; create schema auth; create table auth.users (id uuid primary key, email text); revoke all on schema auth from public;");
  // Schema migrations plus the fictional sample cohort, in filename order (the sample sits between them).
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "supabase");
  const files = ["migrations", "sample"].flatMap((d) => readdirSync(join(root, d)).filter((f) => f.endsWith(".sql")).map((f) => ({ f, path: join(root, d, f) })));
  for (const { path } of files.sort((a, b) => a.f.localeCompare(b.f))) {
    await pg.exec(readFileSync(path, "utf8"));
  }
  const sysRun: Run = async <T>(text: string, params: unknown[]) => (await pg.query<T>(text, params)).rows;
  return {
    pg,
    system: toSql(sysRun),
    async scoped(init, fn) {
      return pg.transaction(async (tx) => {
        const run: Run = async <T>(text: string, params: unknown[]) => (await tx.query<T>(text, params)).rows;
        await applyScope(run, init);
        return fn(toSql(run), (orgId, memberId = null) => setTenant(run, orgId, memberId));
      });
    },
  };
}

export const ORG = "org_2007";
