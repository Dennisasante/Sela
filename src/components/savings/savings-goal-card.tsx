"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { MoreVertical } from "lucide-react";
import { deleteSavingsGoal } from "@/app/(app)/savings/actions";
import { formatMoney } from "@/lib/format";
import { withDataSlot } from "@/lib/utils";
import type { SavingsGoalProgress } from "@/lib/data/savings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SavingsGoalCard({ goal }: { goal: SavingsGoalProgress }) {
  const [pending, startTransition] = useTransition();
  const pct = goal.targetAmount > 0 ? Math.min(100, (goal.actualAmount / goal.targetAmount) * 100) : 0;

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteSavingsGoal(goal.id);
        toast.success("Goal removed");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{goal.name}</p>
            {goal.targetAccountName && (
              <p className="text-xs text-muted-foreground">→ {goal.targetAccountName}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={withDataSlot(
                <Button variant="ghost" size="icon" aria-label="Goal actions">
                  <MoreVertical className="size-4" />
                </Button>,
                "dropdown-menu-trigger"
              )}
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem variant="destructive" disabled={pending} onClick={handleDelete}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {formatMoney(goal.actualAmount, goal.currency)} of{" "}
            {formatMoney(goal.targetAmount, goal.currency)}
          </span>
          <span className="font-medium text-foreground">{Math.round(pct)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
