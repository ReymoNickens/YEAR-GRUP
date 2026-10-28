-- Identity, payments, approvals and messaging support.

-- ---------------------------------------------------------------------------
-- Verified phone identity, one-time codes, step-up grants, rate limits.
-- ---------------------------------------------------------------------------
create table if not exists phone_identity (
  id text primary key,
  user_id text not null,
  phone text not null unique,
  verified_at timestamptz not null default now(),
  is_primary boolean not null default true
);
create index if not exists phone_identity_user_idx on phone_identity (user_id);

create table if not exists otp_challenge (
  id text primary key,
  user_id text not null,
  phone text not null,
  purpose text not null check (purpose in ('verify_phone', 'step_up')),
  action text,
  organisation_id text,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists otp_challenge_user_idx on otp_challenge (user_id, created_at desc);

create table if not exists step_up_grant (
  id text primary key,
  organisation_id text not null,
  membership_id text not null,
  action text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (organisation_id, membership_id) references membership (organisation_id, id)
);

create table if not exists rate_limit (
  bucket text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (bucket, window_start)
);

create table if not exists client_action (
  client_id text primary key,
  organisation_id text not null,
  membership_id text not null,
  type text not null,
  created_at timestamptz not null default now(),
  foreign key (organisation_id, membership_id) references membership (organisation_id, id)
);

alter table membership add column if not exists phone_verified boolean not null default false;
create unique index if not exists membership_org_phone_idx on membership (organisation_id, phone) where phone is not null;
alter table membership add column if not exists updated_at timestamptz not null default now();
alter table membership add column if not exists field_times jsonb not null default '{}';

create table if not exists org_founder (
  organisation_id text not null references organisation (id),
  email text not null,
  claimed_membership_id text,
  primary key (organisation_id, email)
);

-- ---------------------------------------------------------------------------
-- Structure aliases and the import pipeline.
-- ---------------------------------------------------------------------------
create table if not exists structure_alias (
  id text primary key,
  organisation_id text not null,
  node_id text not null,
  alias text not null,
  normalised text not null,
  unique (organisation_id, normalised),
  foreign key (organisation_id, node_id) references structure_node (organisation_id, id)
);

-- Seed one alias per house, programme and class from its own name, plus each
-- surname of a double-barrelled house, so "Balmer Acquaah", "balmer-acquaah" and
-- "Balmer" all resolve. Matching ignores case and punctuation.
insert into structure_alias (id, organisation_id, node_id, alias, normalised)
select 'al_' || substr(md5(n.id || ':full'), 1, 16), n.organisation_id, n.id, n.name,
       lower(regexp_replace(n.name, '[^a-zA-Z0-9]+', '', 'g'))
from structure_node n where n.level in ('house', 'programme', 'class')
on conflict do nothing;
insert into structure_alias (id, organisation_id, node_id, alias, normalised)
select 'al_' || substr(md5(n.id || ':' || part), 1, 16), n.organisation_id, n.id, part,
       lower(regexp_replace(part, '[^a-zA-Z0-9]+', '', 'g'))
from structure_node n, unnest(string_to_array(n.name, '-')) as part
where n.level = 'house' and n.name like '%-%'
on conflict do nothing;

create table if not exists import_batch (
  id text primary key,
  organisation_id text not null references organisation (id),
  file_name text not null,
  created_by text,
  total_rows integer not null default 0,
  created_at timestamptz not null default now(),
  unique (organisation_id, id)
);

alter table import_row add column if not exists batch_id text;
alter table import_row add column if not exists normalised jsonb;
alter table import_row add column if not exists issues jsonb not null default '[]';
alter table import_row add column if not exists matched_membership_id text;
alter table import_row add column if not exists claim_token_hash text;
alter table import_row add column if not exists created_at timestamptz not null default now();
alter table import_row drop constraint if exists import_row_status_check;
alter table import_row add constraint import_row_status_check check (
  status in ('imported','normalised','suspected_duplicate','needs_review','approved','invited','claimed','verified'));

-- ---------------------------------------------------------------------------
-- Payments: provider references, settlement, per-event idempotency.
-- ---------------------------------------------------------------------------
alter table organisation add column if not exists paystack_subaccount text;
alter table organisation add column if not exists sms_monthly_budget integer not null default 300;
alter table organisation add column if not exists ai_monthly_budget integer not null default 200;

alter table payment_intent add column if not exists provider text not null default 'test';
alter table payment_intent add column if not exists authorization_url text;
alter table payment_intent add column if not exists paid_at timestamptz;
alter table payment_intent add column if not exists settled_at timestamptz;
alter table payment_intent add column if not exists settlement_reference text;
update payment_intent set provider = 'test' where provider is null;

alter table gateway_event drop constraint if exists gateway_event_reference_key;
alter table gateway_event add column if not exists event_key text;
alter table gateway_event add column if not exists event_type text;
alter table gateway_event add column if not exists processed_at timestamptz;
update gateway_event set event_key = provider || ':' || reference || ':seed', event_type = coalesce(event_type, 'charge.success'), processed_at = coalesce(processed_at, created_at) where event_key is null;
alter table gateway_event alter column event_key set not null;
create unique index if not exists gateway_event_provider_key_idx on gateway_event (provider, event_key);
create index if not exists gateway_event_reference_idx on gateway_event (reference);

alter table refund add column if not exists method text not null default 'gateway';
alter table refund add column if not exists manual_reference text;
alter table refund add column if not exists gateway_reference text;
alter table refund add column if not exists approver_membership_id text;
alter table refund add column if not exists processed_at timestamptz;
alter table refund add column if not exists last_error text;
alter table refund drop constraint if exists refund_status_check;
alter table refund add constraint refund_status_check check (
  status in ('awaiting_approval','approved','rejected','failed'));
alter table refund drop constraint if exists refund_method_check;
alter table refund add constraint refund_method_check check (method in ('gateway','manual'));

alter table expense add column if not exists payout_reference text;
alter table expense add column if not exists paid_at timestamptz;
alter table expense drop constraint if exists expense_status_check;
alter table expense add constraint expense_status_check check (
  status in ('submitted','partially_approved','approved','paid','rejected'));

-- ---------------------------------------------------------------------------
-- Messaging.
-- ---------------------------------------------------------------------------
alter table outbox add column if not exists next_attempt_at timestamptz not null default now();
alter table outbox add column if not exists provider_message_id text;
alter table outbox add column if not exists delivered_at timestamptz;
alter table outbox drop constraint if exists outbox_status_check;
alter table outbox add constraint outbox_status_check check (
  status in ('queued','processing','delivered','failed','dead_letter','held_no_provider','held_budget'));
create index if not exists outbox_queue_idx on outbox (status, next_attempt_at);

create table if not exists usage_meter (
  organisation_id text not null references organisation (id),
  month text not null,
  channel text not null,
  count integer not null default 0,
  primary key (organisation_id, month, channel)
);

-- ---------------------------------------------------------------------------
-- Row level security for the new tables.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  for t in
    select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
      and exists (select 1 from pg_attribute a where a.attrelid = c.oid and a.attname = 'organisation_id' and not a.attisdropped)
      and c.relname not in ('organisation', 'receipt_counter')
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists tenant_isolation on public.%I', t);
    execute format(
      'create policy tenant_isolation on public.%I using (organisation_id = hub_org()) with check (organisation_id = hub_org())', t);
  end loop;
end $$;

-- otp_challenge carries an optional organisation (step-up), so it is user scoped.
drop policy if exists tenant_isolation on otp_challenge;
alter table otp_challenge enable row level security;
drop policy if exists own_challenge on otp_challenge;
create policy own_challenge on otp_challenge using (user_id = hub_user()) with check (user_id = hub_user());

alter table phone_identity enable row level security;
drop policy if exists own_phone on phone_identity;
create policy own_phone on phone_identity using (user_id = hub_user()) with check (user_id = hub_user());

alter table rate_limit enable row level security;
drop policy if exists open_limits on rate_limit;
create policy open_limits on rate_limit using (true) with check (true);

-- The audit trail is append-only and officer-readable; step-up grants are private.
drop policy if exists own_grant on step_up_grant;
create policy own_grant on step_up_grant as restrictive for all using (membership_id = hub_member());

-- A step-up grant may be used by one member once; nothing else may rewrite history.
create or replace function hub_phone_owner(p_phone text) returns text
language sql stable security definer set search_path = public as
$$ select user_id from phone_identity where phone = p_phone $$;
grant execute on function hub_phone_owner(text) to hub_app;

-- Messages are written through this function. A plain insert with ON CONFLICT
-- would make row level security hide a notification from the member who caused
-- it, so the write is mediated and checked against the request's organisation.
create or replace function hub_enqueue(
  p_id text, p_org text, p_member text, p_template text, p_payload jsonb,
  p_key text, p_status text, p_channel text, p_delivered timestamptz
) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if hub_org() is not null and p_org is distinct from hub_org() then
    raise exception 'that message belongs to another organisation';
  end if;
  insert into outbox (id, organisation_id, membership_id, template_key, payload, idempotency_key, status, channel, attempts, delivered_at)
  values (p_id, p_org, p_member, p_template, p_payload, p_key, p_status, p_channel, 0, p_delivered)
  on conflict (idempotency_key) do nothing;
  return found;
end $$;
revoke all on function hub_enqueue(text,text,text,text,jsonb,text,text,text,timestamptz) from public;
grant execute on function hub_enqueue(text,text,text,text,jsonb,text,text,text,timestamptz) to hub_app;

select hub_apply_grants();

-- Account recovery: an executive moves a number to a member who has lost theirs.
-- The caller must hold the executive role in the request's organisation, and the
-- target must belong to it. The app adds a step-up check and an audit entry.
create or replace function hub_move_phone(p_membership text, p_phone text) returns void
language plpgsql security definer set search_path = public as $$
declare target record;
begin
  if not hub_has_role(array['organisation_admin','executive']) then
    raise exception 'only an executive can move a number';
  end if;
  select id, user_id from membership where id = p_membership and organisation_id = hub_org() into target;
  if target.id is null or target.user_id is null then
    raise exception 'that member has no account to move the number to';
  end if;
  update phone_identity set is_primary = false where user_id = target.user_id;
  delete from phone_identity where phone = p_phone;
  insert into phone_identity (id, user_id, phone, is_primary)
    values ('ph_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16), target.user_id, p_phone, true);
  update membership set phone = p_phone, phone_verified = true where id = p_membership;
end $$;
revoke all on function hub_move_phone(text, text) from public;
grant execute on function hub_move_phone(text, text) to hub_app;
