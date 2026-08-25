import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendPushToUser } from "@/lib/push";
import { toISODate } from "@/lib/format";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const today = toISODate(new Date());
  const soon = toISODate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));

  const { data: bills, error } = await supabase
    .from("bills")
    .select("*")
    .neq("status", "paid")
    .lte("due_date", soon);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byUser = new Map<string, typeof bills>();
  for (const bill of bills ?? []) {
    const list = byUser.get(bill.user_id) ?? [];
    list.push(bill);
    byUser.set(bill.user_id, list);
  }

  let sent = 0;
  for (const [userId, userBills] of byUser) {
    const overdue = userBills.filter((b) => b.due_date < today);
    const dueSoon = userBills.filter((b) => b.due_date >= today);

    const parts: string[] = [];
    if (overdue.length > 0) parts.push(`${overdue.length} overdue`);
    if (dueSoon.length > 0) parts.push(`${dueSoon.length} due soon`);

    await sendPushToUser(supabase, userId, {
      title: "Bills need attention",
      body: `You have ${parts.join(" and ")}: ${userBills.map((b) => b.payee).join(", ")}.`,
      url: "/expenses?tab=bills",
    });
    sent += 1;
  }

  const remindersSent = await fireDueReminders(supabase);

  return NextResponse.json({ ok: true, usersNotified: sent, remindersSent });
}

// Vercel Hobby cron only allows daily-frequency jobs, so standalone reminders
// (which have no dedicated cron slot) piggyback on this once-a-day run rather
// than firing at the exact time the user picked.
async function fireDueReminders(supabase: ReturnType<typeof createServiceClient>) {
  const now = new Date().toISOString();

  const { data: due } = await supabase
    .from("reminders")
    .select("*")
    .eq("is_active", true)
    .lte("remind_at", now);

  let remindersSent = 0;
  for (const reminder of due ?? []) {
    await sendPushToUser(supabase, reminder.user_id, {
      title: reminder.title,
      body: reminder.notes ?? "Reminder from Sela",
      url: "/reminders",
    });
    remindersSent += 1;

    const nextRemindAt = nextOccurrence(reminder.remind_at, reminder.repeat);
    await supabase
      .from("reminders")
      .update({
        last_fired_at: now,
        remind_at: nextRemindAt ?? reminder.remind_at,
        is_active: nextRemindAt !== null,
      })
      .eq("id", reminder.id);
  }

  return remindersSent;
}

function nextOccurrence(remindAt: string, repeat: string): string | null {
  if (repeat === "none") return null;
  const d = new Date(remindAt);
  const now = new Date();
  do {
    if (repeat === "daily") d.setDate(d.getDate() + 1);
    else if (repeat === "weekly") d.setDate(d.getDate() + 7);
    else if (repeat === "monthly") d.setMonth(d.getMonth() + 1);
    else if (repeat === "yearly") d.setFullYear(d.getFullYear() + 1);
    else return null;
  } while (d.getTime() <= now.getTime());
  return d.toISOString();
}
