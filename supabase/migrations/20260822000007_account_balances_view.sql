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
