do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'accounts', 'income_sources', 'projects', 'income_entries', 'product_sales',
      'expense_categories', 'expenses', 'bills', 'loans', 'transfers', 'events',
      'savings_rules', 'savings_goals', 'alert_thresholds'
    ])
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "owner_all" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t
    );
  end loop;
end $$;
