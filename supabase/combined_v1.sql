-- ===== 20260822000001_extensions_and_helpers.sql =====
-- Extensions
create extension if not exists "pgcrypto";

-- Generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===== 20260822000002_enums.sql =====
create type public.account_type as enum ('mobile_money', 'bank', 'cash', 'investment', 'other');
create type public.income_category as enum ('stable', 'gig', 'product');
create type public.project_status as enum ('active', 'completed', 'cancelled');
create type public.bill_recurrence as enum ('monthly', 'yearly');
create type public.bill_status as enum ('pending', 'paid', 'overdue');
create type public.loan_direction as enum ('borrowed', 'lent');
create type public.loan_status as enum ('outstanding', 'repaid', 'partially_repaid');
create type public.event_status as enum ('active', 'closed');
create type public.savings_base_type as enum ('all_income', 'stable_only', 'gig_only', 'custom');
create type public.savings_period as enum ('monthly');
create type public.goal_target_type as enum ('percentage_of_income', 'fixed_amount');
create type public.alert_metric as enum ('total_spend', 'category_spend', 'total_income');
create type public.alert_direction as enum ('above', 'below');

-- ===== 20260822000003_tables.sql =====
-- accounts
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  type public.account_type not null,
  provider text,
  currency text not null default 'GHS',
  opening_balance numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- income_sources
create table public.income_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  category public.income_category not null,
  is_recurring boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  source_id uuid references public.income_sources(id) on delete set null,
  title text not null,
  total_amount numeric(12,2) not null,
  currency text not null default 'GHS',
  status public.project_status not null default 'active',
  started_at date,
  due_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- events (budget-tracked occasions)
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  budgeted_amount numeric(12,2) not null,
  currency text not null default 'GHS',
  start_date date,
  end_date date,
  status public.event_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- expense_categories
create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

-- loans
create table public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  direction public.loan_direction not null,
  counterparty text not null,
  amount numeric(12,2) not null,
  currency text not null default 'GHS',
  date date not null default current_date,
  status public.loan_status not null default 'outstanding',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- bills (one-off owed amounts and recurring bills/subscriptions)
create table public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  payee text not null,
  amount numeric(12,2) not null,
  currency text not null default 'GHS',
  is_recurring boolean not null default false,
  recurrence public.bill_recurrence,
  due_date date not null,
  status public.bill_status not null default 'pending',
  category_id uuid references public.expense_categories(id) on delete set null,
  default_account_id uuid references public.accounts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recurrence_requires_flag check (
    (is_recurring and recurrence is not null) or (not is_recurring and recurrence is null)
  )
);

-- income_entries (product_sale_id added after product_sales exists)
create table public.income_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  source_id uuid references public.income_sources(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  loan_id uuid references public.loans(id) on delete set null,
  account_id uuid not null references public.accounts(id) on delete restrict,
  amount numeric(12,2) not null,
  currency text not null default 'GHS',
  date date not null default current_date,
  description text,
  include_in_tax_base boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- product_sales
create table public.product_sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  income_entry_id uuid not null references public.income_entries(id) on delete cascade,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  selling_price_per_unit numeric(12,2) not null,
  cost_price_per_unit numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  sale_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.income_entries
  add column product_sale_id uuid references public.product_sales(id) on delete set null;

-- expenses
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete restrict,
  category_id uuid references public.expense_categories(id) on delete set null,
  amount numeric(12,2) not null,
  currency text not null default 'GHS',
  date date not null default current_date,
  description text,
  payee text,
  is_gift boolean not null default false,
  event_id uuid references public.events(id) on delete set null,
  bill_id uuid references public.bills(id) on delete set null,
  loan_id uuid references public.loans(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- transfers
create table public.transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  from_account_id uuid not null references public.accounts(id) on delete restrict,
  to_account_id uuid references public.accounts(id) on delete restrict,
  amount numeric(12,2) not null,
  currency text not null default 'GHS',
  date date not null default current_date,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transfer_accounts_differ check (
    to_account_id is null or to_account_id <> from_account_id
  )
);

-- savings_rules
create table public.savings_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  percentage numeric(5,2) not null check (percentage >= 0 and percentage <= 100),
  base_type public.savings_base_type not null,
  custom_source_ids uuid[],
  period public.savings_period not null default 'monthly',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint custom_requires_source_ids check (
    (base_type = 'custom' and custom_source_ids is not null and array_length(custom_source_ids, 1) > 0)
    or (base_type <> 'custom')
  )
);

-- savings_goals
create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  target_account_id uuid references public.accounts(id) on delete set null,
  target_type public.goal_target_type not null,
  target_value numeric(12,2) not null,
  period public.savings_period not null default 'monthly',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- alert_thresholds
create table public.alert_thresholds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  metric public.alert_metric not null,
  category_id uuid references public.expense_categories(id) on delete cascade,
  period public.savings_period not null default 'monthly',
  direction public.alert_direction not null,
  threshold_amount numeric(12,2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint category_metric_pair check (
    (metric = 'category_spend' and category_id is not null)
    or (metric <> 'category_spend' and category_id is null)
  )
);

-- updated_at triggers
create trigger set_updated_at before update on public.accounts for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.income_sources for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.projects for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.expense_categories for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.loans for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.bills for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.income_entries for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.product_sales for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.expenses for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.transfers for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.savings_rules for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.savings_goals for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.alert_thresholds for each row execute function public.set_updated_at();

-- indexes for common lookups
create index on public.income_entries (user_id, date);
create index on public.income_entries (account_id);
create index on public.income_entries (source_id);
create index on public.income_entries (project_id);
create index on public.expenses (user_id, date);
create index on public.expenses (account_id);
create index on public.expenses (category_id);
create index on public.expenses (event_id);
create index on public.expenses (bill_id);
create index on public.transfers (user_id, date);
create index on public.bills (user_id, due_date);
create index on public.loans (user_id, status);

-- ===== 20260822000004_rls.sql =====
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'accounts', 'income_sources', 'projects', 'income_entries', 'product_sales',
      'expense_categories', 'expenses', 'bills', 'loans', 'transfers', 'events',
      'savings_rules', 'savings_goals', 'alert_thresholds'
    ])
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "owner_all" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t
    );
  end loop;
end $$;

-- ===== 20260822000005_default_categories.sql =====
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.expense_categories (user_id, name, is_default)
  values
    (new.id, 'Transport', true),
    (new.id, 'Printing/School', true),
    (new.id, 'Food', true),
    (new.id, 'Utilities', true),
    (new.id, 'Airtime/Data', true),
    (new.id, 'Rent', true),
    (new.id, 'Entertainment', true),
    (new.id, 'Gifts', true),
    (new.id, 'Other', true);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== 20260822000006_mark_bill_paid.sql =====
-- Marks a bill as paid: creates the linked expense, and for recurring bills
-- rolls due_date forward to the next cycle and resets status to pending.
-- Runs with the caller's own privileges, so RLS applies exactly as it would
-- for a manual insert/update by that user.
create or replace function public.mark_bill_paid(
  p_bill_id uuid,
  p_account_id uuid default null,
  p_amount numeric default null,
  p_date date default current_date
)
returns public.expenses
language plpgsql
as $$
declare
  v_bill public.bills;
  v_account_id uuid;
  v_amount numeric(12,2);
  v_expense public.expenses;
begin
  select * into v_bill from public.bills where id = p_bill_id;

  if v_bill.id is null then
    raise exception 'Bill % not found', p_bill_id;
  end if;

  v_account_id := coalesce(p_account_id, v_bill.default_account_id);
  if v_account_id is null then
    raise exception 'No account specified and bill has no default_account_id';
  end if;

  v_amount := coalesce(p_amount, v_bill.amount);

  insert into public.expenses (
    user_id, account_id, category_id, amount, currency, date,
    description, payee, bill_id
  ) values (
    v_bill.user_id, v_account_id, v_bill.category_id, v_amount, v_bill.currency, p_date,
    'Bill payment: ' || v_bill.payee, v_bill.payee, v_bill.id
  )
  returning * into v_expense;

  if v_bill.is_recurring then
    update public.bills
    set
      status = 'pending',
      due_date = case v_bill.recurrence
        when 'monthly' then v_bill.due_date + interval '1 month'
        when 'yearly' then v_bill.due_date + interval '1 year'
      end
    where id = v_bill.id;
  else
    update public.bills set status = 'paid' where id = v_bill.id;
  end if;

  return v_expense;
end;
$$;

-- ===== 20260822000007_account_balances_view.sql =====
create or replace view public.account_balances
with (security_invoker = on) as
select
  a.id as account_id,
  a.user_id,
  a.name,
  a.type,
  a.currency,
  a.is_active,
  a.opening_balance
    + coalesce((select sum(ie.amount) from public.income_entries ie where ie.account_id = a.id), 0)
    + coalesce((select sum(t.amount) from public.transfers t where t.to_account_id = a.id), 0)
    - coalesce((select sum(e.amount) from public.expenses e where e.account_id = a.id), 0)
    - coalesce((select sum(t.amount) from public.transfers t where t.from_account_id = a.id), 0)
    as balance
from public.accounts a;

