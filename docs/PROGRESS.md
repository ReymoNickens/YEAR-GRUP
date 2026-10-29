# Progress

Update this at the end of every session.

## 29 Oct 2026: the exercise book and the blackboard (branch `claude/honours-board`)

The owner found the Honours Board still common and too focused on money ("the boys should feel
welcomed"). From two concept pages (the four signature ideas, then three sample Home screens) the
owner chose **the mix plus blackboard and chalk**, in **red and black**. System in `docs/DESIGN.md`.

- New type: Alfa Slab One (painted signs), Kalam (biro and chalk), Special Elite (typewriter),
  Literata (reading). Light mode is the exercise book; dark mode is the blackboard.
- Home leads with the boys: chalked date and Akwaaba, the boys in your city (or newest on the roll),
  birthdays in the next ten days (`src/lib/hub/birthdays.ts`, tested), posts, the notice board, the
  next meet-up. Money left the Home alert and is one quiet line at the end.
- Tabs are now Home, Boys, Meet, Circles, Me; Give and My dues moved to the side list and Me.
- Demo: sample file `20261029110050_sample_welcome.sql` restores the nicknames (Wayo, Obonto,
  Wetbone, Reymo) on databases loaded earlier and puts Amable's welcome notice on the board.
  `demo-bootstrap.ts` now runs new sample files even when no migration is pending (each sample is
  safe to re-run and is recorded once).
- Next: the owner judges the preview; then carry the look through the remaining screens
  (giving, receipt, circles, control room) and merge into the live branch.

## 29 Oct 2026: design reset, Stage A (branch `claude/honours-board`)

The executives found the redesign still common. Direction chosen with the owner: **The Honours
Board** (gilt names on a dark board; papers pinned to it), a warm and ceremonial voice, 2007 as the
year we left school. Concept, audit and system in `docs/DESIGN.md`.

- Built on its own branch with its own preview link:
  https://year-grup-git-claude-honours-board-reymonickens-projects.vercel.app/demo
  (the live demo on `claude/practical-volta-ezvr3s` is untouched). A branch-scoped `DATABASE_URL`
  points the preview at the same demo database.
- Done in Stage A: tokens, type (Cormorant Garamond lettering, Source Serif 4 text and figures),
  the frame, **Home** and **My dues**. Other screens inherit type and colour only.
- Home counts only real things: confirmed members, confirmed givers. `branding.cohort` = 2007.
- Stage B, after approval: the demo landing, giving journey, receipt, circles, roll, Me, events,
  notices and the control room, then merge into the live branch.

## 29 Oct 2026: the preview's officers, by name

The executives asked for their own names and offices in the preview:
**Amable (President)**, **Charles Armah (Financial Secretary)**, **Stephen Tawiah (Organiser)**.

- An office can carry the year group's own title (`role_assignment.title`, migration
  `20261029100000_role_titles.sql`); permissions stay on the role key. President = executive,
  Financial Secretary = treasurer, Organiser = new `organiser` role.
- The Organiser can put events on the calendar (`event_create`), see who is coming by house, and
  remind those who have not answered (opens Messages with the event chosen). No money desk.
- The money desk is now only for officers who keep or sign for money (`canSeeMoney`).
- Sample officers renamed in `supabase/sample/20261029100050_sample_officers.sql`; their invented
  nicknames, work and lines were cleared because they are real people.
- Demo personas: Kwame (member), President, Financial Secretary, Organiser, and a new old boy.
  A renamed persona can take over its sample membership from the old demo login.
- Their demo journeys interlock: the Organiser's bus expense (GH₵3,500) needs both the President
  and the Financial Secretary; the Financial Secretary's refund needs the President.

## 29 Oct 2026: member dues

Each member now has **My dues** (`/o/<slug>/dues`): what is due now, every year (or month) with what
was paid towards it, a two-tap way to pay, and their dues receipts. Linked from Home (a "Dues due"
nudge, a dues summary and a shortcut), the sidebar, Give and Me.

- `dues_plan` table (migration `20261029090000_dues_plan.sql`): a rate per year or per month from a
  date. A new rate is a new row from a later date; rows are history (update and delete refused).
- What a member has paid is never stored: it is read from the ledger (fund credits on their dues
  payments, less refunds). `src/lib/hub/dues.ts` turns rates + paid into a statement, applying
  payments to the oldest period first (tested in `dues.test.ts`).
- Money desk has a **Dues** tab: paid up X of N, collected, still owed, who is behind (names, house,
  amount), a link to send a reminder, and setting the rate (treasurer or executive, with a fresh
  text-message code).
- Dues receipts read "being year group dues", and the share button becomes "Remind your cot".
- Sample cohort: GH₵ 240 a year from 2025, 22 sample dues payments (`scripts/gen-dues-sample.mjs`).
- The demo database now catches up on migrations it has not run (`catchUp` in
  `src/lib/demo-bootstrap.ts`), so the live preview picked this up without a paste.
- For the real Supabase project, `supabase/manual/setup-supabase.sql` is regenerated and includes
  the new table. No dues rate is set there: the treasurer sets it from the money desk.

## 28 Oct 2026 (night): full UI redesign

The executives' first reaction to the preview was that it looked amateur and the crest was wrong.
Rebuilt every screen on a new design system, borrowing each pattern from where it is done best:
Memories (poster type, square edges, ruled lists, one signature object), GoFundMe (the appeal page),
Cash App (the amount keypad), Apple Pay (the check slip and the success tick), Monzo (home at a
glance), Linear and Stripe (sidebar, dashboard, tables).

- Type: Instrument Serif for what we say, Geist for what you do, Geist Mono for numbers on paper.
- Colour: the crest's red and black on warm paper; full dark mode.
- Desktop: a real sidebar and two-column pages (appeal with a sticky give panel), not a stretched phone.
- The receipt is the signature piece: receipt-book paper, perforations, handwritten lines, rubber stamp.
- Motto corrected to **Dwin Hwe Kan**. The crest comes from the organisation's branding
  (`public/orgs/mfantsipim-2007/crest.png`); until the file is in the repo a shield in the crest's
  colours stands in. **Waiting on the owner to upload the official crest file.**
- Home shows what you have given and how many have given to the appeal (new fields in `homeData`).
- Fees are not covered by default: the member chooses on the check slip.

## 28 Oct 2026 (later): executive demo is live

**Live:** https://year-grup.vercel.app/demo (Vercel project `year-grup`, `HUB_DEMO=1`).

- The demo database sets itself up on first visit from `supabase/manual/setup-demo.sql`
  (40 fictional members, 171 ledger lines, 4 migrations recorded).
- Checked live: landing page, entering as Kwame (his home opens; membership linked and phone
  verified in the database). No new runtime errors since the last deploy.
- Fixed on the way: `scripts/setup-sql.mjs` creates `supabase_migrations.schema_migrations` when a
  project has none.

**Owner to do after the preview**
- Change the Supabase database password (it was shared in chat), then update `DATABASE_URL` in Vercel.
- Delete the older preview-only `DATABASE_URL` entry in Vercel.
- Turn Vercel deployment protection back on once the executives have seen it.

**Next (after executives approve):** real setup with `setup-supabase.sql`, Google OAuth client,
SMS provider, live Paystack keys.

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
