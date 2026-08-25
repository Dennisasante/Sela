import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export async function isAdminUser(
  supabase: SupabaseClient<Database>,
  user: User | null
): Promise<boolean> {
  if (!user) return false;
  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return !!data;
}
