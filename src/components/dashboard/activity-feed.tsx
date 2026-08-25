"use client";

import { useState } from "react";
import type { ActivityEntry } from "@/lib/data/dashboard";
import { formatMoney, formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ActivityFeed({
  today,
  week,
  currency,
}: {
  today: ActivityEntry[];
  week: ActivityEntry[];
  currency: string;
}) {
  const [range, setRange] = useState<"today" | "week">("today");
  const entries = range === "today" ? today : week;

  const income = entries.filter((e) => e.type === "income").reduce((sum, e) => sum + e.amount, 0);
  const expenses = entries.filter((e) => e.type === "expense").reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Recent activity</h2>
        <div className="flex gap-1 rounded-lg bg-muted p-0.5">
          {(["today", "week"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                range === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {r === "today" ? "Today" : "This week"}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="space-y-3 py-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="text-sm font-semibold text-success">
                +{formatMoney(income, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expenses</p>
              <p className="text-sm font-semibold text-destructive">
                -{formatMoney(expenses, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net</p>
              <p className="text-sm font-semibold">
                {formatMoney(income - expenses, currency)}
              </p>
            </div>
          </div>

          {entries.length === 0 ? (
            <p className="py-2 text-center text-sm text-muted-foreground">
              No activity {range === "today" ? "today" : "this week"} yet.
            </p>
          ) : (
            <div className="divide-y">
              {entries.map((entry) => (
                <div key={`${entry.type}-${entry.id}`} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm">{entry.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      entry.type === "income" ? "text-success" : "text-destructive"
                    )}
                  >
                    {entry.type === "income" ? "+" : "-"}
                    {formatMoney(entry.amount, entry.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
