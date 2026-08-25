import { createClient } from "@/lib/supabase/server";
import { getBudgetProgress } from "@/lib/data/budgets";
import { formatMoney } from "@/lib/format";
import { BudgetCard } from "@/components/budgets/budget-card";
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Plus } from "lucide-react";

export default async function BudgetsPage() {
  const supabase = await createClient();

  const [budgets, { data: categories }] = await Promise.all([
    getBudgetProgress(supabase),
    supabase.from("expense_categories").select("*").order("name"),
  ]);

  const budgetedCategoryIds = new Set(budgets.map((b) => b.categoryId));
  const availableCategories = (categories ?? []).filter(
    (c) => !budgetedCategoryIds.has(c.id)
  );

  const totalLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPct = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  const currency = budgets[0]?.currency ?? "GHS";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Budgets</h1>
        {availableCategories.length > 0 && (
          <BudgetFormDialog
            categories={availableCategories}
            trigger={
              <Button size="sm">
                <Plus className="size-4" />
                Add
              </Button>
            }
          />
        )}
      </div>

      {budgets.length > 0 && (
        <Card className="overflow-hidden border-none bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <p className="text-sm text-primary-foreground/80">Total budget</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatMoney(totalLimit, currency)}
              </p>
              <p className="mt-3 text-sm text-primary-foreground/80">
                {formatMoney(totalSpent, currency)} spent this month
              </p>
            </div>
            <CircularProgress value={Math.min(100, overallPct)} size={84}>
              <span className="text-lg font-semibold">{Math.round(overallPct)}%</span>
              <span className="text-[10px] text-primary-foreground/80">spent</span>
            </CircularProgress>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {budgets.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No budgets yet — set a monthly limit per category to track your spending.
          </p>
        )}
        {budgets.map((budget) => (
          <BudgetCard key={budget.budgetId} budget={budget} categories={categories ?? []} />
        ))}
      </div>
    </div>
  );
}
