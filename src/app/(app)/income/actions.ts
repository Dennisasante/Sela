"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteIncomeEntry(entryId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("income_entries").delete().eq("id", entryId);
  if (error) throw new Error(error.message);
  revalidatePath("/income");
  revalidatePath("/");
}
