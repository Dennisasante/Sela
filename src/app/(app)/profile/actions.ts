"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/errors";

export async function updateDisplayName(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) throw new Error("Name can't be empty");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
  if (error) throw new Error(getErrorMessage(error));

  revalidatePath("/profile");
  revalidatePath("/");
}

export async function updatePassword(formData: FormData) {
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  if (newPassword !== confirmPassword) {
    throw new Error("Passwords don't match");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(getErrorMessage(error));
}
