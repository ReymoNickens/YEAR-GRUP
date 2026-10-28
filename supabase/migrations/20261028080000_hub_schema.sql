-- Year group hub. Tenant tables carry organisation_id.
-- Ledger and audit rows are append-only. Amounts are integer pesewas.

create table if not exists organisation (
  id text primary key,
  slug text not null unique,
  name text not null,
  type text not null,
  terminology jsonb not null,
  branding jsonb not null,
  verification_rule text not null,
  min_givers integer not null default 5,
  enabled_modules jsonb not null,
  payment_mode text not null default 'test',
  gateway_fee_bps integer not null,
  platform_fee_bps integer not null,
  reverse_platform_fee_on_refund boolean not null default false,
  expense_two_approver_pesewas integer not null default 200000,
  listed boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists structure_dimension (
  id text primary key,
  organisation_id text not null references organisation (id),
  key text not null,
  name text not null,
  sort integer not null
);

create table if not exists structure_node (
  id text primary key,
  organisation_id text not null references organisation (id),
  dimension_id text not null references structure_dimension (id),
  parent_id text references structure_node (id),
  level text not null,
  name text not null,
  child_limit integer,
  path text not null,
  sort integer not null
);

create index if not exists structure_node_org_idx on structure_node (organisation_id, dimension_id, parent_id);

create table if not exists membership (
  id text primary key,
  organisation_id text not null references organisation (id),
  user_id text,
  sample boolean not null default false,
  status text not null,
  display_name text not null,
  nickname text,
  phone text,
  city text,
  country text not null default 'Ghana',
  profession text,
  business_name text,
  bio text,
  house_node_id text,
  dorm_node_id text,
  cot_node_id text,
  programme_node_id text,
  class_node_id text,
  residence_escape text,
  birthday_month integer,
  birthday_day integer,
  birthday_opt_out boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists membership_user_org_idx
  on membership (organisation_id, user_id) where user_id is not null;
create index if not exists membership_org_name_idx on membership (organisation_id, display_name);

create table if not exists circle (
  id text primary key,
  organisation_id text not null references organisation (id),
  kind text not null,
  visibility text not null,
  node_id text,
  name text not null,
  purpose text not null default '',
  slug text not null,
  unique (organisation_id, slug)
);

create unique index if not exists circle_node_idx on circle (organisation_id, node_id) where node_id is not null;

create table if not exists circle_member (
  organisation_id text not null,
  circle_id text not null references circle (id),
  membership_id text not null references membership (id),
  source text not null,
  primary key (circle_id, membership_id)
);

create index if not exists circle_member_member_idx on circle_member (membership_id);

create table if not exists role_assignment (
  id text primary key,
  organisation_id text not null,
  membership_id text not null references membership (id),
  role text not null,
  scope_type text not null,
  scope_id text,
  scope_path text,
  created_at timestamptz not null default now()
);

create table if not exists purpose (
  id text primary key,
  organisation_id text not null,
  type text not null,
  title text not null,
  story text not null,
  target_pesewas integer not null default 0,
  status text not null default 'open',
  hero boolean not null default false
);

create table if not exists pledge (
  id text primary key,
  organisation_id text not null,
  purpose_id text not null,
  membership_id text not null,
  total_pesewas integer not null,
  anonymous boolean not null default false,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists instalment (
  id text primary key,
  organisation_id text not null,
  pledge_id text not null references pledge (id),
  due_on date not null,
  amount_pesewas integer not null,
  paid_pesewas integer not null default 0,
  seq integer not null
);

create table if not exists payment_intent (
  id text primary key,
  organisation_id text not null,
  purpose_id text not null,
  membership_id text not null,
  pledge_id text,
  gift_pesewas integer not null,
  charge_pesewas integer not null,
  gateway_fee_pesewas integer not null,
  platform_fee_pesewas integer not null,
  cover_fees boolean not null,
  anonymous boolean not null default false,
  status text not null,
  reference text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists payment_intent_org_idx on payment_intent (organisation_id, status);

create table if not exists gateway_event (
  id text primary key,
  organisation_id text not null,
  intent_id text not null,
  provider text not null,
  reference text not null unique,
  raw jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists ledger_entry (
  id text primary key,
  organisation_id text not null,
  txn_id text not null,
  account text not null,
  direction text not null,
  amount_pesewas integer not null check (amount_pesewas > 0),
  purpose_id text,
  membership_id text,
  intent_id text,
  memo text not null,
  created_at timestamptz not null default now()
);

create index if not exists ledger_entry_org_idx on ledger_entry (organisation_id, account);
create index if not exists ledger_entry_intent_idx on ledger_entry (intent_id);

create table if not exists receipt (
  id text primary key,
  organisation_id text not null,
  number text not null unique,
  intent_id text not null,
  purpose_title text not null,
  amount_pesewas integer not null,
  issued_on date not null,
  voided boolean not null default false,
  refund_of text
);

create table if not exists post (
  id text primary key,
  organisation_id text not null,
  circle_id text not null,
  author_membership_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists post_circle_idx on post (circle_id, created_at desc);

create table if not exists hub_event (
  id text primary key,
  organisation_id text not null,
  circle_id text,
  title text not null,
  place text not null,
  starts_at timestamptz not null,
  story text not null,
  price_pesewas integer,
  purpose_id text,
  capacity integer
);

create table if not exists rsvp (
  event_id text not null references hub_event (id),
  membership_id text not null,
  status text not null,
  primary key (event_id, membership_id)
);

create table if not exists business (
  id text primary key,
  organisation_id text not null,
  membership_id text not null,
  name text not null,
  category text not null,
  city text not null,
  contact text not null,
  blurb text not null
);

create table if not exists business_support (
  business_id text not null references business (id),
  membership_id text not null,
  primary key (business_id, membership_id)
);

create table if not exists ask (
  id text primary key,
  organisation_id text not null,
  membership_id text not null,
  category text not null,
  title text not null,
  body text not null,
  circle_id text,
  created_at timestamptz not null default now()
);

create table if not exists ask_reply (
  id text primary key,
  ask_id text not null references ask (id),
  membership_id text not null,
  body text not null,
  recommended boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists album (
  id text primary key,
  organisation_id text not null,
  title text not null,
  year integer not null,
  caption text not null,
  motif text not null
);

create table if not exists photo (
  id text primary key,
  organisation_id text not null,
  album_id text not null references album (id),
  caption text not null,
  motif text not null,
  data_url text,
  author_membership_id text,
  created_at timestamptz not null default now()
);

create table if not exists photo_tag (
  photo_id text not null references photo (id),
  membership_id text not null,
  primary key (photo_id, membership_id)
);

create table if not exists poll (
  id text primary key,
  organisation_id text not null,
  circle_id text,
  question text not null,
  closes_on date not null
);

create table if not exists poll_option (
  id text primary key,
  poll_id text not null references poll (id),
  label text not null,
  sort integer not null
);

create table if not exists poll_vote (
  poll_id text not null,
  option_id text not null,
  membership_id text not null,
  primary key (poll_id, membership_id)
);

create table if not exists announcement (
  id text primary key,
  organisation_id text not null,
  author_membership_id text not null,
  audience text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists outbox (
  id text primary key,
  organisation_id text not null,
  membership_id text,
  template_key text not null,
  payload jsonb not null,
  idempotency_key text not null unique,
  status text not null,
  channel text not null,
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now()
);

create table if not exists welfare_request (
  id text primary key,
  organisation_id text not null,
  membership_id text not null,
  category text not null,
  body text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists mentor_offer (
  id text primary key,
  organisation_id text not null,
  membership_id text not null,
  field text not null,
  kind text not null,
  note text not null
);

create table if not exists election (
  id text primary key,
  organisation_id text not null,
  role_name text not null,
  blurb text not null,
  status text not null,
  closes_on date not null
);

create table if not exists nomination (
  id text primary key,
  election_id text not null references election (id),
  membership_id text not null,
  statement text not null
);

create table if not exists ballot (
  election_id text not null,
  voter_membership_id text not null,
  nomination_id text not null,
  primary key (election_id, voter_membership_id)
);

create table if not exists product (
  id text primary key,
  organisation_id text not null,
  name text not null,
  blurb text not null,
  price_pesewas integer not null,
  stock integer not null,
  motif text not null
);

create table if not exists shop_order (
  id text primary key,
  organisation_id text not null,
  product_id text not null,
  membership_id text not null,
  intent_id text,
  qty integer not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists trivia_question (
  id text primary key,
  organisation_id text not null,
  prompt text not null,
  choices jsonb not null,
  answer_index integer not null,
  sort integer not null
);

create table if not exists trivia_answer (
  question_id text not null references trivia_question (id),
  membership_id text not null,
  choice integer not null,
  correct boolean not null,
  primary key (question_id, membership_id)
);

create table if not exists capsule (
  id text primary key,
  organisation_id text not null,
  membership_id text not null,
  circle_id text,
  title text not null,
  body text not null,
  seals_until date not null,
  created_at timestamptz not null default now()
);

create table if not exists milestone (
  id text primary key,
  organisation_id text not null,
  membership_id text not null,
  kind text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists spotlight (
  id text primary key,
  organisation_id text not null,
  membership_id text not null,
  story text not null,
  consented boolean not null,
  published boolean not null
);

create table if not exists expense (
  id text primary key,
  organisation_id text not null,
  requester_membership_id text not null,
  amount_pesewas integer not null,
  memo text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists approval (
  id text primary key,
  organisation_id text not null,
  subject_type text not null,
  subject_id text not null,
  approver_membership_id text not null,
  decision text not null,
  step_up text not null,
  created_at timestamptz not null default now()
);

create table if not exists refund (
  id text primary key,
  organisation_id text not null,
  intent_id text not null,
  amount_pesewas integer not null,
  reason text not null,
  status text not null,
  requester_membership_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists import_row (
  id text primary key,
  organisation_id text not null,
  raw jsonb not null,
  display_name text not null,
  phone text,
  status text not null,
  note text not null default ''
);

create table if not exists audit_log (
  id text primary key,
  organisation_id text not null,
  actor_membership_id text,
  action text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create table if not exists usage_event (
  id text primary key,
  organisation_id text not null,
  membership_id text,
  stage text not null,
  name text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists profile_claim (
  id text primary key,
  organisation_id text not null,
  membership_id text not null unique,
  status text not null,
  needed integer not null default 2
);

create table if not exists claim_confirmation (
  claim_id text not null references profile_claim (id),
  confirmer_membership_id text not null,
  primary key (claim_id, confirmer_membership_id)
);

create table if not exists report (
  id text primary key,
  organisation_id text not null,
  post_id text not null,
  membership_id text not null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create or replace function hub_refuse_append_only()
returns trigger
language plpgsql
as $$
begin
  raise exception 'this record is append-only';
end;
$$;

drop trigger if exists ledger_no_update on ledger_entry;
create trigger ledger_no_update
before update or delete on ledger_entry
for each row execute function hub_refuse_append_only();

drop trigger if exists audit_no_update on audit_log;
create trigger audit_no_update
before update or delete on audit_log
for each row execute function hub_refuse_append_only();
