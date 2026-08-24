"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AlertMetric, AlertDirection } from "@/lib/supabase/types";

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("expense_categories").insert({
    name: String(formData.get("name")),
    is_default: false,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("expense_categories").delete().eq("id", categoryId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function createThreshold(formData: FormData) {
  const supabase = await createClient();
  const metric = String(formData.get("metric")) as AlertMetric;
  const categoryId = formData.get("category_id") as string | null;

  const { error } = await supabase.from("alert_thresholds").insert({
    metric,
    category_id: metric === "category_spend" ? categoryId : null,
    period: "monthly",
    direction: String(formData.get("direction")) as AlertDirection,
    threshold_amount: Number(formData.get("threshold_amount")),
    is_active: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/notifications");
}

export async function deleteThreshold(thresholdId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("alert_thresholds").delete().eq("id", thresholdId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/notifications");
}
