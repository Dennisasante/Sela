"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AccountType } from "@/lib/supabase/types";

export async function createAccount(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("accounts").insert({
    name: String(formData.get("name")),
    type: String(formData.get("type")) as AccountType,
    provider: (formData.get("provider") as string) || null,
    opening_balance: Number(formData.get("opening_balance") ?? 0),
    currency: "GHS",
    is_active: true,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/accounts");
  revalidatePath("/");
}

export async function updateAccount(accountId: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("accounts")
    .update({
      name: String(formData.get("name")),
      type: String(formData.get("type")) as AccountType,
      provider: (formData.get("provider") as string) || null,
      opening_balance: Number(formData.get("opening_balance") ?? 0),
    })
    .eq("id", accountId);

  if (error) throw new Error(error.message);
  revalidatePath("/accounts");
  revalidatePath("/");
}

export async function setAccountActive(accountId: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .update({ is_active: isActive })
    .eq("id", accountId);

  if (error) throw new Error(error.message);
  revalidatePath("/accounts");
  revalidatePath("/");
}

export async function createTransfer(formData: FormData) {
  const supabase = await createClient();

  const toAccountId = (formData.get("to_account_id") as string) || null;

  const { error } = await supabase.from("transfers").insert({
    from_account_id: String(formData.get("from_account_id")),
    to_account_id: toAccountId && toAccountId !== "none" ? toAccountId : null,
    amount: Number(formData.get("amount")),
    currency: "GHS",
    date: String(formData.get("date")),
    description: (formData.get("description") as string) || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/accounts");
  revalidatePath("/");
}
