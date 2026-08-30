"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { createWishlistItem, updateWishlistItem } from "@/app/(app)/wishlist/actions";
import type { WishlistItem } from "@/lib/supabase/types";
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

const PRIORITY_LABEL: Record<string, string> = { low: "Low", medium: "Medium", high: "High" };

export function WishlistFormDialog({
  trigger,
  item,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  trigger?: ReactElement;
  item?: WishlistItem;
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
        if (item) {
          await updateWishlistItem(item.id, formData);
          toast.success("Item updated");
        } else {
          await createWishlistItem(formData);
          toast.success("Added to wishlist");
        }
        setOpen(false);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit item" : "New wishlist item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wishlist_name">Item</Label>
            <Input
              id="wishlist_name"
              name="name"
              required
              defaultValue={item?.name}
              placeholder="e.g. New laptop, Headphones"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="estimated_price">Estimated price</Label>
              <Input
                id="estimated_price"
                name="estimated_price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={item?.estimated_price}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue={item?.priority ?? "medium"}>
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue>{(value: string) => PRIORITY_LABEL[value] ?? "Medium"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Link (optional)</Label>
            <Input id="url" name="url" type="url" defaultValue={item?.url ?? ""} placeholder="https://" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input id="notes" name="notes" defaultValue={item?.notes ?? ""} />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : item ? "Save changes" : "Add to wishlist"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
