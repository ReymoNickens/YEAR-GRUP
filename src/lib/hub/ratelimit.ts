import type { Sql } from "../scope-core.ts";
import { fail } from "./util.ts";

/** Fixed-window counter kept in the database, so it holds across serverless instances. */
export async function hit(sql: Sql, bucket: string, limit: number, windowSeconds: number) {
  const rows = await sql.query<{ hits: number }>(
    `insert into rate_limit (bucket, window_start, hits)
     values ($1, to_timestamp(floor(extract(epoch from now()) / $2::int) * $2::int), 1)
     on conflict (bucket, window_start) do update set hits = rate_limit.hits + 1
     returning hits`,
    [bucket, windowSeconds],
  );
  const hits = Number(rows[0]?.hits ?? 1);
  if (hits === 1) await sql`delete from rate_limit where window_start < now() - interval '1 day'`;
  return { allowed: hits <= limit, hits, remaining: Math.max(0, limit - hits) };
}

export async function enforce(sql: Sql, bucket: string, limit: number, windowSeconds: number, message: string) {
  const r = await hit(sql, bucket, limit, windowSeconds);
  if (!r.allowed) fail(message);
  return r;
}
