import { createClient } from "@/lib/supabase/server";
import {
  getDailyTrend,
  getExpenseCategoryBreakdown,
  getIncomeBySourceBreakdown,
} from "@/lib/data/reports";
import { monthRangeForOffset, formatMoney } from "@/lib/format";
import { MonthNav } from "@/components/reports/month-nav";
import { TrendChart } from "@/components/reports/trend-chart";
import { CategoryPieChart } from "@/components/reports/category-pie-chart";
import { SourceBarChart } from "@/components/reports/source-bar-chart";
import { Card, CardContent } from "@/components/ui/card";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const monthOffset = month ? parseInt(month, 10) || 0 : 0;
  const { start, end, label } = monthRangeForOffset(monthOffset);

  const supabase = await createClient();

  const [trend, categoryBreakdown, sourceBreakdown] = await Promise.all([
    getDailyTrend(supabase, start, end),
    getExpenseCategoryBreakdown(supabase, start, end),
    getIncomeBySourceBreakdown(supabase, start, end),
  ]);

  const totalIncome = trend.reduce((sum, p) => sum + p.income, 0);
  const totalExpense = trend.reduce((sum, p) => sum + p.expense, 0);
  const currency = "GHS";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reports</h1>
      <MonthNav monthOffset={monthOffset} monthLabel={label} />

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="mt-1 text-lg font-semibold text-primary">
              {formatMoney(totalIncome, currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="mt-1 text-lg font-semibold text-destructive">
              {formatMoney(totalExpense, currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-4">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Daily trend</h2>
          <TrendChart data={trend} currency={currency} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            Expenses by category
          </h2>
          <CategoryPieChart data={categoryBreakdown} currency={currency} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Income by source</h2>
          <SourceBarChart data={sourceBreakdown} currency={currency} />
        </CardContent>
      </Card>
    </div>
  );
}
