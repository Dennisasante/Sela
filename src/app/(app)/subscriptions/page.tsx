import { createClient } from "@/lib/supabase/server";
import { getSubscriptions } from "@/lib/data/subscriptions";
import { formatMoney } from "@/lib/format";
import { SubscriptionCard } from "@/components/subscriptions/subscription-card";
import { SubscriptionFormDialog } from "@/components/subscriptions/subscription-form-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Repeat, Plus } from "lucide-react";

export default async function SubscriptionsPage() {
  const supabase = await createClient();

  const [{ subscriptions, summary }, { data: categories }, { data: accounts }] = await Promise.all([
    getSubscriptions(supabase),
    supabase.from("expense_categories").select("*").is("archived_at", null).order("name"),
    supabase.from("accounts").select("*").eq("is_active", true).order("name"),
  ]);

  const currency = subscriptions[0]?.bill.currency ?? "GHS";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Subscriptions</h1>
        <SubscriptionFormDialog
          categories={categories ?? []}
          accounts={accounts ?? []}
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Add
            </Button>
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-xs text-muted-foreground">Monthly cost</p>
            <p className="mt-1 text-lg font-semibold">
              {formatMoney(summary.monthlyCost, currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-xs text-muted-foreground">Annual cost</p>
            <p className="mt-1 text-lg font-semibold">
              {formatMoney(summary.annualCost, currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      {subscriptions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted">
            <Repeat className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No subscriptions tracked yet</p>
          <p className="max-w-[24rem] text-xs text-muted-foreground">
            Add the things you pay for on repeat — hosting, streaming, tools — so Sela can show
            you what they really cost over a year.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map((row) => (
            <SubscriptionCard
              key={row.bill.id}
              row={row}
              categories={categories ?? []}
              accounts={accounts ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
