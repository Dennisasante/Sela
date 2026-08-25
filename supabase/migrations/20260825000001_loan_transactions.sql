-- Loans need their own cash-movement ledger, separate from income_entries/
-- expenses, so principal disbursement and repayment affect account balances
-- as liability/receivable movements without distorting income or expense totals.

create type public.loan_transaction_type as enum ('disbursement', 'repayment');

create table public.loan_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  loan_id uuid not null references public.loans(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete restrict,
  type public.loan_transaction_type not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'GHS',
  date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.loan_transactions
  for each row execute function public.set_updated_at();

alter table public.loan_transactions enable row level security;

create policy "owner_all" on public.loan_transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index on public.loan_transactions (loan_id);
create index on public.loan_transactions (account_id);

-- Cash impact of a loan_transaction on the account it moved through:
--   borrowed + disbursement  -> money IN  (I received the loan)
--   borrowed + repayment     -> money OUT (I paid it back)
--   lent     + disbursement  -> money OUT (I gave the loan)
--   lent     + repayment     -> money IN  (I got it back)
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
    + coalesce((
        select sum(
          case
            when (l.direction = 'borrowed' and lt.type = 'disbursement')
              or (l.direction = 'lent' and lt.type = 'repayment')
              then lt.amount
            else -lt.amount
          end
        )
        from public.loan_transactions lt
        join public.loans l on l.id = lt.loan_id
        where lt.account_id = a.id
      ), 0)
    as balance
from public.accounts a;
