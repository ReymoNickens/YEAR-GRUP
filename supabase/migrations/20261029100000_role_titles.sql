-- An office can carry the year group's own title ("President", "Financial Secretary"),
-- while what it may do stays with its role key.
alter table role_assignment add column if not exists title text;

select hub_apply_grants();
