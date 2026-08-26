"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { createProject } from "@/app/(app)/income/actions";
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

export function ProjectFormDialog({
  trigger,
  sources,
}: {
  trigger: ReactElement;
  sources: IncomeSource[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createProject(formData);
        toast.success("Project created");
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
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proj_title">Title</Label>
            <Input id="proj_title" name="title" required placeholder="e.g. Corporate Website" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proj_source">Client (optional)</Label>
            <Select name="source_id" defaultValue="none">
              <SelectTrigger id="proj_source" className="w-full">
                <SelectValue>
                  {(value: string | null) =>
                    value && value !== "none"
                      ? (sources.find((s) => s.id === value)?.name ?? "None")
                      : "None"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {sources.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="proj_amount">Agreed amount</Label>
            <Input id="proj_amount" name="total_amount" type="number" step="0.01" min="0.01" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="proj_start">Start date</Label>
              <Input id="proj_start" name="started_at" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proj_due">Due date</Label>
              <Input id="proj_due" name="due_at" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="proj_description">Description (optional)</Label>
            <Input id="proj_description" name="description" />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Create project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
