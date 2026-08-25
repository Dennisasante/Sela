import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData, getRecentActivity } from "@/lib/data/dashboard";
import { getActiveAlerts } from "@/lib/data/notifications";
import { formatMoney, formatDate } from "@/lib/format";
import { getCategoryStyle } from "@/lib/category-style";
import { getAccountIcon } from "@/lib/account-style";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { NeedsAttentionCard } from "@/components/dashboard/needs-attention-card";
import { GuardianInsightCard } from "@/components/dashboard/guardian-insight-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { EmptyState } from "@/components/ui/empty-state";
import { getDisplayName } from "@/lib/user";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, ShieldCheck, Wallet } from "lucide-react";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [data, alerts, todayActivity, weekActivity] = await Promise.all([
    getDashboardData(supabase),
    getActiveAlerts(supabase),
    getRecentActivity(supabase, "today"),
    getRecentActivity(supabase, "week"),
  ]);

  const monthLabelText = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
    new Date()
  );
  const greeting = greetingForHour(new Date().getHours());
  const name = getDisplayName(user);

  const balanceUp = data.balanceChangeThisMonth >= 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">
          {greeting}, {name} 👋
        </h1>
        <p className="text-sm text-muted-foreground">{monthLabelText}</p>
      </div>

      {data.alerts.map((alert, i) => (
        <Alert key={i} variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Threshold crossed</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}

      <Card className="overflow-hidden border-none bg-gradient-to-br from-brand via-brand to-brand/85 text-brand-foreground shadow-lg shadow-brand/20">
        <CardContent className="py-5">
          <p className="text-sm text-brand-foreground/80">Total balance</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">
            {formatMoney(data.availableNow, data.currency)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-brand-foreground/80">
            {balanceUp ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {formatMoney(Math.abs(data.balanceChangeThisMonth), data.currency)} this month
          </p>

          <div className="mt-5 border-t border-white/15 pt-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-brand-foreground/90">
              <ShieldCheck className="size-3.5" />
              You&apos;re protected
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-brand-foreground/70">Expected</p>
                <p className="text-sm font-semibold">
                  {formatMoney(data.expectedThisMonth, data.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-brand-foreground/70">Committed</p>
                <p className="text-sm font-semibold">
                  {formatMoney(data.committedToPay, data.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-brand-foreground/70">Safe to spend</p>
                <p className="text-sm font-semibold">
                  {formatMoney(data.safeToSpend, data.currency)}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-snug text-brand-foreground/60">
            Safe to spend = available now, minus bills you owe
            {data.plannedSavings > 0 ? ", planned savings/tithe set-asides" : ""}
            {data.minimumReserve > 0 ? ", and your minimum reserve" : ""}.
          </p>
        </CardContent>
      </Card>

      <GuardianInsightCard insight={data.guardianInsight} />

      <NeedsAttentionCard alerts={alerts} />

      <Card>
        <CardContent className="space-y-3 py-4">
          <h2 className="text-sm font-medium text-muted-foreground">Monthly snapshot</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <SnapshotItem label="Income" value={data.totalIncome} currency={data.currency} tone="success" />
            <SnapshotItem label="Expenses" value={data.totalExpenses} currency={data.currency} tone="destructive" />
            <SnapshotItem label="Net" value={data.net} currency={data.currency} />
            <SnapshotItem label="Expected income" value={data.expectedThisMonth} currency={data.currency} />
            <SnapshotItem
              label="Upcoming payments"
              value={data.upcomingPaymentsThisMonth}
              currency={data.currency}
            />
            <SnapshotItem label="Savings" value={data.savingsThisMonth} currency={data.currency} />
          </div>
          {data.budgetUsagePct !== null && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Budget usage</span>
                <span className="font-medium">{Math.round(data.budgetUsagePct)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    data.budgetUsagePct > 100 ? "bg-destructive" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(100, data.budgetUsagePct)}%` }}
                />
              </div>
            </div>
          )}
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

      {data.topGoals.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Financial goals</h2>
            <Link href="/savings" className="text-xs font-medium text-primary">
              See all
            </Link>
          </div>
          <div className="space-y-2">
            {data.topGoals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="space-y-2 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-muted-foreground">{Math.round(goal.progressPct)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${goal.progressPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {formatMoney(goal.currentAmount, goal.currency)} of{" "}
                      {formatMoney(goal.targetAmount, goal.currency)}
                    </span>
                    {goal.targetDate && <span>Target {formatDate(goal.targetDate)}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <ActivityFeed today={todayActivity} week={weekActivity} currency={data.currency} />

      <Card>
        <CardContent className="space-y-2 py-4">
          <h2 className="text-sm font-medium text-muted-foreground">Account balances</h2>
          {data.balances.length === 0 && (
            <EmptyState
              icon={Wallet}
              title="No accounts yet"
              description="Add your first wallet — mobile money, bank, or cash — to start tracking balances."
              actionHref="/accounts"
              actionLabel="Add account"
            />
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
                <span className={`text-sm font-medium ${account.balance < 0 ? "text-destructive" : ""}`}>
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

function SnapshotItem({
  label,
  value,
  currency,
  tone,
}: {
  label: string;
  value: number;
  currency: string;
  tone?: "success" | "destructive";
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-sm font-semibold ${
          tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : ""
        }`}
      >
        {formatMoney(value, currency)}
      </p>
    </div>
  );
}
