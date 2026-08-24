import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { currentMonthRange, toISODate } from "@/lib/format";

export type AppAlert = {
  id: string;
  title: string;
  message: string;
  severity: "warning" | "danger";
  href: string;
};

export async function getActiveAlerts(
  supabase: SupabaseClient<Database>
): Promise<AppAlert[]> {
  const { start, end } = currentMonthRange();
  const today = toISODate(new Date());
  const soon = toISODate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));

  const [{ data: thresholds }, { data: expenseRows }, { data: incomeRows }, { data: bills }] =
    await Promise.all([
      supabase.from("alert_thresholds").select("*").eq("is_active", true),
      supabase.from("expenses").select("amount, category_id").gte("date", start).lte("date", end),
      supabase.from("income_entries").select("amount").gte("date", start).lte("date", end),
      supabase
        .from("bills")
        .select("*")
        .neq("status", "paid")
        .lte("due_date", soon)
        .order("due_date"),
    ]);

  const alerts: AppAlert[] = [];

  const totalExpenses = (expenseRows ?? []).reduce((sum, r) => sum + r.amount, 0);
  const totalIncome = (incomeRows ?? []).reduce((sum, r) => sum + r.amount, 0);

  for (const threshold of thresholds ?? []) {
    let actual = 0;
    if (threshold.metric === "total_spend") actual = totalExpenses;
    else if (threshold.metric === "total_income") actual = totalIncome;
    else if (threshold.metric === "category_spend") {
      actual = (expenseRows ?? [])
        .filter((r) => r.category_id === threshold.category_id)
        .reduce((sum, r) => sum + r.amount, 0);
    }

    const crossed =
      threshold.direction === "above"
        ? actual > threshold.threshold_amount
        : actual < threshold.threshold_amount;

    if (crossed) {
      alerts.push({
        id: `threshold-${threshold.id}`,
        title: "Spending threshold crossed",
        message: `${threshold.metric.replace("_", " ")} is ${threshold.direction} ${threshold.threshold_amount} this month (currently ${actual.toFixed(2)}).`,
        severity: "warning",
        href: "/settings",
      });
    }
  }

  for (const bill of bills ?? []) {
    const overdue = bill.due_date < today;
    alerts.push({
      id: `bill-${bill.id}`,
      title: overdue ? "Bill overdue" : "Bill due soon",
      message: `${bill.payee} — ${bill.amount} due ${bill.due_date}${overdue ? " (overdue)" : ""}.`,
      severity: overdue ? "danger" : "warning",
      href: "/expenses?tab=bills",
    });
  }

  return alerts;
}

export async function getActiveAlertCount(supabase: SupabaseClient<Database>) {
  const alerts = await getActiveAlerts(supabase);
  return alerts.length;
}
