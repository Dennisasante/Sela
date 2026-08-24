"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "sonner";
import { createSavingsGoal } from "@/app/(app)/savings/actions";
import { withDataSlot } from "@/lib/utils";
import type { Account } from "@/lib/supabase/types";
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

export function SavingsGoalFormDialog({
  trigger,
  accounts,
}: {
  trigger: ReactElement;
  accounts: Account[];
}) {
  const [open, setOpen] = useState(false);
  const [targetType, setTargetType] = useState("fixed_amount");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createSavingsGoal(formData);
        toast.success("Savings goal created");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={withDataSlot(trigger, "dialog-trigger")} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New savings goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal_name">Name</Label>
            <Input id="goal_name" name="name" required placeholder="e.g. Achieve investment" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_account_id">Target account (optional)</Label>
            <Select name="target_account_id" defaultValue="none">
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
          <div className="space-y-2">
            <Label htmlFor="target_type">Target type</Label>
            <Select
              name="target_type"
              value={targetType}
              onValueChange={(value) => value && setTargetType(value)}
            >
              <SelectTrigger id="target_type" className="w-full">
                <SelectValue>
                  {(value: string | null) =>
                    value === "percentage_of_income" ? "% of monthly income" : "Fixed monthly amount"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed_amount">Fixed monthly amount</SelectItem>
                <SelectItem value="percentage_of_income">% of monthly income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_value">
              {targetType === "percentage_of_income" ? "Percentage" : "Amount"}
            </Label>
            <Input
              id="target_value"
              name="target_value"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal_notes">Notes (optional)</Label>
            <Input id="goal_notes" name="notes" />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Save goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
