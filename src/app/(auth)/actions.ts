"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/errors";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(getErrorMessage(error, "We couldn't sign you in. Please try again."))}`);
  }

  redirect("/");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(getErrorMessage(error, "We couldn't create your account. Please try again."))}`);
  }

  if (data.session) {
    redirect("/");
  }

  redirect(
    `/login?message=Check your email to confirm your account&pending_email=${encodeURIComponent(email)}`
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resendConfirmation(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const redirectTo = (formData.get("redirect_to") as string) || "/login";
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });

  const separator = redirectTo.includes("?") ? "&" : "?";

  if (error) {
    redirect(
      `${redirectTo}${separator}error=${encodeURIComponent(getErrorMessage(error, "We couldn't resend that email. Please try again."))}&pending_email=${encodeURIComponent(email)}`
    );
  }

  redirect(
    `${redirectTo}${separator}message=${encodeURIComponent("Confirmation email resent — check your inbox.")}`
  );
}
