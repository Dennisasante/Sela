import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CategoryManager } from "@/components/settings/category-manager";
import { SourceManager } from "@/components/settings/source-manager";
import { ThresholdFormDialog } from "@/components/settings/threshold-form-dialog";
import { ThresholdRow } from "@/components/settings/threshold-row";
import { MinimumReserveForm } from "@/components/settings/minimum-reserve-form";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { PushSubscribeToggle } from "@/components/notifications/push-subscribe-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, HelpCircle, User } from "lucide-react";

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
    <div className="space-y-6">
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
        <h2 className="text-sm font-medium text-muted-foreground">Notifications</h2>
        <Card>
          <CardContent className="py-4">
            <PushSubscribeToggle />
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
        <h2 className="text-sm font-medium text-muted-foreground">Financial safety</h2>
        <Card>
          <CardContent className="py-4">
            <MinimumReserveForm minimumReserve={minimumReserve} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Appearance</h2>
        <Card>
          <CardContent className="py-4">
            <ThemeToggle />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Currency</h2>
        <Card>
          <CardContent className="py-4 text-sm">
            Ghana Cedis (₵ GHS) — the default currency for all accounts.
          </CardContent>
        </Card>
      </section>

      <p className="pb-2 text-center text-xs text-muted-foreground">
        Sela — a product of Ratel Systems
      </p>
    </div>
  );
}
