-- Wave 0 hardening: database-level tenant isolation and integrity.
--
-- The application connects as the table owner but runs every request inside a
-- transaction that does `set local role hub_app` and sets three settings:
--   app.user_id, app.org_id, app.member_id
-- hub_app is not the owner and has no BYPASSRLS, so the policies below are the
-- real permission layer. A query that forgets its organisation filter returns
-- nothing from another tenant, and a write cannot name another tenant.

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'hub_app') then
    create role hub_app nologin;
  end if;
  begin
    execute format('grant hub_app to %I', current_user);
  exception when others then null;
  end;
end $$;

-- ---------------------------------------------------------------------------
-- 1. Child tables get their own organisation_id so isolation is uniform.
-- ---------------------------------------------------------------------------
alter table rsvp add column if not exists organisation_id text;
update rsvp set organisation_id = (select e.organisation_id from hub_event e where e.id = rsvp.event_id) where organisation_id is null;
alter table rsvp alter column organisation_id set not null;

alter table ask_reply add column if not exists organisation_id text;
update ask_reply set organisation_id = (select a.organisation_id from ask a where a.id = ask_reply.ask_id) where organisation_id is null;
alter table ask_reply alter column organisation_id set not null;

alter table poll_option add column if not exists organisation_id text;
update poll_option set organisation_id = (select p.organisation_id from poll p where p.id = poll_option.poll_id) where organisation_id is null;
alter table poll_option alter column organisation_id set not null;

alter table poll_vote add column if not exists organisation_id text;
update poll_vote set organisation_id = (select p.organisation_id from poll p where p.id = poll_vote.poll_id) where organisation_id is null;
alter table poll_vote alter column organisation_id set not null;

alter table business_support add column if not exists organisation_id text;
update business_support set organisation_id = (select b.organisation_id from business b where b.id = business_support.business_id) where organisation_id is null;
alter table business_support alter column organisation_id set not null;

alter table photo_tag add column if not exists organisation_id text;
update photo_tag set organisation_id = (select p.organisation_id from photo p where p.id = photo_tag.photo_id) where organisation_id is null;
alter table photo_tag alter column organisation_id set not null;

alter table trivia_answer add column if not exists organisation_id text;
update trivia_answer set organisation_id = (select q.organisation_id from trivia_question q where q.id = trivia_answer.question_id) where organisation_id is null;
alter table trivia_answer alter column organisation_id set not null;

alter table claim_confirmation add column if not exists organisation_id text;
update claim_confirmation set organisation_id = (select c.organisation_id from profile_claim c where c.id = claim_confirmation.claim_id) where organisation_id is null;
alter table claim_confirmation alter column organisation_id set not null;

alter table nomination add column if not exists organisation_id text;
update nomination set organisation_id = (select e.organisation_id from election e where e.id = nomination.election_id) where organisation_id is null;
alter table nomination alter column organisation_id set not null;

-- ---------------------------------------------------------------------------
-- 2. Secret ballots: who voted and what was chosen live in separate tables
--    with no link between them.
-- ---------------------------------------------------------------------------
create table if not exists ballot_receipt (
  organisation_id text not null,
  election_id text not null references election (id),
  voter_membership_id text not null,
  cast_at timestamptz not null default now(),
  primary key (election_id, voter_membership_id)
);
create table if not exists ballot_choice (
  id text primary key,
  organisation_id text not null,
  election_id text not null references election (id),
  nomination_id text not null references nomination (id)
);
create index if not exists ballot_choice_nomination_idx on ballot_choice (nomination_id);

do $$ begin
  if to_regclass('public.ballot') is not null then
    insert into ballot_receipt (organisation_id, election_id, voter_membership_id)
      select e.organisation_id, b.election_id, b.voter_membership_id
      from ballot b join election e on e.id = b.election_id
      on conflict do nothing;
    insert into ballot_choice (id, organisation_id, election_id, nomination_id)
      select 'bc_' || substr(md5(random()::text || b.nomination_id || clock_timestamp()::text), 1, 16), e.organisation_id, b.election_id, b.nomination_id
      from ballot b join election e on e.id = b.election_id;
    drop table ballot;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Composite uniqueness and composite foreign keys: a row can never point at
--    another organisation's row, even if application code is wrong.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  parents text[] := array[
    'membership','circle','purpose','pledge','payment_intent','structure_node','structure_dimension',
    'hub_event','ask','poll','poll_option','business','photo','election','nomination','profile_claim',
    'trivia_question','album','product','expense','refund','post'
  ];
begin
  foreach t in array parents loop
    if not exists (
      select 1 from pg_constraint where conrelid = format('public.%I', t)::regclass and conname = t || '_org_id_key'
    ) then
      execute format('alter table public.%I add constraint %I unique (organisation_id, id)', t, t || '_org_id_key');
    end if;
  end loop;
end $$;

do $$
declare
  r record;
begin
  for r in
    select * from (values
      ('structure_node','dimension_id','structure_dimension'),
      ('structure_node','parent_id','structure_node'),
      ('membership','house_node_id','structure_node'),
      ('membership','dorm_node_id','structure_node'),
      ('membership','cot_node_id','structure_node'),
      ('membership','programme_node_id','structure_node'),
      ('membership','class_node_id','structure_node'),
      ('circle','node_id','structure_node'),
      ('circle_member','circle_id','circle'),
      ('circle_member','membership_id','membership'),
      ('role_assignment','membership_id','membership'),
      ('pledge','purpose_id','purpose'),
      ('pledge','membership_id','membership'),
      ('instalment','pledge_id','pledge'),
      ('payment_intent','purpose_id','purpose'),
      ('payment_intent','membership_id','membership'),
      ('payment_intent','pledge_id','pledge'),
      ('ledger_entry','intent_id','payment_intent'),
      ('ledger_entry','membership_id','membership'),
      ('ledger_entry','purpose_id','purpose'),
      ('receipt','intent_id','payment_intent'),
      ('gateway_event','intent_id','payment_intent'),
      ('post','circle_id','circle'),
      ('post','author_membership_id','membership'),
      ('hub_event','circle_id','circle'),
      ('hub_event','purpose_id','purpose'),
      ('rsvp','event_id','hub_event'),
      ('rsvp','membership_id','membership'),
      ('business','membership_id','membership'),
      ('business_support','business_id','business'),
      ('business_support','membership_id','membership'),
      ('ask','membership_id','membership'),
      ('ask','circle_id','circle'),
      ('ask_reply','ask_id','ask'),
      ('ask_reply','membership_id','membership'),
      ('photo','album_id','album'),
      ('photo','author_membership_id','membership'),
      ('photo_tag','photo_id','photo'),
      ('photo_tag','membership_id','membership'),
      ('poll','circle_id','circle'),
      ('poll_option','poll_id','poll'),
      ('poll_vote','poll_id','poll'),
      ('poll_vote','option_id','poll_option'),
      ('poll_vote','membership_id','membership'),
      ('announcement','author_membership_id','membership'),
      ('welfare_request','membership_id','membership'),
      ('mentor_offer','membership_id','membership'),
      ('nomination','election_id','election'),
      ('nomination','membership_id','membership'),
      ('ballot_receipt','election_id','election'),
      ('ballot_receipt','voter_membership_id','membership'),
      ('ballot_choice','election_id','election'),
      ('ballot_choice','nomination_id','nomination'),
      ('shop_order','product_id','product'),
      ('shop_order','membership_id','membership'),
      ('trivia_answer','question_id','trivia_question'),
      ('trivia_answer','membership_id','membership'),
      ('capsule','membership_id','membership'),
      ('capsule','circle_id','circle'),
      ('milestone','membership_id','membership'),
      ('spotlight','membership_id','membership'),
      ('expense','requester_membership_id','membership'),
      ('approval','approver_membership_id','membership'),
      ('refund','intent_id','payment_intent'),
      ('refund','requester_membership_id','membership'),
      ('profile_claim','membership_id','membership'),
      ('claim_confirmation','claim_id','profile_claim'),
      ('claim_confirmation','confirmer_membership_id','membership'),
      ('report','post_id','post'),
      ('report','membership_id','membership'),
      ('usage_event','membership_id','membership'),
      ('outbox','membership_id','membership'),
      ('audit_log','actor_membership_id','membership')
    ) as x(child, col, parent)
  loop
    execute format(
      'alter table public.%I add constraint %I foreign key (organisation_id, %I) references public.%I (organisation_id, id)',
      r.child, r.child || '_' || r.col || '_org_fk', r.col, r.parent
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Receipt numbering: per organisation, atomic, globally unique by prefix.
-- ---------------------------------------------------------------------------
alter table organisation add column if not exists receipt_prefix text;
update organisation set receipt_prefix = upper(regexp_replace(slug, '[^a-zA-Z0-9]+', '', 'g')) where receipt_prefix is null;
update organisation set receipt_prefix = 'MF2007' where slug = 'mfantsipim-2007';
alter table organisation alter column receipt_prefix set not null;
create unique index if not exists organisation_receipt_prefix_idx on organisation (receipt_prefix);

create table if not exists receipt_counter (
  organisation_id text primary key references organisation (id),
  n integer not null default 0
);
insert into receipt_counter (organisation_id, n)
  select o.id, coalesce((select count(*) from receipt r where r.organisation_id = o.id), 0) from organisation o
  on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 5. Helper functions used by policies. SECURITY DEFINER so they read the
--    underlying tables without recursing into the policies they serve.
-- ---------------------------------------------------------------------------
create or replace function hub_org() returns text language sql stable as
  $$ select nullif(current_setting('app.org_id', true), '') $$;
create or replace function hub_member() returns text language sql stable as
  $$ select nullif(current_setting('app.member_id', true), '') $$;
create or replace function hub_user() returns text language sql stable as
  $$ select nullif(current_setting('app.user_id', true), '') $$;

create or replace function hub_is_circle_member(p_circle text) returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from circle_member cm where cm.circle_id = p_circle and cm.membership_id = hub_member()) $$;

create or replace function hub_circle_visible(p_circle text) returns boolean
language sql stable security definer set search_path = public as
$$ select p_circle is null or exists (
     select 1 from circle c where c.id = p_circle and c.organisation_id = hub_org()
       and (c.visibility <> 'hidden' or hub_is_circle_member(c.id))) $$;

create or replace function hub_has_role(p_roles text[]) returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from role_assignment r where r.membership_id = hub_member()
     and r.organisation_id = hub_org() and r.role = any (p_roles)) $$;

create or replace function public_receipt(p_number text)
returns table (number text, purpose_title text, amount_pesewas integer, issued_on text, voided boolean)
language sql stable security definer set search_path = public as
$$ select r.number, r.purpose_title, r.amount_pesewas, r.issued_on::text, r.voided from receipt r where r.number = p_number $$;

create or replace function platform_overview()
returns table (organisation_id text, name text, slug text, members integer, verified integer,
               succeeded_payments integer, volume_pesewas bigint, queued_messages integer, dead_messages integer)
language sql stable security definer set search_path = public as
$$ select o.id, o.name, o.slug,
     (select count(*)::int from membership m where m.organisation_id = o.id and not m.sample),
     (select count(*)::int from membership m where m.organisation_id = o.id and not m.sample and m.status = 'verified'),
     (select count(*)::int from payment_intent p where p.organisation_id = o.id and p.status = 'succeeded'),
     (select coalesce(sum(p.charge_pesewas), 0) from payment_intent p where p.organisation_id = o.id and p.status = 'succeeded'),
     (select count(*)::int from outbox b where b.organisation_id = o.id and b.status in ('queued','processing')),
     (select count(*)::int from outbox b where b.organisation_id = o.id and b.status = 'dead_letter')
   from organisation o order by o.name $$;

revoke all on function public_receipt(text), platform_overview() from public;
grant execute on function public_receipt(text), platform_overview() to hub_app;
grant execute on function hub_org(), hub_member(), hub_user(), hub_is_circle_member(text), hub_circle_visible(text), hub_has_role(text[]) to hub_app;

-- ---------------------------------------------------------------------------
-- 6. Row level security.
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

alter table organisation enable row level security;
drop policy if exists organisation_read on organisation;
create policy organisation_read on organisation for select using (true);

alter table receipt_counter enable row level security;
drop policy if exists tenant_isolation on receipt_counter;
create policy tenant_isolation on receipt_counter using (organisation_id = hub_org()) with check (organisation_id = hub_org());

-- Hidden circles: invisible unless you are in them. Restrictive policies are
-- ANDed with the tenant policy.
do $$
declare
  t text;
begin
  foreach t in array array['circle_member','post','ask','poll','hub_event','capsule'] loop
    execute format('drop policy if exists hidden_circle_guard on public.%I', t);
  end loop;
end $$;
create policy hidden_circle_guard on circle as restrictive for all using (visibility <> 'hidden' or hub_is_circle_member(id));
create policy hidden_circle_guard on circle_member as restrictive for all using (hub_circle_visible(circle_id));
create policy hidden_circle_guard on post as restrictive for all using (hub_circle_visible(circle_id));
create policy hidden_circle_guard on ask as restrictive for all using (hub_circle_visible(circle_id));
create policy hidden_circle_guard on poll as restrictive for all using (hub_circle_visible(circle_id));
create policy hidden_circle_guard on hub_event as restrictive for all using (hub_circle_visible(circle_id));
create policy hidden_circle_guard on capsule as restrictive for all using (hub_circle_visible(circle_id));

-- Welfare is confidential: the member and the executive only.
drop policy if exists welfare_confidential on welfare_request;
create policy welfare_confidential on welfare_request as restrictive for select
  using (membership_id = hub_member() or hub_has_role(array['organisation_admin','executive']));

-- Audit trail is readable by officers; anyone may append through the app.
drop policy if exists audit_officers on audit_log;
create policy audit_officers on audit_log as restrictive for select
  using (hub_has_role(array['organisation_admin','executive','treasurer']));

-- Personal messages: your own, or an officer's.
drop policy if exists outbox_own on outbox;
create policy outbox_own on outbox as restrictive for select
  using (membership_id is null or membership_id = hub_member() or hub_has_role(array['organisation_admin','executive','treasurer']));

-- ---------------------------------------------------------------------------
-- 7. Privileges for the request role. Auth tables and bookkeeping stay private.
--    Every migration that creates tables ends with `select hub_apply_grants();`
--    because a blanket GRANT would otherwise re-open the private tables.
-- ---------------------------------------------------------------------------
create or replace function hub_apply_grants() returns void language plpgsql as $$
declare t text;
begin
  grant usage on schema public to hub_app;
  grant select, insert, update, delete on all tables in schema public to hub_app;
  revoke insert, update, delete on organisation from hub_app;
  foreach t in array array['user','session','account','verification','_migrations'] loop
    if to_regclass(format('public.%I', t)) is not null then
      execute format('revoke all on public.%I from hub_app', t);
    end if;
  end loop;
end $$;
select hub_apply_grants();
alter default privileges in schema public grant select, insert, update, delete on tables to hub_app;

-- ---------------------------------------------------------------------------
-- 8. The ledger and audit trail stay append-only for every role.
-- ---------------------------------------------------------------------------
create or replace function hub_refuse_truncate() returns trigger language plpgsql as
  $$ begin raise exception 'this record is append-only'; end; $$;
drop trigger if exists ledger_no_truncate on ledger_entry;
create trigger ledger_no_truncate before truncate on ledger_entry for each statement execute function hub_refuse_truncate();
drop trigger if exists audit_no_truncate on audit_log;
create trigger audit_no_truncate before truncate on audit_log for each statement execute function hub_refuse_truncate();

-- A transaction's postings must balance. Checked when the transaction commits.
create or replace function hub_check_ledger_balance() returns trigger language plpgsql as $$
declare diff bigint;
begin
  select coalesce(sum(case when direction = 'debit' then amount_pesewas else -amount_pesewas end), 0)
    into diff from ledger_entry where organisation_id = new.organisation_id and txn_id = new.txn_id;
  if diff <> 0 then
    raise exception 'ledger transaction % does not balance (off by % pesewas)', new.txn_id, diff;
  end if;
  return null;
end $$;

drop trigger if exists ledger_balanced_at_commit on ledger_entry;
create constraint trigger ledger_balanced_at_commit
  after insert on ledger_entry deferrable initially deferred
  for each row execute function hub_check_ledger_balance();
