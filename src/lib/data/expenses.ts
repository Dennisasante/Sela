import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type ExpenseRow = {
  id: string;
  amount: number;
  currency: string;
  date: string;
  description: string | null;
  payee: string | null;
  isGift: boolean;
  categoryName: string | null;
  accountName: string;
};

export async function getExpenses(
  supabase: SupabaseClient<Database>,
  filters: {
    start: string;
    end: string;
    categoryId?: string;
    accountId?: string;
    giftsOnly?: boolean;
  }
): Promise<ExpenseRow[]> {
  let query = supabase
    .from("expenses")
    .select(
      "id, amount, currency, date, description, payee, is_gift, category_id, account_id, expense_categories(name), accounts(name)"
    )
    .gte("date", filters.start)
    .lte("date", filters.end)
    .order("date", { ascending: false });

  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.accountId) query = query.eq("account_id", filters.accountId);
  if (filters.giftsOnly) query = query.eq("is_gift", true);
  else query = query.eq("is_gift", false);

  const { data } = await query;

  return (data ?? []).map((row) => {
    const category = row.expense_categories as unknown as { name?: string } | null;
    const account = row.accounts as unknown as { name?: string } | null;
    return {
      id: row.id,
      amount: row.amount,
      currency: row.currency,
      date: row.date,
      description: row.description,
      payee: row.payee,
      isGift: row.is_gift,
      categoryName: category?.name ?? null,
      accountName: account?.name ?? "",
    };
  });
}
