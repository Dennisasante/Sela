"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SavingsBaseType, GoalTargetType } from "@/lib/supabase/types";

export async function createSavingsRule(formData: FormData) {
  const supabase = await createClient();
  const baseType = String(formData.get("base_type")) as SavingsBaseType;
  const customSourceIds = formData.getAll("custom_source_ids").map(String);

  const { error } = await supabase.from("savings_rules").insert({
    name: String(formData.get("name")),
    percentage: Number(formData.get("percentage")),
    base_type: baseType,
    custom_source_ids: baseType === "custom" ? customSourceIds : null,
    period: "monthly",
    is_active: true,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/savings");
}

export async function deleteSavingsRule(ruleId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("savings_rules").delete().eq("id", ruleId);
  if (error) throw new Error(error.message);
  revalidatePath("/savings");
}

export async function logSetAsideTransfer(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("transfers").insert({
    from_account_id: String(formData.get("from_account_id")),
    to_account_id: String(formData.get("to_account_id")),
    amount: Number(formData.get("amount")),
    currency: "GHS",
    date: String(formData.get("date")),
    description: String(formData.get("description") ?? "Savings set-aside"),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/savings");
  revalidatePath("/accounts");
  revalidatePath("/");
}

export async function createSavingsGoal(formData: FormData) {
  const supabase = await createClient();
  const targetAccountId = formData.get("target_account_id") as string | null;

  const { error } = await supabase.from("savings_goals").insert({
    name: String(formData.get("name")),
    target_account_id: targetAccountId && targetAccountId !== "none" ? targetAccountId : null,
    target_type: String(formData.get("target_type")) as GoalTargetType,
    target_value: Number(formData.get("target_value")),
    period: "monthly",
    notes: (formData.get("notes") as string) || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/savings");
}

export async function deleteSavingsGoal(goalId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("savings_goals").delete().eq("id", goalId);
  if (error) throw new Error(error.message);
  revalidatePath("/savings");
}
