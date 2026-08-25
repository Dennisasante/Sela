import { createClient } from "@/lib/supabase/server";
import { getReminders } from "@/lib/data/reminders";
import { ReminderCard } from "@/components/reminders/reminder-card";
import { ReminderFormDialog } from "@/components/reminders/reminder-form-dialog";
import { Button } from "@/components/ui/button";
import { Plus, BellRing } from "lucide-react";

export default async function RemindersPage() {
  const supabase = await createClient();
  const reminders = await getReminders(supabase);
  const active = reminders.filter((r) => r.is_active);
  const inactive = reminders.filter((r) => !r.is_active);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Reminders</h1>
          <p className="text-sm text-muted-foreground">
            Anything you don&apos;t want to forget — not tied to a bill or income.
          </p>
        </div>
        <ReminderFormDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Add
            </Button>
          }
        />
      </div>

      {reminders.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted">
            <BellRing className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No reminders yet</p>
          <p className="max-w-[24rem] text-xs text-muted-foreground">
            Set a one-off or repeating reminder for anything — a renewal, a follow-up, a
            deadline — and Sela will notify you.
          </p>
          <ReminderFormDialog
            trigger={
              <Button size="sm" className="mt-1">
                <Plus className="size-4" />
                Create reminder
              </Button>
            }
          />
        </div>
      )}

      <div className="space-y-2">
        {active.map((reminder) => (
          <ReminderCard key={reminder.id} reminder={reminder} />
        ))}
      </div>

      {inactive.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Turned off</p>
          {inactive.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>
      )}
    </div>
  );
}
