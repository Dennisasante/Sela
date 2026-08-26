"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getErrorMessage } from "@/lib/errors";
import { isAdminUser } from "@/lib/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isAdminUser(supabase, user))) {
    throw new Error("Not authorized");
  }
  return user;
}

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

export async function confirmUserEmail(userId: string) {
  await requireAdmin();
  const service = createServiceClient();
  const { error } = await service.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });
  if (error) throw new Error(getErrorMessage(error));
  revalidatePath("/admin");
}

export async function resendUserConfirmation(email: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) throw new Error(getErrorMessage(error));
}

export async function setUserBanned(userId: string, banned: boolean) {
  const admin = await requireAdmin();
  if (userId === admin.id) throw new Error("You can't suspend your own admin account.");

  const service = createServiceClient();
  const { error } = await service.auth.admin.updateUserById(userId, {
    ban_duration: banned ? "876000h" : "none",
  });
  if (error) throw new Error(getErrorMessage(error));
  revalidatePath("/admin");
}

export async function deleteUserAccount(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) throw new Error("You can't delete your own admin account.");

  const service = createServiceClient();
  const { data: adminRow } = await service
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (adminRow) throw new Error("Demote this account before deleting it.");

  const { error } = await service.auth.admin.deleteUser(userId);
  if (error) throw new Error(getErrorMessage(error));
  revalidatePath("/admin");
}

export async function promoteToAdmin(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) throw new Error("Enter an email address");

  const service = createServiceClient();
  const { data: usersPage, error: listError } = await service.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) throw new Error(getErrorMessage(listError));

  const target = usersPage.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!target) throw new Error("No account with that email exists yet — sign up first.");

  const { error } = await service.from("admin_users").insert({ user_id: target.id });
  if (error) throw new Error(getErrorMessage(error, "That account may already be an admin."));
  revalidatePath("/admin");
}

export async function demoteAdmin(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) throw new Error("You can't remove your own admin access.");

  const service = createServiceClient();
  const { count } = await service
    .from("admin_users")
    .select("user_id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) throw new Error("At least one admin must remain.");

  const { error } = await service.from("admin_users").delete().eq("user_id", userId);
  if (error) throw new Error(getErrorMessage(error));
  revalidatePath("/admin");
}
