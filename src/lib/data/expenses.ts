import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Bill } from "@/lib/supabase/types";
import { toISODate } from "@/lib/format";

export type ExpenseRow = {
  id: string;
  amount: number;
  currency: string;
  date: string;
  description: string | null;
  payee: string | null;
  isGift: boolean;
  categoryName: string | null;
  accountName: string;
};

export async function getExpenses(
  supabase: SupabaseClient<Database>,
  filters: {
    start: string;
    end: string;
    categoryId?: string;
    accountId?: string;
    giftsOnly?: boolean;
  }
): Promise<ExpenseRow[]> {
  let query = supabase
    .from("expenses")
    .select(
      "id, amount, currency, date, description, payee, is_gift, category_id, account_id, expense_categories(name), accounts(name)"
    )
    .gte("date", filters.start)
    .lte("date", filters.end)
    .order("date", { ascending: false });

  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.accountId) query = query.eq("account_id", filters.accountId);
  if (filters.giftsOnly) query = query.eq("is_gift", true);
  else query = query.eq("is_gift", false);

  const { data } = await query;

  return (data ?? []).map((row) => {
    const category = row.expense_categories as unknown as { name?: string } | null;
    const account = row.accounts as unknown as { name?: string } | null;
    return {
      id: row.id,
      amount: row.amount,
      currency: row.currency,
      date: row.date,
      description: row.description,
      payee: row.payee,
      isGift: row.is_gift,
      categoryName: category?.name ?? null,
      accountName: account?.name ?? "",
    };
  });
}

export type BillWithProgress = {
  bill: Bill;
  paidToDate: number;
  outstanding: number;
  payments: { id: string; amount: number; date: string }[];
};

export type PayableSummary = {
  totalOwed: number;
  dueSoon: number;
  overdue: number;
  upcoming: number;
};

export async function getBillsWithProgress(
  supabase: SupabaseClient<Database>
): Promise<{ bills: BillWithProgress[]; summary: PayableSummary }> {
  const [{ data: bills }, { data: payments }] = await Promise.all([
    supabase.from("bills").select("*").order("due_date"),
    supabase.from("expenses").select("id, bill_id, amount, date").not("bill_id", "is", null),
  ]);

  const today = toISODate(new Date());
  const soon = toISODate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  const paymentsByBill = new Map<string, { id: string; amount: number; date: string }[]>();
  for (const p of payments ?? []) {
    if (!p.bill_id) continue;
    const list = paymentsByBill.get(p.bill_id) ?? [];
    list.push({ id: p.id, amount: p.amount, date: p.date });
    paymentsByBill.set(p.bill_id, list);
  }

  let totalOwed = 0;
  let dueSoon = 0;
  let overdue = 0;
  let upcoming = 0;

  const billsWithProgress = (bills ?? []).map((bill) => {
    const billPayments = paymentsByBill.get(bill.id) ?? [];
    const paidToDate = billPayments.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = Math.max(0, bill.amount - paidToDate);

    if (bill.status !== "paid" && !bill.is_recurring) {
      totalOwed += outstanding;
      if (bill.due_date < today) overdue += outstanding;
      else if (bill.due_date <= soon) dueSoon += outstanding;
      else upcoming += outstanding;
    } else if (bill.is_recurring && bill.status !== "paid") {
      totalOwed += bill.amount;
      if (bill.due_date < today) overdue += bill.amount;
      else if (bill.due_date <= soon) dueSoon += bill.amount;
      else upcoming += bill.amount;
    }

    return { bill, paidToDate, outstanding, payments: billPayments };
  });

  return {
    bills: billsWithProgress,
    summary: { totalOwed, dueSoon, overdue, upcoming },
  };
}
