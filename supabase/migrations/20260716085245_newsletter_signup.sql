create or replace function public.subscribe_newsletter(address text, has_consent boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if has_consent is not true then raise exception 'consent is required'; end if;
  if address is null or address !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then raise exception 'invalid email'; end if;
  insert into public.newsletter_subscriptions(email, status, consented_at, unsubscribed_at)
  values(lower(trim(address)), 'subscribed', now(), null)
  on conflict (lower(email)) do update set status='subscribed', consented_at=now(), unsubscribed_at=null;
end;
$$;
revoke all on function public.subscribe_newsletter(text, boolean) from public;
grant execute on function public.subscribe_newsletter(text, boolean) to anon, authenticated;
