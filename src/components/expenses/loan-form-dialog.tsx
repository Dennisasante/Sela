"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { createLoan } from "@/app/(app)/expenses/actions";
import { withDataSlot } from "@/lib/utils";
import { toISODate } from "@/lib/format";
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

export function LoanFormDialog({
  trigger,
  accounts,
}: {
  trigger: ReactElement;
  accounts: Account[];
}) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState("borrowed");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createLoan(formData);
        toast.success("Loan logged");
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
          <DialogTitle>Log a loan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="direction">Direction</Label>
            <Select
              name="direction"
              value={direction}
              onValueChange={(value) => value && setDirection(value)}
              required
            >
              <SelectTrigger id="direction" className="w-full">
                <SelectValue>
                  {(value: string | null) =>
                    value === "lent" ? "I lent money" : "I borrowed money"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="borrowed">I borrowed money</SelectItem>
                <SelectItem value="lent">I lent money</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="counterparty">With</Label>
            <Input id="counterparty" name="counterparty" required placeholder="Who?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" step="0.01" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loan_account">
              {direction === "borrowed" ? "Received into" : "Paid from"}
            </Label>
            <Select
              name="account_id"
              required
              defaultValue={accounts.length === 1 ? accounts[0].id : undefined}
            >
              <SelectTrigger id="loan_account" className="w-full">
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
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={toISODate(new Date())}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input id="notes" name="notes" />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Save loan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
