import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { currentMonthRange, toISODate } from "@/lib/format";

function clampDay(year: number, month: number, day: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Math.min(day, daysInMonth);
}

/**
 * Lazily creates this month's "expected" occurrence for every active
 * recurring income that doesn't already have one. Idempotent — safe to call
 * on every page load. Never touches income_entries.
 */
export async function ensureCurrentOccurrences(supabase: SupabaseClient<Database>) {
  const { data: recurring } = await supabase
    .from("recurring_income")
    .select("*")
    .eq("status", "active");

  if (!recurring || recurring.length === 0) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const { data: existing } = await supabase
    .from("income_occurrences")
    .select("recurring_income_id")
    .gte("expected_date", toISODate(new Date(year, month, 1)))
    .lte("expected_date", toISODate(new Date(year, month + 1, 0)));

  const existingIds = new Set((existing ?? []).map((o) => o.recurring_income_id));

  const toCreate = recurring
    .filter((r) => !existingIds.has(r.id) && new Date(r.start_date) <= new Date(year, month + 1, 0))
    .map((r) => ({
      recurring_income_id: r.id,
      expected_date: toISODate(new Date(year, month, clampDay(year, month, r.expected_day_of_month))),
      expected_amount: r.expected_amount,
      currency: r.currency,
      status: "expected" as const,
    }));

  if (toCreate.length > 0) {
    await supabase.from("income_occurrences").insert(toCreate);
  }
}

export type ExpectedIncomeRow = {
  id: string;
  recurringIncomeId: string;
  sourceName: string;
  expectedDate: string;
  expectedAmount: number;
  status: string;
  receivedAmount: number | null;
  currency: string;
  defaultAccountId: string | null;
};

export async function getExpectedIncome(
  supabase: SupabaseClient<Database>
): Promise<ExpectedIncomeRow[]> {
  const { start, end } = currentMonthRange();

  const { data } = await supabase
    .from("income_occurrences")
    .select(
      "*, recurring_income(default_account_id, income_sources(name))"
    )
    .gte("expected_date", start)
    .lte("expected_date", end)
    .order("expected_date");

  return (data ?? []).map((row) => {
    const recurring = row.recurring_income as unknown as {
      default_account_id: string | null;
      income_sources: { name?: string } | null;
    } | null;
    return {
      id: row.id,
      recurringIncomeId: row.recurring_income_id,
      sourceName: recurring?.income_sources?.name ?? "Unknown",
      expectedDate: row.expected_date,
      expectedAmount: row.expected_amount,
      status: row.status,
      receivedAmount: row.received_amount,
      currency: row.currency,
      defaultAccountId: recurring?.default_account_id ?? null,
    };
  });
}
