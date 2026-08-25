import type { User } from "@supabase/supabase-js";

export function getDisplayName(user: User | null | undefined) {
  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim();
  if (fullName) return fullName.split(/\s+/)[0];

  const email = user?.email ?? "";
  const local = email.split("@")[0] ?? "";
  const alpha = local.match(/^[a-zA-Z]+/)?.[0] ?? local;
  return alpha ? alpha.charAt(0).toUpperCase() + alpha.slice(1) : "there";
}

export function getFullDisplayName(user: User | null | undefined) {
  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim();
  if (fullName) return fullName;
  return getDisplayName(user);
}
