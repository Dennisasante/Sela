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
    provider: null,
    is_subscription: false,
    is_active: true,
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

export async function markBillPaid(billId: string, accountId?: string, amount?: number) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_bill_paid", {
    p_bill_id: billId,
    p_account_id: accountId ?? null,
    p_amount: amount ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
  revalidatePath("/subscriptions");
  revalidatePath("/budgets");
  revalidatePath("/");
}

export async function deleteBill(billId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("bills").delete().eq("id", billId);
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
  revalidatePath("/subscriptions");
}

export async function createSubscription(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("bills").insert({
    payee: String(formData.get("name")),
    provider: (formData.get("provider") as string) || null,
    amount: Number(formData.get("amount")),
    currency: "GHS",
    is_recurring: true,
    is_subscription: true,
    is_active: true,
    recurrence: formData.get("recurrence") as BillRecurrence,
    due_date: String(formData.get("next_billing_date")),
    status: "pending",
    category_id: optionalId(formData, "category_id"),
    default_account_id: optionalId(formData, "default_account_id"),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/subscriptions");
  revalidatePath("/");
}

export async function updateSubscription(subscriptionId: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bills")
    .update({
      payee: String(formData.get("name")),
      provider: (formData.get("provider") as string) || null,
      amount: Number(formData.get("amount")),
      recurrence: formData.get("recurrence") as BillRecurrence,
      due_date: String(formData.get("next_billing_date")),
      category_id: optionalId(formData, "category_id"),
      default_account_id: optionalId(formData, "default_account_id"),
    })
    .eq("id", subscriptionId);

  if (error) throw new Error(error.message);
  revalidatePath("/subscriptions");
}

export async function toggleSubscriptionActive(subscriptionId: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bills")
    .update({ is_active: isActive })
    .eq("id", subscriptionId);
  if (error) throw new Error(error.message);
  revalidatePath("/subscriptions");
  revalidatePath("/");
}

export async function createLoan(formData: FormData) {
  const supabase = await createClient();

  const direction = String(formData.get("direction")) as "borrowed" | "lent";
  const amount = Number(formData.get("amount"));
  const accountId = String(formData.get("account_id"));
  const date = String(formData.get("date"));

  const { data: loan, error } = await supabase
    .from("loans")
    .insert({
      direction,
      counterparty: String(formData.get("counterparty")),
      amount,
      currency: "GHS",
      date,
      status: "outstanding",
      notes: (formData.get("notes") as string) || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // The principal moving into (borrowed) or out of (lent) an account is a
  // real cash movement — recorded on the loan's own ledger, not as income
  // or an expense, so it doesn't distort income/expense totals.
  const { error: txError } = await supabase.from("loan_transactions").insert({
    loan_id: loan.id,
    account_id: accountId,
    type: "disbursement",
    amount,
    currency: "GHS",
    date,
    notes: direction === "borrowed" ? "Loan received" : "Loan given",
  });
  if (txError) throw new Error(txError.message);

  revalidatePath("/expenses");
  revalidatePath("/accounts");
  revalidatePath("/");
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

  const { error } = await supabase.from("loan_transactions").insert({
    loan_id: loanId,
    account_id: accountId,
    type: "repayment",
    amount,
    currency: loan.currency,
    date,
    notes:
      loan.direction === "borrowed"
        ? `Repaid to ${loan.counterparty}`
        : `Repaid by ${loan.counterparty}`,
  });
  if (error) throw new Error(error.message);

  const { data: repaymentRows } = await supabase
    .from("loan_transactions")
    .select("amount")
    .eq("loan_id", loanId)
    .eq("type", "repayment");

  const totalRepaid = (repaymentRows ?? []).reduce((sum, r) => sum + r.amount, 0);
  const newStatus =
    totalRepaid >= loan.amount ? "repaid" : totalRepaid > 0 ? "partially_repaid" : "outstanding";

  const { error: updateError } = await supabase
    .from("loans")
    .update({ status: newStatus })
    .eq("id", loanId);
  if (updateError) throw new Error(updateError.message);

  revalidatePath("/expenses");
  revalidatePath("/accounts");
  revalidatePath("/");
}

export async function deleteLoan(loanId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("loans").delete().eq("id", loanId);
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
}
