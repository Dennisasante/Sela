import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AdminUserRow = {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
  accounts: number;
  expenses: number;
  incomeEntries: number;
};

export async function getAdminUserOverview(
  serviceClient: SupabaseClient<Database>
): Promise<AdminUserRow[]> {
  const [{ data: usersPage, error }, accountRows, expenseRows, incomeRows] = await Promise.all([
    serviceClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    serviceClient.from("accounts").select("user_id"),
    serviceClient.from("expenses").select("user_id"),
    serviceClient.from("income_entries").select("user_id"),
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

  return (usersPage?.users ?? [])
    .map((user) => ({
      id: user.id,
      email: user.email ?? null,
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at ?? null,
      emailConfirmed: !!user.email_confirmed_at,
      accounts: accountCounts.get(user.id) ?? 0,
      expenses: expenseCounts.get(user.id) ?? 0,
      incomeEntries: incomeCounts.get(user.id) ?? 0,
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
