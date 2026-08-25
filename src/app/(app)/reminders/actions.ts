"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/errors";
import type { ReminderRepeat } from "@/lib/supabase/types";

export async function createReminder(formData: FormData) {
  const supabase = await createClient();
  const date = String(formData.get("date"));
  const time = String(formData.get("time") || "09:00");

  const { error } = await supabase.from("reminders").insert({
    title: String(formData.get("title")),
    notes: (formData.get("notes") as string) || null,
    remind_at: new Date(`${date}T${time}`).toISOString(),
    repeat: String(formData.get("repeat") || "none") as ReminderRepeat,
    is_active: true,
    last_fired_at: null,
  });

  if (error) throw new Error(getErrorMessage(error));
  revalidatePath("/reminders");
}

export async function updateReminder(reminderId: string, formData: FormData) {
  const supabase = await createClient();
  const date = String(formData.get("date"));
  const time = String(formData.get("time") || "09:00");

  const { error } = await supabase
    .from("reminders")
    .update({
      title: String(formData.get("title")),
      notes: (formData.get("notes") as string) || null,
      remind_at: new Date(`${date}T${time}`).toISOString(),
      repeat: String(formData.get("repeat") || "none") as ReminderRepeat,
    })
    .eq("id", reminderId);

  if (error) throw new Error(getErrorMessage(error));
  revalidatePath("/reminders");
}

export async function toggleReminderActive(reminderId: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reminders")
    .update({ is_active: isActive })
    .eq("id", reminderId);
  if (error) throw new Error(getErrorMessage(error));
  revalidatePath("/reminders");
}

export async function deleteReminder(reminderId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("reminders").delete().eq("id", reminderId);
  if (error) throw new Error(getErrorMessage(error));
  revalidatePath("/reminders");
}
