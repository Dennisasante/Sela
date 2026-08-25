-- Subscriptions are recurring bills with a couple of extra fields (a provider
-- name, and more billing-frequency options) rather than a parallel table —
-- they already need the same due-date/roll-forward/payment-history machinery
-- bills have. `is_subscription` distinguishes them for the dedicated page.

alter type public.bill_recurrence add value if not exists 'weekly';
alter type public.bill_recurrence add value if not exists 'quarterly';

alter table public.bills
  add column if not exists provider text,
  add column if not exists is_subscription boolean not null default false,
  add column if not exists is_active boolean not null default true;

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
  v_total_paid numeric(12,2);
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
    -- Recurring bills are settled in full each cycle, then roll forward.
    update public.bills
    set
      status = 'pending'::public.bill_status,
      due_date = case v_bill.recurrence
        when 'weekly' then v_bill.due_date + interval '1 week'
        when 'monthly' then v_bill.due_date + interval '1 month'
        when 'quarterly' then v_bill.due_date + interval '3 months'
        when 'yearly' then v_bill.due_date + interval '1 year'
      end
    where id = v_bill.id;
  else
    select coalesce(sum(amount), 0) into v_total_paid
    from public.expenses
    where bill_id = v_bill.id;

    update public.bills
    set status = (case when v_total_paid >= v_bill.amount then 'paid' else 'partially_paid' end)::public.bill_status
    where id = v_bill.id;
  end if;

  return v_expense;
end;
$$;
