"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreVertical } from "lucide-react";
import { deleteBudget } from "@/app/(app)/budgets/actions";
import { getCategoryStyle } from "@/lib/category-style";
import { formatMoney } from "@/lib/format";
import { withDataSlot } from "@/lib/utils";
import type { BudgetProgress } from "@/lib/data/budgets";
import type { ExpenseCategory } from "@/lib/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog";

export function BudgetCard({
  budget,
  categories,
}: {
  budget: BudgetProgress;
  categories: ExpenseCategory[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { icon: Icon, bg, fg } = getCategoryStyle(budget.categoryName);
  const pct = Math.min(100, (budget.spent / budget.monthlyLimit) * 100);
  const overBudget = budget.spent > budget.monthlyLimit;
  const remaining = budget.monthlyLimit - budget.spent;

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteBudget(budget.budgetId);
        toast.success("Budget removed");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-3 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-full ${bg}`}>
              <Icon className={`size-5 ${fg}`} />
            </div>
            <div>
              <p className="font-medium">{budget.categoryName}</p>
              <p className="text-xs text-muted-foreground">
                {formatMoney(budget.spent, budget.currency)} of{" "}
                {formatMoney(budget.monthlyLimit, budget.currency)}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={withDataSlot(
                <Button variant="ghost" size="icon" aria-label="Budget actions">
                  <MoreVertical className="size-4" />
                </Button>,
                "dropdown-menu-trigger"
              )}
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={pending}
                onClick={handleDelete}
              >
                Remove budget
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <BudgetFormDialog
          categories={categories}
          categoryId={budget.categoryId}
          categoryName={budget.categoryName}
          currentLimit={budget.monthlyLimit}
          open={editOpen}
          onOpenChange={setEditOpen}
        />

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              overBudget ? "bg-destructive" : "bg-primary"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <p
          className={`text-xs font-medium ${
            overBudget ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {overBudget
            ? `${formatMoney(Math.abs(remaining), budget.currency)} over budget`
            : `${formatMoney(remaining, budget.currency)} left`}
        </p>
      </CardContent>
    </Card>
  );
}
