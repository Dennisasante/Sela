"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { createSubscription, updateSubscription } from "@/app/(app)/expenses/actions";
import { withDataSlot } from "@/lib/utils";
import { toISODate } from "@/lib/format";
import type { Account, ExpenseCategory, Bill } from "@/lib/supabase/types";
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

const RECURRENCE_LABEL: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export function SubscriptionFormDialog({
  trigger,
  categories,
  accounts,
  subscription,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  trigger?: ReactElement;
  categories: ExpenseCategory[];
  accounts: Account[];
  subscription?: Bill;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        if (subscription) {
          await updateSubscription(subscription.id, formData);
          toast.success("Subscription updated");
        } else {
          await createSubscription(formData);
          toast.success("Subscription added");
        }
        setOpen(false);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={withDataSlot(trigger, "dialog-trigger")} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{subscription ? "Edit subscription" : "Add subscription"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sub_name">Name</Label>
            <Input
              id="sub_name"
              name="name"
              required
              defaultValue={subscription?.payee}
              placeholder="e.g. Netflix, Hosting"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="provider">Provider (optional)</Label>
            <Input id="provider" name="provider" defaultValue={subscription?.provider ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                defaultValue={subscription?.amount}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recurrence">Billing frequency</Label>
              <Select name="recurrence" defaultValue={subscription?.recurrence ?? "monthly"} required>
                <SelectTrigger id="recurrence" className="w-full">
                  <SelectValue>
                    {(value: string | null) => RECURRENCE_LABEL[value ?? "monthly"] ?? "Monthly"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="next_billing_date">Next billing date</Label>
            <Input
              id="next_billing_date"
              name="next_billing_date"
              type="date"
              required
              defaultValue={subscription?.due_date ?? toISODate(new Date())}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category_id">Category (optional)</Label>
            <Select name="category_id" defaultValue={subscription?.category_id ?? "none"}>
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
            <Label htmlFor="default_account_id">Account (optional)</Label>
            <Select name="default_account_id" defaultValue={subscription?.default_account_id ?? "none"}>
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
            {pending ? "Saving…" : subscription ? "Save changes" : "Add subscription"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
