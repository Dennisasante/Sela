"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "sonner";
import { upsertBudget } from "@/app/(app)/budgets/actions";
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

export function BudgetFormDialog({
  trigger,
  categories,
  categoryId,
  categoryName,
  currentLimit,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  trigger?: ReactElement;
  categories: ExpenseCategory[];
  categoryId?: string;
  categoryName?: string;
  currentLimit?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await upsertBudget(formData);
        toast.success("Budget saved");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={withDataSlot(trigger, "dialog-trigger")} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{categoryId ? `Edit budget` : "Set a budget"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {categoryId ? (
            <input type="hidden" name="category_id" value={categoryId} />
          ) : (
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select name="category_id" required>
                <SelectTrigger id="category_id" className="w-full">
                  <SelectValue>
                    {(value: string | null) =>
                      value
                        ? (categories.find((c) => c.id === value)?.name ?? value)
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
          {categoryName && (
            <p className="text-sm text-muted-foreground">
              Monthly limit for <span className="font-medium text-foreground">{categoryName}</span>
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="monthly_limit">Monthly limit</Label>
            <Input
              id="monthly_limit"
              name="monthly_limit"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={currentLimit}
              required
              autoFocus={!!categoryId}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Save budget"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
