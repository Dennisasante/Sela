import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, WishlistItem } from "@/lib/supabase/types";
import { getSafeToSpendSnapshot } from "@/lib/data/dashboard";

export type WishlistItemWithAffordability = {
  item: WishlistItem;
  canAffordNow: boolean;
  shortfall: number;
};

export async function getWishlistOverview(supabase: SupabaseClient<Database>) {
  const [{ data: items }, snapshot] = await Promise.all([
    supabase.from("wishlist_items").select("*").order("created_at", { ascending: false }),
    getSafeToSpendSnapshot(supabase),
  ]);

  const withAffordability: WishlistItemWithAffordability[] = (items ?? []).map((item) => ({
    item,
    canAffordNow: snapshot.safeToSpend >= item.estimated_price,
    shortfall: Math.max(0, item.estimated_price - snapshot.safeToSpend),
  }));

  return { items: withAffordability, safeToSpend: snapshot.safeToSpend, currency: snapshot.currency };
}
