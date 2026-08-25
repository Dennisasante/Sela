"use client";

import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { Plus, X } from "lucide-react";
import {
  createMilestone,
  deleteMilestone,
  markMilestonePaid,
} from "@/app/(app)/income/actions";
import { formatMoney, formatDate, toISODate } from "@/lib/format";
import type { ProjectMilestone } from "@/lib/supabase/types";
import type { Account } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function MilestoneList({
  projectId,
  milestones,
  accounts,
}: {
  projectId: string;
  milestones: ProjectMilestone[];
  accounts: Account[];
}) {
  const [pending, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);
  const [payingMilestone, setPayingMilestone] = useState<ProjectMilestone | null>(null);

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("project_id", projectId);

    startTransition(async () => {
      try {
        await createMilestone(formData);
        toast.success("Milestone added");
        setAddOpen(false);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteMilestone(id);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handlePay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (payingMilestone) formData.set("milestone_id", payingMilestone.id);

    startTransition(async () => {
      try {
        await markMilestonePaid(formData);
        toast.success("Payment recorded");
        setPayingMilestone(null);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Payment schedule</p>
        <Button size="xs" variant="outline" onClick={() => setAddOpen(true)}>
          <Plus className="size-3" />
          Milestone
        </Button>
      </div>
      {milestones.length === 0 && (
        <p className="text-xs text-muted-foreground">No milestones set up.</p>
      )}
      {milestones.map((m) => (
        <div key={m.id} className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-2">
          <div>
            <p className="text-sm">{m.label}</p>
            {m.due_date && (
              <p className="text-xs text-muted-foreground">Due {formatDate(m.due_date)}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{formatMoney(m.amount, m.currency)}</span>
            {m.status === "paid" ? (
              <Badge variant="success">Paid</Badge>
            ) : (
              <>
                <Button size="xs" disabled={pending} onClick={() => setPayingMilestone(m)}>
                  Mark paid
                </Button>
                <button
                  type="button"
                  aria-label="Remove milestone"
                  disabled={pending}
                  onClick={() => handleDelete(m.id)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-foreground/10"
                >
                  <X className="size-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add milestone</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ms_label">Label</Label>
              <Input id="ms_label" name="label" required placeholder="e.g. Deposit, Final" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ms_amount">Amount</Label>
              <Input id="ms_amount" name="amount" type="number" step="0.01" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ms_due">Due date (optional)</Label>
              <Input id="ms_due" name="due_date" type="date" />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Add milestone"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!payingMilestone} onOpenChange={(o) => !o && setPayingMilestone(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record milestone payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePay} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ms_pay_amount">Amount received</Label>
              <Input
                id="ms_pay_amount"
                name="amount"
                type="number"
                step="0.01"
                required
                defaultValue={payingMilestone?.amount.toFixed(2)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ms_pay_account">Received into</Label>
              <Select name="account_id" required>
                <SelectTrigger id="ms_pay_account" className="w-full">
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
              <Label htmlFor="ms_pay_date">Date</Label>
              <Input
                id="ms_pay_date"
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
    </div>
  );
}
