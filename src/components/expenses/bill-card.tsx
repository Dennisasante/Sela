"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreVertical, Repeat } from "lucide-react";
import { markBillPaid, deleteBill } from "@/app/(app)/expenses/actions";
import { formatMoney, formatDate, toISODate } from "@/lib/format";
import { withDataSlot } from "@/lib/utils";
import type { Bill, Account } from "@/lib/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";

export function BillCard({ bill, accounts }: { bill: Bill; accounts: Account[] }) {
  const [pending, startTransition] = useTransition();
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const isOverdue = bill.status === "pending" && bill.due_date < toISODate(new Date());

  function handleMarkPaid(accountId?: string) {
    startTransition(async () => {
      try {
        await markBillPaid(bill.id, accountId);
        toast.success("Bill marked paid");
        setAccountPickerOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handlePayClick() {
    if (bill.default_account_id) {
      handleMarkPaid();
    } else {
      setAccountPickerOpen(true);
    }
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteBill(bill.id);
        toast.success("Bill removed");
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
                Due {formatDate(bill.due_date)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Badge
                variant={
                  bill.status === "paid"
                    ? "success"
                    : isOverdue
                      ? "destructive"
                      : "info"
                }
                className="capitalize"
              >
                {bill.status === "pending" && isOverdue ? "Overdue" : bill.status}
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
            <p className="text-lg font-semibold">{formatMoney(bill.amount, bill.currency)}</p>
            {bill.status !== "paid" && (
              <Button size="sm" disabled={pending} onClick={handlePayClick}>
                Mark paid
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={accountPickerOpen} onOpenChange={setAccountPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay from which account?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pay_account">Account</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
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
            <Button
              className="w-full"
              disabled={!selectedAccount || pending}
              onClick={() => handleMarkPaid(selectedAccount ?? undefined)}
            >
              Confirm payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
