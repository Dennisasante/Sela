-- Expected/recurring income: planned money that has NOT been received yet.
-- Occurrences never touch income_entries until explicitly recorded as
-- received, so "expected" figures never leak into actual income totals.

create type public.recurring_income_status as enum ('active', 'paused', 'cancelled');
create type public.income_occurrence_status as enum ('expected', 'partial', 'received', 'skipped', 'missed');

create table public.recurring_income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  source_id uuid not null references public.income_sources(id) on delete cascade,
  expected_amount numeric(12,2) not null check (expected_amount > 0),
  currency text not null default 'GHS',
  expected_day_of_month smallint not null check (expected_day_of_month between 1 and 31),
  default_account_id uuid references public.accounts(id) on delete set null,
  start_date date not null default current_date,
  status public.recurring_income_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.recurring_income
  for each row execute function public.set_updated_at();

alter table public.recurring_income enable row level security;
create policy "owner_all" on public.recurring_income
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.income_occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recurring_income_id uuid not null references public.recurring_income(id) on delete cascade,
  expected_date date not null,
  expected_amount numeric(12,2) not null,
  currency text not null default 'GHS',
  status public.income_occurrence_status not null default 'expected',
  income_entry_id uuid references public.income_entries(id) on delete set null,
  received_amount numeric(12,2),
  received_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recurring_income_id, expected_date)
);

create trigger set_updated_at before update on public.income_occurrences
  for each row execute function public.set_updated_at();

alter table public.income_occurrences enable row level security;
create policy "owner_all" on public.income_occurrences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index on public.income_occurrences (recurring_income_id);
create index on public.income_occurrences (expected_date);
