"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { createSavingsRule } from "@/app/(app)/savings/actions";
import { withDataSlot } from "@/lib/utils";
import type { IncomeSource } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

const BASE_LABELS: Record<string, string> = {
  all_income: "All income",
  stable_only: "Stable income only",
  gig_only: "Gig income only",
  custom: "Custom selection",
};

export function SavingsRuleFormDialog({
  trigger,
  sources,
}: {
  trigger: ReactElement;
  sources: IncomeSource[];
}) {
  const [open, setOpen] = useState(false);
  const [baseType, setBaseType] = useState("all_income");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createSavingsRule(formData);
        toast.success("Savings rule created");
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
          <DialogTitle>New savings / tax rule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="e.g. Tax set-aside" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="percentage">Percentage</Label>
            <Input
              id="percentage"
              name="percentage"
              type="number"
              step="0.1"
              min="0"
              max="100"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="base_type">Applies to</Label>
            <Select
              name="base_type"
              value={baseType}
              onValueChange={(value) => value && setBaseType(value)}
            >
              <SelectTrigger id="base_type" className="w-full">
                <SelectValue>
                  {(value: string | null) => (value ? BASE_LABELS[value] : "All income")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BASE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {baseType === "custom" && (
            <div className="space-y-2 rounded-md border p-3">
              <Label>Income sources</Label>
              {sources.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No income sources yet — add one under Income first.
                </p>
              )}
              {sources.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <Checkbox id={`src-${s.id}`} name="custom_source_ids" value={s.id} />
                  <Label htmlFor={`src-${s.id}`} className="font-normal">
                    {s.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Save rule"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
