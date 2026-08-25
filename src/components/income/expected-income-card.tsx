"use client";

import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { MoreVertical } from "lucide-react";
import {
  recordOccurrenceReceived,
  skipOccurrence,
} from "@/app/(app)/income/actions";
import { formatMoney, formatDate, toISODate } from "@/lib/format";
import { withDataSlot } from "@/lib/utils";
import type { ExpectedIncomeRow } from "@/lib/data/planning";
import type { Account } from "@/lib/supabase/types";
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

const STATUS_VARIANT: Record<string, "info" | "success" | "secondary" | "destructive"> = {
  expected: "info",
  partial: "info",
  received: "success",
  skipped: "secondary",
  missed: "destructive",
};

export function ExpectedIncomeCard({
  occurrence,
  accounts,
}: {
  occurrence: ExpectedIncomeRow;
  accounts: Account[];
}) {
  const [pending, startTransition] = useTransition();
  const [receiveOpen, setReceiveOpen] = useState(false);
  const isSettled = occurrence.status === "received" || occurrence.status === "skipped";

  function handleSkip() {
    startTransition(async () => {
      try {
        await skipOccurrence(occurrence.id);
        toast.success("Marked as skipped");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("occurrence_id", occurrence.id);

    startTransition(async () => {
      try {
        await recordOccurrenceReceived(formData);
        toast.success("Income recorded");
        setReceiveOpen(false);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <>
      <Card>
        <CardContent className="flex items-center justify-between py-3.5">
          <div>
            <p className="font-medium">{occurrence.sourceName}</p>
            <p className="text-xs text-muted-foreground">
              Expected {formatDate(occurrence.expectedDate)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-semibold">
                {formatMoney(occurrence.expectedAmount, occurrence.currency)}
              </p>
              <Badge variant={STATUS_VARIANT[occurrence.status]} className="capitalize">
                {occurrence.status}
              </Badge>
            </div>
            {!isSettled && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={withDataSlot(
                    <Button variant="ghost" size="icon" aria-label="Occurrence actions">
                      <MoreVertical className="size-4" />
                    </Button>,
                    "dropdown-menu-trigger"
                  )}
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setReceiveOpen(true)}>
                    Record as received
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={pending} onClick={handleSkip}>
                    Skip this month
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record as received</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="occ_amount">Amount received</Label>
              <Input
                id="occ_amount"
                name="amount"
                type="number"
                step="0.01"
                required
                defaultValue={occurrence.expectedAmount.toFixed(2)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occ_account">Received into</Label>
              <Select name="account_id" defaultValue={occurrence.defaultAccountId ?? undefined} required>
                <SelectTrigger id="occ_account" className="w-full">
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
              <Label htmlFor="occ_date">Date received</Label>
              <Input
                id="occ_date"
                name="date"
                type="date"
                required
                defaultValue={toISODate(new Date())}
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Confirm received"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
