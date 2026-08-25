import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type CalendarEventType = "expected_income" | "bill" | "milestone" | "goal_target";

export type CalendarEvent = {
  id: string;
  date: string;
  type: CalendarEventType;
  title: string;
  amount: number;
  currency: string;
  href: string;
};

export async function getCalendarEvents(
  supabase: SupabaseClient<Database>,
  start: string,
  end: string
): Promise<CalendarEvent[]> {
  const [{ data: occurrences }, { data: bills }, { data: milestones }, { data: goals }] =
    await Promise.all([
      supabase
        .from("income_occurrences")
        .select("id, expected_date, expected_amount, currency, status, recurring_income(income_sources(name))")
        .gte("expected_date", start)
        .lte("expected_date", end)
        .in("status", ["expected", "partial"]),
      supabase
        .from("bills")
        .select("id, due_date, amount, currency, payee, status")
        .neq("status", "paid")
        .gte("due_date", start)
        .lte("due_date", end),
      supabase
        .from("project_milestones")
        .select("id, due_date, amount, currency, label, status, projects(title)")
        .eq("status", "pending")
        .not("due_date", "is", null)
        .gte("due_date", start)
        .lte("due_date", end),
      supabase
        .from("savings_goals")
        .select("id, name, target_amount, target_date, status")
        .eq("status", "active")
        .not("target_date", "is", null)
        .gte("target_date", start)
        .lte("target_date", end),
    ]);

  const events: CalendarEvent[] = [];

  for (const o of occurrences ?? []) {
    const recurring = o.recurring_income as unknown as {
      income_sources: { name?: string } | null;
    } | null;
    events.push({
      id: `income-${o.id}`,
      date: o.expected_date,
      type: "expected_income",
      title: `${recurring?.income_sources?.name ?? "Income"} expected`,
      amount: o.expected_amount,
      currency: o.currency,
      href: "/income?tab=expected",
    });
  }

  for (const b of bills ?? []) {
    events.push({
      id: `bill-${b.id}`,
      date: b.due_date,
      type: "bill",
      title: `${b.payee} due`,
      amount: b.amount,
      currency: b.currency,
      href: "/expenses?tab=bills",
    });
  }

  for (const m of milestones ?? []) {
    const project = m.projects as unknown as { title?: string } | null;
    events.push({
      id: `milestone-${m.id}`,
      date: m.due_date as string,
      type: "milestone",
      title: `${project?.title ?? "Project"}: ${m.label}`,
      amount: m.amount,
      currency: m.currency,
      href: "/income?tab=projects",
    });
  }

  for (const g of goals ?? []) {
    events.push({
      id: `goal-${g.id}`,
      date: g.target_date as string,
      type: "goal_target",
      title: `${g.name} target date`,
      amount: g.target_amount,
      currency: "GHS",
      href: "/savings",
    });
  }

  return events.sort((a, b) => (a.date < b.date ? -1 : 1));
}
