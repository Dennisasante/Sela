create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.expense_categories (user_id, name, is_default)
  values
    (new.id, 'Transport', true),
    (new.id, 'Printing/School', true),
    (new.id, 'Food', true),
    (new.id, 'Utilities', true),
    (new.id, 'Airtime/Data', true),
    (new.id, 'Rent', true),
    (new.id, 'Entertainment', true),
    (new.id, 'Gifts', true),
    (new.id, 'Other', true);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
