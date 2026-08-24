"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreVertical } from "lucide-react";
import { deleteSavingsRule, logSetAsideTransfer } from "@/app/(app)/savings/actions";
import { formatMoney, toISODate } from "@/lib/format";
import { withDataSlot } from "@/lib/utils";
import type { SavingsRuleProgress } from "@/lib/data/savings";
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

const BASE_LABELS: Record<string, string> = {
  all_income: "All income",
  stable_only: "Stable income only",
  gig_only: "Gig income only",
  custom: "Custom selection",
};

export function SavingsRuleCard({
  rule,
  accounts,
}: {
  rule: SavingsRuleProgress;
  accounts: Account[];
}) {
  const [pending, startTransition] = useTransition();
  const [transferOpen, setTransferOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteSavingsRule(rule.id);
        toast.success("Rule removed");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await logSetAsideTransfer(formData);
        toast.success("Logged as a transfer");
        setTransferOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <>
      <Card>
        <CardContent className="space-y-3 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{rule.name}</p>
              <Badge variant="secondary" className="mt-1">
                {rule.percentage}% · {BASE_LABELS[rule.baseType]}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={withDataSlot(
                  <Button variant="ghost" size="icon" aria-label="Rule actions">
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
          <div className="flex items-center justify-between rounded-md bg-muted/60 p-3">
            <div>
              <p className="text-xs text-muted-foreground">Set aside this month</p>
              <p className="text-lg font-semibold text-primary">
                {formatMoney(rule.setAsideAmount, rule.currency)}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setTransferOpen(true)}>
              Log as transfer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log set-aside as a transfer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from_account_id">From</Label>
              <Select name="from_account_id" required>
                <SelectTrigger id="from_account_id" className="w-full">
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
              <Label htmlFor="to_account_id">To</Label>
              <Select name="to_account_id" required>
                <SelectTrigger id="to_account_id" className="w-full">
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
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                defaultValue={rule.setAsideAmount.toFixed(2)}
              />
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
            <input type="hidden" name="description" value={`Set-aside: ${rule.name}`} />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Log transfer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
