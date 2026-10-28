# Going live: step by step

About 30 minutes. You need the Supabase dashboard, Google Cloud Console and Vercel.
The Supabase project already exists: **year-grup** (London), `https://bkdcgdwzekhqrpbecxgo.supabase.co`.

## 1. Create the database (Supabase, 2 minutes)

1. Open the Supabase dashboard → project **year-grup** → **SQL Editor** → **New query**.
2. Paste the whole of [`supabase/manual/setup-supabase.sql`](../supabase/manual/setup-supabase.sql) and press **Run**.
3. It runs as one transaction: either everything is created or nothing is. It creates the tables and
   security rules, locks Supabase's public API out of every table, and creates **Mfantsipim 2007**
   with its houses, dorms, cots, programmes, classes and circles. No sample people and no sample money.
4. `esseljeffery@gmail.com` is listed as the founder: the first sign-in with that Google account
   becomes the first officer (administrator and executive).

Check: **Table Editor** shows `organisation` with one row, and **Database → Migrations** lists four migrations.

## 2. Google sign-in (Google Cloud Console, 10 minutes)

1. <https://console.cloud.google.com> → create a project (for example "Year Group Hub").
2. **APIs & Services → OAuth consent screen**: External, app name "Year Group Hub", your support email.
   Scopes: only `email`, `profile`, `openid`. Publish the app when you are ready for members
   (while in "Testing", only listed test users can sign in).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** → Web application.
   - Authorised redirect URI: `https://bkdcgdwzekhqrpbecxgo.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client secret**.

## 3. Connect Google to Supabase (2 minutes)

1. Supabase → **Authentication → Sign In / Providers → Google**: switch on, paste the Client ID and secret, save.
2. Supabase → **Authentication → URL Configuration**:
   - **Site URL**: your Vercel address, for example `https://year-grup.vercel.app`
   - **Redirect URLs**: add `https://year-grup.vercel.app/auth/callback` and `http://localhost:3000/auth/callback`
     (add your own domain's `/auth/callback` later too).

## 4. Deploy (Vercel, 10 minutes)

1. Vercel → **Add New → Project** → import `ReymoNickens/YEAR-GRUP`. Framework: Next.js (detected).
2. **Environment variables** (Production and Preview):

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://bkdcgdwzekhqrpbecxgo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_e7GDfsw8SrGrK4i1i-chHQ_XxIZNoPz` |
| `DATABASE_URL` | Supabase → **Connect** → **Transaction pooler** (port 6543) string, with the database password filled in |
| `PUBLIC_APP_URL` | your Vercel address, for example `https://year-grup.vercel.app` |
| `CRON_SECRET` | a long random string (at least 24 characters) |
| `HUB_OTP_PEPPER` | a different long random string. Never change it while codes are in flight |
| `PLATFORM_ADMIN_EMAILS` | EvolveIT staff emails for `/platform`, comma separated |

   Leave the `HUB_DEV_*` / `HUB_ALLOW_*` switches unset: they are ignored in production anyway.
3. Deploy. Open the site, press **Continue with Google**, sign in with `esseljeffery@gmail.com`,
   and go through joining. You land as the first officer, with the **Control room** on your Me screen.

If you forgot your database password: Supabase → **Project Settings → Database → Reset database password**.

## 5. Text messages (when ready)

Without a provider, phone codes cannot be delivered, so members cannot finish joining.
Set `SMS_PROVIDER=arkesel` (or `mnotify`), `SMS_API_KEY`, and `SMS_SENDER` (an approved sender ID,
11 characters at most), then redeploy. Check delivery on MTN, Telecel and AirtelTigo before launch.

## 6. Payments (when the executives approve the fee agreement)

1. Paystack: the association's account, then a **subaccount** for its settlement bank.
2. Set `PAYSTACK_SECRET_KEY` (test key `sk_test_...` first) on Vercel.
3. Paystack → Settings → API Keys & Webhooks → webhook URL: `https://<your-domain>/api/paystack/webhook`.
4. In the SQL editor, connect the subaccount and switch the year group to live **only after** a test-mode pilot:

```sql
update organisation set paystack_subaccount = 'ACCT_xxxxxxxx' where slug = 'mfantsipim-2007';
-- after the pilot, with the live secret key set on Vercel:
update organisation set payment_mode = 'live' where slug = 'mfantsipim-2007';
```

The fee rates (`gateway_fee_bps`, `platform_fee_bps`) are settings on the organisation row,
not code. Who bears the fee is the member's choice on the review screen.

## 7. Scheduled jobs

`vercel.json` runs three jobs once a day (the most the free Vercel plan allows):
message sending (`/api/cron/outbox`), nightly reconciliation (`/api/cron/reconcile`) and the weekly digest.
In-app messages are delivered at once regardless. For text messages to go out within minutes,
either move to Vercel Pro and set the outbox schedule to `*/10 * * * *`, or schedule it from Supabase
(Database → Cron, with the `pg_net` extension) to call
`https://<your-domain>/api/cron/outbox` with header `Authorization: Bearer <CRON_SECRET>` every 10 minutes.

## 8. Before members arrive

- Supabase → **Database → Backups**: turn on point-in-time recovery and rehearse a restore.
- Two people hold admin access to Supabase, Vercel and Paystack, with credentials in a shared password manager.
- Import the member list: Control room → People → Upload a CSV (name, phone, house, dorm, cot, class).
- Run the pilot with 15 to 20 members (brief section 14).
