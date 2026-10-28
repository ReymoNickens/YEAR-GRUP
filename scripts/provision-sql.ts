/**
 * Turn an organisation config into plain SQL, for databases this machine cannot
 * reach directly (paste it into the Supabase SQL editor, or apply it as a migration).
 *   PROVISION_SCRATCH_URL=postgres://... node --experimental-strip-types scripts/provision-sql.ts <config.json> <out.sql>
 * The scratch database must have every migration applied and no organisation with
 * this slug. Provisioning runs there for real, and every write is recorded with its
 * values inlined, so the output is exactly what `npm run provision` would do.
 */
import { readFileSync, writeFileSync } from "node:fs";
import pg from "pg";
import { toSql } from "../src/lib/scope-core.ts";
import { provision, validate, type OrgConfig } from "../src/lib/hub/provision.ts";

const [file, out] = process.argv.slice(2);
const scratch = process.env.PROVISION_SCRATCH_URL;
if (!file || !out || !scratch) {
  console.error("Usage: PROVISION_SCRATCH_URL=... provision-sql.ts <config.json> <out.sql>");
  process.exit(2);
}
const config = JSON.parse(readFileSync(file, "utf8")) as OrgConfig;
const problems = validate(config);
if (problems.length) { console.error(`Not valid:\n- ${problems.join("\n- ")}`); process.exit(1); }

const literal = (v: unknown): string =>
  v === null || v === undefined ? "null"
    : typeof v === "number" || typeof v === "boolean" ? String(v)
    : `'${(typeof v === "object" ? JSON.stringify(v) : String(v)).replaceAll("'", "''")}'`;

const pool = new pg.Pool({ connectionString: scratch });
const client = await pool.connect();
const writes: string[] = [];
try {
  await client.query("begin");
  const sql = toSql(async (text, params) => {
    if (!/^\s*select/i.test(text)) writes.push(`${text.replace(/\$(\d+)/g, (_, i) => literal(params[Number(i) - 1])).trim()};`);
    return (await client.query(text, params)).rows;
  });
  const result = await provision(sql, config);
  if (!result.created) throw new Error(`The scratch database already has ${config.slug}. Use a fresh one.`);
  await client.query("rollback"); // the scratch database stays clean
  writeFileSync(out, `-- ${config.name}: generated from ${file} by scripts/provision-sql.ts\n${writes.join("\n")}\n`);
  console.log(`Wrote ${writes.length} statements to ${out}:`, result.plan);
} catch (e) {
  await client.query("rollback").catch(() => undefined);
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
