"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AlertMetric, AlertDirection, IncomeCategory, Database } from "@/lib/supabase/types";

// Keeps the source's is_recurring checkbox in sync with a real recurring_income
// row, so ticking "recurring" + filling in amount/day is enough to have it
// forecast automatically under Income -> Expected, without a separate setup step.
async function syncRecurringIncomeForSource(
  supabase: SupabaseClient<Database>,
  sourceId: string,
  formData: FormData
) {
  const isRecurring = formData.get("is_recurring") === "on";

  const { data: existing } = await supabase
    .from("recurring_income")
    .select("id")
    .eq("source_id", sourceId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!isRecurring) {
    if (existing) {
      await supabase.from("recurring_income").update({ status: "paused" }).eq("id", existing.id);
    }
    return;
  }

  const expectedAmount = Number(formData.get("expected_amount"));
  const expectedDayOfMonth = Number(formData.get("expected_day_of_month"));
  if (!expectedAmount || !expectedDayOfMonth) return;

  const defaultAccountId = formData.get("default_account_id") as string | null;
  const payload = {
    expected_amount: expectedAmount,
    expected_day_of_month: expectedDayOfMonth,
    default_account_id:
      defaultAccountId && defaultAccountId !== "none" ? defaultAccountId : null,
    status: "active" as const,
  };

  if (existing) {
    await supabase.from("recurring_income").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("recurring_income").insert({
      source_id: sourceId,
      currency: "GHS",
      start_date: (formData.get("start_date") as string) || new Date().toISOString().slice(0, 10),
      ...payload,
    });
  }
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("expense_categories").insert({
    name: String(formData.get("name")),
    icon: String(formData.get("icon") || "shapes"),
    color: String(formData.get("color") || "#64748b"),
    is_default: false,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function updateCategoryStyle(categoryId: string, icon: string, color: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("expense_categories")
    .update({ icon, color })
    .eq("id", categoryId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function archiveCategory(categoryId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("expense_categories")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", categoryId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function restoreCategory(categoryId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("expense_categories")
    .update({ archived_at: null })
    .eq("id", categoryId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function createIncomeSource(formData: FormData) {
  const supabase = await createClient();
  const { data: created, error } = await supabase
    .from("income_sources")
    .insert({
      name: String(formData.get("name")),
      category: String(formData.get("category")) as IncomeCategory,
      is_recurring: formData.get("is_recurring") === "on",
      notes: null,
      company: (formData.get("company") as string) || null,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await syncRecurringIncomeForSource(supabase, created.id, formData);

  revalidatePath("/settings");
  revalidatePath("/income");
  revalidatePath("/add/income");
}

export async function updateIncomeSource(sourceId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("income_sources")
    .update({
      name: String(formData.get("name")),
      category: String(formData.get("category")) as IncomeCategory,
      is_recurring: formData.get("is_recurring") === "on",
      company: (formData.get("company") as string) || null,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
    })
    .eq("id", sourceId);
  if (error) throw new Error(error.message);

  await syncRecurringIncomeForSource(supabase, sourceId, formData);

  revalidatePath("/settings");
  revalidatePath("/income");
}

export async function deleteIncomeSource(sourceId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("income_sources").delete().eq("id", sourceId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  revalidatePath("/income");
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

export async function updateMinimumReserve(formData: FormData) {
  const supabase = await createClient();
  const minimumReserve = Math.max(0, Number(formData.get("minimum_reserve")) || 0);
  const { error } = await supabase.auth.updateUser({ data: { minimum_reserve: minimumReserve } });
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  revalidatePath("/");
}
