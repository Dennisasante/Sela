"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { createSavingsGoal, updateSavingsGoal } from "@/app/(app)/savings/actions";
import type { Account } from "@/lib/supabase/types";
import type { SavingsGoalProgress } from "@/lib/data/savings";
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
  DialogTrigger,
} from "@/components/ui/dialog";

const PRIORITY_LABEL: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function SavingsGoalFormDialog({
  trigger,
  accounts,
  goal,
  kind = "goal",
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  trigger?: ReactElement;
  accounts: Account[];
  goal?: SavingsGoalProgress;
  kind?: "goal" | "sinking_fund";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isSinkingFund = (goal?.kind ?? kind) === "sinking_fund";
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        if (goal) {
          await updateSavingsGoal(goal.id, formData);
          toast.success("Goal updated");
        } else {
          await createSavingsGoal(formData);
          toast.success("Goal created");
        }
        setOpen(false);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {goal
              ? isSinkingFund
                ? "Edit sinking fund"
                : "Edit goal"
              : isSinkingFund
                ? "New sinking fund"
                : "New goal"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="kind" value={isSinkingFund ? "sinking_fund" : "goal"} />
          <div className="space-y-2">
            <Label htmlFor="goal_name">Name</Label>
            <Input
              id="goal_name"
              name="name"
              required
              defaultValue={goal?.name}
              placeholder={
                isSinkingFund
                  ? "e.g. Insurance renewal, Christmas"
                  : "e.g. Emergency Fund, Laptop, Rent"
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal_description">Description (optional)</Label>
            <Input id="goal_description" name="description" defaultValue={goal?.description ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="target_amount">Target amount</Label>
              <Input
                id="target_amount"
                name="target_amount"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={goal?.targetAmount}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_date">
                {isSinkingFund ? "Due date" : "Target date (optional)"}
              </Label>
              <Input
                id="target_date"
                name="target_date"
                type="date"
                defaultValue={goal?.targetDate ?? ""}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue={goal?.priority ?? "medium"}>
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue>
                    {(value: string) => PRIORITY_LABEL[value] ?? "Medium"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                name="category"
                defaultValue={goal?.category ?? ""}
                placeholder="e.g. Travel"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_account_id">Target account (optional)</Label>
            <Select name="target_account_id" defaultValue={goal?.targetAccountId ?? "none"}>
              <SelectTrigger id="target_account_id" className="w-full">
                <SelectValue>
                  {(value: string | null) =>
                    value && value !== "none"
                      ? (accounts.find((a) => a.id === value)?.name ?? "None")
                      : "None"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isSinkingFund && (
            <div className="flex items-center gap-2">
              <input
                id="is_recurring"
                name="is_recurring"
                type="checkbox"
                className="size-4"
                defaultChecked={goal?.isRecurring}
              />
              <Label htmlFor="is_recurring" className="font-normal">
                Recurs every year (e.g. insurance, Christmas)
              </Label>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending
              ? "Saving…"
              : goal
                ? "Save changes"
                : isSinkingFund
                  ? "Create sinking fund"
                  : "Create goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
