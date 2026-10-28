-- Dues: what each member is asked to pay, per year (or per month), from a date.
-- A change of rate is a new row from a new date, so past periods keep their old rate.
-- What a member has paid is never stored here: it is read from the ledger.

create table if not exists dues_plan (
  id text primary key,
  organisation_id text not null references organisation (id),
  purpose_id text not null references purpose (id),
  amount_pesewas integer not null check (amount_pesewas > 0),
  period text not null check (period in ('year', 'month')),
  starts_on date not null,
  created_by text references membership (id),
  created_at timestamptz not null default now(),
  unique (organisation_id, starts_on)
);

create index if not exists dues_plan_org_idx on dues_plan (organisation_id, starts_on);

alter table dues_plan enable row level security;
drop policy if exists tenant_isolation on dues_plan;
create policy tenant_isolation on dues_plan using (organisation_id = hub_org()) with check (organisation_id = hub_org());

-- Rows are history: a rate is replaced by a later row, never edited or removed.
create or replace function dues_plan_append_only() returns trigger language plpgsql as $$
begin
  raise exception 'Dues plans are history. Add a new rate from a new date instead.';
end $$;
drop trigger if exists dues_plan_append_only on dues_plan;
create trigger dues_plan_append_only before update or delete on dues_plan
  for each row execute function dues_plan_append_only();

select hub_apply_grants();
