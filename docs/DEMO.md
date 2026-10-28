# The executive preview

A hosted copy of the hub with made-up classmates and test money, for the executives to tap
through on their own phones before the full build. No Google account, no SMS, no real money.

**Address:** https://year-grup-reymonickens-projects.vercel.app → opens on `/demo`.

## What they can do

| Be | What they see |
| --- | --- |
| A new old boy | Joining: name, phone code (shown on screen), programme, class, house, dorm, cot, work. Then "Confirm me now", which skips waiting for two cot mates. |
| Kwame, house captain | Home with the latest notice and the library appeal, his circles, and the full giving journey. |
| Paa Kwesi, treasurer | The money desk: what has come in, expenses waiting (he can approve the reunion cards), refunds, the ledger download. |
| Kweku, executive | The control room: who has joined, announcements to one house, dorm, cot or class, and the second signature on the large bus expense. |

### Giving, the part to show first

1. As Kwame, **Give** → **the 2007 library**. The appeal page shows the total, how many have given,
   recent gifts on the noticeboard, his cot drawn as beds, and the house cup.
2. Choose ₵200, or **In three bits** to show pay-in-bits.
3. **Check it** shows the fees and exactly what the library receives.
4. **Pay**: choose MTN MoMo, **Send the approval prompt**, type any four digits, **Send**.
   (Or **Card**: a test card is filled in.) Cancel instead to show "Not paid, nothing was charged".
5. The receipt from the receipt book, the library's new total, Balmer-Acquaah's place in the house
   cup, the cot count, and **Tell your cot on WhatsApp**.

Every figure comes from the real ledger rules; the money is not real.

## Setting it up (once)

One step. In Supabase → project **year-grup** → **Connect** → **Transaction pooler**, copy the
connection string and put the database password in it (forgotten it? Project Settings → Database →
Reset database password). In Vercel → project **year-grup** → Settings → Environment Variables, add it
as `DATABASE_URL` (Production and Preview), then Deployments → Redeploy.

The first visit loads the demo data into the empty database by itself
(`src/lib/demo-bootstrap.ts`, demo mode only). To load it by hand instead, paste
[`supabase/manual/setup-demo.sql`](../supabase/manual/setup-demo.sql) into the SQL Editor.
For the real hub later, the database is reset and `setup-supabase.sql` is used: see `docs/SETUP.md`.

Already set on Vercel: `HUB_DEMO=1`, `DEMO_SECRET`, `CRON_SECRET`, `HUB_OTP_PEPPER`, the Supabase URL and key.

## Safety

- `HUB_DEMO=1` turns on codes on screen, the test checkout and the skip-ahead confirmation.
  Live payments refuse to start while it is on. Never set it on the real hub.
- The preview link is public (Vercel's login wall is off for this project so the executives can
  open it). Everything in it is made up. Turn protection back on in Vercel → Settings →
  Deployment Protection when the preview is over.
- Data accumulates as people try things. To start fresh, reset the database and paste the file again.
