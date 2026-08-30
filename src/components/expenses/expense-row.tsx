"use client";

import { useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { MoreVertical } from "lucide-react";
import { deleteExpense } from "@/app/(app)/expenses/actions";
import { formatMoney, formatDate } from "@/lib/format";
import { getCategoryStyle } from "@/lib/category-style";
import type { ExpenseRow as Row } from "@/lib/data/expenses";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExpenseRow({ expense }: { expense: Row }) {
  const [pending, startTransition] = useTransition();
  const { icon: Icon, bg, fg } = getCategoryStyle(expense.categoryName ?? "");

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteExpense(expense.id);
        toast.success("Expense deleted");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  const title = expense.payee || expense.categoryName || "Expense";

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${bg}`}>
          <Icon className={`size-4 ${fg}`} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {formatDate(expense.date)}
            {expense.categoryName && expense.categoryName !== title
              ? ` · ${expense.categoryName}`
              : ""}{" "}
            · {expense.accountName}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <p className="text-sm font-semibold tabular-nums text-destructive">
          -{formatMoney(expense.amount, expense.currency)}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" aria-label="Expense actions">
                <MoreVertical className="size-4" />
              </Button>}
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive" disabled={pending} onClick={handleDelete}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
