create table public.category_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_id uuid not null references public.expense_categories(id) on delete cascade,
  monthly_limit numeric(12,2) not null check (monthly_limit > 0),
  currency text not null default 'GHS',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_id)
);

create trigger set_updated_at before update on public.category_budgets
  for each row execute function public.set_updated_at();

alter table public.category_budgets enable row level security;

create policy "owner_all" on public.category_budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
