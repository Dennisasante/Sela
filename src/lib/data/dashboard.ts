import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { currentMonthRange } from "@/lib/format";

export async function getDashboardData(supabase: SupabaseClient<Database>) {
  const { start, end } = currentMonthRange();

  const [
    { data: incomeEntries },
    { data: expenses },
    { data: balances },
    { data: thresholds },
  ] = await Promise.all([
    supabase
      .from("income_entries")
      .select("amount, currency, source_id, income_sources(category)")
      .gte("date", start)
      .lte("date", end),
    supabase
      .from("expenses")
      .select("amount, currency, is_gift, category_id, expense_categories(name)")
      .gte("date", start)
      .lte("date", end),
    supabase.from("account_balances").select("*").eq("is_active", true),
    supabase.from("alert_thresholds").select("*").eq("is_active", true),
  ]);

  const income = incomeEntries ?? [];
  const expenseRows = expenses ?? [];

  const incomeByCategory = { stable: 0, gig: 0, product: 0 } as Record<
    "stable" | "gig" | "product",
    number
  >;

  for (const row of income) {
    const source = row.income_sources as unknown as { category?: string } | null;
    const category = (source?.category as "stable" | "gig" | "product") ?? "gig";
    incomeByCategory[category] = (incomeByCategory[category] ?? 0) + row.amount;
  }

  const totalIncome = income.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenseRows.reduce((sum, r) => sum + r.amount, 0);
  const totalGifts = expenseRows.filter((r) => r.is_gift).reduce((sum, r) => sum + r.amount, 0);

  const categoryTotals = new Map<string, number>();
  for (const row of expenseRows) {
    const category = row.expense_categories as unknown as { name?: string } | null;
    const name = category?.name ?? "Other";
    categoryTotals.set(name, (categoryTotals.get(name) ?? 0) + row.amount);
  }
  const topCategories = Array.from(categoryTotals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  const currency = income[0]?.currency ?? expenseRows[0]?.currency ?? "GHS";

  const alerts: { message: string; direction: "above" | "below" }[] = [];
  for (const threshold of thresholds ?? []) {
    let actual = 0;
    if (threshold.metric === "total_spend") actual = totalExpenses;
    else if (threshold.metric === "total_income") actual = totalIncome;
    else if (threshold.metric === "category_spend") {
      actual = expenseRows
        .filter((r) => r.category_id === threshold.category_id)
        .reduce((sum, r) => sum + r.amount, 0);
    }

    const crossed =
      threshold.direction === "above"
        ? actual > threshold.threshold_amount
        : actual < threshold.threshold_amount;

    if (crossed) {
      alerts.push({
        message: `${threshold.metric.replace("_", " ")} is ${threshold.direction} ${threshold.threshold_amount} (currently ${actual.toFixed(2)})`,
        direction: threshold.direction,
      });
    }
  }

  return {
    currency,
    totalIncome,
    incomeByCategory,
    totalExpenses,
    totalGifts,
    topCategories,
    net: totalIncome - totalExpenses,
    balances: balances ?? [],
    alerts,
  };
}
