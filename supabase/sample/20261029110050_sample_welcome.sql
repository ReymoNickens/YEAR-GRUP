-- Sample only: the welcome on Home. Safe to run more than once.
-- 1. The nicknames the year group actually uses, for databases loaded before the seed changed.
update membership set nickname = 'Wayo' where id = 'mem_01' and organisation_id = 'org_2007';
update membership set nickname = 'Obonto' where id = 'mem_02' and organisation_id = 'org_2007';
update membership set nickname = 'Wetbone' where id = 'mem_03' and organisation_id = 'org_2007';
update membership set nickname = 'Reymo' where id = 'mem_04' and organisation_id = 'org_2007';

-- 2. A word from the President, and the organiser's notice delivered to every inbox, so the notice board is not bare.
insert into announcement (id, organisation_id, author_membership_id, audience, body, created_at) values
  ('an_welcome', 'org_2007', 'mem_19', 'Class of 2007',
   'Akwaaba to every one of the boys who joined this month. Find your house, say hello to your cot mates, and keep 5 December free for the founders dinner in Accra.',
   now() - interval '2 hours')
on conflict (id) do nothing;
update announcement set created_at = now() - interval '3 days' where id = 'an_1' and organisation_id = 'org_2007';

insert into outbox (id, organisation_id, membership_id, template_key, payload, idempotency_key, status, channel, attempts)
select 'ob_' || a.id || '_' || m.id, a.organisation_id, m.id, 'announcement',
       jsonb_build_object('body', left(a.body, 140), 'org', 'Mfantsipim 2007', 'audience', a.audience),
       'an:' || a.id || ':' || m.id || ':in_app', 'delivered', 'in_app', 1
from announcement a
join membership m on m.organisation_id = a.organisation_id
where a.organisation_id = 'org_2007' and a.id in ('an_1', 'an_welcome')
on conflict (idempotency_key) do nothing;
