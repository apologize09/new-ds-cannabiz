-- Canonicalize the retired DS-C-334 SKU without losing dependent media or tags.
do $$
declare
  old_id uuid;
  canonical_id uuid;
begin
  select id into old_id from public.products where sku = 'DS-C-334';
  select id into canonical_id from public.products where sku = 'DS-C-312';

  if old_id is not null and canonical_id is null then
    update public.products set sku = 'DS-C-312', name = 'DS-C-312' where id = old_id;
    update public.product_images set alt_text = replace(coalesce(alt_text, ''), 'DS-C-334', 'DS-C-312') where product_id = old_id;
  elsif old_id is not null and canonical_id is not null and old_id <> canonical_id then
    update public.product_tags set product_id = canonical_id where product_id = old_id
      and not exists (select 1 from public.product_tags t where t.product_id = canonical_id and t.tag = public.product_tags.tag);
    delete from public.product_tags where product_id = old_id;
    update public.product_images set product_id = canonical_id,
      alt_text = replace(coalesce(alt_text, ''), 'DS-C-334', 'DS-C-312')
      where product_id = old_id;
    delete from public.products where id = old_id;
  end if;
end $$;

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  path text not null,
  referrer text,
  session_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views(created_at desc);
create index if not exists page_views_session_idx on public.page_views(session_id, created_at desc);
alter table public.page_views enable row level security;
drop policy if exists page_views_insert on public.page_views;
create policy page_views_insert on public.page_views for insert to anon, authenticated with check (user_id is null or user_id = auth.uid());
drop policy if exists page_views_staff_read on public.page_views;
create policy page_views_staff_read on public.page_views for select to authenticated using (private.is_staff());
grant insert on public.page_views to anon, authenticated;
grant select on public.page_views to authenticated;
