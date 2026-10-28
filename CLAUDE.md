# Year Group Hub

@AGENTS.md

Read first: `README.md`, `docs/SETUP.md`, `docs/ARCHITECTURE.md`, `docs/PROGRESS.md` (update it at the end of every session).

## Stack

Next.js 16 (App Router) on Vercel · Supabase (Postgres + Google sign-in) · Paystack · SMS (Arkesel/mNotify).
Supabase project: `year-grup` (`bkdcgdwzekhqrpbecxgo`, eu-west-2).

## Layout

```
src/app/                 pages (thin) and route handlers (webhook, cron, ledger export, auth callback)
src/components/hub/      screens ("use client"); they import server calls only from src/lib/hub/api.ts
src/lib/hub/             business logic; core.ts and handlers.ts hold the server functions
src/lib/hub/actions.ts   server actions wrapping each server function (keep in step with them)
src/lib/server-fn.ts     createServerFn builder: auth + one RLS transaction per call
src/lib/db.ts            pg pool, withScope (role hub_app), getSql, getSystemSql (privileged)
supabase/migrations/     schema; supabase/sample/ fictional cohort for local and tests only
supabase/manual/         SQL to paste into the Supabase SQL editor
```

## Rules

1. Only a verified gateway event changes a payment. Never post to the ledger from the screen.
2. Ledger and audit rows are append-only; corrections are new entries.
3. Every tenant table has `organisation_id`, RLS and a cross-tenant test. No code branches on an organisation's name.
4. New server function: add it with `createServerFn`, then add a matching action in `actions.ts` and an export in `api.ts`.
5. Errors for members: `fail("plain sentence")`. Database errors are never shown.
6. New migration: `supabase/migrations/<yyyymmddhhmmss>_<name>.sql`, end with `select hub_apply_grants();`,
   then regenerate `supabase/manual/setup-supabase.sql` with `node scripts/setup-sql.mjs`.
   The Supabase connector's confirmation prompts cannot be answered from a cloud session; give the owner SQL to paste.
7. UI: one task per screen, tap targets 48px+, plain words (see `src/lib/hub/words.ts`), test at 390px wide in light and dark.

## Commands

`npm run dev` · `npm test` · `npm run lint` · `npm run typecheck` · `npm run build`
