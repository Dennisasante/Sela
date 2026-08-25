"use client";

import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { MoreVertical, Bell, BellOff, Repeat } from "lucide-react";
import { deleteReminder, toggleReminderActive } from "@/app/(app)/reminders/actions";
import { withDataSlot } from "@/lib/utils";
import type { Reminder } from "@/lib/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReminderFormDialog } from "@/components/reminders/reminder-form-dialog";

const REPEAT_LABEL: Record<string, string> = {
  none: "One-time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export function ReminderCard({ reminder }: { reminder: Reminder }) {
  const [pending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const remindAt = new Date(reminder.remind_at);
  const isPast = remindAt.getTime() < Date.now() && reminder.repeat === "none";

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteReminder(reminder.id);
        toast.success("Reminder deleted");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleReminderActive(reminder.id, !reminder.is_active);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <>
      <Card>
        <CardContent className="flex items-start justify-between gap-2 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className={`font-medium ${!reminder.is_active ? "text-muted-foreground line-through" : ""}`}>
                {reminder.title}
              </p>
              {isPast && reminder.is_active && (
                <Badge variant="secondary" className="text-[10px]">
                  Past
                </Badge>
              )}
            </div>
            {reminder.notes && (
              <p className="text-xs text-muted-foreground">{reminder.notes}</p>
            )}
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              {new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              }).format(remindAt)}
              {reminder.repeat !== "none" && (
                <span className="flex items-center gap-0.5">
                  <Repeat className="size-3" />
                  {REPEAT_LABEL[reminder.repeat]}
                </span>
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={withDataSlot(
                  <Button variant="ghost" size="icon" aria-label="Reminder actions">
                    <MoreVertical className="size-4" />
                  </Button>,
                  "dropdown-menu-trigger"
                )}
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
                <DropdownMenuItem disabled={pending} onClick={handleToggle}>
                  {reminder.is_active ? (
                    <>
                      <BellOff className="size-4" />
                      Turn off
                    </>
                  ) : (
                    <>
                      <Bell className="size-4" />
                      Turn on
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" disabled={pending} onClick={handleDelete}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      <ReminderFormDialog reminder={reminder} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
