"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { createBill } from "@/app/(app)/expenses/actions";
import { withDataSlot } from "@/lib/utils";
import { toISODate } from "@/lib/format";
import type { Account, ExpenseCategory } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

export function BillFormDialog({
  trigger,
  categories,
  accounts,
}: {
  trigger: ReactElement;
  categories: ExpenseCategory[];
  accounts: Account[];
}) {
  const [open, setOpen] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createBill(formData);
        toast.success("Bill added");
        setOpen(false);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={withDataSlot(trigger, "dialog-trigger")} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add bill</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payee">Payee</Label>
            <Input id="payee" name="payee" required placeholder="e.g. MTN Data, Hosting" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" step="0.01" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Due date</Label>
            <Input
              id="due_date"
              name="due_date"
              type="date"
              required
              defaultValue={toISODate(new Date())}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="is_recurring" className="font-normal">
              Recurring bill
            </Label>
            <Switch
              id="is_recurring"
              name="is_recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
          </div>
          {isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="recurrence">Recurs</Label>
              <Select name="recurrence" defaultValue="monthly" required={isRecurring}>
                <SelectTrigger id="recurrence" className="w-full">
                  <SelectValue>
                    {(value: string | null) =>
                      value === "yearly" ? "Yearly" : "Monthly"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="category_id">Category (optional)</Label>
            <Select name="category_id" defaultValue="none">
              <SelectTrigger id="category_id" className="w-full">
                <SelectValue>
                  {(value: string | null) =>
                    value && value !== "none"
                      ? (categories.find((c) => c.id === value)?.name ?? "None")
                      : "None"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="default_account_id">Default account (optional)</Label>
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
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Save bill"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
