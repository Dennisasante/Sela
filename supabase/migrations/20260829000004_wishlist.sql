create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  estimated_price numeric(12,2) not null default 0,
  currency text not null default 'GHS',
  priority text not null default 'medium',
  url text,
  notes text,
  status text not null default 'wanted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wishlist_items
  add constraint wishlist_items_priority_check check (priority in ('low', 'medium', 'high')),
  add constraint wishlist_items_status_check check (status in ('wanted', 'purchased', 'archived'));

alter table public.wishlist_items enable row level security;

create policy "owner_all" on public.wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger set_updated_at before update on public.wishlist_items
  for each row execute function public.set_updated_at();
