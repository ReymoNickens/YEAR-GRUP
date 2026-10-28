# Year Group Hub

The digital home of the Mfantsipim 2007 year group: take your place by house, dorm and cot, find
your people, give with an honest ledger, and keep the old circles alive. Built as a platform:
the next year group or association is a configuration file, not new code.

**Stack:** Next.js 16 on Vercel · Supabase (Postgres + Google sign-in) · Paystack · Arkesel/mNotify SMS

- **Executive preview:** [`docs/DEMO.md`](docs/DEMO.md)
- **Going live:** [`docs/SETUP.md`](docs/SETUP.md) (database, Google sign-in, Vercel, SMS, Paystack)
- **Where the build is:** [`docs/PROGRESS.md`](docs/PROGRESS.md)
- **How it works:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · **When things go wrong:** [`docs/RUNBOOKS.md`](docs/RUNBOOKS.md)

## Run it locally

You need Node 22+ and a Postgres 15+ you can create databases on.

```bash
npm install
cp .env.example .env.local
```

Create a local database with the schema and the fictional sample cohort (so screens are not empty).
`auth.users` stands in for Supabase's own table:

```bash
createdb hub
psql hub -c "create role anon nologin; create role authenticated nologin; create schema auth; create table auth.users (id uuid primary key, email text);"
for f in $(ls supabase/migrations/*.sql supabase/sample/*.sql | xargs -n1 basename | sort); do psql -q hub -f supabase/*/$f; done
```

In `.env.local` set `DATABASE_URL=postgres://localhost/hub` and switch on the local helpers:

```bash
HUB_DEV_AUTH=1            # /auth/dev?email=you@example.com signs in without Google
HUB_DEV_OTP=1             # phone codes appear on screen
HUB_ALLOW_TEST_GATEWAY=1  # a "pay with test mobile money" button
HUB_ALLOW_TEST_STEPUP=1   # type CONFIRM instead of a text-message code
```

All four are ignored in production. Then:

```bash
npm run dev
```

Open http://localhost:3000/auth/dev?email=you@example.com and join the year group.

## Checks

```bash
npm test          # 101 tests on a real Postgres engine (PGlite) with every migration and the restricted role
npm run lint
npm run typecheck
npm run check     # all three
npm run build
```

The tests cover tenant isolation, the ledger's balance and immutability, payment replay and
concurrency, the webhook (signature, gateway confirmation, retries), refunds, claims and
verification, imports, one-time codes, step-up approvals, the outbox, offline rules, provisioning,
the ledger export and the assistant.

## The rules that keep money and data safe

1. Only a gateway-confirmed event moves a payment: the webhook checks Paystack's signature and then
   asks Paystack's API before anything is posted. The screen never decides success.
2. The ledger is double-entry and append-only. The database refuses edits, deletes and any
   transaction that does not balance.
3. Every request runs as the restricted `hub_app` role inside one transaction, and row level security
   decides what each member can see. Supabase's public API roles can read nothing.
4. Money, roles and settings need a fresh text-message code. Whoever requests an expense or refund
   cannot approve it.
5. Officers can download the whole ledger at any time; each download is in the audit log.
