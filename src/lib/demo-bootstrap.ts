import "server-only";
import { readdir, readFile } from "node:fs/promises";
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
    if (have[0]?.t) return catchUp();
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

/**
 * A preview loaded before a newer migration or sample existed: run the migrations it
 * has not seen, with the sample rows that came with them (or after them), once, and
 * record each one in Supabase's history. Every file is written to be safe to run again.
 */
async function catchUp() {
  const sql = await getSystemSql();
  const root = join(process.cwd(), "supabase");
  const migrations = (await readdir(join(root, "migrations"))).filter((f) => /^\d{14}_.*\.sql$/.test(f)).sort();
  const done = new Set(
    (await sql<{ version: string }>`select version from supabase_migrations.schema_migrations`).map((r) => String(r.version)),
  );
  const pending = migrations.filter((f) => !done.has(f.slice(0, 14)));
  // Sample rows can also arrive on their own (no schema change): any sample newer than everything recorded.
  // Each sample file is written to be safe to run again, and is recorded once it has run.
  const newest = [...done].sort().at(-1) ?? "";
  const since = pending[0]?.slice(0, 14) ?? "99999999999999";
  const samples = (await readdir(join(root, "sample"))).filter((f) => {
    const v = f.slice(0, 14);
    return /^\d{14}_.*\.sql$/.test(f) && !done.has(v) && (v > since || v > newest);
  });
  if (!pending.length && !samples.length) return;
  const files = [...pending.map((f) => ({ f, dir: "migrations" })), ...samples.map((f) => ({ f, dir: "sample" }))].sort((a, b) => a.f.localeCompare(b.f));
  const parts = ["begin;", "select pg_advisory_xact_lock(727007);"];
  for (const { f, dir } of files) {
    parts.push(await readFile(join(root, dir, f), "utf8"));
    const [version, ...name] = f.replace(/\.sql$/, "").split("_");
    const label = dir === "sample" ? `sample_${name.join("_")}` : name.join("_");
    parts.push(`insert into supabase_migrations.schema_migrations (version, name) values ('${version}', '${label}') on conflict do nothing;`);
  }
  parts.push("commit;");
  await sql.query(parts.join("\n"));
}
