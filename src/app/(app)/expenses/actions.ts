"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BillRecurrence } from "@/lib/supabase/types";

function optionalId(formData: FormData, key: string): string | null {
  const value = formData.get(key) as string | null;
  return value && value !== "none" ? value : null;
}

export async function deleteExpense(expenseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
  revalidatePath("/budgets");
  revalidatePath("/");
}

export async function createBill(formData: FormData) {
  const supabase = await createClient();
  const isRecurring = formData.get("is_recurring") === "on";

  const { error } = await supabase.from("bills").insert({
    payee: String(formData.get("payee")),
    amount: Number(formData.get("amount")),
    currency: "GHS",
    is_recurring: isRecurring,
    recurrence: isRecurring ? (formData.get("recurrence") as BillRecurrence) : null,
    due_date: String(formData.get("due_date")),
    status: "pending",
    category_id: optionalId(formData, "category_id"),
    default_account_id: optionalId(formData, "default_account_id"),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
}

export async function markBillPaid(billId: string, accountId?: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_bill_paid", {
    p_bill_id: billId,
    p_account_id: accountId ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
  revalidatePath("/budgets");
  revalidatePath("/");
}

export async function deleteBill(billId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("bills").delete().eq("id", billId);
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
}

export async function createLoan(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("loans").insert({
    direction: String(formData.get("direction")) as "borrowed" | "lent",
    counterparty: String(formData.get("counterparty")),
    amount: Number(formData.get("amount")),
    currency: "GHS",
    date: String(formData.get("date")),
    status: "outstanding",
    notes: (formData.get("notes") as string) || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
}

export async function logLoanRepayment(formData: FormData) {
  const supabase = await createClient();

  const loanId = String(formData.get("loan_id"));
  const amount = Number(formData.get("amount"));
  const accountId = String(formData.get("account_id"));
  const date = String(formData.get("date"));

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("*")
    .eq("id", loanId)
    .single();
  if (loanError) throw new Error(loanError.message);

  if (loan.direction === "borrowed") {
    const { error } = await supabase.from("expenses").insert({
      account_id: accountId,
      category_id: null,
      amount,
      currency: loan.currency,
      date,
      description: `Loan repayment to ${loan.counterparty}`,
      payee: loan.counterparty,
      is_gift: false,
      loan_id: loanId,
    });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("income_entries").insert({
      account_id: accountId,
      amount,
      currency: loan.currency,
      date,
      description: `Loan repayment from ${loan.counterparty}`,
      include_in_tax_base: false,
      loan_id: loanId,
    });
    if (error) throw new Error(error.message);
  }

  const { data: repaymentRows } = await supabase
    .from(loan.direction === "borrowed" ? "expenses" : "income_entries")
    .select("amount")
    .eq("loan_id", loanId);

  const totalRepaid = (repaymentRows ?? []).reduce((sum, r) => sum + r.amount, 0);
  const newStatus =
    totalRepaid >= loan.amount ? "repaid" : totalRepaid > 0 ? "partially_repaid" : "outstanding";

  const { error: updateError } = await supabase
    .from("loans")
    .update({ status: newStatus })
    .eq("id", loanId);
  if (updateError) throw new Error(updateError.message);

  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function deleteLoan(loanId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("loans").delete().eq("id", loanId);
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
}
