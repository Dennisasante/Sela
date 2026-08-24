"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function optionalId(formData: FormData, key: string): string | null {
  const value = formData.get(key) as string | null;
  return value && value !== "none" ? value : null;
}

export async function addIncome(formData: FormData) {
  const supabase = await createClient();

  const isProductSale = formData.get("is_product_sale") === "on";

  const { data: incomeEntry, error } = await supabase
    .from("income_entries")
    .insert({
      source_id: optionalId(formData, "source_id"),
      project_id: optionalId(formData, "project_id"),
      account_id: String(formData.get("account_id")),
      amount: Number(formData.get("amount")),
      currency: "GHS",
      date: String(formData.get("date")),
      description: (formData.get("description") as string) || null,
      include_in_tax_base: formData.get("include_in_tax_base") === "on",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (isProductSale && incomeEntry) {
    const { data: sale, error: saleError } = await supabase
      .from("product_sales")
      .insert({
        income_entry_id: incomeEntry.id,
        product_name: String(formData.get("product_name")),
        quantity: Number(formData.get("quantity")),
        selling_price_per_unit: Number(formData.get("selling_price_per_unit")),
        cost_price_per_unit: Number(formData.get("cost_price_per_unit") ?? 0),
        delivery_fee: Number(formData.get("delivery_fee") ?? 0),
        sale_date: String(formData.get("date")),
      })
      .select()
      .single();

    if (saleError) throw new Error(saleError.message);

    if (sale) {
      const { error: linkError } = await supabase
        .from("income_entries")
        .update({ product_sale_id: sale.id })
        .eq("id", incomeEntry.id);
      if (linkError) throw new Error(linkError.message);
    }
  }

  revalidatePath("/income");
  revalidatePath("/");
}

export async function addExpense(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("expenses").insert({
    account_id: String(formData.get("account_id")),
    category_id: optionalId(formData, "category_id"),
    amount: Number(formData.get("amount")),
    currency: "GHS",
    date: String(formData.get("date")),
    description: (formData.get("description") as string) || null,
    payee: (formData.get("payee") as string) || null,
    is_gift: formData.get("is_gift") === "on",
    event_id: optionalId(formData, "event_id"),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
  revalidatePath("/");
}
