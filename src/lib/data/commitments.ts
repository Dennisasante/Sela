import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Bill, Loan } from "@/lib/supabase/types";
import { toISODate } from "@/lib/format";
import { getSubscriptions } from "@/lib/data/subscriptions";
import { getSavingsRulesProgress, getSavingsGoalsProgress } from "@/lib/data/savings";

export type CommitmentBill = {
  bill: Bill;
  outstanding: number;
};

export type CommitmentLoan = {
  loan: Loan;
  outstanding: number;
};

export type CommitmentsOverview = {
  currency: string;
  bills: CommitmentBill[];
  billsTotalOwed: number;
  billsOverdue: number;
  subscriptionsMonthlyCost: number;
  subscriptionsCount: number;
  loans: CommitmentLoan[];
  loansOwedByMe: number;
  savingsRulesMonthly: number;
  savingsRulesCount: number;
  sinkingFundsMonthly: number;
  sinkingFundsCount: number;
  grandTotalThisMonth: number;
};

export async function getCommitmentsOverview(
  supabase: SupabaseClient<Database>
): Promise<CommitmentsOverview> {
  const today = toISODate(new Date());

  const [
    { data: bills },
    { data: payments },
    subscriptionData,
    savingsRules,
    sinkingFunds,
    { data: loans },
    { data: loanTx },
  ] = await Promise.all([
    supabase.from("bills").select("*").eq("is_subscription", false).neq("status", "paid").order("due_date"),
    supabase.from("expenses").select("bill_id, amount").not("bill_id", "is", null),
    getSubscriptions(supabase),
    getSavingsRulesProgress(supabase),
    getSavingsGoalsProgress(supabase, "sinking_fund"),
    supabase.from("loans").select("*").order("date", { ascending: false }),
    supabase.from("loan_transactions").select("loan_id, type, amount"),
  ]);

  const paidByBill = new Map<string, number>();
  for (const p of payments ?? []) {
    if (!p.bill_id) continue;
    paidByBill.set(p.bill_id, (paidByBill.get(p.bill_id) ?? 0) + p.amount);
  }

  let billsTotalOwed = 0;
  let billsOverdue = 0;
  const billRows: CommitmentBill[] = (bills ?? []).map((bill) => {
    const paid = paidByBill.get(bill.id) ?? 0;
    const outstanding = bill.is_recurring ? bill.amount : Math.max(0, bill.amount - paid);
    billsTotalOwed += outstanding;
    if (bill.due_date < today) billsOverdue += outstanding;
    return { bill, outstanding };
  });

  const repaidByLoan = new Map<string, number>();
  for (const tx of loanTx ?? []) {
    if (tx.type !== "repayment") continue;
    repaidByLoan.set(tx.loan_id, (repaidByLoan.get(tx.loan_id) ?? 0) + tx.amount);
  }
  const loanRows: CommitmentLoan[] = (loans ?? [])
    .filter((l) => l.direction === "borrowed")
    .map((loan) => ({
      loan,
      outstanding: loan.amount - (repaidByLoan.get(loan.id) ?? 0),
    }))
    .filter((l) => l.outstanding > 0);
  const loansOwedByMe = loanRows.reduce((sum, l) => sum + l.outstanding, 0);

  const savingsRulesMonthly = savingsRules.reduce((sum, r) => sum + r.setAsideAmount, 0);
  const activeSinkingFunds = sinkingFunds.filter((f) => f.status === "active");
  const sinkingFundsMonthly = activeSinkingFunds.reduce(
    (sum, f) =>
      sum +
      (f.suggestedContribution
        ? f.suggestedContribution.period === "month"
          ? f.suggestedContribution.amount
          : f.suggestedContribution.period === "week"
            ? f.suggestedContribution.amount * (52 / 12)
            : f.suggestedContribution.amount * 30
        : 0),
    0
  );

  const currency = billRows[0]?.bill.currency ?? loanRows[0]?.loan.currency ?? "GHS";

  return {
    currency,
    bills: billRows,
    billsTotalOwed,
    billsOverdue,
    subscriptionsMonthlyCost: subscriptionData.summary.monthlyCost,
    subscriptionsCount: subscriptionData.subscriptions.filter((s) => s.bill.is_active).length,
    loans: loanRows,
    loansOwedByMe,
    savingsRulesMonthly,
    savingsRulesCount: savingsRules.length,
    sinkingFundsMonthly,
    sinkingFundsCount: activeSinkingFunds.length,
    grandTotalThisMonth:
      billsTotalOwed + subscriptionData.summary.monthlyCost + savingsRulesMonthly + sinkingFundsMonthly,
  };
}
