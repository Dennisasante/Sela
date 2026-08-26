import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CategoryManager } from "@/components/settings/category-manager";
import { SourceManager } from "@/components/settings/source-manager";
import { ThresholdFormDialog } from "@/components/settings/threshold-form-dialog";
import { ThresholdRow } from "@/components/settings/threshold-row";
import { MinimumReserveForm } from "@/components/settings/minimum-reserve-form";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { PushSubscribeToggle } from "@/components/notifications/push-subscribe-toggle";
import { InstallPrompt } from "@/components/settings/install-prompt";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { ChangeEmailForm } from "@/components/settings/change-email-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { toISODate } from "@/lib/format";
import { Plus, ChevronRight, HelpCircle, User, Download } from "lucide-react";

const EXPORT_RANGES = [
  { label: "This month", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "This year", days: 365 },
  { label: "All time", days: null },
];

export default async function SettingsPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: thresholds }, { data: sources }, { data: { user } }] =
    await Promise.all([
      supabase.from("expense_categories").select("*").order("name"),
      supabase.from("alert_thresholds").select("*, expense_categories(name)").order("created_at"),
      supabase.from("income_sources").select("*").order("name"),
      supabase.auth.getUser(),
    ]);
  const minimumReserve = Number(user?.user_metadata?.minimum_reserve ?? 0) || 0;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Account</h2>
        <Card>
          <CardContent className="divide-y py-0">
            <Link
              href="/profile"
              className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
            >
              <span className="flex items-center gap-2 text-sm">
                <User className="size-4 text-muted-foreground" />
                Profile
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
            <Link
              href="/guide"
              className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
            >
              <span className="flex items-center gap-2 text-sm">
                <HelpCircle className="size-4 text-muted-foreground" />
                User guide
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
            <Link
              href="/help"
              className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
            >
              <span className="flex items-center gap-2 text-sm">
                <HelpCircle className="size-4 text-muted-foreground" />
                Help &amp; support
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Preferences</h2>
        <Card>
          <CardContent className="divide-y py-0">
            <div className="py-4 first:pt-4">
              <PushSubscribeToggle />
            </div>
            <div className="py-4">
              <InstallPrompt />
            </div>
            <div className="py-4">
              <ThemeToggle />
            </div>
            <div className="py-4 text-sm last:pb-4">
              Ghana Cedis (₵ GHS) — the default currency for all accounts.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Clients & income sources</h2>
        <Card>
          <CardContent className="py-4">
            <SourceManager sources={sources ?? []} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Expense categories</h2>
        <Card>
          <CardContent className="py-4">
            <CategoryManager categories={categories ?? []} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Spending alerts</h2>
          <ThresholdFormDialog
            categories={categories ?? []}
            trigger={
              <Button size="sm">
                <Plus className="size-4" />
                Add
              </Button>
            }
          />
        </div>
        <Card>
          <CardContent className="divide-y py-0">
            {(thresholds ?? []).length === 0 && (
              <p className="py-4 text-sm text-muted-foreground">No alerts set up yet.</p>
            )}
            {(thresholds ?? []).map((t) => {
              const category = t.expense_categories as unknown as { name?: string } | null;
              return (
                <ThresholdRow key={t.id} threshold={t} categoryName={category?.name} />
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Data export</h2>
        <Card>
          <CardContent className="space-y-2 py-4">
            <p className="text-sm text-muted-foreground">
              Download your income, expenses, and transfers as a CSV file.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {EXPORT_RANGES.map((r) => {
                const to = toISODate(new Date());
                const from = r.days
                  ? toISODate(new Date(Date.now() - r.days * 24 * 60 * 60 * 1000))
                  : "2000-01-01";
                return (
                  <a
                    key={r.label}
                    href={`/api/export/csv?from=${from}&to=${to}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
                  >
                    <Download className="size-3.5" />
                    {r.label}
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Security</h2>
        <Card>
          <CardContent className="space-y-5 py-4">
            <ChangeEmailForm currentEmail={user?.email ?? ""} />
            <div className="border-t pt-4">
              <ChangePasswordForm />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Financial safety</h2>
        <Card>
          <CardContent className="py-4">
            <MinimumReserveForm minimumReserve={minimumReserve} />
          </CardContent>
        </Card>
      </section>

      <p className="pb-2 text-center text-xs text-muted-foreground">
        Sela — a product of Ratel Systems
      </p>
    </div>
  );
}
