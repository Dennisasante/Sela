"use server";

import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/errors";
import type { AccountType } from "@/lib/supabase/types";

export async function saveOnboardingProfile(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const incomeType = String(formData.get("income_type") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: {
      ...(fullName ? { full_name: fullName } : {}),
      ...(incomeType ? { primary_income_type: incomeType } : {}),
    },
  });
  if (error) throw new Error(getErrorMessage(error));
}

export async function createFirstAccount(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  const { error } = await supabase.from("accounts").insert({
    name,
    type: String(formData.get("type") || "cash") as AccountType,
    provider: null,
    opening_balance: Number(formData.get("opening_balance")) || 0,
    currency: "GHS",
    is_active: true,
  });
  if (error) throw new Error(getErrorMessage(error));
}

export async function createFirstGoal(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const targetAmount = Number(formData.get("target_amount"));
  if (!name || !targetAmount) return;

  const supabase = await createClient();
  const { error } = await supabase.from("savings_goals").insert({
    name,
    target_amount: targetAmount,
    target_account_id: null,
    target_date: null,
    priority: "medium",
    category: null,
    status: "active",
    notes: null,
    kind: "goal",
    is_recurring: false,
    cycle_started_at: new Date().toISOString(),
  });
  if (error) throw new Error(getErrorMessage(error));
}

export async function completeOnboarding() {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { onboarding_completed: true },
  });
  if (error) throw new Error(getErrorMessage(error));
}
