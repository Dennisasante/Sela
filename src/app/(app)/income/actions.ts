"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProjectStatus } from "@/lib/supabase/types";

export async function deleteIncomeEntry(entryId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("income_entries").delete().eq("id", entryId);
  if (error) throw new Error(error.message);
  revalidatePath("/income");
  revalidatePath("/");
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const sourceId = formData.get("source_id") as string | null;

  const { error } = await supabase.from("projects").insert({
    source_id: sourceId && sourceId !== "none" ? sourceId : null,
    title: String(formData.get("title")),
    description: (formData.get("description") as string) || null,
    total_amount: Number(formData.get("total_amount")),
    currency: "GHS",
    status: "active",
    started_at: (formData.get("started_at") as string) || null,
    due_at: (formData.get("due_at") as string) || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/income");
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ status }).eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidatePath("/income");
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();

  // Deleting a project is treated as "undo this project entirely" — the
  // income/expenses recorded against it get removed too, not just unlinked,
  // since a project delete is usually someone correcting a mistake rather
  // than archiving a project whose real transaction history should persist.
  const { error: incomeError } = await supabase
    .from("income_entries")
    .delete()
    .eq("project_id", projectId);
  if (incomeError) throw new Error(incomeError.message);

  const { error: expenseError } = await supabase
    .from("expenses")
    .delete()
    .eq("project_id", projectId);
  if (expenseError) throw new Error(expenseError.message);

  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw new Error(error.message);

  revalidatePath("/income");
  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function createMilestone(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("project_milestones").insert({
    project_id: String(formData.get("project_id")),
    label: String(formData.get("label")),
    amount: Number(formData.get("amount")),
    currency: "GHS",
    due_date: (formData.get("due_date") as string) || null,
    status: "pending",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/income");
}

export async function deleteMilestone(milestoneId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("project_milestones").delete().eq("id", milestoneId);
  if (error) throw new Error(error.message);
  revalidatePath("/income");
}

export async function markMilestonePaid(formData: FormData) {
  const supabase = await createClient();

  const milestoneId = String(formData.get("milestone_id"));
  const amount = Number(formData.get("amount"));
  const accountId = String(formData.get("account_id"));
  const date = String(formData.get("date"));

  const { data: milestone, error: msError } = await supabase
    .from("project_milestones")
    .select("*, projects(source_id, title)")
    .eq("id", milestoneId)
    .single();
  if (msError) throw new Error(msError.message);

  const project = milestone.projects as unknown as { source_id: string | null; title: string } | null;

  const { data: entry, error: entryError } = await supabase
    .from("income_entries")
    .insert({
      source_id: project?.source_id ?? null,
      project_id: milestone.project_id,
      account_id: accountId,
      amount,
      currency: milestone.currency,
      date,
      description: `${project?.title ?? "Project"}: ${milestone.label}`,
      include_in_tax_base: true,
    })
    .select()
    .single();
  if (entryError) throw new Error(entryError.message);

  const { error: updateError } = await supabase
    .from("project_milestones")
    .update({ status: "paid", income_entry_id: entry.id })
    .eq("id", milestoneId);
  if (updateError) throw new Error(updateError.message);

  revalidatePath("/income");
  revalidatePath("/");
}

export async function createRecurringIncome(formData: FormData) {
  const supabase = await createClient();

  const defaultAccountId = formData.get("default_account_id") as string | null;

  const { error } = await supabase.from("recurring_income").insert({
    source_id: String(formData.get("source_id")),
    expected_amount: Number(formData.get("expected_amount")),
    currency: "GHS",
    expected_day_of_month: Number(formData.get("expected_day_of_month")),
    default_account_id:
      defaultAccountId && defaultAccountId !== "none" ? defaultAccountId : null,
    start_date: String(formData.get("start_date")),
    status: "active",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/income");
}

export async function pauseRecurringIncome(id: string, status: "active" | "paused") {
  const supabase = await createClient();
  const { error } = await supabase.from("recurring_income").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/income");
}

export async function deleteRecurringIncome(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("recurring_income").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/income");
}

export async function skipOccurrence(occurrenceId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("income_occurrences")
    .update({ status: "skipped" })
    .eq("id", occurrenceId);
  if (error) throw new Error(error.message);
  revalidatePath("/income");
}

export async function recordOccurrenceReceived(formData: FormData) {
  const supabase = await createClient();

  const occurrenceId = String(formData.get("occurrence_id"));
  const amount = Number(formData.get("amount"));
  const date = String(formData.get("date"));
  const accountId = String(formData.get("account_id"));

  const { data: occurrence, error: occError } = await supabase
    .from("income_occurrences")
    .select("*, recurring_income(source_id)")
    .eq("id", occurrenceId)
    .single();
  if (occError) throw new Error(occError.message);

  const recurring = occurrence.recurring_income as unknown as { source_id: string } | null;
  if (!recurring) throw new Error("Recurring income not found");

  const { data: entry, error: entryError } = await supabase
    .from("income_entries")
    .insert({
      source_id: recurring.source_id,
      account_id: accountId,
      amount,
      currency: occurrence.currency,
      date,
      description: "Recurring income received",
      include_in_tax_base: true,
    })
    .select()
    .single();
  if (entryError) throw new Error(entryError.message);

  const { error: updateError } = await supabase
    .from("income_occurrences")
    .update({
      status: amount >= occurrence.expected_amount ? "received" : "partial",
      income_entry_id: entry.id,
      received_amount: amount,
      received_date: date,
    })
    .eq("id", occurrenceId);
  if (updateError) throw new Error(updateError.message);

  revalidatePath("/income");
  revalidatePath("/");
}
