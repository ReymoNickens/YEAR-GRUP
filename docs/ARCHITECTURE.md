# Architecture

## Request scope

Screens call server actions (`src/lib/hub/actions.ts`). Each action runs a server function built with `createServerFn(...).middleware([authMiddleware]).handler(...)` (`src/lib/server-fn.ts`). `authMiddleware` reads the Supabase session (`src/lib/auth/supabase.ts`, signature checked with `getClaims`), then runs the whole function inside `withScope` (`src/lib/db.ts`):

1. begin a transaction,
2. `set local role hub_app` (not the owner, no BYPASSRLS),
3. record `app.user_id`; the handler adds `app.org_id` and `app.member_id` once it knows them (`orgBySlug`, `memberByUser`).

`getSql()` returns the scoped client inside a scope, so existing queries join the transaction without change. The privileged client (`getSystemSql`) exists for migrations, the webhook's reference lookup, scheduled jobs and one read of the auth user table. Nothing else uses it.

Errors thrown inside a scope roll everything back. Anything that must survive a refusal (a one-time-code attempt counter) is therefore returned as a result, not thrown.

## Database rules (`supabase/migrations`)

- Every tenant table has `organisation_id`, a tenant policy, and composite foreign keys to `(organisation_id, id)`.
- Restrictive policies hide hidden circles (and their posts, events, members) from non-members, keep welfare requests to the member and executives, and keep the audit trail to officers.
- `ledger_entry` and `audit_log` refuse update, delete and truncate for every role. A deferred constraint trigger rejects an unbalanced ledger transaction at commit.
- `hub_apply_grants()` re-applies privileges. Every migration that creates tables must end with `select hub_apply_grants();`, because a blanket GRANT would otherwise re-open the auth tables.
- Notifications are written by `hub_enqueue`, a checked security-definer function, because `INSERT ... ON CONFLICT` makes row level security hide a row from the member who caused it.
- `public_receipt`, `platform_overview`, `hub_move_phone` are narrow security-definer functions; each checks what it needs to.

## Money

`src/lib/hub/money.ts` plans the postings; `payments.ts` applies them.

| Event | Debit | Credit |
| --- | --- | --- |
| Payment succeeds | clearing | fund (and fees recovered when the payer covers fees) |
| Fees deducted | fees expense | clearing |
| Bank settles | org bank | clearing |
| Refund | fund | clearing (platform fee share reversed only if the organisation says so) |
| Expense paid | expense paid | org bank |

A live payment leaves clearing open until a treasurer confirms the bank settlement. Reconciliation checks that every transaction balances, that clearing equals unsettled payments plus refund effects, and that the gateway agrees with every live payment.

## Webhook

`handlePaystackWebhook` verifies the HMAC, finds the organisation by reference, and settles inside that organisation's scope. The event row and the postings commit together, so a failure leaves nothing that could make a retry look like a duplicate. A transient failure answers 5xx and the gateway retries. A payment that can never apply (amount or gateway mismatch) is logged for a person and answered 200.

## Client bundle

Server code imports `server-only`, so the build fails if a browser component pulls in the database layer. The screens only ever import `src/lib/hub/api.ts`, which calls the server actions and turns an error envelope back into a thrown message. Thrown messages are passed through only when they are plain member-facing errors; database errors become a calm general message and are logged.

## Supabase

- Sign-in is Supabase Auth with Google. `proxy.ts` keeps the session cookie fresh; it authorises nothing.
- The app talks to Postgres directly (`DATABASE_URL`, the transaction pooler) as the restricted `hub_app` role. Supabase's REST roles (`anon`, `authenticated`) are refused every table and function (`20261028080300_supabase_lockdown.sql`).
- `membership.user_id` holds the Supabase Auth user id as text. Email for founders and Paystack comes from the session, or from `auth.users` through the privileged client.
