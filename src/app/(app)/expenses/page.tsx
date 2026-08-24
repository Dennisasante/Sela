import { createClient } from "@/lib/supabase/server";
import { getExpenses } from "@/lib/data/expenses";
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

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; category?: string; account?: string }>;
}) {
  const { month, category, account } = await searchParams;
  const monthOffset = month ? parseInt(month, 10) || 0 : 0;
  const { start, end, label } = monthRangeForOffset(monthOffset);

  const supabase = await createClient();

  const [expenses, gifts, { data: categories }, { data: accounts }, { data: bills }, { data: loans }] =
    await Promise.all([
      getExpenses(supabase, { start, end, categoryId: category, accountId: account }),
      getExpenses(supabase, { start, end, giftsOnly: true }),
      supabase.from("expense_categories").select("*").order("name"),
      supabase.from("accounts").select("*").eq("is_active", true).order("name"),
      supabase.from("bills").select("*").order("due_date"),
      supabase.from("loans").select("*").order("date", { ascending: false }),
    ]);

  const monthTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const currency = expenses[0]?.currency ?? "GHS";
  const allAccounts = accounts ?? [];
  const allCategories = categories ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Expenses</h1>

      <Tabs defaultValue="expenses">
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
          {(bills ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No bills tracked yet.</p>
          )}
          {(bills ?? []).map((bill) => (
            <BillCard key={bill.id} bill={bill} accounts={allAccounts} />
          ))}
        </TabsContent>

        <TabsContent value="loans" className="space-y-3">
          <div className="flex justify-end">
            <LoanFormDialog
              trigger={
                <Button size="sm">
                  <Plus className="size-4" />
                  Add loan
                </Button>
              }
            />
          </div>
          {(loans ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No loans tracked yet.</p>
          )}
          {(loans ?? []).map((loan) => (
            <LoanCard key={loan.id} loan={loan} accounts={allAccounts} />
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
