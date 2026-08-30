"use client";

import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { MoreVertical } from "lucide-react";
import {
  deleteBill,
  markBillPaid,
  toggleSubscriptionActive,
} from "@/app/(app)/expenses/actions";
import { formatMoney, formatDate, toISODate } from "@/lib/format";
import type { SubscriptionRow } from "@/lib/data/subscriptions";
import type { Account, ExpenseCategory } from "@/lib/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubscriptionFormDialog } from "@/components/subscriptions/subscription-form-dialog";

const RECURRENCE_LABEL: Record<string, string> = {
  weekly: "week",
  monthly: "month",
  quarterly: "quarter",
  yearly: "year",
};

export function SubscriptionCard({
  row,
  categories,
  accounts,
}: {
  row: SubscriptionRow;
  categories: ExpenseCategory[];
  accounts: Account[];
}) {
  const { bill } = row;
  const [pending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  function handleMarkPaid() {
    startTransition(async () => {
      try {
        await markBillPaid(bill.id, bill.default_account_id ?? undefined, bill.amount);
        toast.success(`${bill.payee} marked as paid`);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleToggleActive() {
    startTransition(async () => {
      try {
        await toggleSubscriptionActive(bill.id, !bill.is_active);
        toast.success(bill.is_active ? "Subscription cancelled" : "Subscription reactivated");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteBill(bill.id);
        toast.success("Subscription removed");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  const overdue = bill.is_active && bill.status !== "paid" && bill.due_date < toISODate(new Date());

  return (
    <>
      <Card>
        <CardContent className="space-y-2 py-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">{bill.payee}</p>
              {row.categoryName && (
                <p className="text-xs text-muted-foreground">{row.categoryName}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {!bill.is_active ? (
                <Badge variant="secondary">Cancelled</Badge>
              ) : overdue ? (
                <Badge variant="destructive">Overdue</Badge>
              ) : (
                <Badge variant="success">Active</Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon" aria-label="Subscription actions">
                      <MoreVertical className="size-4" />
                    </Button>}
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem disabled={pending} onClick={handleToggleActive}>
                    {bill.is_active ? "Cancel subscription" : "Reactivate"}
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" disabled={pending} onClick={handleDelete}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">
              {formatMoney(bill.amount, bill.currency)}
              <span className="text-xs font-normal text-muted-foreground">
                /{RECURRENCE_LABEL[bill.recurrence ?? "monthly"]}
              </span>
            </span>
            {bill.is_active && (
              <span className="text-xs text-muted-foreground">
                Next billing {formatDate(bill.due_date)}
              </span>
            )}
          </div>

          {bill.is_active && (
            <Button size="sm" variant="outline" className="w-full" disabled={pending} onClick={handleMarkPaid}>
              Mark this cycle paid
            </Button>
          )}
        </CardContent>
      </Card>

      <SubscriptionFormDialog
        categories={categories}
        accounts={accounts}
        subscription={bill}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
