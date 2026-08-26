"use client";

import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { MoreVertical, Repeat } from "lucide-react";
import { markBillPaid, deleteBill } from "@/app/(app)/expenses/actions";
import { formatMoney, formatDate, toISODate } from "@/lib/format";
import { withDataSlot } from "@/lib/utils";
import type { Bill, Account } from "@/lib/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  overdue: "Overdue",
  partially_paid: "Partially paid",
};

export function BillCard({
  bill,
  outstanding,
  paidToDate,
  payments,
  accounts,
}: {
  bill: Bill;
  outstanding: number;
  paidToDate: number;
  payments: { id: string; amount: number; date: string }[];
  accounts: Account[];
}) {
  const [pending, startTransition] = useTransition();
  const [payOpen, setPayOpen] = useState(false);

  const isOverdue = bill.status !== "paid" && bill.due_date < toISODate(new Date());
  const displayStatus = isOverdue && bill.status === "pending" ? "overdue" : bill.status;

  // Recurring bills roll their due_date forward and reset to "pending"
  // immediately after being paid, so status alone can't show "already paid
  // this cycle" — check the payment history directly instead.
  const now = new Date();
  const latestPayment = payments.reduce<{ id: string; amount: number; date: string } | null>(
    (latest, p) => (!latest || p.date > latest.date ? p : latest),
    null
  );
  const paidThisCycle =
    bill.is_recurring &&
    !!latestPayment &&
    (bill.recurrence === "yearly"
      ? new Date(latestPayment.date).getFullYear() === now.getFullYear()
      : new Date(latestPayment.date).getFullYear() === now.getFullYear() &&
        new Date(latestPayment.date).getMonth() === now.getMonth());

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("amount"));
    const accountId = String(formData.get("account_id"));

    startTransition(async () => {
      try {
        await markBillPaid(bill.id, accountId, amount);
        toast.success("Payment recorded");
        setPayOpen(false);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteBill(bill.id);
        toast.success("Bill removed");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <>
      <Card>
        <CardContent className="space-y-2 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{bill.payee}</p>
                {bill.is_recurring && (
                  <Badge variant="secondary" className="gap-1">
                    <Repeat className="size-3" />
                    {bill.recurrence}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {paidThisCycle
                  ? `Paid ${formatDate(latestPayment!.date)} · next due ${formatDate(bill.due_date)}`
                  : `Due ${formatDate(bill.due_date)}`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Badge
                variant={
                  displayStatus === "paid" || paidThisCycle
                    ? "success"
                    : displayStatus === "overdue"
                      ? "destructive"
                      : "info"
                }
              >
                {paidThisCycle
                  ? bill.recurrence === "yearly"
                    ? `Paid for ${now.getFullYear()}`
                    : "Paid this month"
                  : STATUS_LABEL[displayStatus]}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={withDataSlot(
                    <Button variant="ghost" size="icon" aria-label="Bill actions">
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
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">{formatMoney(bill.amount, bill.currency)}</p>
              {!bill.is_recurring && paidToDate > 0 && bill.status !== "paid" && (
                <p className="text-xs text-muted-foreground">
                  {formatMoney(paidToDate, bill.currency)} paid ·{" "}
                  {formatMoney(outstanding, bill.currency)} left
                </p>
              )}
            </div>
            {bill.status !== "paid" && !paidThisCycle && (
              <Button size="sm" disabled={pending} onClick={() => setPayOpen(true)}>
                Mark paid
              </Button>
            )}
          </div>
          {payments.length > 0 && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer select-none">
                Payment history ({payments.length})
              </summary>
              <div className="mt-1.5 space-y-1 pl-1">
                {payments.map((p) => (
                  <div key={p.id} className="flex justify-between">
                    <span>{formatDate(p.date)}</span>
                    <span>{formatMoney(p.amount, bill.currency)}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </CardContent>
      </Card>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bill.is_recurring ? "Mark paid" : "Record payment"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pay_amount">Amount</Label>
              <Input
                id="pay_amount"
                name="amount"
                type="number"
                step="0.01"
                max={bill.is_recurring ? undefined : outstanding}
                defaultValue={(bill.is_recurring ? bill.amount : outstanding).toFixed(2)}
                required
              />
              {!bill.is_recurring && (
                <p className="text-xs text-muted-foreground">
                  Enter less than {formatMoney(outstanding, bill.currency)} to record a partial
                  payment.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay_account">Paid from</Label>
              <Select name="account_id" defaultValue={bill.default_account_id ?? undefined} required>
                <SelectTrigger id="pay_account" className="w-full">
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
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Confirm payment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
