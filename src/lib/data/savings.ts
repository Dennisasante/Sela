import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { currentMonthRange } from "@/lib/format";

export type SavingsRuleProgress = {
  id: string;
  name: string;
  percentage: number;
  baseType: string;
  baseAmount: number;
  setAsideAmount: number;
  currency: string;
};

export async function getSavingsRulesProgress(
  supabase: SupabaseClient<Database>
): Promise<SavingsRuleProgress[]> {
  const { start, end } = currentMonthRange();

  const [{ data: rules }, { data: entries }] = await Promise.all([
    supabase.from("savings_rules").select("*").eq("is_active", true).order("created_at"),
    supabase
      .from("income_entries")
      .select("amount, currency, source_id, include_in_tax_base, income_sources(category)")
      .gte("date", start)
      .lte("date", end)
      .eq("include_in_tax_base", true),
  ]);

  const rows = entries ?? [];
  const currency = rows[0]?.currency ?? "GHS";

  return (rules ?? []).map((rule) => {
    let baseAmount = 0;

    if (rule.base_type === "all_income") {
      baseAmount = rows.reduce((sum, r) => sum + r.amount, 0);
    } else if (rule.base_type === "stable_only" || rule.base_type === "gig_only") {
      const wanted = rule.base_type === "stable_only" ? "stable" : "gig";
      baseAmount = rows
        .filter((r) => {
          const source = r.income_sources as unknown as { category?: string } | null;
          return source?.category === wanted;
        })
        .reduce((sum, r) => sum + r.amount, 0);
    } else if (rule.base_type === "custom") {
      const ids = new Set(rule.custom_source_ids ?? []);
      baseAmount = rows
        .filter((r) => r.source_id && ids.has(r.source_id))
        .reduce((sum, r) => sum + r.amount, 0);
    }

    return {
      id: rule.id,
      name: rule.name,
      percentage: rule.percentage,
      baseType: rule.base_type,
      baseAmount,
      setAsideAmount: (rule.percentage / 100) * baseAmount,
      currency,
    };
  });
}

export type SavingsGoalProgress = {
  id: string;
  name: string;
  targetType: string;
  targetValue: number;
  targetAccountId: string | null;
  targetAccountName: string | null;
  targetAmount: number;
  actualAmount: number;
  currency: string;
};

export async function getSavingsGoalsProgress(
  supabase: SupabaseClient<Database>
): Promise<SavingsGoalProgress[]> {
  const { start, end } = currentMonthRange();

  const [{ data: goals }, { data: incomeRows }, { data: transfers }] = await Promise.all([
    supabase.from("savings_goals").select("*, accounts(name)").order("created_at"),
    supabase.from("income_entries").select("amount").gte("date", start).lte("date", end),
    supabase
      .from("transfers")
      .select("amount, to_account_id")
      .gte("date", start)
      .lte("date", end)
      .not("to_account_id", "is", null),
  ]);

  const totalIncome = (incomeRows ?? []).reduce((sum, r) => sum + r.amount, 0);
  const transferByAccount = new Map<string, number>();
  for (const t of transfers ?? []) {
    if (!t.to_account_id) continue;
    transferByAccount.set(t.to_account_id, (transferByAccount.get(t.to_account_id) ?? 0) + t.amount);
  }

  return (goals ?? []).map((goal) => {
    const account = goal.accounts as unknown as { name?: string } | null;
    const targetAmount =
      goal.target_type === "percentage_of_income"
        ? (goal.target_value / 100) * totalIncome
        : goal.target_value;
    const actualAmount = goal.target_account_id
      ? (transferByAccount.get(goal.target_account_id) ?? 0)
      : 0;

    return {
      id: goal.id,
      name: goal.name,
      targetType: goal.target_type,
      targetValue: goal.target_value,
      targetAccountId: goal.target_account_id,
      targetAccountName: account?.name ?? null,
      targetAmount,
      actualAmount,
      currency: "GHS",
    };
  });
}
