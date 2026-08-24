import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { currentMonthRange } from "@/lib/format";

export type BudgetProgress = {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  monthlyLimit: number;
  spent: number;
  currency: string;
};

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
      .select("amount, category_id")
      .gte("date", start)
      .lte("date", end),
  ]);

  const spentByCategory = new Map<string, number>();
  for (const row of expenses ?? []) {
    if (!row.category_id) continue;
    spentByCategory.set(
      row.category_id,
      (spentByCategory.get(row.category_id) ?? 0) + row.amount
    );
  }

  return (budgets ?? []).map((b) => {
    const category = b.expense_categories as unknown as { name?: string } | null;
    return {
      budgetId: b.id,
      categoryId: b.category_id,
      categoryName: category?.name ?? "Unknown",
      monthlyLimit: b.monthly_limit,
      spent: spentByCategory.get(b.category_id) ?? 0,
      currency: b.currency,
    };
  });
}
