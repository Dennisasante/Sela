import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { currentMonthRange, monthRangeForOffset } from "@/lib/format";
import { getBudgetProgress } from "@/lib/data/budgets";
import { getSavingsGoalsProgress } from "@/lib/data/savings";

export type HealthFactor = {
  key: string;
  label: string;
  value: string;
  detail: string;
  status: "good" | "watch" | "attention" | "neutral";
};

export async function getFinancialHealth(supabase: SupabaseClient<Database>) {
  const { start, end } = currentMonthRange();
  const { start: lastStart, end: lastEnd } = monthRangeForOffset(-1);

  const [
    { data: incomeRows },
    { data: expenseRows },
    { data: lastMonthExpenseRows },
    { data: loans },
    { data: loanTx },
    budgets,
    goals,
    { data: goalContributions },
  ] = await Promise.all([
    supabase
      .from("income_entries")
      .select("amount, source_id, income_sources(category)")
      .gte("date", start)
      .lte("date", end),
    supabase.from("expenses").select("amount").gte("date", start).lte("date", end),
    supabase.from("expenses").select("amount").gte("date", lastStart).lte("date", lastEnd),
    supabase.from("loans").select("*").eq("direction", "borrowed"),
    supabase.from("loan_transactions").select("loan_id, type, amount"),
    getBudgetProgress(supabase),
    getSavingsGoalsProgress(supabase),
    supabase
      .from("transfers")
      .select("amount")
      .not("goal_id", "is", null)
      .gte("date", start)
      .lte("date", end),
  ]);

  const totalIncome = (incomeRows ?? []).reduce((sum, r) => sum + r.amount, 0);
  const stableIncome = (incomeRows ?? [])
    .filter((r) => {
      const source = r.income_sources as unknown as { category?: string } | null;
      return source?.category === "stable";
    })
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = (expenseRows ?? []).reduce((sum, r) => sum + r.amount, 0);
  const lastMonthExpenses = (lastMonthExpenseRows ?? []).reduce((sum, r) => sum + r.amount, 0);
  const savingsThisMonth = (goalContributions ?? []).reduce((sum, r) => sum + r.amount, 0);

  const repaidByLoan = new Map<string, number>();
  for (const tx of loanTx ?? []) {
    if (tx.type !== "repayment") continue;
    repaidByLoan.set(tx.loan_id, (repaidByLoan.get(tx.loan_id) ?? 0) + tx.amount);
  }
  const totalDebt = (loans ?? []).reduce(
    (sum, loan) => sum + Math.max(0, loan.amount - (repaidByLoan.get(loan.id) ?? 0)),
    0
  );

  const factors: HealthFactor[] = [];

  // Savings rate
  const savingsRate = totalIncome > 0 ? (savingsThisMonth / totalIncome) * 100 : null;
  factors.push({
    key: "savings_rate",
    label: "Savings rate",
    value: savingsRate !== null ? `${Math.round(savingsRate)}%` : "—",
    detail:
      totalIncome > 0
        ? `You put aside ${savingsThisMonth.toFixed(2)} of ${totalIncome.toFixed(2)} income this month.`
        : "No income recorded yet this month to calculate this from.",
    status: savingsRate === null ? "neutral" : savingsRate >= 15 ? "good" : savingsRate >= 5 ? "watch" : "attention",
  });

  // Budget adherence
  const healthyBudgets = budgets.filter((b) => b.status === "on_track" || b.status === "not_started");
  factors.push({
    key: "budget_adherence",
    label: "Budget adherence",
    value: budgets.length > 0 ? `${healthyBudgets.length} of ${budgets.length}` : "—",
    detail:
      budgets.length > 0
        ? `${healthyBudgets.length} of your ${budgets.length} budget${budgets.length === 1 ? "" : "s"} ${budgets.length === 1 ? "is" : "are"} within limit this month.`
        : "You haven't set up any budgets yet.",
    status:
      budgets.length === 0
        ? "neutral"
        : healthyBudgets.length === budgets.length
          ? "good"
          : healthyBudgets.length >= budgets.length / 2
            ? "watch"
            : "attention",
  });

  // Income stability
  const stablePct = totalIncome > 0 ? (stableIncome / totalIncome) * 100 : null;
  factors.push({
    key: "income_stability",
    label: "Income stability",
    value: stablePct !== null ? `${Math.round(stablePct)}% stable` : "—",
    detail:
      totalIncome > 0
        ? `${Math.round(stablePct ?? 0)}% of this month's income came from stable sources rather than one-off gigs.`
        : "No income recorded yet this month.",
    status: stablePct === null ? "neutral" : stablePct >= 60 ? "good" : stablePct >= 30 ? "watch" : "attention",
  });

  // Debt
  factors.push({
    key: "debt",
    label: "Debt",
    value: totalDebt > 0 ? totalDebt.toFixed(2) : "None",
    detail:
      totalDebt > 0
        ? `You currently owe ${totalDebt.toFixed(2)} across outstanding loans.`
        : "You have no outstanding loans right now.",
    status: totalDebt === 0 ? "good" : totalDebt < totalIncome ? "watch" : "attention",
  });

  // Spending trend
  const spendingChangePct =
    lastMonthExpenses > 0 ? ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : null;
  factors.push({
    key: "spending_trend",
    label: "Spending trend",
    value: spendingChangePct !== null ? `${spendingChangePct >= 0 ? "+" : ""}${Math.round(spendingChangePct)}%` : "—",
    detail:
      spendingChangePct !== null
        ? `Spending is ${spendingChangePct >= 0 ? "up" : "down"} ${Math.abs(Math.round(spendingChangePct))}% compared to last month.`
        : "Not enough history yet to compare month over month.",
    status:
      spendingChangePct === null ? "neutral" : spendingChangePct <= 0 ? "good" : spendingChangePct <= 15 ? "watch" : "attention",
  });

  // Emergency savings
  const emergencyGoal = goals.find((g) => /emergency/i.test(g.name) || /emergency/i.test(g.category ?? ""));
  factors.push({
    key: "emergency_savings",
    label: "Emergency savings",
    value: emergencyGoal ? `${Math.round(emergencyGoal.progressPct)}%` : "Not started",
    detail: emergencyGoal
      ? `Your ${emergencyGoal.name} goal is ${Math.round(emergencyGoal.progressPct)}% funded.`
      : "You haven't set up an emergency fund goal yet.",
    status: !emergencyGoal ? "neutral" : emergencyGoal.progressPct >= 80 ? "good" : emergencyGoal.progressPct >= 30 ? "watch" : "attention",
  });

  // Goal progress
  const activeGoals = goals.filter((g) => g.status === "active");
  const avgGoalProgress =
    activeGoals.length > 0
      ? activeGoals.reduce((sum, g) => sum + g.progressPct, 0) / activeGoals.length
      : null;
  factors.push({
    key: "goal_progress",
    label: "Goal progress",
    value: avgGoalProgress !== null ? `${Math.round(avgGoalProgress)}% avg` : "—",
    detail:
      activeGoals.length > 0
        ? `You're averaging ${Math.round(avgGoalProgress ?? 0)}% progress across ${activeGoals.length} active goal${activeGoals.length === 1 ? "" : "s"}.`
        : "You don't have any active savings goals yet.",
    status:
      avgGoalProgress === null
        ? "neutral"
        : goals.some((g) => g.displayStatus === "behind")
          ? "watch"
          : "good",
  });

  return factors;
}
