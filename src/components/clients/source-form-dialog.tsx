"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { createIncomeSource, updateIncomeSource } from "@/app/(app)/settings/actions";
import { withDataSlot } from "@/lib/utils";
import type { IncomeSource } from "@/lib/supabase/types";
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

const CATEGORY_LABEL: Record<string, string> = {
  stable: "Stable",
  gig: "Gig",
  product: "Product",
};

export function SourceFormDialog({
  trigger,
  source,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  trigger?: ReactElement;
  source?: IncomeSource;
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
        if (source) {
          await updateIncomeSource(source.id, formData);
        } else {
          await createIncomeSource(formData);
        }
        toast.success(source ? "Client updated" : "Client added");
        setOpen(false);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={withDataSlot(trigger, "dialog-trigger")} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{source ? "Edit client / source" : "Add a client / income source"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source_name">Name</Label>
            <Input
              id="source_name"
              name="name"
              required
              defaultValue={source?.name}
              placeholder="e.g. ABC Company"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source_category">Category</Label>
            <Select name="category" defaultValue={source?.category ?? "stable"} required>
              <SelectTrigger id="source_category" className="w-full">
                <SelectValue>
                  {(value: string | null) => (value ? CATEGORY_LABEL[value] : "Stable")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="gig">Gig</SelectItem>
                <SelectItem value="product">Product</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="company">Company (optional)</Label>
              <Input id="company" name="company" defaultValue={source?.company ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" defaultValue={source?.phone ?? ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" name="email" type="email" defaultValue={source?.email ?? ""} />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="is_recurring"
              name="is_recurring"
              type="checkbox"
              className="size-4"
              defaultChecked={source?.is_recurring}
            />
            <Label htmlFor="is_recurring" className="font-normal">
              This is a recurring client/source (e.g. monthly retainer)
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : source ? "Save changes" : "Add source"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
