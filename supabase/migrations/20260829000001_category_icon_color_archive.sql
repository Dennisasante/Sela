alter table public.expense_categories
  add column if not exists icon text not null default 'shapes',
  add column if not exists color text not null default '#64748b',
  add column if not exists archived_at timestamptz;
