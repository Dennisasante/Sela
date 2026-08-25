import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { currentMonthRange } from "@/lib/format";

export type BudgetStatus = "not_started" | "on_track" | "near_limit" | "over_budget";

export type BudgetTransaction = {
  id: string;
  amount: number;
  date: string;
  description: string | null;
  payee: string | null;
};

export type BudgetProgress = {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  monthlyLimit: number;
  spent: number;
  variance: number;
  projected: number;
  status: BudgetStatus;
  currency: string;
  transactions: BudgetTransaction[];
};

const NEAR_LIMIT_THRESHOLD = 0.85;

export async function getBudgetProgress(
  supabase: SupabaseClient<Database>
): Promise<BudgetProgress[]> {
  const { start, end } = currentMonthRange();

  const [{ data: budgets }, { data: expenses }] = await Promise.all([
    supabase
      .from("category_budgets")
      .select("*, expense_categories(name)")
      .order("created_at"),
    supabase
      .from("expenses")
      .select("id, amount, category_id, date, description, payee")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: false }),
  ]);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = Math.min(now.getDate(), daysInMonth);

  const byCategory = new Map<string, BudgetTransaction[]>();
  for (const row of expenses ?? []) {
    if (!row.category_id) continue;
    const list = byCategory.get(row.category_id) ?? [];
    list.push({
      id: row.id,
      amount: row.amount,
      date: row.date,
      description: row.description,
      payee: row.payee,
    });
    byCategory.set(row.category_id, list);
  }

  return (budgets ?? []).map((b) => {
    const category = b.expense_categories as unknown as { name?: string } | null;
    const transactions = byCategory.get(b.category_id) ?? [];
    const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const projected = daysElapsed > 0 ? (spent / daysElapsed) * daysInMonth : spent;

    let status: BudgetStatus;
    if (spent === 0) status = "not_started";
    else if (spent > b.monthly_limit) status = "over_budget";
    else if (spent / b.monthly_limit >= NEAR_LIMIT_THRESHOLD) status = "near_limit";
    else status = "on_track";

    return {
      budgetId: b.id,
      categoryId: b.category_id,
      categoryName: category?.name ?? "Unknown",
      monthlyLimit: b.monthly_limit,
      spent,
      variance: b.monthly_limit - spent,
      projected,
      status,
      currency: b.currency,
      transactions,
    };
  });
}
