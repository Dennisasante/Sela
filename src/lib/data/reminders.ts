import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Reminder } from "@/lib/supabase/types";

export async function getReminders(supabase: SupabaseClient<Database>): Promise<Reminder[]> {
  const { data } = await supabase
    .from("reminders")
    .select("*")
    .order("remind_at", { ascending: true });
  return data ?? [];
}
