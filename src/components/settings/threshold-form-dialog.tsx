"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "sonner";
import { createThreshold } from "@/app/(app)/settings/actions";
import { withDataSlot } from "@/lib/utils";
import type { ExpenseCategory } from "@/lib/supabase/types";
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

const METRIC_LABELS: Record<string, string> = {
  total_spend: "Total spend",
  total_income: "Total income",
  category_spend: "Category spend",
};

export function ThresholdFormDialog({
  trigger,
  categories,
}: {
  trigger: ReactElement;
  categories: ExpenseCategory[];
}) {
  const [open, setOpen] = useState(false);
  const [metric, setMetric] = useState("total_spend");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createThreshold(formData);
        toast.success("Alert created");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={withDataSlot(trigger, "dialog-trigger")} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New alert</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metric">Metric</Label>
            <Select name="metric" value={metric} onValueChange={(v) => v && setMetric(v)}>
              <SelectTrigger id="metric" className="w-full">
                <SelectValue>
                  {(value: string | null) => (value ? METRIC_LABELS[value] : "Total spend")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(METRIC_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {metric === "category_spend" && (
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select name="category_id" required>
                <SelectTrigger id="category_id" className="w-full">
                  <SelectValue>
                    {(value: string | null) =>
                      value
                        ? (categories.find((c) => c.id === value)?.name ?? "Select category")
                        : "Select category"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="direction">Alert when</Label>
            <Select name="direction" defaultValue="above" required>
              <SelectTrigger id="direction" className="w-full">
                <SelectValue>
                  {(value: string | null) => (value === "below" ? "Below" : "Above")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Above</SelectItem>
                <SelectItem value="below">Below</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="threshold_amount">Amount</Label>
            <Input
              id="threshold_amount"
              name="threshold_amount"
              type="number"
              step="0.01"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Save alert"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
