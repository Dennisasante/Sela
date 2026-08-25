-- Sinking funds reuse the savings_goals progress-tracking machinery (target
-- amount, contributions via tagged transfers, suggested-contribution math) but
-- are for a known, recurring future expense (insurance, Christmas) rather than
-- an open-ended goal. `kind` distinguishes the two in the same table instead of
-- duplicating all of that logic in a parallel schema.

alter table public.savings_goals
  add column if not exists kind text not null default 'goal',
  add column if not exists is_recurring boolean not null default false,
  add column if not exists cycle_started_at timestamptz not null default now();

alter table public.savings_goals
  drop constraint if exists savings_goals_kind_check,
  add constraint savings_goals_kind_check check (kind in ('goal', 'sinking_fund'));
