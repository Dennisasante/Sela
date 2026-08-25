-- Clients: extend income_sources with light contact info so it can serve as
-- a proper client record (name/category/recurring already existed).
alter table public.income_sources
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists company text;

-- Projects: description, and let expenses be tagged to a project so project
-- profitability (received - project expenses) is computable.
alter table public.projects
  add column if not exists description text;

alter table public.expenses
  add column if not exists project_id uuid references public.projects(id) on delete set null;

create index if not exists expenses_project_id_idx on public.expenses (project_id);

-- Project payment milestones: planned installments (deposit/milestone/final).
-- Mirrors the expected-income pattern — a milestone is a plan, not money
-- moved, until it's marked paid (which creates the real income_entries row).
create type public.milestone_status as enum ('pending', 'paid');

create table public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  label text not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'GHS',
  due_date date,
  status public.milestone_status not null default 'pending',
  income_entry_id uuid references public.income_entries(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.project_milestones
  for each row execute function public.set_updated_at();

alter table public.project_milestones enable row level security;
create policy "owner_all" on public.project_milestones
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index on public.project_milestones (project_id);
