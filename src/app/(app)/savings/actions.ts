"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SavingsBaseType, GoalPriority, GoalStatus, GoalKind } from "@/lib/supabase/types";

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
    target_amount: Number(formData.get("target_amount")),
    target_date: (formData.get("target_date") as string) || null,
    priority: String(formData.get("priority") || "medium") as GoalPriority,
    category: (formData.get("category") as string) || null,
    status: "active",
    notes: (formData.get("description") as string) || null,
    kind: (String(formData.get("kind") || "goal") as GoalKind),
    is_recurring: formData.get("is_recurring") === "on",
    cycle_started_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/savings");
}

export async function updateSavingsGoal(goalId: string, formData: FormData) {
  const supabase = await createClient();
  const targetAccountId = formData.get("target_account_id") as string | null;

  const { error } = await supabase
    .from("savings_goals")
    .update({
      name: String(formData.get("name")),
      target_account_id: targetAccountId && targetAccountId !== "none" ? targetAccountId : null,
      target_amount: Number(formData.get("target_amount")),
      target_date: (formData.get("target_date") as string) || null,
      priority: String(formData.get("priority") || "medium") as GoalPriority,
      category: (formData.get("category") as string) || null,
      notes: (formData.get("description") as string) || null,
      is_recurring: formData.get("is_recurring") === "on",
    })
    .eq("id", goalId);

  if (error) throw new Error(error.message);
  revalidatePath("/savings");
}

export async function restartSinkingFundCycle(goalId: string) {
  const supabase = await createClient();
  const { data: goal, error: fetchError } = await supabase
    .from("savings_goals")
    .select("target_date, is_recurring")
    .eq("id", goalId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const nextTargetDate = goal.target_date
    ? (() => {
        const d = new Date(goal.target_date!);
        d.setFullYear(d.getFullYear() + 1);
        return d.toISOString().slice(0, 10);
      })()
    : null;

  const { error } = await supabase
    .from("savings_goals")
    .update({
      cycle_started_at: new Date().toISOString(),
      target_date: goal.is_recurring ? nextTargetDate : goal.target_date,
      status: "active",
    })
    .eq("id", goalId);

  if (error) throw new Error(error.message);
  revalidatePath("/savings");
}

export async function updateGoalStatus(goalId: string, status: GoalStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("savings_goals").update({ status }).eq("id", goalId);
  if (error) throw new Error(error.message);
  revalidatePath("/savings");
}

export async function deleteSavingsGoal(goalId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("savings_goals").delete().eq("id", goalId);
  if (error) throw new Error(error.message);
  revalidatePath("/savings");
}

export async function logGoalContribution(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("transfers").insert({
    from_account_id: String(formData.get("from_account_id")),
    to_account_id: String(formData.get("to_account_id")),
    goal_id: String(formData.get("goal_id")),
    amount: Number(formData.get("amount")),
    currency: "GHS",
    date: String(formData.get("date")),
    description: String(formData.get("description") ?? "Goal contribution"),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/savings");
  revalidatePath("/accounts");
  revalidatePath("/");
}
