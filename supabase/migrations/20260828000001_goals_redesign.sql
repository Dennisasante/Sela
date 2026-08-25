-- Redesign savings_goals from a "monthly savings rate" concept (which duplicated
-- savings_rules) into a true long-term goal: a fixed target amount, an optional
-- target date, and cumulative progress tracked via explicitly-tagged contribution
-- transfers (not inferred from shared account balances, which would double-count
-- when two goals share a target account).

alter table public.savings_goals
  drop column if exists target_type,
  drop column if exists target_value,
  drop column if exists period;

drop type if exists public.goal_target_type;

alter table public.savings_goals
  add column if not exists target_amount numeric(12,2) not null default 0,
  add column if not exists target_date date,
  add column if not exists priority text not null default 'medium',
  add column if not exists category text,
  add column if not exists status text not null default 'active';

alter table public.savings_goals
  drop constraint if exists savings_goals_priority_check,
  add constraint savings_goals_priority_check check (priority in ('low', 'medium', 'high'));

alter table public.savings_goals
  drop constraint if exists savings_goals_status_check,
  add constraint savings_goals_status_check check (status in ('active', 'paused', 'cancelled'));

alter table public.transfers
  add column if not exists goal_id uuid references public.savings_goals(id) on delete set null;

create index if not exists transfers_goal_id_idx on public.transfers (goal_id);
