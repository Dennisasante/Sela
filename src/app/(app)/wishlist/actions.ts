"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/errors";
import type { WishlistPriority } from "@/lib/supabase/types";

export async function createWishlistItem(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("wishlist_items").insert({
    name: String(formData.get("name")),
    estimated_price: Number(formData.get("estimated_price")) || 0,
    currency: "GHS",
    priority: String(formData.get("priority") || "medium") as WishlistPriority,
    url: (formData.get("url") as string) || null,
    notes: (formData.get("notes") as string) || null,
    status: "wanted",
  });

  if (error) throw new Error(getErrorMessage(error));
  revalidatePath("/wishlist");
}

export async function updateWishlistItem(itemId: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("wishlist_items")
    .update({
      name: String(formData.get("name")),
      estimated_price: Number(formData.get("estimated_price")) || 0,
      priority: String(formData.get("priority") || "medium") as WishlistPriority,
      url: (formData.get("url") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", itemId);

  if (error) throw new Error(getErrorMessage(error));
  revalidatePath("/wishlist");
}

export async function markWishlistItemPurchased(itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("wishlist_items")
    .update({ status: "purchased" })
    .eq("id", itemId);
  if (error) throw new Error(getErrorMessage(error));
  revalidatePath("/wishlist");
}

export async function deleteWishlistItem(itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("wishlist_items").delete().eq("id", itemId);
  if (error) throw new Error(getErrorMessage(error));
  revalidatePath("/wishlist");
}
