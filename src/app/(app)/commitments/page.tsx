import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCommitmentsOverview } from "@/lib/data/commitments";
import { formatMoney, formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Repeat, HandCoins, PiggyBank, CalendarClock, ChevronRight } from "lucide-react";

export default async function CommitmentsPage() {
  const supabase = await createClient();
  const overview = await getCommitmentsOverview(supabase);
  const { currency } = overview;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Commitments</h1>
        <p className="text-sm text-muted-foreground">
          Everything you&apos;re on the hook for, in one place.
        </p>
      </div>

      <Card>
        <CardContent className="py-5 text-center">
          <p className="text-xs font-medium text-muted-foreground">This month&apos;s commitments</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
            {formatMoney(overview.grandTotalThisMonth, currency)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Bills owed + subscriptions + planned savings + sinking funds
          </p>
        </CardContent>
      </Card>

      <Link href="/expenses?tab=bills" className="block">
        <Card>
          <CardContent className="space-y-3 py-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <Receipt className="size-4 text-muted-foreground" />
                Bills
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold">
                  {formatMoney(overview.billsTotalOwed, currency)}
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </div>
            {overview.bills.length === 0 && (
              <p className="text-sm text-muted-foreground">No bills currently owed.</p>
            )}
            <div className="divide-y">
              {overview.bills.slice(0, 5).map(({ bill, outstanding }) => (
                <div key={bill.id} className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>{bill.payee}</span>
                    {bill.due_date < new Date().toISOString().slice(0, 10) && (
                      <Badge variant="destructive" className="text-[10px]">
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatMoney(outstanding, currency)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(bill.due_date)}</p>
                  </div>
                </div>
              ))}
            </div>
            {overview.bills.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{overview.bills.length - 5} more
              </p>
            )}
          </CardContent>
        </Card>
      </Link>

      <Link href="/subscriptions" className="block">
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <span className="flex items-center gap-2 font-medium">
              <Repeat className="size-4 text-muted-foreground" />
              Subscriptions
            </span>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatMoney(overview.subscriptionsMonthlyCost, currency)}/mo
                </p>
                <p className="text-xs text-muted-foreground">
                  {overview.subscriptionsCount} active
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/expenses?tab=loans" className="block">
        <Card>
          <CardContent className="space-y-3 py-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <HandCoins className="size-4 text-muted-foreground" />
                Loans you owe
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold">
                  {formatMoney(overview.loansOwedByMe, currency)}
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </div>
            {overview.loans.length === 0 && (
              <p className="text-sm text-muted-foreground">You don&apos;t owe anyone right now.</p>
            )}
            <div className="divide-y">
              {overview.loans.slice(0, 5).map(({ loan, outstanding }) => (
                <div key={loan.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{loan.counterparty}</span>
                  <p className="font-medium">{formatMoney(outstanding, loan.currency)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/savings" className="block">
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <span className="flex items-center gap-2 font-medium">
              <PiggyBank className="size-4 text-muted-foreground" />
              Savings &amp; tax rules
            </span>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatMoney(overview.savingsRulesMonthly, currency)}/mo
                </p>
                <p className="text-xs text-muted-foreground">
                  {overview.savingsRulesCount} active
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/savings" className="block">
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <span className="flex items-center gap-2 font-medium">
              <CalendarClock className="size-4 text-muted-foreground" />
              Sinking funds
            </span>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatMoney(overview.sinkingFundsMonthly, currency)}/mo
                </p>
                <p className="text-xs text-muted-foreground">
                  {overview.sinkingFundsCount} active
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
