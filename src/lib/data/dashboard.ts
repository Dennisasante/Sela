import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { currentMonthRange, monthRangeForOffset, toISODate, formatMoney } from "@/lib/format";
import { getBudgetProgress } from "@/lib/data/budgets";
import { getBillsWithProgress } from "@/lib/data/expenses";
import { getSavingsGoalsProgress, getSavingsRulesProgress } from "@/lib/data/savings";

export type GuardianInsight = {
  title: string;
  message: string;
  tone: "positive" | "info" | "warning" | "protected";
  href: string;
};

export async function getDashboardData(supabase: SupabaseClient<Database>) {
  const { start, end } = currentMonthRange();
  const { start: lastStart, end: lastEnd } = monthRangeForOffset(-1);

  const [
    { data: incomeEntries },
    { data: expenses },
    { data: balances },
    { data: thresholds },
    { data: loanTx },
    payableSummary,
    budgets,
    savingsGoals,
    savingsRules,
    { data: lastMonthExpenseRows },
    {
      data: { user },
    },
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
    supabase
      .from("loan_transactions")
      .select("amount, type, loans(direction)")
      .gte("date", start)
      .lte("date", end),
    getBillsWithProgress(supabase).then((r) => r.summary),
    getBudgetProgress(supabase),
    getSavingsGoalsProgress(supabase),
    getSavingsRulesProgress(supabase),
    supabase.from("expenses").select("amount").gte("date", lastStart).lte("date", lastEnd),
    supabase.auth.getUser(),
  ]);

  const { data: goalContributionsThisMonth } = await supabase
    .from("transfers")
    .select("amount")
    .not("goal_id", "is", null)
    .gte("date", start)
    .lte("date", end);

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

  // Loan disbursements/repayments move real cash without being income or an
  // expense — fold their net cash effect in here so "change this month"
  // matches the same formula the account_balances view uses.
  let loanCashImpact = 0;
  for (const row of loanTx ?? []) {
    const loan = row.loans as unknown as { direction?: "borrowed" | "lent" } | null;
    const inflow =
      (loan?.direction === "borrowed" && row.type === "disbursement") ||
      (loan?.direction === "lent" && row.type === "repayment");
    loanCashImpact += inflow ? row.amount : -row.amount;
  }

  const availableNow = (balances ?? []).reduce((sum, a) => sum + a.balance, 0);
  // Transfers between the user's own accounts always net to zero across the
  // total, so the only things that move total balance are income, expenses,
  // and loan cash flow — this is exactly the change since the start of the month.
  const balanceChangeThisMonth = totalIncome - totalExpenses + loanCashImpact;

  const expectedThisMonth = await getExpectedRemainingThisMonth(supabase, start, end);
  const committedToPay = payableSummary.totalOwed;
  const plannedSavings = savingsRules.reduce((sum, r) => sum + r.setAsideAmount, 0);
  const minimumReserve = Number(user?.user_metadata?.minimum_reserve ?? 0) || 0;
  const safeToSpend = availableNow - committedToPay - plannedSavings - minimumReserve;

  const upcomingPaymentsThisMonth = (
    await supabase
      .from("bills")
      .select("amount")
      .neq("status", "paid")
      .gte("due_date", start)
      .lte("due_date", end)
  ).data?.reduce((sum, b) => sum + b.amount, 0) ?? 0;

  const savingsThisMonth = (goalContributionsThisMonth ?? []).reduce((sum, r) => sum + r.amount, 0);

  const budgetTotals = budgets.reduce(
    (acc, b) => {
      acc.spent += b.spent;
      acc.limit += b.monthlyLimit;
      return acc;
    },
    { spent: 0, limit: 0 }
  );
  const budgetUsagePct = budgetTotals.limit > 0 ? (budgetTotals.spent / budgetTotals.limit) * 100 : null;

  const lastMonthExpenses = (lastMonthExpenseRows ?? []).reduce((sum, r) => sum + r.amount, 0);

  const priorityRank = { high: 0, medium: 1, low: 2 } as const;
  const topGoals = savingsGoals
    .filter((g) => g.status === "active")
    .sort((a, b) => {
      const rank = priorityRank[a.priority] - priorityRank[b.priority];
      if (rank !== 0) return rank;
      if (a.targetDate && b.targetDate) return a.targetDate < b.targetDate ? -1 : 1;
      if (a.targetDate) return -1;
      if (b.targetDate) return 1;
      return 0;
    })
    .slice(0, 3);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();

  const guardianInsight = pickGuardianInsight({
    budgets,
    expectedThisMonth,
    totalExpenses,
    lastMonthExpenses,
    availableNow,
    committedToPay,
    plannedSavings,
    minimumReserve,
    daysRemaining,
    currency,
  });

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
    availableNow,
    balanceChangeThisMonth,
    expectedThisMonth,
    committedToPay,
    plannedSavings,
    minimumReserve,
    safeToSpend,
    upcomingPaymentsThisMonth,
    savingsThisMonth,
    budgetUsagePct,
    topGoals,
    guardianInsight,
  };
}

function pickGuardianInsight(ctx: {
  budgets: Awaited<ReturnType<typeof getBudgetProgress>>;
  expectedThisMonth: number;
  totalExpenses: number;
  lastMonthExpenses: number;
  availableNow: number;
  committedToPay: number;
  plannedSavings: number;
  minimumReserve: number;
  daysRemaining: number;
  currency: string;
}): GuardianInsight {
  const {
    budgets,
    expectedThisMonth,
    totalExpenses,
    lastMonthExpenses,
    availableNow,
    committedToPay,
    plannedSavings,
    minimumReserve,
    daysRemaining,
    currency,
  } = ctx;

  const overBudget = budgets.find((b) => b.status === "over_budget");
  const nearLimit = budgets.find((b) => b.status === "near_limit");

  if (overBudget) {
    return {
      title: `Keep an eye on ${overBudget.categoryName}`,
      message: `Your ${overBudget.categoryName.toLowerCase()} budget is over for this month. Slowing down there for the rest of the month can help you get back on track.`,
      tone: "warning",
      href: "/budgets",
    };
  }

  if (nearLimit) {
    const pct = Math.round((nearLimit.spent / nearLimit.monthlyLimit) * 100);
    return {
      title: `Keep an eye on ${nearLimit.categoryName}`,
      message:
        daysRemaining > 0
          ? `Your ${nearLimit.categoryName.toLowerCase()} budget is ${pct}% used with ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left this month.`
          : `Your ${nearLimit.categoryName.toLowerCase()} budget is ${pct}% used.`,
      tone: "warning",
      href: "/budgets",
    };
  }

  if (lastMonthExpenses > 0 && totalExpenses < lastMonthExpenses * 0.95) {
    const pct = Math.round((1 - totalExpenses / lastMonthExpenses) * 100);
    return {
      title: "You're doing well",
      message: `You've spent ${pct}% less this month than last month.`,
      tone: "positive",
      href: "/reports",
    };
  }

  if (expectedThisMonth > 0) {
    return {
      title: "Money coming in",
      message: `You have ${formatMoney(expectedThisMonth, currency)} expected this month.`,
      tone: "info",
      href: "/income?tab=expected",
    };
  }

  const shortfall = committedToPay + plannedSavings + minimumReserve - availableNow;
  if (shortfall > 0) {
    return {
      title: "Watch your upcoming commitments",
      message: `You may need another ${formatMoney(shortfall, currency)} to comfortably cover everything currently planned.`,
      tone: "warning",
      href: "/",
    };
  }

  return {
    title: "You're protected",
    message: "Your current balance covers all of your known commitments this month.",
    tone: "protected",
    href: "/",
  };
}


async function getExpectedRemainingThisMonth(
  supabase: SupabaseClient<Database>,
  start: string,
  end: string
) {
  const { data } = await supabase
    .from("income_occurrences")
    .select("expected_amount, status")
    .gte("expected_date", start)
    .lte("expected_date", end)
    .in("status", ["expected", "partial"]);
  return (data ?? []).reduce((sum, r) => sum + r.expected_amount, 0);
}

export type ActivityEntry = {
  id: string;
  type: "income" | "expense";
  amount: number;
  currency: string;
  description: string;
  date: string;
  createdAt: string;
};

export async function getRecentActivity(
  supabase: SupabaseClient<Database>,
  range: "today" | "week"
): Promise<ActivityEntry[]> {
  const now = new Date();
  const startDate =
    range === "today"
      ? now
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const start = toISODate(startDate);
  const end = toISODate(now);

  const [{ data: incomeRows }, { data: expenseRows }] = await Promise.all([
    supabase
      .from("income_entries")
      .select("id, amount, currency, date, description, created_at, income_sources(name)")
      .gte("date", start)
      .lte("date", end)
      .order("created_at", { ascending: false }),
    supabase
      .from("expenses")
      .select("id, amount, currency, date, description, payee, created_at, expense_categories(name)")
      .gte("date", start)
      .lte("date", end)
      .order("created_at", { ascending: false }),
  ]);

  const incomeActivity: ActivityEntry[] = (incomeRows ?? []).map((row) => {
    const source = row.income_sources as unknown as { name?: string } | null;
    return {
      id: row.id,
      type: "income",
      amount: row.amount,
      currency: row.currency,
      description: row.description ?? source?.name ?? "Income",
      date: row.date,
      createdAt: row.created_at,
    };
  });

  const expenseActivity: ActivityEntry[] = (expenseRows ?? []).map((row) => {
    const category = row.expense_categories as unknown as { name?: string } | null;
    return {
      id: row.id,
      type: "expense",
      amount: row.amount,
      currency: row.currency,
      description: row.description ?? row.payee ?? category?.name ?? "Expense",
      date: row.date,
      createdAt: row.created_at,
    };
  });

  return [...incomeActivity, ...expenseActivity].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  );
}
