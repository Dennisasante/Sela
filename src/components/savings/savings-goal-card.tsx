"use client";

import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { MoreVertical } from "lucide-react";
import {
  deleteSavingsGoal,
  updateGoalStatus,
  logGoalContribution,
  restartSinkingFundCycle,
} from "@/app/(app)/savings/actions";
import { Repeat } from "lucide-react";
import { formatMoney, formatDate, toISODate } from "@/lib/format";
import type { SavingsGoalProgress } from "@/lib/data/savings";
import type { Account } from "@/lib/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SavingsGoalFormDialog } from "@/components/savings/savings-goal-form-dialog";

const STATUS_LABEL: Record<string, string> = {
  just_started: "Just started",
  on_track: "On track",
  behind: "Behind",
  completed: "Completed",
  paused: "Paused",
  cancelled: "Cancelled",
};

const STATUS_VARIANT: Record<string, "secondary" | "success" | "info" | "destructive"> = {
  just_started: "secondary",
  on_track: "success",
  behind: "info",
  completed: "success",
  paused: "secondary",
  cancelled: "secondary",
};

const PERIOD_LABEL: Record<string, string> = { day: "day", week: "week", month: "month" };

export function SavingsGoalCard({
  goal,
  accounts,
}: {
  goal: SavingsGoalProgress;
  accounts: Account[];
}) {
  const [pending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteSavingsGoal(goal.id);
        toast.success("Goal removed");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleStatus(status: "active" | "paused" | "cancelled") {
    startTransition(async () => {
      try {
        await updateGoalStatus(goal.id, status);
        toast.success(
          status === "paused" ? "Goal paused" : status === "active" ? "Goal resumed" : "Goal cancelled"
        );
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleRestartCycle() {
    startTransition(async () => {
      try {
        await restartSinkingFundCycle(goal.id);
        toast.success("Cycle restarted for next time");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleContribute(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await logGoalContribution(formData);
        toast.success("Contribution logged");
        setContributeOpen(false);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <>
      <Card>
        <CardContent className="space-y-3 py-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{goal.name}</p>
                {goal.priority === "high" && (
                  <Badge variant="destructive" className="text-[10px]">
                    High priority
                  </Badge>
                )}
              </div>
              {goal.category && (
                <p className="text-xs text-muted-foreground">{goal.category}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Badge variant={STATUS_VARIANT[goal.displayStatus]}>
                {STATUS_LABEL[goal.displayStatus]}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon" aria-label="Goal actions">
                      <MoreVertical className="size-4" />
                    </Button>}
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
                  {goal.kind === "sinking_fund" && (
                    <DropdownMenuItem disabled={pending} onClick={handleRestartCycle}>
                      <Repeat className="size-4" />
                      Mark paid &amp; restart
                    </DropdownMenuItem>
                  )}
                  {goal.status === "active" && (
                    <DropdownMenuItem disabled={pending} onClick={() => handleStatus("paused")}>
                      Pause goal
                    </DropdownMenuItem>
                  )}
                  {goal.status === "paused" && (
                    <DropdownMenuItem disabled={pending} onClick={() => handleStatus("active")}>
                      Resume goal
                    </DropdownMenuItem>
                  )}
                  {goal.status !== "cancelled" && (
                    <DropdownMenuItem disabled={pending} onClick={() => handleStatus("cancelled")}>
                      Cancel goal
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem variant="destructive" disabled={pending} onClick={handleDelete}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                goal.displayStatus === "behind" ? "bg-info" : "bg-primary"
              }`}
              style={{ width: `${goal.progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="tabular-nums">
              {formatMoney(goal.currentAmount, goal.currency)} of{" "}
              {formatMoney(goal.targetAmount, goal.currency)}
            </span>
            <span className="font-medium tabular-nums text-foreground">
              {Math.round(goal.progressPct)}%
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="tabular-nums">
              {formatMoney(goal.remaining, goal.currency)} remaining
              {goal.targetDate &&
                ` · ${goal.kind === "sinking_fund" ? "Due" : "Target"} ${formatDate(goal.targetDate)}`}
              {goal.kind === "sinking_fund" && goal.isRecurring && " · Recurs yearly"}
            </span>
          </div>

          {goal.suggestedContribution && goal.status === "active" && (
            <p className="text-xs text-muted-foreground">
              Suggested: {formatMoney(goal.suggestedContribution.amount, goal.currency)}/
              {PERIOD_LABEL[goal.suggestedContribution.period]}
            </p>
          )}

          {goal.displayStatus === "behind" && goal.shortfallEstimate && goal.shortfallEstimate > 0 && (
            <p className="rounded-md bg-info/10 p-2 text-xs text-info">
              At your current pace, you may fall short of this goal by about{" "}
              {formatMoney(goal.shortfallEstimate, goal.currency)}. Consider increasing your
              contribution or adjusting the target date.
            </p>
          )}

          {goal.status === "active" && (
            <Button size="sm" variant="outline" className="w-full" onClick={() => setContributeOpen(true)}>
              Add money
            </Button>
          )}
        </CardContent>
      </Card>

      <SavingsGoalFormDialog
        accounts={accounts}
        goal={goal}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <Dialog open={contributeOpen} onOpenChange={setContributeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add money to {goal.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleContribute} className="space-y-4">
            <input type="hidden" name="goal_id" value={goal.id} />
            <div className="space-y-2">
              <Label htmlFor="from_account_id">From</Label>
              <Select
                name="from_account_id"
                required
                defaultValue={accounts.length === 1 ? accounts[0].id : undefined}
              >
                <SelectTrigger id="from_account_id" className="w-full">
                  <SelectValue>
                    {(value: string | null) =>
                      value ? (accounts.find((a) => a.id === value)?.name ?? value) : "Select account"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="to_account_id">To</Label>
              <Select name="to_account_id" defaultValue={goal.targetAccountId ?? undefined} required>
                <SelectTrigger id="to_account_id" className="w-full">
                  <SelectValue>
                    {(value: string | null) =>
                      value ? (accounts.find((a) => a.id === value)?.name ?? value) : "Select account"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                defaultValue={
                  goal.suggestedContribution ? goal.suggestedContribution.amount.toFixed(2) : undefined
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required defaultValue={toISODate(new Date())} />
            </div>
            <input type="hidden" name="description" value={`Contribution: ${goal.name}`} />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Add money"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
