"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function upsertBudget(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("category_budgets").upsert(
    {
      category_id: String(formData.get("category_id")),
      monthly_limit: Number(formData.get("monthly_limit")),
      currency: "GHS",
    },
    { onConflict: "user_id,category_id" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/budgets");
  revalidatePath("/");
}

export async function deleteBudget(budgetId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("category_budgets").delete().eq("id", budgetId);
  if (error) throw new Error(error.message);
  revalidatePath("/budgets");
  revalidatePath("/");
}
