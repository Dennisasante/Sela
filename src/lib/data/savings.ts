import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, GoalKind } from "@/lib/supabase/types";
import { currentMonthRange } from "@/lib/format";

export type SavingsRuleContribution = {
  id: string;
  date: string;
  sourceName: string;
  amount: number;
};

export type SavingsRuleProgress = {
  id: string;
  name: string;
  percentage: number;
  baseType: string;
  baseAmount: number;
  setAsideAmount: number;
  currency: string;
  contributions: SavingsRuleContribution[];
};

export async function getSavingsRulesProgress(
  supabase: SupabaseClient<Database>
): Promise<SavingsRuleProgress[]> {
  const { start, end } = currentMonthRange();

  const [{ data: rules }, { data: entries }] = await Promise.all([
    supabase.from("savings_rules").select("*").eq("is_active", true).order("created_at"),
    supabase
      .from("income_entries")
      .select(
        "id, date, amount, currency, source_id, include_in_tax_base, income_sources(name, category)"
      )
      .gte("date", start)
      .lte("date", end)
      .eq("include_in_tax_base", true),
  ]);

  const rows = entries ?? [];
  const currency = rows[0]?.currency ?? "GHS";

  return (rules ?? []).map((rule) => {
    let matching: typeof rows = [];

    if (rule.base_type === "all_income") {
      matching = rows;
    } else if (rule.base_type === "stable_only" || rule.base_type === "gig_only") {
      const wanted = rule.base_type === "stable_only" ? "stable" : "gig";
      matching = rows.filter((r) => {
        const source = r.income_sources as unknown as { category?: string } | null;
        return source?.category === wanted;
      });
    } else if (rule.base_type === "custom") {
      const ids = new Set(rule.custom_source_ids ?? []);
      matching = rows.filter((r) => r.source_id && ids.has(r.source_id));
    }

    const baseAmount = matching.reduce((sum, r) => sum + r.amount, 0);
    const contributions: SavingsRuleContribution[] = matching.map((r) => {
      const source = r.income_sources as unknown as { name?: string } | null;
      return {
        id: r.id,
        date: r.date,
        sourceName: source?.name ?? "Income",
        amount: r.amount,
      };
    });

    return {
      id: rule.id,
      name: rule.name,
      percentage: rule.percentage,
      baseType: rule.base_type,
      baseAmount,
      setAsideAmount: (rule.percentage / 100) * baseAmount,
      currency,
      contributions,
    };
  });
}

export type GoalDisplayStatus =
  | "just_started"
  | "on_track"
  | "behind"
  | "completed"
  | "paused"
  | "cancelled";

export type SavingsGoalProgress = {
  id: string;
  name: string;
  description: string | null;
  targetAccountId: string | null;
  targetAccountName: string | null;
  targetAmount: number;
  currentAmount: number;
  remaining: number;
  progressPct: number;
  targetDate: string | null;
  daysRemaining: number | null;
  priority: "low" | "medium" | "high";
  category: string | null;
  status: "active" | "paused" | "cancelled";
  displayStatus: GoalDisplayStatus;
  suggestedContribution: { amount: number; period: "day" | "week" | "month" } | null;
  shortfallEstimate: number | null;
  currency: string;
  kind: GoalKind;
  isRecurring: boolean;
  cycleStartedAt: string;
};

export async function getSavingsGoalsProgress(
  supabase: SupabaseClient<Database>,
  kind?: GoalKind
): Promise<SavingsGoalProgress[]> {
  let query = supabase.from("savings_goals").select("*, accounts(name)").order("created_at");
  if (kind) query = query.eq("kind", kind);

  const [{ data: goals }, { data: contributions }] = await Promise.all([
    query,
    supabase.from("transfers").select("goal_id, amount, date").not("goal_id", "is", null),
  ]);

  const contributionsByGoal = new Map<string, { amount: number; date: string }[]>();
  for (const c of contributions ?? []) {
    if (!c.goal_id) continue;
    const list = contributionsByGoal.get(c.goal_id) ?? [];
    list.push({ amount: c.amount, date: c.date });
    contributionsByGoal.set(c.goal_id, list);
  }

  const today = new Date();

  return (goals ?? []).map((goal) => {
    const account = goal.accounts as unknown as { name?: string } | null;
    const cycleStart = goal.cycle_started_at ? goal.cycle_started_at.slice(0, 10) : "";
    const currentAmount = (contributionsByGoal.get(goal.id) ?? [])
      .filter((c) => c.date >= cycleStart)
      .reduce((sum, c) => sum + c.amount, 0);
    const targetAmount = goal.target_amount;
    const remaining = Math.max(0, targetAmount - currentAmount);
    const progressPct = targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 0;

    const daysRemaining = goal.target_date
      ? Math.ceil(
          (new Date(goal.target_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

    const completed = targetAmount > 0 && currentAmount >= targetAmount;

    let displayStatus: GoalDisplayStatus;
    let suggestedContribution: SavingsGoalProgress["suggestedContribution"] = null;
    let shortfallEstimate: number | null = null;

    if (goal.status === "paused") displayStatus = "paused";
    else if (goal.status === "cancelled") displayStatus = "cancelled";
    else if (completed) displayStatus = "completed";
    else if (currentAmount <= 0) displayStatus = "just_started";
    else {
      const daysSinceCreated = Math.max(
        1,
        Math.floor((today.getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24))
      );
      const dailyRate = currentAmount / daysSinceCreated;

      if (daysRemaining !== null && daysRemaining > 0) {
        const projected = currentAmount + dailyRate * daysRemaining;
        if (projected >= targetAmount * 0.98) {
          displayStatus = "on_track";
        } else {
          displayStatus = "behind";
          shortfallEstimate = Math.round((targetAmount - projected) * 100) / 100;
        }
      } else {
        displayStatus = daysRemaining !== null && daysRemaining <= 0 ? "behind" : "on_track";
      }
    }

    if (
      (displayStatus === "on_track" || displayStatus === "behind" || displayStatus === "just_started") &&
      daysRemaining !== null &&
      daysRemaining > 0
    ) {
      if (daysRemaining > 60) {
        suggestedContribution = { amount: (remaining / daysRemaining) * 30, period: "month" };
      } else if (daysRemaining >= 14) {
        suggestedContribution = { amount: (remaining / daysRemaining) * 7, period: "week" };
      } else {
        suggestedContribution = { amount: remaining / daysRemaining, period: "day" };
      }
    }

    return {
      id: goal.id,
      name: goal.name,
      description: goal.notes,
      targetAccountId: goal.target_account_id,
      targetAccountName: account?.name ?? null,
      targetAmount,
      currentAmount,
      remaining,
      progressPct,
      targetDate: goal.target_date,
      daysRemaining,
      priority: goal.priority as "low" | "medium" | "high",
      category: goal.category,
      kind: goal.kind,
      isRecurring: goal.is_recurring,
      cycleStartedAt: goal.cycle_started_at,
      status: goal.status as "active" | "paused" | "cancelled",
      displayStatus,
      suggestedContribution,
      shortfallEstimate,
      currency: "GHS",
    };
  });
}
