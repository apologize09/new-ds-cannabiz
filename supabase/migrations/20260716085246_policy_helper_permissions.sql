grant usage on schema private to anon, authenticated, service_role;
grant execute on function private.is_staff(uuid) to anon, authenticated, service_role;
grant execute on function private.is_admin(uuid) to authenticated, service_role;
