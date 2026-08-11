create extension if not exists pgcrypto;

create type public.app_role as enum ('customer', 'staff', 'admin');
create type public.project_kind as enum ('packaging', 'merchandise');
create type public.project_status as enum ('draft', 'submitted', 'quoted', 'archived');
create type public.lead_status as enum ('new', 'contacted', 'qualified', 'won', 'lost');
create type public.quote_status as enum ('draft', 'submitted', 'reviewing', 'quoted', 'accepted', 'declined');
create type public.ai_action_type as enum ('product_match', 'background_removal', 'design_generation');
create type public.ai_job_status as enum ('queued', 'processing', 'succeeded', 'failed');
create type public.credit_entry_type as enum ('grant', 'reserve', 'spend', 'refund', 'adjustment');

create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  company text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 0,
  active boolean not null default true
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  category_id uuid references public.categories(id),
  name text not null,
  description text,
  specifications jsonb not null default '{}'::jsonb,
  stock_status text not null default 'inquire',
  stock_quantity integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false
);

create table public.product_tags (
  product_id uuid not null references public.products(id) on delete cascade,
  tag text not null,
  primary key (product_id, tag)
);

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  kind public.project_kind not null,
  name text not null,
  model_id text,
  image_url text,
  metadata jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.templates(id),
  kind public.project_kind not null,
  name text not null,
  status public.project_status not null default 'draft',
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null check (bucket in ('user-uploads', 'generated-assets')),
  path text not null,
  kind text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 20971520),
  created_at timestamptz not null default now(),
  unique (bucket, path)
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  monthly_price_cents integer,
  annual_price_cents integer,
  monthly_credits integer,
  annual_credits integer,
  stripe_monthly_price_id text,
  stripe_annual_price_id text,
  features jsonb not null default '[]'::jsonb,
  sales_assisted boolean not null default false,
  active boolean not null default true
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan_id uuid references public.plans(id),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'inactive',
  billing_interval text check (billing_interval in ('month', 'year')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.credit_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  reserved integer not null default 0 check (reserved >= 0 and reserved <= balance),
  updated_at timestamptz not null default now()
);

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_type public.credit_entry_type not null,
  amount integer not null,
  balance_after integer not null check (balance_after >= 0),
  reference_type text,
  reference_id text,
  description text,
  created_at timestamptz not null default now()
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);

create table public.sales_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  company text,
  phone text,
  message text not null,
  consent boolean not null default false,
  status public.lead_status not null default 'new',
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.sales_leads(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer check (quantity is null or quantity > 0),
  details jsonb not null default '{}'::jsonb,
  status public.quote_status not null default 'submitted',
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'subscribed',
  consented_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index newsletter_email_unique on public.newsletter_subscriptions (lower(email));

create table public.ai_action_costs (
  action public.ai_action_type primary key,
  credit_cost integer not null check (credit_cost >= 0),
  updated_at timestamptz not null default now()
);

create table public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  action public.ai_action_type not null,
  status public.ai_job_status not null default 'queued',
  credit_cost integer not null check (credit_cost >= 0),
  input_asset_id uuid references public.project_assets(id) on delete set null,
  output_asset_id uuid references public.project_assets(id) on delete set null,
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function private.is_staff(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles
    where user_id = uid and role in ('staff', 'admin')
  );
$$;
revoke all on function private.is_staff(uuid) from public;
grant execute on function private.is_staff(uuid) to authenticated, service_role;

create or replace function private.is_admin(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles where user_id = uid and role = 'admin');
$$;
revoke all on function private.is_admin(uuid) from public;
grant execute on function private.is_admin(uuid) to authenticated, service_role;

create or replace function private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated before update on public.profiles for each row execute function private.touch_updated_at();
create trigger products_updated before update on public.products for each row execute function private.touch_updated_at();
create trigger projects_updated before update on public.projects for each row execute function private.touch_updated_at();
create trigger subscriptions_updated before update on public.subscriptions for each row execute function private.touch_updated_at();
create trigger leads_updated before update on public.sales_leads for each row execute function private.touch_updated_at();
create trigger quotes_updated before update on public.quote_requests for each row execute function private.touch_updated_at();
create trigger ai_jobs_updated before update on public.ai_jobs for each row execute function private.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'avatar_url');
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  insert into public.credit_accounts (user_id, balance) values (new.id, 0);
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.apply_credit_change(
  target_user uuid, change_type public.credit_entry_type, credit_amount integer,
  ref_type text default null, ref_id text default null, note text default null
) returns integer language plpgsql security definer set search_path = '' as $$
declare current_balance integer; next_balance integer;
begin
  if auth.role() <> 'service_role' then raise exception 'not authorized'; end if;
  if credit_amount = 0 then raise exception 'amount cannot be zero'; end if;
  select balance into current_balance from public.credit_accounts where user_id = target_user for update;
  if current_balance is null then raise exception 'credit account not found'; end if;
  next_balance := current_balance + credit_amount;
  if next_balance < 0 then raise exception 'insufficient credits'; end if;
  update public.credit_accounts set balance = next_balance, updated_at = now() where user_id = target_user;
  insert into public.credit_ledger(user_id, entry_type, amount, balance_after, reference_type, reference_id, description)
  values(target_user, change_type, credit_amount, next_balance, ref_type, ref_id, note);
  return next_balance;
end;
$$;
revoke all on function public.apply_credit_change(uuid, public.credit_entry_type, integer, text, text, text) from public, anon, authenticated;
grant execute on function public.apply_credit_change(uuid, public.credit_entry_type, integer, text, text, text) to service_role;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_tags enable row level security;
alter table public.templates enable row level security;
alter table public.favorites enable row level security;
alter table public.projects enable row level security;
alter table public.project_assets enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.credit_accounts enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.webhook_events enable row level security;
alter table public.sales_leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.quote_requests enable row level security;
alter table public.newsletter_subscriptions enable row level security;
alter table public.ai_action_costs enable row level security;
alter table public.ai_jobs enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_select on public.profiles for select using (id = auth.uid() or private.is_staff());
create policy profiles_update on public.profiles for update using (id = auth.uid() or private.is_staff()) with check (id = auth.uid() or private.is_staff());
create policy roles_select on public.user_roles for select using (user_id = auth.uid() or private.is_staff());
create policy roles_admin_all on public.user_roles for all using (private.is_admin()) with check (private.is_admin());

create policy categories_public_read on public.categories for select using (active or private.is_staff());
create policy categories_staff_all on public.categories for all using (private.is_staff()) with check (private.is_staff());
create policy products_public_read on public.products for select using (active or private.is_staff());
create policy products_staff_all on public.products for all using (private.is_staff()) with check (private.is_staff());
create policy images_public_read on public.product_images for select using (exists(select 1 from public.products p where p.id = product_id and p.active));
create policy images_staff_all on public.product_images for all using (private.is_staff()) with check (private.is_staff());
create policy tags_public_read on public.product_tags for select using (exists(select 1 from public.products p where p.id = product_id and p.active));
create policy tags_staff_all on public.product_tags for all using (private.is_staff()) with check (private.is_staff());
create policy templates_public_read on public.templates for select using (active or private.is_staff());
create policy templates_staff_all on public.templates for all using (private.is_staff()) with check (private.is_staff());

create policy favorites_owner_all on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy projects_owner_read on public.projects for select using (user_id = auth.uid() or private.is_staff());
create policy projects_owner_insert on public.projects for insert with check (user_id = auth.uid());
create policy projects_owner_update on public.projects for update using (user_id = auth.uid() or private.is_staff()) with check (user_id = auth.uid() or private.is_staff());
create policy projects_owner_delete on public.projects for delete using (user_id = auth.uid() or private.is_staff());
create policy assets_owner_read on public.project_assets for select using (user_id = auth.uid() or private.is_staff());
create policy assets_owner_insert on public.project_assets for insert with check (user_id = auth.uid());
create policy assets_owner_delete on public.project_assets for delete using (user_id = auth.uid() or private.is_staff());

create policy plans_public_read on public.plans for select using (active or private.is_staff());
create policy plans_staff_all on public.plans for all using (private.is_staff()) with check (private.is_staff());
create policy subscriptions_owner_read on public.subscriptions for select using (user_id = auth.uid() or private.is_staff());
create policy subscriptions_staff_all on public.subscriptions for all using (private.is_staff()) with check (private.is_staff());
create policy credits_owner_read on public.credit_accounts for select using (user_id = auth.uid() or private.is_staff());
create policy ledger_owner_read on public.credit_ledger for select using (user_id = auth.uid() or private.is_staff());
create policy webhook_staff_read on public.webhook_events for select using (private.is_staff());

create policy leads_owner_read on public.sales_leads for select using (user_id = auth.uid() or private.is_staff());
create policy leads_staff_all on public.sales_leads for all using (private.is_staff()) with check (private.is_staff());
create policy notes_staff_all on public.lead_notes for all using (private.is_staff()) with check (private.is_staff());
create policy quotes_owner_read on public.quote_requests for select using (user_id = auth.uid() or private.is_staff());
create policy quotes_owner_insert on public.quote_requests for insert with check (user_id = auth.uid());
create policy quotes_staff_update on public.quote_requests for update using (private.is_staff()) with check (private.is_staff());
create policy newsletter_staff_read on public.newsletter_subscriptions for select using (private.is_staff());

create policy ai_costs_public_read on public.ai_action_costs for select using (true);
create policy ai_costs_staff_all on public.ai_action_costs for all using (private.is_staff()) with check (private.is_staff());
create policy jobs_owner_read on public.ai_jobs for select using (user_id = auth.uid() or private.is_staff());
create policy audit_staff_read on public.audit_events for select using (private.is_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
('product-media', 'product-media', true, 20971520, array['image/jpeg','image/png','image/webp','image/svg+xml']),
('template-media', 'template-media', true, 20971520, array['image/jpeg','image/png','image/webp','image/svg+xml']),
('user-uploads', 'user-uploads', false, 20971520, array['image/jpeg','image/png','image/webp','application/pdf','application/postscript']),
('generated-assets', 'generated-assets', false, 20971520, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

create policy public_media_read on storage.objects for select using (bucket_id in ('product-media','template-media'));
create policy staff_media_insert on storage.objects for insert with check (bucket_id in ('product-media','template-media') and private.is_staff());
create policy staff_media_update on storage.objects for update using (bucket_id in ('product-media','template-media') and private.is_staff()) with check (bucket_id in ('product-media','template-media') and private.is_staff());
create policy staff_media_delete on storage.objects for delete using (bucket_id in ('product-media','template-media') and private.is_staff());
create policy private_asset_read on storage.objects for select using (bucket_id in ('user-uploads','generated-assets') and ((storage.foldername(name))[1] = auth.uid()::text or private.is_staff()));
create policy private_upload_insert on storage.objects for insert with check (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy private_upload_update on storage.objects for update using (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy private_asset_delete on storage.objects for delete using (bucket_id in ('user-uploads','generated-assets') and ((storage.foldername(name))[1] = auth.uid()::text or private.is_staff()));

create index products_category_idx on public.products(category_id) where active;
create index projects_user_idx on public.projects(user_id, updated_at desc);
create index assets_project_idx on public.project_assets(project_id);
create index ledger_user_idx on public.credit_ledger(user_id, created_at desc);
create index leads_status_idx on public.sales_leads(status, created_at desc);
create index quotes_status_idx on public.quote_requests(status, created_at desc);
create index jobs_user_idx on public.ai_jobs(user_id, created_at desc);
