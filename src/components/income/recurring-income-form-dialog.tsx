"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { createRecurringIncome } from "@/app/(app)/income/actions";
import { withDataSlot } from "@/lib/utils";
import { toISODate } from "@/lib/format";
import type { Account, IncomeSource } from "@/lib/supabase/types";
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

export function RecurringIncomeFormDialog({
  trigger,
  sources,
  accounts,
}: {
  trigger: ReactElement;
  sources: IncomeSource[];
  accounts: Account[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createRecurringIncome(formData);
        toast.success("Recurring income set up");
        setOpen(false);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  if (sources.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a client/source first (log any income against a new source) before setting up
        recurring income.
      </p>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={withDataSlot(trigger, "dialog-trigger")} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set up recurring income</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source_id">Client / source</Label>
            <Select name="source_id" required>
              <SelectTrigger id="source_id" className="w-full">
                <SelectValue>
                  {(value: string | null) =>
                    value
                      ? (sources.find((s) => s.id === value)?.name ?? "Select source")
                      : "Select source"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sources.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expected_amount">Expected amount</Label>
            <Input
              id="expected_amount"
              name="expected_amount"
              type="number"
              step="0.01"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expected_day_of_month">Expected day of month</Label>
            <Input
              id="expected_day_of_month"
              name="expected_day_of_month"
              type="number"
              min={1}
              max={31}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default_account_id">Usually received into (optional)</Label>
            <Select name="default_account_id" defaultValue="none">
              <SelectTrigger id="default_account_id" className="w-full">
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
            <Label htmlFor="start_date">Starting from</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              required
              defaultValue={toISODate(new Date())}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
