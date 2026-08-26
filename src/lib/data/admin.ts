import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AdminUserRow = {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
  bannedUntil: string | null;
  isAdmin: boolean;
  accounts: number;
  expenses: number;
  incomeEntries: number;
};

export type AdminStats = {
  totalUsers: number;
  newThisWeek: number;
  activeThisWeek: number;
  unconfirmed: number;
};

function isBanned(bannedUntil: string | null) {
  return !!bannedUntil && new Date(bannedUntil).getTime() > Date.now();
}

export async function getAdminUserOverview(
  serviceClient: SupabaseClient<Database>
): Promise<AdminUserRow[]> {
  const [{ data: usersPage, error }, accountRows, expenseRows, incomeRows, { data: admins }] =
    await Promise.all([
      serviceClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      serviceClient.from("accounts").select("user_id"),
      serviceClient.from("expenses").select("user_id"),
      serviceClient.from("income_entries").select("user_id"),
      serviceClient.from("admin_users").select("user_id"),
    ]);

  if (error) throw new Error(error.message);

  const countByUser = (rows: { data: { user_id: string }[] | null }) => {
    const counts = new Map<string, number>();
    for (const row of rows.data ?? []) {
      counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
    }
    return counts;
  };

  const accountCounts = countByUser(accountRows);
  const expenseCounts = countByUser(expenseRows);
  const incomeCounts = countByUser(incomeRows);
  const adminIds = new Set((admins ?? []).map((a) => a.user_id));

  return (usersPage?.users ?? [])
    .map((user) => ({
      id: user.id,
      email: user.email ?? null,
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at ?? null,
      emailConfirmed: !!user.email_confirmed_at,
      bannedUntil: isBanned(user.banned_until ?? null) ? (user.banned_until ?? null) : null,
      isAdmin: adminIds.has(user.id),
      accounts: accountCounts.get(user.id) ?? 0,
      expenses: expenseCounts.get(user.id) ?? 0,
      incomeEntries: incomeCounts.get(user.id) ?? 0,
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getAdminStats(users: AdminUserRow[]): AdminStats {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return {
    totalUsers: users.length,
    newThisWeek: users.filter((u) => new Date(u.createdAt).getTime() >= weekAgo).length,
    activeThisWeek: users.filter(
      (u) => u.lastSignInAt && new Date(u.lastSignInAt).getTime() >= weekAgo
    ).length,
    unconfirmed: users.filter((u) => !u.emailConfirmed).length,
  };
}
