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
