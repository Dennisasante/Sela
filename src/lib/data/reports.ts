import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type DailyTrendPoint = {
  date: string;
  day: number;
  income: number;
  expense: number;
};

export type BreakdownSlice = {
  name: string;
  amount: number;
};

export async function getDailyTrend(
  supabase: SupabaseClient<Database>,
  start: string,
  end: string
): Promise<DailyTrendPoint[]> {
  const [{ data: incomeRows }, { data: expenseRows }] = await Promise.all([
    supabase.from("income_entries").select("amount, date").gte("date", start).lte("date", end),
    supabase.from("expenses").select("amount, date").gte("date", start).lte("date", end),
  ]);

  const daysInMonth = new Date(
    Number(start.slice(0, 4)),
    Number(start.slice(5, 7)),
    0
  ).getDate();

  const points: DailyTrendPoint[] = Array.from({ length: daysInMonth }, (_, i) => ({
    date: `${start.slice(0, 8)}${String(i + 1).padStart(2, "0")}`,
    day: i + 1,
    income: 0,
    expense: 0,
  }));

  for (const row of incomeRows ?? []) {
    const day = Number(row.date.slice(8, 10));
    if (points[day - 1]) points[day - 1].income += row.amount;
  }
  for (const row of expenseRows ?? []) {
    const day = Number(row.date.slice(8, 10));
    if (points[day - 1]) points[day - 1].expense += row.amount;
  }

  return points;
}

export async function getExpenseCategoryBreakdown(
  supabase: SupabaseClient<Database>,
  start: string,
  end: string
): Promise<BreakdownSlice[]> {
  const { data } = await supabase
    .from("expenses")
    .select("amount, expense_categories(name)")
    .gte("date", start)
    .lte("date", end);

  const totals = new Map<string, number>();
  for (const row of data ?? []) {
    const category = row.expense_categories as unknown as { name?: string } | null;
    const name = category?.name ?? "Other";
    totals.set(name, (totals.get(name) ?? 0) + row.amount);
  }

  return Array.from(totals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getIncomeBySourceBreakdown(
  supabase: SupabaseClient<Database>,
  start: string,
  end: string
): Promise<BreakdownSlice[]> {
  const { data } = await supabase
    .from("income_entries")
    .select("amount, income_sources(name)")
    .gte("date", start)
    .lte("date", end);

  const totals = new Map<string, number>();
  for (const row of data ?? []) {
    const source = row.income_sources as unknown as { name?: string } | null;
    const name = source?.name ?? "One-off";
    totals.set(name, (totals.get(name) ?? 0) + row.amount);
  }

  return Array.from(totals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
}
