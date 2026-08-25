"use client";

import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { MoreVertical, TrendingUp } from "lucide-react";
import { deleteBudget } from "@/app/(app)/budgets/actions";
import { getCategoryStyle } from "@/lib/category-style";
import { formatMoney, formatDate } from "@/lib/format";
import { withDataSlot } from "@/lib/utils";
import type { BudgetProgress, BudgetStatus } from "@/lib/data/budgets";
import type { ExpenseCategory } from "@/lib/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog";

const STATUS_LABEL: Record<BudgetStatus, string> = {
  not_started: "Not started",
  on_track: "On track",
  near_limit: "Near limit",
  over_budget: "Over budget",
};

const STATUS_VARIANT: Record<BudgetStatus, "secondary" | "success" | "info" | "destructive"> = {
  not_started: "secondary",
  on_track: "success",
  near_limit: "info",
  over_budget: "destructive",
};

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
  const overBudget = budget.status === "over_budget";
  const projectedOver = !overBudget && budget.projected > budget.monthlyLimit;

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteBudget(budget.budgetId);
        toast.success("Budget removed");
      } catch (err) {
        toast.error(getErrorMessage(err));
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
          <div className="flex items-center gap-1">
            <Badge variant={STATUS_VARIANT[budget.status]}>{STATUS_LABEL[budget.status]}</Badge>
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

        <div className="flex items-center justify-between text-xs">
          <span className={overBudget ? "font-medium text-destructive" : "text-muted-foreground"}>
            {overBudget
              ? `${formatMoney(Math.abs(budget.variance), budget.currency)} over budget`
              : `${formatMoney(budget.variance, budget.currency)} left`}
          </span>
          {projectedOver && (
            <span className="flex items-center gap-1 font-medium text-destructive">
              <TrendingUp className="size-3.5" />
              Projected {formatMoney(budget.projected, budget.currency)}
            </span>
          )}
        </div>

        {budget.transactions.length > 0 && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer select-none">
              What makes up this {formatMoney(budget.spent, budget.currency)}? (
              {budget.transactions.length})
            </summary>
            <div className="mt-1.5 space-y-1 pl-1">
              {budget.transactions.map((t) => (
                <div key={t.id} className="flex justify-between gap-2">
                  <span className="truncate">
                    {formatDate(t.date)} {t.payee ? `· ${t.payee}` : t.description ? `· ${t.description}` : ""}
                  </span>
                  <span className="shrink-0">{formatMoney(t.amount, budget.currency)}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
