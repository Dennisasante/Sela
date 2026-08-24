import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatMoney } from "@/lib/format";
import { getCategoryStyle } from "@/lib/category-style";
import { getAccountIcon } from "@/lib/account-style";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircularProgress } from "@/components/ui/circular-progress";
import { AlertTriangle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const data = await getDashboardData(supabase);

  const totalBalance = data.balances.reduce((sum, a) => sum + a.balance, 0);
  const spendRate =
    data.totalIncome > 0
      ? Math.min(100, (data.totalExpenses / data.totalIncome) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {data.alerts.map((alert, i) => (
        <Alert key={i} variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Threshold crossed</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}

      <Card className="overflow-hidden border-none bg-gradient-to-br from-primary via-primary to-primary/85 text-primary-foreground shadow-lg shadow-primary/20">
        <CardContent className="py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-foreground/80">Total balance</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {formatMoney(totalBalance, data.currency)}
              </p>
            </div>
            <CircularProgress value={spendRate} size={80}>
              <span className="text-base font-semibold">{Math.round(spendRate)}%</span>
              <span className="text-[10px] text-primary-foreground/80">of income</span>
            </CircularProgress>
          </div>
          <div className="mt-5 flex items-center gap-6 border-t border-white/15 pt-4">
            <div>
              <p className="text-xs text-primary-foreground/70">Income</p>
              <p className="font-semibold">{formatMoney(data.totalIncome, data.currency)}</p>
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70">Expenses</p>
              <p className="font-semibold">{formatMoney(data.totalExpenses, data.currency)}</p>
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70">Net</p>
              <p className="font-semibold">{formatMoney(data.net, data.currency)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="Stable" value={data.incomeByCategory.stable} currency={data.currency} />
        <MiniStat label="Gig" value={data.incomeByCategory.gig} currency={data.currency} />
        <MiniStat label="Product" value={data.incomeByCategory.product} currency={data.currency} />
      </div>

      {data.topCategories.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Top categories</h2>
          <div className="grid grid-cols-3 gap-3">
            {data.topCategories.map((cat) => {
              const { icon: Icon, bg, fg } = getCategoryStyle(cat.name);
              return (
                <div key={cat.name} className="flex flex-col items-center gap-1.5 text-center">
                  <div className={`flex size-12 items-center justify-center rounded-full ${bg}`}>
                    <Icon className={`size-6 ${fg}`} />
                  </div>
                  <p className="text-xs font-medium leading-tight">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(cat.amount, data.currency)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Card>
        <CardContent className="space-y-2 py-4">
          <h2 className="text-sm font-medium text-muted-foreground">Account balances</h2>
          {data.balances.length === 0 && (
            <p className="text-sm text-muted-foreground">No accounts yet.</p>
          )}
          {data.balances.map((account) => {
            const Icon = getAccountIcon(account.type);
            return (
              <div key={account.account_id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <span className="text-sm">{account.name}</span>
                </div>
                <span className="text-sm font-medium">
                  {formatMoney(account.balance, account.currency)}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({
  label,
  value,
  currency,
}: {
  label: string;
  value: number;
  currency: string;
}) {
  return (
    <Card>
      <CardContent className="py-3 text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-semibold">{formatMoney(value, currency)}</p>
      </CardContent>
    </Card>
  );
}
