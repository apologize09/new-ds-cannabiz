create table if not exists public.staff_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_name text not null check (length(trim(recipient_name)) > 0),
  lead_id uuid not null references public.sales_leads(id) on delete cascade,
  channel text not null default 'in_app' check (channel in ('in_app', 'email', 'webhook')),
  status text not null default 'unread' check (status in ('unread', 'read', 'sent', 'failed')),
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (recipient_name, lead_id, channel)
);

create index if not exists staff_notifications_recipient_status_idx
  on public.staff_notifications (recipient_name, status, created_at desc);

alter table public.staff_notifications enable row level security;

drop policy if exists staff_notifications_staff_read on public.staff_notifications;
create policy staff_notifications_staff_read
  on public.staff_notifications for select to authenticated
  using (private.is_staff());

drop policy if exists staff_notifications_staff_update on public.staff_notifications;
create policy staff_notifications_staff_update
  on public.staff_notifications for update to authenticated
  using (private.is_staff()) with check (private.is_staff());

grant select, update on public.staff_notifications to authenticated;
