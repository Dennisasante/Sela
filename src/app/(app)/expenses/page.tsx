import { createClient } from "@/lib/supabase/server";
import { getExpenses, getBillsWithProgress } from "@/lib/data/expenses";
import { monthRangeForOffset, formatMoney } from "@/lib/format";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import { ExpenseRow } from "@/components/expenses/expense-row";
import { BillCard } from "@/components/expenses/bill-card";
import { BillFormDialog } from "@/components/expenses/bill-form-dialog";
import { LoanCard } from "@/components/expenses/loan-card";
import { LoanFormDialog } from "@/components/expenses/loan-form-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const EXPENSE_TABS = ["expenses", "bills", "loans", "gifts"] as const;

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    category?: string;
    account?: string;
    tab?: string;
    search?: string;
    min?: string;
    max?: string;
  }>;
}) {
  const { month, category, account, tab, search, min, max } = await searchParams;
  const monthOffset = month ? parseInt(month, 10) || 0 : 0;
  const { start, end, label } = monthRangeForOffset(monthOffset);
  const activeTab = EXPENSE_TABS.includes(tab as (typeof EXPENSE_TABS)[number])
    ? (tab as (typeof EXPENSE_TABS)[number])
    : "expenses";
  const minAmount = min ? Number(min) : undefined;
  const maxAmount = max ? Number(max) : undefined;

  const supabase = await createClient();

  const [
    expenses,
    gifts,
    { data: categories },
    { data: accounts },
    billProgress,
    { data: loans },
    { data: loanTx },
  ] = await Promise.all([
    getExpenses(supabase, {
      start,
      end,
      categoryId: category,
      accountId: account,
      search,
      minAmount,
      maxAmount,
    }),
    getExpenses(supabase, { start, end, giftsOnly: true }),
    supabase.from("expense_categories").select("*").order("name"),
    supabase.from("accounts").select("*").eq("is_active", true).order("name"),
    getBillsWithProgress(supabase),
    supabase.from("loans").select("*").order("date", { ascending: false }),
    supabase.from("loan_transactions").select("loan_id, type, amount"),
  ]);
  const { bills, summary: payableSummary } = billProgress;

  const monthTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const currency = expenses[0]?.currency ?? "GHS";
  const allAccounts = accounts ?? [];
  const allCategories = categories ?? [];

  const repaidByLoan = new Map<string, number>();
  for (const tx of loanTx ?? []) {
    if (tx.type !== "repayment") continue;
    repaidByLoan.set(tx.loan_id, (repaidByLoan.get(tx.loan_id) ?? 0) + tx.amount);
  }

  const loansWithOutstanding = (loans ?? []).map((loan) => ({
    loan,
    outstanding: loan.amount - (repaidByLoan.get(loan.id) ?? 0),
  }));
  const totalOwedByMe = loansWithOutstanding
    .filter((l) => l.loan.direction === "borrowed")
    .reduce((sum, l) => sum + l.outstanding, 0);
  const totalOwedToMe = loansWithOutstanding
    .filter((l) => l.loan.direction === "lent")
    .reduce((sum, l) => sum + l.outstanding, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Expenses</h1>

      <Tabs key={activeTab} defaultValue={activeTab}>
        <TabsList className="w-full">
          <TabsTrigger value="expenses" className="flex-1">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="bills" className="flex-1">
            Bills
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex-1">
            Loans
          </TabsTrigger>
          <TabsTrigger value="gifts" className="flex-1">
            Gifts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-3">
          <ExpenseFilters
            categories={allCategories}
            accounts={allAccounts}
            monthOffset={monthOffset}
            monthLabel={label}
            categoryId={category}
            accountId={account}
            search={search}
            minAmount={min}
            maxAmount={max}
          />
          <p className="text-sm text-muted-foreground">
            Total:{" "}
            <span className="font-semibold text-foreground">
              {formatMoney(monthTotal, currency)}
            </span>
          </p>
          <Card>
            <CardContent className="divide-y py-0">
              {expenses.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No expenses logged for this period.
                </p>
              )}
              {expenses.map((expense) => (
                <ExpenseRow key={expense.id} expense={expense} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills" className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="py-3 text-center">
                <p className="text-xs text-muted-foreground">Total owed</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatMoney(payableSummary.totalOwed, currency)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 text-center">
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="mt-1 text-lg font-semibold text-destructive">
                  {formatMoney(payableSummary.overdue, currency)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 text-center">
                <p className="text-xs text-muted-foreground">Due within 7 days</p>
                <p className="mt-1 text-lg font-semibold text-info">
                  {formatMoney(payableSummary.dueSoon, currency)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 text-center">
                <p className="text-xs text-muted-foreground">Upcoming</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatMoney(payableSummary.upcoming, currency)}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <BillFormDialog
              categories={allCategories}
              accounts={allAccounts}
              trigger={
                <Button size="sm">
                  <Plus className="size-4" />
                  Add bill
                </Button>
              }
            />
          </div>
          {bills.length === 0 && (
            <p className="text-sm text-muted-foreground">No bills tracked yet.</p>
          )}
          {bills.map(({ bill, outstanding, paidToDate, payments }) => (
            <BillCard
              key={bill.id}
              bill={bill}
              outstanding={outstanding}
              paidToDate={paidToDate}
              payments={payments}
              accounts={allAccounts}
            />
          ))}
        </TabsContent>

        <TabsContent value="loans" className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="py-3 text-center">
                <p className="text-xs text-muted-foreground">You owe</p>
                <p className="mt-1 text-lg font-semibold text-destructive">
                  {formatMoney(totalOwedByMe, currency)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 text-center">
                <p className="text-xs text-muted-foreground">Owed to you</p>
                <p className="mt-1 text-lg font-semibold text-success">
                  {formatMoney(totalOwedToMe, currency)}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <LoanFormDialog
              accounts={allAccounts}
              trigger={
                <Button size="sm">
                  <Plus className="size-4" />
                  Add loan
                </Button>
              }
            />
          </div>
          {loansWithOutstanding.length === 0 && (
            <p className="text-sm text-muted-foreground">No loans tracked yet.</p>
          )}
          {loansWithOutstanding.map(({ loan, outstanding }) => (
            <LoanCard key={loan.id} loan={loan} outstanding={outstanding} accounts={allAccounts} />
          ))}
        </TabsContent>

        <TabsContent value="gifts" className="space-y-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Card>
            <CardContent className="divide-y py-0">
              {gifts.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No gifts logged this month.
                </p>
              )}
              {gifts.map((expense) => (
                <ExpenseRow key={expense.id} expense={expense} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
