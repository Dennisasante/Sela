"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/errors";
import { isAdminUser } from "@/lib/admin";

export async function adminSignIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/admin/login?error=${encodeURIComponent(getErrorMessage(error, "We couldn't sign you in. Please try again."))}`
    );
  }

  if (!(await isAdminUser(supabase, data.user))) {
    await supabase.auth.signOut();
    redirect(
      `/admin/login?error=${encodeURIComponent("This account doesn't have admin access.")}`
    );
  }

  redirect("/admin");
}

export async function adminSignOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
