-- Marks a bill as paid: creates the linked expense, and for recurring bills
-- rolls due_date forward to the next cycle and resets status to pending.
-- Runs with the caller's own privileges, so RLS applies exactly as it would
-- for a manual insert/update by that user.
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
    update public.bills
    set
      status = 'pending',
      due_date = case v_bill.recurrence
        when 'monthly' then v_bill.due_date + interval '1 month'
        when 'yearly' then v_bill.due_date + interval '1 year'
      end
    where id = v_bill.id;
  else
    update public.bills set status = 'paid' where id = v_bill.id;
  end if;

  return v_expense;
end;
$$;
