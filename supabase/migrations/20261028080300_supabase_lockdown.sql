-- Supabase exposes the public schema through its REST API to the anon and
-- authenticated roles. This app never uses that API: every query runs on the
-- server, inside one transaction, as the restricted hub_app role. So those
-- roles get nothing here, now or for tables created later.

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated, public;

alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated, public;

-- hub_app keeps exactly what the earlier migrations granted it.
grant execute on function hub_org(), hub_member(), hub_user(), hub_is_circle_member(text), hub_circle_visible(text), hub_has_role(text[]) to hub_app;
grant execute on function public_receipt(text), platform_overview() to hub_app;
grant execute on function hub_phone_owner(text) to hub_app;
grant execute on function hub_enqueue(text,text,text,text,jsonb,text,text,text,timestamptz) to hub_app;
grant execute on function hub_move_phone(text, text) to hub_app;
select hub_apply_grants();
