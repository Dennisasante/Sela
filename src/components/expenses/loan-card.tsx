"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreVertical } from "lucide-react";
import { logLoanRepayment, deleteLoan } from "@/app/(app)/expenses/actions";
import { formatMoney, formatDate, toISODate } from "@/lib/format";
import { withDataSlot } from "@/lib/utils";
import type { Loan, Account } from "@/lib/supabase/types";
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
  outstanding: "Outstanding",
  partially_repaid: "Partially repaid",
  repaid: "Repaid",
};

export function LoanCard({ loan, accounts }: { loan: Loan; accounts: Account[] }) {
  const [pending, startTransition] = useTransition();
  const [repayOpen, setRepayOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteLoan(loan.id);
        toast.success("Loan removed");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("loan_id", loan.id);

    startTransition(async () => {
      try {
        await logLoanRepayment(formData);
        toast.success("Repayment logged");
        setRepayOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <>
      <Card>
        <CardContent className="space-y-2 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {loan.direction === "borrowed" ? "Borrowed from" : "Lent to"} {loan.counterparty}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(loan.date)}</p>
            </div>
            <div className="flex items-center gap-1">
              <Badge
                variant={
                  loan.status === "repaid"
                    ? "success"
                    : loan.status === "partially_repaid"
                      ? "info"
                      : "outline"
                }
              >
                {STATUS_LABEL[loan.status]}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={withDataSlot(
                    <Button variant="ghost" size="icon" aria-label="Loan actions">
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
            <p className="text-lg font-semibold">{formatMoney(loan.amount, loan.currency)}</p>
            {loan.status !== "repaid" && (
              <Button size="sm" disabled={pending} onClick={() => setRepayOpen(true)}>
                Log repayment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={repayOpen} onOpenChange={setRepayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log repayment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repay_amount">Amount</Label>
              <Input id="repay_amount" name="amount" type="number" step="0.01" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repay_account">
                {loan.direction === "borrowed" ? "Paid from" : "Received into"}
              </Label>
              <Select name="account_id" required>
                <SelectTrigger id="repay_account" className="w-full">
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
              <Label htmlFor="repay_date">Date</Label>
              <Input
                id="repay_date"
                name="date"
                type="date"
                required
                defaultValue={toISODate(new Date())}
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Log repayment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
