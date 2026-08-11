alter table public.credit_ledger
  add column if not exists idempotency_key text;

create unique index if not exists credit_ledger_idempotency_key_idx
  on public.credit_ledger (idempotency_key)
  where idempotency_key is not null;

create or replace function public.apply_credit_change_once(
  target_user uuid,
  change_type public.credit_entry_type,
  credit_amount integer,
  ref_type text default null,
  ref_id text default null,
  note text default null,
  operation_key text default null
) returns integer language plpgsql security definer set search_path = '' as $$
declare current_balance integer; next_balance integer; existing_balance integer;
begin
  if auth.role() <> 'service_role' then raise exception 'not authorized'; end if;
  if operation_key is null or length(trim(operation_key)) = 0 then raise exception 'operation key is required'; end if;
  if credit_amount = 0 then raise exception 'amount cannot be zero'; end if;

  select balance_after into existing_balance
  from public.credit_ledger where idempotency_key = operation_key;
  if existing_balance is not null then return existing_balance; end if;

  select balance into current_balance from public.credit_accounts where user_id = target_user for update;
  if current_balance is null then raise exception 'credit account not found'; end if;

  select balance_after into existing_balance
  from public.credit_ledger where idempotency_key = operation_key;
  if existing_balance is not null then return existing_balance; end if;

  next_balance := current_balance + credit_amount;
  if next_balance < 0 then raise exception 'insufficient credits'; end if;
  update public.credit_accounts set balance = next_balance, updated_at = now() where user_id = target_user;
  insert into public.credit_ledger(user_id, entry_type, amount, balance_after, reference_type, reference_id, description, idempotency_key)
  values(target_user, change_type, credit_amount, next_balance, ref_type, ref_id, note, operation_key);
  return next_balance;
end;
$$;
revoke all on function public.apply_credit_change_once(uuid, public.credit_entry_type, integer, text, text, text, text) from public, anon, authenticated;
grant execute on function public.apply_credit_change_once(uuid, public.credit_entry_type, integer, text, text, text, text) to service_role;

alter table public.ai_action_costs
  add column if not exists estimated_provider_cost_cents numeric(10,4),
  add column if not exists minimum_margin_bps integer not null default 7000
    check (minimum_margin_bps between 0 and 9900);

create or replace function public.minimum_paid_credit_price_cents()
returns numeric language sql stable security definer set search_path = '' as $$
  select min(price_per_credit) from (
    select monthly_price_cents::numeric / monthly_credits as price_per_credit
    from public.plans
    where active and not sales_assisted and monthly_price_cents > 0 and monthly_credits > 0
    union all
    select annual_price_cents::numeric / annual_credits as price_per_credit
    from public.plans
    where active and not sales_assisted and annual_price_cents > 0 and annual_credits > 0
  ) prices;
$$;
revoke all on function public.minimum_paid_credit_price_cents() from public, anon, authenticated;
grant execute on function public.minimum_paid_credit_price_cents() to service_role;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'avatar_url');
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  insert into public.credit_accounts (user_id, balance) values (new.id, 20);
  insert into public.credit_ledger(user_id, entry_type, amount, balance_after, reference_type, reference_id, description, idempotency_key)
  values(new.id, 'grant', 20, 20, 'signup', new.id::text, 'Basic plan starter credits', 'signup:' || new.id::text || ':grant');
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

with eligible as (
  select a.user_id
  from public.credit_accounts a
  where a.balance = 0
    and not exists (select 1 from public.credit_ledger l where l.user_id = a.user_id)
), updated as (
  update public.credit_accounts a set balance = 20, updated_at = now()
  from eligible e where a.user_id = e.user_id returning a.user_id
)
insert into public.credit_ledger(user_id, entry_type, amount, balance_after, reference_type, reference_id, description, idempotency_key)
select user_id, 'grant', 20, 20, 'signup', user_id::text, 'Basic plan starter credits', 'signup:' || user_id::text || ':grant'
from updated;
