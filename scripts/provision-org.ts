/**
 * Create an organisation from a configuration file.
 *   DATABASE_URL=postgres://... node --experimental-strip-types scripts/provision-org.ts config/organisations/aggrey-2010.example.json
 *   node --experimental-strip-types scripts/provision-org.ts <file> --dry-run   (no database needed)
 * It never overwrites an existing organisation. If one exists with different
 * settings, it lists the differences and stops, so nothing changes by accident.
 */
import { readFileSync } from "node:fs";
import pg from "pg";
import { toSql } from "../src/lib/scope-core.ts";
import { plan, provision, validate, type OrgConfig } from "../src/lib/hub/provision.ts";

const [file, ...flags] = process.argv.slice(2);
if (!file) { console.error("Usage: provision-org.ts <config.json> [--dry-run]"); process.exit(2); }
const config = JSON.parse(readFileSync(file, "utf8")) as OrgConfig;
const problems = validate(config);
if (problems.length) { console.error(`Not valid:\n- ${problems.join("\n- ")}`); process.exit(1); }
if (flags.includes("--dry-run")) { console.log(`Valid. This would create:`, plan(config)); process.exit(0); }
if (!process.env.DATABASE_URL) { console.error("DATABASE_URL is not set."); process.exit(2); }

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  await client.query("begin");
  const sql = toSql(async (text, params) => (await client.query(text, params)).rows);
  const out = await provision(sql, config);
  await client.query("commit");
  if (!out.created) console.log(`Already exists as ${out.organisationId}.${out.differences.length ? ` It differs from the file in: ${out.differences.join(", ")}. Nothing was changed.` : " Nothing to do."}`);
  else console.log(`Created ${out.organisationId}:`, out.plan, config.founders?.length ? "\nFounders will be seated when they sign up with the listed email." : "\nNo founders listed: add them to org_founder before anyone signs up.");
} catch (e) {
  await client.query("rollback").catch(() => undefined);
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
