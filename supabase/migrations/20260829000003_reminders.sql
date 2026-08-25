create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  notes text,
  remind_at timestamptz not null,
  repeat text not null default 'none',
  is_active boolean not null default true,
  last_fired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reminders
  add constraint reminders_repeat_check check (repeat in ('none', 'daily', 'weekly', 'monthly', 'yearly'));

create index reminders_remind_at_idx on public.reminders (remind_at) where is_active;

alter table public.reminders enable row level security;

create policy "owner_all" on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger set_updated_at before update on public.reminders
  for each row execute function public.set_updated_at();
