import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Bill } from "@/lib/supabase/types";
import { toISODate } from "@/lib/format";

const MONTHLY_MULTIPLIER: Record<string, number> = {
  weekly: 52 / 12,
  monthly: 1,
  quarterly: 1 / 3,
  yearly: 1 / 12,
};

export type SubscriptionRow = {
  bill: Bill;
  categoryName: string | null;
  accountName: string | null;
  monthlyEquivalent: number;
};

export type SubscriptionSummary = {
  monthlyCost: number;
  annualCost: number;
  upcomingThisMonth: number;
};

export async function getSubscriptions(
  supabase: SupabaseClient<Database>
): Promise<{ subscriptions: SubscriptionRow[]; summary: SubscriptionSummary }> {
  const { data: bills } = await supabase
    .from("bills")
    .select("*, expense_categories(name), accounts(name)")
    .eq("is_subscription", true)
    .order("due_date");

  const today = toISODate(new Date());
  const monthEnd = toISODate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

  let monthlyCost = 0;
  let upcomingThisMonth = 0;

  const subscriptions: SubscriptionRow[] = (bills ?? []).map((row) => {
    const category = row.expense_categories as unknown as { name?: string } | null;
    const account = row.accounts as unknown as { name?: string } | null;
    const multiplier = MONTHLY_MULTIPLIER[row.recurrence ?? "monthly"] ?? 1;
    const monthlyEquivalent = row.amount * multiplier;

    if (row.is_active) {
      monthlyCost += monthlyEquivalent;
      if (row.due_date >= today && row.due_date <= monthEnd) {
        upcomingThisMonth += row.amount;
      }
    }

    return {
      bill: row as Bill,
      categoryName: category?.name ?? null,
      accountName: account?.name ?? null,
      monthlyEquivalent,
    };
  });

  return {
    subscriptions,
    summary: {
      monthlyCost,
      annualCost: monthlyCost * 12,
      upcomingThisMonth,
    },
  };
}
