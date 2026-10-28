# Architecture

## Request scope

`authMiddleware` resolves the signed-in user, then runs the whole server function inside `withScope` (`src/lib/db.ts`):

1. begin a transaction,
2. `set local role hub_app` (not the owner, no BYPASSRLS),
3. record `app.user_id`; the handler adds `app.org_id` and `app.member_id` once it knows them (`orgBySlug`, `memberByUser`).

`getSql()` returns the scoped client inside a scope, so existing queries join the transaction without change. The privileged client (`getSystemSql`) exists for migrations, the webhook's reference lookup, scheduled jobs and one read of the auth user table. Nothing else uses it.

Errors thrown inside a scope roll everything back. Anything that must survive a refusal (a one-time-code attempt counter) is therefore returned as a result, not thrown.

## Database rules (`migrations/0004`, `0005`)

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

Server functions are written as literal `createServerFn(...).handler(...)` chains so the compiler can split the handler out of the browser bundle. Wrapping the chain in a helper silently defeats that and ships SQL to the browser. `npm run check:leaks` fails the build if any server-only marker appears in browser files.
