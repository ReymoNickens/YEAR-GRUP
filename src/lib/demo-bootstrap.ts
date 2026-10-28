import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getSystemSql } from "@/lib/db";
import { demoMode } from "@/lib/hub/util";

const g = globalThis as typeof globalThis & { __demoReady__?: Promise<void> };

/**
 * The executive preview fills an empty database by itself, so setting it up is
 * one step (the connection string), not two. Only in demo mode, only when the
 * hub's tables are missing, and the whole file runs as one transaction.
 * Two first visitors at once: the second waits on the lock, then finds the work done.
 */
export function ensureDemoDatabase(): Promise<void> {
  if (!demoMode()) return Promise.resolve();
  g.__demoReady__ ??= (async () => {
    const sql = await getSystemSql();
    const have = await sql<{ t: string | null }>`select to_regclass('public.organisation')::text as t`;
    if (have[0]?.t) return;
    const file = await readFile(join(process.cwd(), "supabase", "manual", "setup-demo.sql"), "utf8");
    // The file opens its own transaction; take a lock inside it so two cold starts do not both load it.
    const script = file.replace(/^begin;$/m, "begin;\nselect pg_advisory_xact_lock(727007);");
    try {
      await sql.query(script);
    } catch (e) {
      const again = await sql<{ t: string | null }>`select to_regclass('public.organisation')::text as t`;
      if (!again[0]?.t) throw e; // someone else loaded it meanwhile: fine
    }
  })().catch((e) => {
    g.__demoReady__ = undefined; // try again on the next visit
    throw e;
  });
  return g.__demoReady__;
}
