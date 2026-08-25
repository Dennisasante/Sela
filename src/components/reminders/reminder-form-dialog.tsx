"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { createReminder, updateReminder } from "@/app/(app)/reminders/actions";
import { withDataSlot } from "@/lib/utils";
import { toISODate } from "@/lib/format";
import type { Reminder } from "@/lib/supabase/types";
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

const REPEAT_LABEL: Record<string, string> = {
  none: "Doesn't repeat",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export function ReminderFormDialog({
  trigger,
  reminder,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  trigger?: ReactElement;
  reminder?: Reminder;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;
  const [pending, startTransition] = useTransition();

  const remindAt = reminder ? new Date(reminder.remind_at) : null;
  const defaultDate = remindAt ? toISODate(remindAt) : toISODate(new Date());
  const defaultTime = remindAt
    ? `${String(remindAt.getHours()).padStart(2, "0")}:${String(remindAt.getMinutes()).padStart(2, "0")}`
    : "09:00";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        if (reminder) {
          await updateReminder(reminder.id, formData);
          toast.success("Reminder updated");
        } else {
          await createReminder(formData);
          toast.success("Reminder created");
        }
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
          <DialogTitle>{reminder ? "Edit reminder" : "New reminder"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reminder_title">Title</Label>
            <Input
              id="reminder_title"
              name="title"
              required
              defaultValue={reminder?.title}
              placeholder="e.g. Renew passport, Call the landlord"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder_notes">Notes (optional)</Label>
            <Input id="reminder_notes" name="notes" defaultValue={reminder?.notes ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required defaultValue={defaultDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" name="time" type="time" required defaultValue={defaultTime} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="repeat">Repeat</Label>
            <Select name="repeat" defaultValue={reminder?.repeat ?? "none"}>
              <SelectTrigger id="repeat" className="w-full">
                <SelectValue>{(value: string) => REPEAT_LABEL[value] ?? "Doesn't repeat"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REPEAT_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : reminder ? "Save changes" : "Create reminder"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
