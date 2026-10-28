-- Sample only: the fictional cohort's dues. Never loaded into a real year group.
insert into dues_plan (id, organisation_id, purpose_id, amount_pesewas, period, starts_on) values ('dp_2025', 'org_2007', 'pur_dues', 24000, 'year', '2025-01-01') on conflict do nothing;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_01', 'org_2007', 'pur_dues', 'mem_11', null, 48000, 49416, 936, 480, true, false, 'succeeded', 'seed_pi_dues_01', now() - interval '200 days', now() - interval '200 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_01', 'org_2007', 'pi_dues_01', 'test', 'seed_pi_dues_01', '{"provider":"test","reference":"seed_pi_dues_01","gift":48000}'::jsonb, 'test:seed_pi_dues_01:seed', 'charge.success', now() - interval '200 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_01_0', 'org_2007', 'pi_dues_01:pay', 'clearing', 'debit', 49416, 'pur_dues', 'mem_11', 'pi_dues_01', 'Test gateway pay'),
  ('le_pi_dues_01_1', 'org_2007', 'pi_dues_01:pay', 'fund', 'credit', 48000, 'pur_dues', 'mem_11', 'pi_dues_01', 'Test gateway pay'),
  ('le_pi_dues_01_2', 'org_2007', 'pi_dues_01:pay', 'fees_recovered', 'credit', 1416, 'pur_dues', 'mem_11', 'pi_dues_01', 'Test gateway pay'),
  ('le_pi_dues_01_3', 'org_2007', 'pi_dues_01:fee', 'fees_expense', 'debit', 1416, 'pur_dues', 'mem_11', 'pi_dues_01', 'Test gateway fee'),
  ('le_pi_dues_01_4', 'org_2007', 'pi_dues_01:fee', 'clearing', 'credit', 1416, 'pur_dues', 'mem_11', 'pi_dues_01', 'Test gateway fee'),
  ('le_pi_dues_01_5', 'org_2007', 'pi_dues_01:settle', 'org_bank', 'debit', 48000, 'pur_dues', 'mem_11', 'pi_dues_01', 'Test gateway settle'),
  ('le_pi_dues_01_6', 'org_2007', 'pi_dues_01:settle', 'clearing', 'credit', 48000, 'pur_dues', 'mem_11', 'pi_dues_01', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_01') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_01', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_01', 'Year group dues', 49416, (now() - interval '200 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_02', 'org_2007', 'pur_dues', 'mem_19', null, 48000, 49416, 936, 480, true, false, 'succeeded', 'seed_pi_dues_02', now() - interval '190 days', now() - interval '190 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_02', 'org_2007', 'pi_dues_02', 'test', 'seed_pi_dues_02', '{"provider":"test","reference":"seed_pi_dues_02","gift":48000}'::jsonb, 'test:seed_pi_dues_02:seed', 'charge.success', now() - interval '190 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_02_0', 'org_2007', 'pi_dues_02:pay', 'clearing', 'debit', 49416, 'pur_dues', 'mem_19', 'pi_dues_02', 'Test gateway pay'),
  ('le_pi_dues_02_1', 'org_2007', 'pi_dues_02:pay', 'fund', 'credit', 48000, 'pur_dues', 'mem_19', 'pi_dues_02', 'Test gateway pay'),
  ('le_pi_dues_02_2', 'org_2007', 'pi_dues_02:pay', 'fees_recovered', 'credit', 1416, 'pur_dues', 'mem_19', 'pi_dues_02', 'Test gateway pay'),
  ('le_pi_dues_02_3', 'org_2007', 'pi_dues_02:fee', 'fees_expense', 'debit', 1416, 'pur_dues', 'mem_19', 'pi_dues_02', 'Test gateway fee'),
  ('le_pi_dues_02_4', 'org_2007', 'pi_dues_02:fee', 'clearing', 'credit', 1416, 'pur_dues', 'mem_19', 'pi_dues_02', 'Test gateway fee'),
  ('le_pi_dues_02_5', 'org_2007', 'pi_dues_02:settle', 'org_bank', 'debit', 48000, 'pur_dues', 'mem_19', 'pi_dues_02', 'Test gateway settle'),
  ('le_pi_dues_02_6', 'org_2007', 'pi_dues_02:settle', 'clearing', 'credit', 48000, 'pur_dues', 'mem_19', 'pi_dues_02', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_02') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_02', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_02', 'Year group dues', 49416, (now() - interval '190 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_03', 'org_2007', 'pur_dues', 'mem_17', null, 48000, 48000, 936, 480, false, false, 'succeeded', 'seed_pi_dues_03', now() - interval '160 days', now() - interval '160 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_03', 'org_2007', 'pi_dues_03', 'test', 'seed_pi_dues_03', '{"provider":"test","reference":"seed_pi_dues_03","gift":48000}'::jsonb, 'test:seed_pi_dues_03:seed', 'charge.success', now() - interval '160 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_03_0', 'org_2007', 'pi_dues_03:pay', 'clearing', 'debit', 48000, 'pur_dues', 'mem_17', 'pi_dues_03', 'Test gateway pay'),
  ('le_pi_dues_03_1', 'org_2007', 'pi_dues_03:pay', 'fund', 'credit', 48000, 'pur_dues', 'mem_17', 'pi_dues_03', 'Test gateway pay'),
  ('le_pi_dues_03_2', 'org_2007', 'pi_dues_03:fee', 'fees_expense', 'debit', 1416, 'pur_dues', 'mem_17', 'pi_dues_03', 'Test gateway fee'),
  ('le_pi_dues_03_3', 'org_2007', 'pi_dues_03:fee', 'clearing', 'credit', 1416, 'pur_dues', 'mem_17', 'pi_dues_03', 'Test gateway fee'),
  ('le_pi_dues_03_4', 'org_2007', 'pi_dues_03:settle', 'org_bank', 'debit', 46584, 'pur_dues', 'mem_17', 'pi_dues_03', 'Test gateway settle'),
  ('le_pi_dues_03_5', 'org_2007', 'pi_dues_03:settle', 'clearing', 'credit', 46584, 'pur_dues', 'mem_17', 'pi_dues_03', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_03') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_03', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_03', 'Year group dues', 48000, (now() - interval '160 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_04', 'org_2007', 'pur_dues', 'mem_21', null, 48000, 49416, 936, 480, true, false, 'succeeded', 'seed_pi_dues_04', now() - interval '120 days', now() - interval '120 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_04', 'org_2007', 'pi_dues_04', 'test', 'seed_pi_dues_04', '{"provider":"test","reference":"seed_pi_dues_04","gift":48000}'::jsonb, 'test:seed_pi_dues_04:seed', 'charge.success', now() - interval '120 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_04_0', 'org_2007', 'pi_dues_04:pay', 'clearing', 'debit', 49416, 'pur_dues', 'mem_21', 'pi_dues_04', 'Test gateway pay'),
  ('le_pi_dues_04_1', 'org_2007', 'pi_dues_04:pay', 'fund', 'credit', 48000, 'pur_dues', 'mem_21', 'pi_dues_04', 'Test gateway pay'),
  ('le_pi_dues_04_2', 'org_2007', 'pi_dues_04:pay', 'fees_recovered', 'credit', 1416, 'pur_dues', 'mem_21', 'pi_dues_04', 'Test gateway pay'),
  ('le_pi_dues_04_3', 'org_2007', 'pi_dues_04:fee', 'fees_expense', 'debit', 1416, 'pur_dues', 'mem_21', 'pi_dues_04', 'Test gateway fee'),
  ('le_pi_dues_04_4', 'org_2007', 'pi_dues_04:fee', 'clearing', 'credit', 1416, 'pur_dues', 'mem_21', 'pi_dues_04', 'Test gateway fee'),
  ('le_pi_dues_04_5', 'org_2007', 'pi_dues_04:settle', 'org_bank', 'debit', 48000, 'pur_dues', 'mem_21', 'pi_dues_04', 'Test gateway settle'),
  ('le_pi_dues_04_6', 'org_2007', 'pi_dues_04:settle', 'clearing', 'credit', 48000, 'pur_dues', 'mem_21', 'pi_dues_04', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_04') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_04', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_04', 'Year group dues', 49416, (now() - interval '120 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_05', 'org_2007', 'pur_dues', 'mem_09', null, 48000, 48000, 936, 480, false, false, 'succeeded', 'seed_pi_dues_05', now() - interval '95 days', now() - interval '95 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_05', 'org_2007', 'pi_dues_05', 'test', 'seed_pi_dues_05', '{"provider":"test","reference":"seed_pi_dues_05","gift":48000}'::jsonb, 'test:seed_pi_dues_05:seed', 'charge.success', now() - interval '95 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_05_0', 'org_2007', 'pi_dues_05:pay', 'clearing', 'debit', 48000, 'pur_dues', 'mem_09', 'pi_dues_05', 'Test gateway pay'),
  ('le_pi_dues_05_1', 'org_2007', 'pi_dues_05:pay', 'fund', 'credit', 48000, 'pur_dues', 'mem_09', 'pi_dues_05', 'Test gateway pay'),
  ('le_pi_dues_05_2', 'org_2007', 'pi_dues_05:fee', 'fees_expense', 'debit', 1416, 'pur_dues', 'mem_09', 'pi_dues_05', 'Test gateway fee'),
  ('le_pi_dues_05_3', 'org_2007', 'pi_dues_05:fee', 'clearing', 'credit', 1416, 'pur_dues', 'mem_09', 'pi_dues_05', 'Test gateway fee'),
  ('le_pi_dues_05_4', 'org_2007', 'pi_dues_05:settle', 'org_bank', 'debit', 46584, 'pur_dues', 'mem_09', 'pi_dues_05', 'Test gateway settle'),
  ('le_pi_dues_05_5', 'org_2007', 'pi_dues_05:settle', 'clearing', 'credit', 46584, 'pur_dues', 'mem_09', 'pi_dues_05', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_05') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_05', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_05', 'Year group dues', 48000, (now() - interval '95 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_06', 'org_2007', 'pur_dues', 'mem_22', null, 48000, 49416, 936, 480, true, false, 'succeeded', 'seed_pi_dues_06', now() - interval '70 days', now() - interval '70 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_06', 'org_2007', 'pi_dues_06', 'test', 'seed_pi_dues_06', '{"provider":"test","reference":"seed_pi_dues_06","gift":48000}'::jsonb, 'test:seed_pi_dues_06:seed', 'charge.success', now() - interval '70 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_06_0', 'org_2007', 'pi_dues_06:pay', 'clearing', 'debit', 49416, 'pur_dues', 'mem_22', 'pi_dues_06', 'Test gateway pay'),
  ('le_pi_dues_06_1', 'org_2007', 'pi_dues_06:pay', 'fund', 'credit', 48000, 'pur_dues', 'mem_22', 'pi_dues_06', 'Test gateway pay'),
  ('le_pi_dues_06_2', 'org_2007', 'pi_dues_06:pay', 'fees_recovered', 'credit', 1416, 'pur_dues', 'mem_22', 'pi_dues_06', 'Test gateway pay'),
  ('le_pi_dues_06_3', 'org_2007', 'pi_dues_06:fee', 'fees_expense', 'debit', 1416, 'pur_dues', 'mem_22', 'pi_dues_06', 'Test gateway fee'),
  ('le_pi_dues_06_4', 'org_2007', 'pi_dues_06:fee', 'clearing', 'credit', 1416, 'pur_dues', 'mem_22', 'pi_dues_06', 'Test gateway fee'),
  ('le_pi_dues_06_5', 'org_2007', 'pi_dues_06:settle', 'org_bank', 'debit', 48000, 'pur_dues', 'mem_22', 'pi_dues_06', 'Test gateway settle'),
  ('le_pi_dues_06_6', 'org_2007', 'pi_dues_06:settle', 'clearing', 'credit', 48000, 'pur_dues', 'mem_22', 'pi_dues_06', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_06') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_06', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_06', 'Year group dues', 49416, (now() - interval '70 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_07', 'org_2007', 'pur_dues', 'mem_28', null, 48000, 49416, 936, 480, true, false, 'succeeded', 'seed_pi_dues_07', now() - interval '40 days', now() - interval '40 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_07', 'org_2007', 'pi_dues_07', 'test', 'seed_pi_dues_07', '{"provider":"test","reference":"seed_pi_dues_07","gift":48000}'::jsonb, 'test:seed_pi_dues_07:seed', 'charge.success', now() - interval '40 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_07_0', 'org_2007', 'pi_dues_07:pay', 'clearing', 'debit', 49416, 'pur_dues', 'mem_28', 'pi_dues_07', 'Test gateway pay'),
  ('le_pi_dues_07_1', 'org_2007', 'pi_dues_07:pay', 'fund', 'credit', 48000, 'pur_dues', 'mem_28', 'pi_dues_07', 'Test gateway pay'),
  ('le_pi_dues_07_2', 'org_2007', 'pi_dues_07:pay', 'fees_recovered', 'credit', 1416, 'pur_dues', 'mem_28', 'pi_dues_07', 'Test gateway pay'),
  ('le_pi_dues_07_3', 'org_2007', 'pi_dues_07:fee', 'fees_expense', 'debit', 1416, 'pur_dues', 'mem_28', 'pi_dues_07', 'Test gateway fee'),
  ('le_pi_dues_07_4', 'org_2007', 'pi_dues_07:fee', 'clearing', 'credit', 1416, 'pur_dues', 'mem_28', 'pi_dues_07', 'Test gateway fee'),
  ('le_pi_dues_07_5', 'org_2007', 'pi_dues_07:settle', 'org_bank', 'debit', 48000, 'pur_dues', 'mem_28', 'pi_dues_07', 'Test gateway settle'),
  ('le_pi_dues_07_6', 'org_2007', 'pi_dues_07:settle', 'clearing', 'credit', 48000, 'pur_dues', 'mem_28', 'pi_dues_07', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_07') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_07', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_07', 'Year group dues', 49416, (now() - interval '40 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_08', 'org_2007', 'pur_dues', 'mem_03', null, 48000, 48000, 936, 480, false, false, 'succeeded', 'seed_pi_dues_08', now() - interval '12 days', now() - interval '12 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_08', 'org_2007', 'pi_dues_08', 'test', 'seed_pi_dues_08', '{"provider":"test","reference":"seed_pi_dues_08","gift":48000}'::jsonb, 'test:seed_pi_dues_08:seed', 'charge.success', now() - interval '12 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_08_0', 'org_2007', 'pi_dues_08:pay', 'clearing', 'debit', 48000, 'pur_dues', 'mem_03', 'pi_dues_08', 'Test gateway pay'),
  ('le_pi_dues_08_1', 'org_2007', 'pi_dues_08:pay', 'fund', 'credit', 48000, 'pur_dues', 'mem_03', 'pi_dues_08', 'Test gateway pay'),
  ('le_pi_dues_08_2', 'org_2007', 'pi_dues_08:fee', 'fees_expense', 'debit', 1416, 'pur_dues', 'mem_03', 'pi_dues_08', 'Test gateway fee'),
  ('le_pi_dues_08_3', 'org_2007', 'pi_dues_08:fee', 'clearing', 'credit', 1416, 'pur_dues', 'mem_03', 'pi_dues_08', 'Test gateway fee'),
  ('le_pi_dues_08_4', 'org_2007', 'pi_dues_08:settle', 'org_bank', 'debit', 46584, 'pur_dues', 'mem_03', 'pi_dues_08', 'Test gateway settle'),
  ('le_pi_dues_08_5', 'org_2007', 'pi_dues_08:settle', 'clearing', 'credit', 46584, 'pur_dues', 'mem_03', 'pi_dues_08', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_08') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_08', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_08', 'Year group dues', 48000, (now() - interval '12 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_09', 'org_2007', 'pur_dues', 'mem_01', null, 24000, 24708, 468, 240, true, false, 'succeeded', 'seed_pi_dues_09', now() - interval '300 days', now() - interval '300 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_09', 'org_2007', 'pi_dues_09', 'test', 'seed_pi_dues_09', '{"provider":"test","reference":"seed_pi_dues_09","gift":24000}'::jsonb, 'test:seed_pi_dues_09:seed', 'charge.success', now() - interval '300 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_09_0', 'org_2007', 'pi_dues_09:pay', 'clearing', 'debit', 24708, 'pur_dues', 'mem_01', 'pi_dues_09', 'Test gateway pay'),
  ('le_pi_dues_09_1', 'org_2007', 'pi_dues_09:pay', 'fund', 'credit', 24000, 'pur_dues', 'mem_01', 'pi_dues_09', 'Test gateway pay'),
  ('le_pi_dues_09_2', 'org_2007', 'pi_dues_09:pay', 'fees_recovered', 'credit', 708, 'pur_dues', 'mem_01', 'pi_dues_09', 'Test gateway pay'),
  ('le_pi_dues_09_3', 'org_2007', 'pi_dues_09:fee', 'fees_expense', 'debit', 708, 'pur_dues', 'mem_01', 'pi_dues_09', 'Test gateway fee'),
  ('le_pi_dues_09_4', 'org_2007', 'pi_dues_09:fee', 'clearing', 'credit', 708, 'pur_dues', 'mem_01', 'pi_dues_09', 'Test gateway fee'),
  ('le_pi_dues_09_5', 'org_2007', 'pi_dues_09:settle', 'org_bank', 'debit', 24000, 'pur_dues', 'mem_01', 'pi_dues_09', 'Test gateway settle'),
  ('le_pi_dues_09_6', 'org_2007', 'pi_dues_09:settle', 'clearing', 'credit', 24000, 'pur_dues', 'mem_01', 'pi_dues_09', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_09') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_09', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_09', 'Year group dues', 24708, (now() - interval '300 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_10', 'org_2007', 'pur_dues', 'mem_02', null, 24000, 24000, 468, 240, false, false, 'succeeded', 'seed_pi_dues_10', now() - interval '290 days', now() - interval '290 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_10', 'org_2007', 'pi_dues_10', 'test', 'seed_pi_dues_10', '{"provider":"test","reference":"seed_pi_dues_10","gift":24000}'::jsonb, 'test:seed_pi_dues_10:seed', 'charge.success', now() - interval '290 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_10_0', 'org_2007', 'pi_dues_10:pay', 'clearing', 'debit', 24000, 'pur_dues', 'mem_02', 'pi_dues_10', 'Test gateway pay'),
  ('le_pi_dues_10_1', 'org_2007', 'pi_dues_10:pay', 'fund', 'credit', 24000, 'pur_dues', 'mem_02', 'pi_dues_10', 'Test gateway pay'),
  ('le_pi_dues_10_2', 'org_2007', 'pi_dues_10:fee', 'fees_expense', 'debit', 708, 'pur_dues', 'mem_02', 'pi_dues_10', 'Test gateway fee'),
  ('le_pi_dues_10_3', 'org_2007', 'pi_dues_10:fee', 'clearing', 'credit', 708, 'pur_dues', 'mem_02', 'pi_dues_10', 'Test gateway fee'),
  ('le_pi_dues_10_4', 'org_2007', 'pi_dues_10:settle', 'org_bank', 'debit', 23292, 'pur_dues', 'mem_02', 'pi_dues_10', 'Test gateway settle'),
  ('le_pi_dues_10_5', 'org_2007', 'pi_dues_10:settle', 'clearing', 'credit', 23292, 'pur_dues', 'mem_02', 'pi_dues_10', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_10') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_10', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_10', 'Year group dues', 24000, (now() - interval '290 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_11', 'org_2007', 'pur_dues', 'mem_04', null, 24000, 24708, 468, 240, true, false, 'succeeded', 'seed_pi_dues_11', now() - interval '280 days', now() - interval '280 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_11', 'org_2007', 'pi_dues_11', 'test', 'seed_pi_dues_11', '{"provider":"test","reference":"seed_pi_dues_11","gift":24000}'::jsonb, 'test:seed_pi_dues_11:seed', 'charge.success', now() - interval '280 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_11_0', 'org_2007', 'pi_dues_11:pay', 'clearing', 'debit', 24708, 'pur_dues', 'mem_04', 'pi_dues_11', 'Test gateway pay'),
  ('le_pi_dues_11_1', 'org_2007', 'pi_dues_11:pay', 'fund', 'credit', 24000, 'pur_dues', 'mem_04', 'pi_dues_11', 'Test gateway pay'),
  ('le_pi_dues_11_2', 'org_2007', 'pi_dues_11:pay', 'fees_recovered', 'credit', 708, 'pur_dues', 'mem_04', 'pi_dues_11', 'Test gateway pay'),
  ('le_pi_dues_11_3', 'org_2007', 'pi_dues_11:fee', 'fees_expense', 'debit', 708, 'pur_dues', 'mem_04', 'pi_dues_11', 'Test gateway fee'),
  ('le_pi_dues_11_4', 'org_2007', 'pi_dues_11:fee', 'clearing', 'credit', 708, 'pur_dues', 'mem_04', 'pi_dues_11', 'Test gateway fee'),
  ('le_pi_dues_11_5', 'org_2007', 'pi_dues_11:settle', 'org_bank', 'debit', 24000, 'pur_dues', 'mem_04', 'pi_dues_11', 'Test gateway settle'),
  ('le_pi_dues_11_6', 'org_2007', 'pi_dues_11:settle', 'clearing', 'credit', 24000, 'pur_dues', 'mem_04', 'pi_dues_11', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_11') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_11', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_11', 'Year group dues', 24708, (now() - interval '280 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_12', 'org_2007', 'pur_dues', 'mem_05', null, 24000, 24000, 468, 240, false, false, 'succeeded', 'seed_pi_dues_12', now() - interval '260 days', now() - interval '260 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_12', 'org_2007', 'pi_dues_12', 'test', 'seed_pi_dues_12', '{"provider":"test","reference":"seed_pi_dues_12","gift":24000}'::jsonb, 'test:seed_pi_dues_12:seed', 'charge.success', now() - interval '260 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_12_0', 'org_2007', 'pi_dues_12:pay', 'clearing', 'debit', 24000, 'pur_dues', 'mem_05', 'pi_dues_12', 'Test gateway pay'),
  ('le_pi_dues_12_1', 'org_2007', 'pi_dues_12:pay', 'fund', 'credit', 24000, 'pur_dues', 'mem_05', 'pi_dues_12', 'Test gateway pay'),
  ('le_pi_dues_12_2', 'org_2007', 'pi_dues_12:fee', 'fees_expense', 'debit', 708, 'pur_dues', 'mem_05', 'pi_dues_12', 'Test gateway fee'),
  ('le_pi_dues_12_3', 'org_2007', 'pi_dues_12:fee', 'clearing', 'credit', 708, 'pur_dues', 'mem_05', 'pi_dues_12', 'Test gateway fee'),
  ('le_pi_dues_12_4', 'org_2007', 'pi_dues_12:settle', 'org_bank', 'debit', 23292, 'pur_dues', 'mem_05', 'pi_dues_12', 'Test gateway settle'),
  ('le_pi_dues_12_5', 'org_2007', 'pi_dues_12:settle', 'clearing', 'credit', 23292, 'pur_dues', 'mem_05', 'pi_dues_12', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_12') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_12', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_12', 'Year group dues', 24000, (now() - interval '260 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_13', 'org_2007', 'pur_dues', 'mem_06', null, 24000, 24708, 468, 240, true, false, 'succeeded', 'seed_pi_dues_13', now() - interval '250 days', now() - interval '250 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_13', 'org_2007', 'pi_dues_13', 'test', 'seed_pi_dues_13', '{"provider":"test","reference":"seed_pi_dues_13","gift":24000}'::jsonb, 'test:seed_pi_dues_13:seed', 'charge.success', now() - interval '250 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_13_0', 'org_2007', 'pi_dues_13:pay', 'clearing', 'debit', 24708, 'pur_dues', 'mem_06', 'pi_dues_13', 'Test gateway pay'),
  ('le_pi_dues_13_1', 'org_2007', 'pi_dues_13:pay', 'fund', 'credit', 24000, 'pur_dues', 'mem_06', 'pi_dues_13', 'Test gateway pay'),
  ('le_pi_dues_13_2', 'org_2007', 'pi_dues_13:pay', 'fees_recovered', 'credit', 708, 'pur_dues', 'mem_06', 'pi_dues_13', 'Test gateway pay'),
  ('le_pi_dues_13_3', 'org_2007', 'pi_dues_13:fee', 'fees_expense', 'debit', 708, 'pur_dues', 'mem_06', 'pi_dues_13', 'Test gateway fee'),
  ('le_pi_dues_13_4', 'org_2007', 'pi_dues_13:fee', 'clearing', 'credit', 708, 'pur_dues', 'mem_06', 'pi_dues_13', 'Test gateway fee'),
  ('le_pi_dues_13_5', 'org_2007', 'pi_dues_13:settle', 'org_bank', 'debit', 24000, 'pur_dues', 'mem_06', 'pi_dues_13', 'Test gateway settle'),
  ('le_pi_dues_13_6', 'org_2007', 'pi_dues_13:settle', 'clearing', 'credit', 24000, 'pur_dues', 'mem_06', 'pi_dues_13', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_13') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_13', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_13', 'Year group dues', 24708, (now() - interval '250 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_14', 'org_2007', 'pur_dues', 'mem_07', null, 24000, 24000, 468, 240, false, false, 'succeeded', 'seed_pi_dues_14', now() - interval '240 days', now() - interval '240 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_14', 'org_2007', 'pi_dues_14', 'test', 'seed_pi_dues_14', '{"provider":"test","reference":"seed_pi_dues_14","gift":24000}'::jsonb, 'test:seed_pi_dues_14:seed', 'charge.success', now() - interval '240 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_14_0', 'org_2007', 'pi_dues_14:pay', 'clearing', 'debit', 24000, 'pur_dues', 'mem_07', 'pi_dues_14', 'Test gateway pay'),
  ('le_pi_dues_14_1', 'org_2007', 'pi_dues_14:pay', 'fund', 'credit', 24000, 'pur_dues', 'mem_07', 'pi_dues_14', 'Test gateway pay'),
  ('le_pi_dues_14_2', 'org_2007', 'pi_dues_14:fee', 'fees_expense', 'debit', 708, 'pur_dues', 'mem_07', 'pi_dues_14', 'Test gateway fee'),
  ('le_pi_dues_14_3', 'org_2007', 'pi_dues_14:fee', 'clearing', 'credit', 708, 'pur_dues', 'mem_07', 'pi_dues_14', 'Test gateway fee'),
  ('le_pi_dues_14_4', 'org_2007', 'pi_dues_14:settle', 'org_bank', 'debit', 23292, 'pur_dues', 'mem_07', 'pi_dues_14', 'Test gateway settle'),
  ('le_pi_dues_14_5', 'org_2007', 'pi_dues_14:settle', 'clearing', 'credit', 23292, 'pur_dues', 'mem_07', 'pi_dues_14', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_14') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_14', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_14', 'Year group dues', 24000, (now() - interval '240 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_15', 'org_2007', 'pur_dues', 'mem_08', null, 24000, 24708, 468, 240, true, false, 'succeeded', 'seed_pi_dues_15', now() - interval '220 days', now() - interval '220 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_15', 'org_2007', 'pi_dues_15', 'test', 'seed_pi_dues_15', '{"provider":"test","reference":"seed_pi_dues_15","gift":24000}'::jsonb, 'test:seed_pi_dues_15:seed', 'charge.success', now() - interval '220 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_15_0', 'org_2007', 'pi_dues_15:pay', 'clearing', 'debit', 24708, 'pur_dues', 'mem_08', 'pi_dues_15', 'Test gateway pay'),
  ('le_pi_dues_15_1', 'org_2007', 'pi_dues_15:pay', 'fund', 'credit', 24000, 'pur_dues', 'mem_08', 'pi_dues_15', 'Test gateway pay'),
  ('le_pi_dues_15_2', 'org_2007', 'pi_dues_15:pay', 'fees_recovered', 'credit', 708, 'pur_dues', 'mem_08', 'pi_dues_15', 'Test gateway pay'),
  ('le_pi_dues_15_3', 'org_2007', 'pi_dues_15:fee', 'fees_expense', 'debit', 708, 'pur_dues', 'mem_08', 'pi_dues_15', 'Test gateway fee'),
  ('le_pi_dues_15_4', 'org_2007', 'pi_dues_15:fee', 'clearing', 'credit', 708, 'pur_dues', 'mem_08', 'pi_dues_15', 'Test gateway fee'),
  ('le_pi_dues_15_5', 'org_2007', 'pi_dues_15:settle', 'org_bank', 'debit', 24000, 'pur_dues', 'mem_08', 'pi_dues_15', 'Test gateway settle'),
  ('le_pi_dues_15_6', 'org_2007', 'pi_dues_15:settle', 'clearing', 'credit', 24000, 'pur_dues', 'mem_08', 'pi_dues_15', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_15') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_15', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_15', 'Year group dues', 24708, (now() - interval '220 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_16', 'org_2007', 'pur_dues', 'mem_10', null, 24000, 24000, 468, 240, false, false, 'succeeded', 'seed_pi_dues_16', now() - interval '210 days', now() - interval '210 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_16', 'org_2007', 'pi_dues_16', 'test', 'seed_pi_dues_16', '{"provider":"test","reference":"seed_pi_dues_16","gift":24000}'::jsonb, 'test:seed_pi_dues_16:seed', 'charge.success', now() - interval '210 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_16_0', 'org_2007', 'pi_dues_16:pay', 'clearing', 'debit', 24000, 'pur_dues', 'mem_10', 'pi_dues_16', 'Test gateway pay'),
  ('le_pi_dues_16_1', 'org_2007', 'pi_dues_16:pay', 'fund', 'credit', 24000, 'pur_dues', 'mem_10', 'pi_dues_16', 'Test gateway pay'),
  ('le_pi_dues_16_2', 'org_2007', 'pi_dues_16:fee', 'fees_expense', 'debit', 708, 'pur_dues', 'mem_10', 'pi_dues_16', 'Test gateway fee'),
  ('le_pi_dues_16_3', 'org_2007', 'pi_dues_16:fee', 'clearing', 'credit', 708, 'pur_dues', 'mem_10', 'pi_dues_16', 'Test gateway fee'),
  ('le_pi_dues_16_4', 'org_2007', 'pi_dues_16:settle', 'org_bank', 'debit', 23292, 'pur_dues', 'mem_10', 'pi_dues_16', 'Test gateway settle'),
  ('le_pi_dues_16_5', 'org_2007', 'pi_dues_16:settle', 'clearing', 'credit', 23292, 'pur_dues', 'mem_10', 'pi_dues_16', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_16') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_16', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_16', 'Year group dues', 24000, (now() - interval '210 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_17', 'org_2007', 'pur_dues', 'mem_13', null, 24000, 24708, 468, 240, true, false, 'succeeded', 'seed_pi_dues_17', now() - interval '180 days', now() - interval '180 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_17', 'org_2007', 'pi_dues_17', 'test', 'seed_pi_dues_17', '{"provider":"test","reference":"seed_pi_dues_17","gift":24000}'::jsonb, 'test:seed_pi_dues_17:seed', 'charge.success', now() - interval '180 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_17_0', 'org_2007', 'pi_dues_17:pay', 'clearing', 'debit', 24708, 'pur_dues', 'mem_13', 'pi_dues_17', 'Test gateway pay'),
  ('le_pi_dues_17_1', 'org_2007', 'pi_dues_17:pay', 'fund', 'credit', 24000, 'pur_dues', 'mem_13', 'pi_dues_17', 'Test gateway pay'),
  ('le_pi_dues_17_2', 'org_2007', 'pi_dues_17:pay', 'fees_recovered', 'credit', 708, 'pur_dues', 'mem_13', 'pi_dues_17', 'Test gateway pay'),
  ('le_pi_dues_17_3', 'org_2007', 'pi_dues_17:fee', 'fees_expense', 'debit', 708, 'pur_dues', 'mem_13', 'pi_dues_17', 'Test gateway fee'),
  ('le_pi_dues_17_4', 'org_2007', 'pi_dues_17:fee', 'clearing', 'credit', 708, 'pur_dues', 'mem_13', 'pi_dues_17', 'Test gateway fee'),
  ('le_pi_dues_17_5', 'org_2007', 'pi_dues_17:settle', 'org_bank', 'debit', 24000, 'pur_dues', 'mem_13', 'pi_dues_17', 'Test gateway settle'),
  ('le_pi_dues_17_6', 'org_2007', 'pi_dues_17:settle', 'clearing', 'credit', 24000, 'pur_dues', 'mem_13', 'pi_dues_17', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_17') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_17', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_17', 'Year group dues', 24708, (now() - interval '180 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_18', 'org_2007', 'pur_dues', 'mem_15', null, 24000, 24000, 468, 240, false, false, 'succeeded', 'seed_pi_dues_18', now() - interval '150 days', now() - interval '150 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_18', 'org_2007', 'pi_dues_18', 'test', 'seed_pi_dues_18', '{"provider":"test","reference":"seed_pi_dues_18","gift":24000}'::jsonb, 'test:seed_pi_dues_18:seed', 'charge.success', now() - interval '150 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_18_0', 'org_2007', 'pi_dues_18:pay', 'clearing', 'debit', 24000, 'pur_dues', 'mem_15', 'pi_dues_18', 'Test gateway pay'),
  ('le_pi_dues_18_1', 'org_2007', 'pi_dues_18:pay', 'fund', 'credit', 24000, 'pur_dues', 'mem_15', 'pi_dues_18', 'Test gateway pay'),
  ('le_pi_dues_18_2', 'org_2007', 'pi_dues_18:fee', 'fees_expense', 'debit', 708, 'pur_dues', 'mem_15', 'pi_dues_18', 'Test gateway fee'),
  ('le_pi_dues_18_3', 'org_2007', 'pi_dues_18:fee', 'clearing', 'credit', 708, 'pur_dues', 'mem_15', 'pi_dues_18', 'Test gateway fee'),
  ('le_pi_dues_18_4', 'org_2007', 'pi_dues_18:settle', 'org_bank', 'debit', 23292, 'pur_dues', 'mem_15', 'pi_dues_18', 'Test gateway settle'),
  ('le_pi_dues_18_5', 'org_2007', 'pi_dues_18:settle', 'clearing', 'credit', 23292, 'pur_dues', 'mem_15', 'pi_dues_18', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_18') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_18', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_18', 'Year group dues', 24000, (now() - interval '150 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_19', 'org_2007', 'pur_dues', 'mem_23', null, 36000, 37062, 702, 360, true, false, 'succeeded', 'seed_pi_dues_19', now() - interval '60 days', now() - interval '60 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_19', 'org_2007', 'pi_dues_19', 'test', 'seed_pi_dues_19', '{"provider":"test","reference":"seed_pi_dues_19","gift":36000}'::jsonb, 'test:seed_pi_dues_19:seed', 'charge.success', now() - interval '60 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_19_0', 'org_2007', 'pi_dues_19:pay', 'clearing', 'debit', 37062, 'pur_dues', 'mem_23', 'pi_dues_19', 'Test gateway pay'),
  ('le_pi_dues_19_1', 'org_2007', 'pi_dues_19:pay', 'fund', 'credit', 36000, 'pur_dues', 'mem_23', 'pi_dues_19', 'Test gateway pay'),
  ('le_pi_dues_19_2', 'org_2007', 'pi_dues_19:pay', 'fees_recovered', 'credit', 1062, 'pur_dues', 'mem_23', 'pi_dues_19', 'Test gateway pay'),
  ('le_pi_dues_19_3', 'org_2007', 'pi_dues_19:fee', 'fees_expense', 'debit', 1062, 'pur_dues', 'mem_23', 'pi_dues_19', 'Test gateway fee'),
  ('le_pi_dues_19_4', 'org_2007', 'pi_dues_19:fee', 'clearing', 'credit', 1062, 'pur_dues', 'mem_23', 'pi_dues_19', 'Test gateway fee'),
  ('le_pi_dues_19_5', 'org_2007', 'pi_dues_19:settle', 'org_bank', 'debit', 36000, 'pur_dues', 'mem_23', 'pi_dues_19', 'Test gateway settle'),
  ('le_pi_dues_19_6', 'org_2007', 'pi_dues_19:settle', 'clearing', 'credit', 36000, 'pur_dues', 'mem_23', 'pi_dues_19', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_19') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_19', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_19', 'Year group dues', 37062, (now() - interval '60 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_20', 'org_2007', 'pur_dues', 'mem_26', null, 12000, 12000, 234, 120, false, false, 'succeeded', 'seed_pi_dues_20', now() - interval '30 days', now() - interval '30 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_20', 'org_2007', 'pi_dues_20', 'test', 'seed_pi_dues_20', '{"provider":"test","reference":"seed_pi_dues_20","gift":12000}'::jsonb, 'test:seed_pi_dues_20:seed', 'charge.success', now() - interval '30 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_20_0', 'org_2007', 'pi_dues_20:pay', 'clearing', 'debit', 12000, 'pur_dues', 'mem_26', 'pi_dues_20', 'Test gateway pay'),
  ('le_pi_dues_20_1', 'org_2007', 'pi_dues_20:pay', 'fund', 'credit', 12000, 'pur_dues', 'mem_26', 'pi_dues_20', 'Test gateway pay'),
  ('le_pi_dues_20_2', 'org_2007', 'pi_dues_20:fee', 'fees_expense', 'debit', 354, 'pur_dues', 'mem_26', 'pi_dues_20', 'Test gateway fee'),
  ('le_pi_dues_20_3', 'org_2007', 'pi_dues_20:fee', 'clearing', 'credit', 354, 'pur_dues', 'mem_26', 'pi_dues_20', 'Test gateway fee'),
  ('le_pi_dues_20_4', 'org_2007', 'pi_dues_20:settle', 'org_bank', 'debit', 11646, 'pur_dues', 'mem_26', 'pi_dues_20', 'Test gateway settle'),
  ('le_pi_dues_20_5', 'org_2007', 'pi_dues_20:settle', 'clearing', 'credit', 11646, 'pur_dues', 'mem_26', 'pi_dues_20', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_20') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_20', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_20', 'Year group dues', 12000, (now() - interval '30 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_21', 'org_2007', 'pur_dues', 'mem_31', null, 24000, 24708, 468, 240, true, false, 'succeeded', 'seed_pi_dues_21', now() - interval '20 days', now() - interval '20 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_21', 'org_2007', 'pi_dues_21', 'test', 'seed_pi_dues_21', '{"provider":"test","reference":"seed_pi_dues_21","gift":24000}'::jsonb, 'test:seed_pi_dues_21:seed', 'charge.success', now() - interval '20 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_21_0', 'org_2007', 'pi_dues_21:pay', 'clearing', 'debit', 24708, 'pur_dues', 'mem_31', 'pi_dues_21', 'Test gateway pay'),
  ('le_pi_dues_21_1', 'org_2007', 'pi_dues_21:pay', 'fund', 'credit', 24000, 'pur_dues', 'mem_31', 'pi_dues_21', 'Test gateway pay'),
  ('le_pi_dues_21_2', 'org_2007', 'pi_dues_21:pay', 'fees_recovered', 'credit', 708, 'pur_dues', 'mem_31', 'pi_dues_21', 'Test gateway pay'),
  ('le_pi_dues_21_3', 'org_2007', 'pi_dues_21:fee', 'fees_expense', 'debit', 708, 'pur_dues', 'mem_31', 'pi_dues_21', 'Test gateway fee'),
  ('le_pi_dues_21_4', 'org_2007', 'pi_dues_21:fee', 'clearing', 'credit', 708, 'pur_dues', 'mem_31', 'pi_dues_21', 'Test gateway fee'),
  ('le_pi_dues_21_5', 'org_2007', 'pi_dues_21:settle', 'org_bank', 'debit', 24000, 'pur_dues', 'mem_31', 'pi_dues_21', 'Test gateway settle'),
  ('le_pi_dues_21_6', 'org_2007', 'pi_dues_21:settle', 'clearing', 'credit', 24000, 'pur_dues', 'mem_31', 'pi_dues_21', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_21') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_21', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_21', 'Year group dues', 24708, (now() - interval '20 days')::date, false from c;
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at, paid_at) values ('pi_dues_22', 'org_2007', 'pur_dues', 'mem_34', null, 24000, 24000, 468, 240, false, false, 'succeeded', 'seed_pi_dues_22', now() - interval '8 days', now() - interval '8 days') on conflict do nothing;
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw, event_key, event_type, processed_at) values ('ge_pi_dues_22', 'org_2007', 'pi_dues_22', 'test', 'seed_pi_dues_22', '{"provider":"test","reference":"seed_pi_dues_22","gift":24000}'::jsonb, 'test:seed_pi_dues_22:seed', 'charge.success', now() - interval '8 days') on conflict do nothing;
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values
  ('le_pi_dues_22_0', 'org_2007', 'pi_dues_22:pay', 'clearing', 'debit', 24000, 'pur_dues', 'mem_34', 'pi_dues_22', 'Test gateway pay'),
  ('le_pi_dues_22_1', 'org_2007', 'pi_dues_22:pay', 'fund', 'credit', 24000, 'pur_dues', 'mem_34', 'pi_dues_22', 'Test gateway pay'),
  ('le_pi_dues_22_2', 'org_2007', 'pi_dues_22:fee', 'fees_expense', 'debit', 708, 'pur_dues', 'mem_34', 'pi_dues_22', 'Test gateway fee'),
  ('le_pi_dues_22_3', 'org_2007', 'pi_dues_22:fee', 'clearing', 'credit', 708, 'pur_dues', 'mem_34', 'pi_dues_22', 'Test gateway fee'),
  ('le_pi_dues_22_4', 'org_2007', 'pi_dues_22:settle', 'org_bank', 'debit', 23292, 'pur_dues', 'mem_34', 'pi_dues_22', 'Test gateway settle'),
  ('le_pi_dues_22_5', 'org_2007', 'pi_dues_22:settle', 'clearing', 'credit', 23292, 'pur_dues', 'mem_34', 'pi_dues_22', 'Test gateway settle')
on conflict do nothing;
with c as (update receipt_counter set n = n + 1 where organisation_id = 'org_2007' and not exists (select 1 from receipt where intent_id = 'pi_dues_22') returning n)
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided)
  select 'rc_pi_dues_22', 'org_2007', 'MF2007-' || lpad(c.n::text, 4, '0'), 'pi_dues_22', 'Year group dues', 24000, (now() - interval '8 days')::date, false from c;
