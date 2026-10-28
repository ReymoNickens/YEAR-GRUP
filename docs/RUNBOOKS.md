# Runbooks

## A payment shows pending but the member says they paid
The pay screen asks the gateway every few seconds, and the member can press "I have paid". If it still shows pending: find the reference, check the Paystack dashboard. If Paystack shows success, press the same check as the treasurer or wait for the webhook retry. Do not post anything by hand; the ledger only accepts a gateway-confirmed event.

## Webhook errors
Look for 5xx on `/api/paystack/webhook`. Paystack retries on its own. A `webhook_rejected` audit entry means a payment could not apply (amount or gateway mismatch): the treasurer decides, and a refund goes through the normal refund path.

## Reconciliation mismatch
Control room, Money, "Run reconciliation" (also nightly). Unbalanced transactions should be impossible; if any appear, stop and investigate. A clearing difference means a payment row and the ledger disagree. A gateway mismatch lists the references.

## Refund on a channel that cannot refund
Request it as "paid out another way". The approver attaches the payout reference. The ledger posts only after that second person confirms.

## Messages are not arriving
Control room, Communication shows text-message states. `held_budget`: the monthly budget was reached. `dead_letter`: five attempts failed, read `last_error`. Check `SMS_PROVIDER` and key; the job is `/api/cron/outbox` (see docs/SETUP.md, step 7, for how often it runs).

## Add an organisation
Copy `config/organisations/aggrey-2010.example.json`, edit, run `npm run provision -- <file> --dry-run`, then without the flag against the production `DATABASE_URL`. Without direct database access, generate SQL instead with `scripts/provision-sql.ts` and paste it into the Supabase SQL editor. List the founders' emails first: only those people are seated as officers. It never overwrites an existing organisation.

## A member lost their phone number
An executive uses "move a number" (needs a fresh code). The member then verifies the new number. Approvals wait 24 hours after a number changes.

## Rotate secrets
Change `PAYSTACK_SECRET_KEY`, `SMS_API_KEY`, `CRON_SECRET`, `HUB_OTP_PEPPER` in the host, redeploy. A new pepper invalidates codes in flight, which expire in ten minutes anyway.

## Weekly ledger copy
Control room, Money, "Download the ledger". An executive keeps the file somewhere the executives control. Every download is in the audit log.

## Restore
Enable point-in-time recovery in Supabase (Database → Backups) and rehearse a restore before launch. After a restore, run reconciliation.
