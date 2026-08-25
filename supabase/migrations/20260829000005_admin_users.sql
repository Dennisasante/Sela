-- A genuinely separate identity space for the superadmin dashboard, mirroring
-- the platform_admins pattern used elsewhere: a dedicated marker table (not an
-- env-var email allowlist) so admin access can be granted/revoked without a
-- redeploy, and so a user can be checked as "is this my own admin row" without
-- ever exposing the full admin roster to a non-admin caller.

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Deliberately narrow: a signed-in user may only check whether THEIR OWN id
-- is an admin row — never list or read anyone else's. The admin dashboard's
-- full user roster is read separately via the service-role client, which
-- bypasses RLS entirely.
create policy "self_read" on public.admin_users
  for select using (auth.uid() = user_id);
