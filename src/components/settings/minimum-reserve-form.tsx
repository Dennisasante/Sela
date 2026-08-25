"use client";

import { useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { updateMinimumReserve } from "@/app/(app)/settings/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function MinimumReserveForm({ minimumReserve }: { minimumReserve: number }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateMinimumReserve(formData);
        toast.success("Minimum reserve updated");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label htmlFor="minimum_reserve">Minimum reserve</Label>
      <p className="text-xs text-muted-foreground">
        A cushion Sela keeps out of your &quot;Safe to spend&quot; number, so you always have
        this much set aside no matter what.
      </p>
      <div className="flex gap-2">
        <Input
          id="minimum_reserve"
          name="minimum_reserve"
          type="number"
          step="0.01"
          min="0"
          defaultValue={minimumReserve || ""}
          placeholder="0.00"
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
