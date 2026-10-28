# Progress

Update this at the end of every session.

## 28 Oct 2026: moved to Next.js + Supabase

Started from the Grok build (`year-group-hub-v2.zip`, reviewed at 74/100) and kept its business
logic, database rules and tests.

**Built**
- Next.js 16.4.3 app on the house stack (same pattern as TRANSPORT). Every Grok screen ported.
- Google sign-in through Supabase Auth; phone number confirmed once after sign-in.
- Supabase migrations, plus a lock-down so Supabase's REST roles reach nothing.
- `supabase/manual/setup-supabase.sql`: one paste creates everything, with Mfantsipim 2007 and its
  structure (no sample people, no sample money) and the founder `esseljeffery@gmail.com`.
- Review fixes: the webhook confirms every charge with Paystack's verify API; officers can download
  the ledger as CSV (anonymous givers hidden except from the treasurer; each download audited);
  the photo archive loads one album at a time, at most 24 photos.
- UI/UX: consistent header with the year group's name; clearer tab icons; screens open instantly
  from the last saved copy and refresh; "Try again" on errors; Google-style sign-in button;
  join progress bar that never jumps and survives a reload; SMS code autofill; Circles grouped into
  where you sat / you chose / join / browse; quick gift amounts; the review shows what the cause
  receives; a thank-you screen with the receipt; save or print a receipt; plain words for message
  states, ledger accounts and control-room areas; light and dark mode.

**Tested**
- 101 automated tests pass; lint and typecheck clean; production build passes.
- End to end on a local Postgres in a phone-sized browser: join (all steps), give, pay with the
  test gateway, receipt, every member module, every control-room area, ledger download (and refusal
  for non-officers). Production build checked: local test sign-in is off, security headers present.

**Not yet done / risky**
- The database is not in Supabase yet: paste `supabase/manual/setup-supabase.sql` (docs/SETUP.md step 1).
  The Supabase connector's approval prompts could not be answered from the build session.
- Google OAuth client, Vercel project and environment variables: owner steps in docs/SETUP.md.
- Not exercised against live Paystack or a live SMS provider.
- Scheduled jobs run daily on Vercel's free plan; text messages need a 10-minute schedule (SETUP step 7).
- Residence is one current placement, not a history across forms (brief section 5).
- Circles have open or hidden visibility; there is no "request to join, admin approves" yet.
- The Me screen is long (profile, modules and officer tools on one page); split it next.

**Decisions needed (brief section 16)**
- Platform fee rate and who bears it by default; signatories and expense thresholds.
- First campaign and target (the live database starts with none).
- SMS provider and monthly budget.
- Final product name.
