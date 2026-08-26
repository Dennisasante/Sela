"use client";

import { useState } from "react";
import { Mail, Phone, Building2, Pencil } from "lucide-react";
import { formatMoney, formatDate } from "@/lib/format";
import { SourceFormDialog } from "@/components/clients/source-form-dialog";
import { getIncomeCategoryColor, getIncomeCategoryLabel } from "@/lib/income-category-style";
import type { ClientOverview } from "@/lib/data/income";
import type { Account, IncomeSource, RecurringIncome } from "@/lib/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ClientCard({
  client,
  source,
  recurringIncome,
  accounts = [],
  monthTotal,
}: {
  client: ClientOverview;
  source: IncomeSource;
  recurringIncome?: RecurringIncome | null;
  accounts?: Account[];
  monthTotal: number;
}) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <Card>
      <CardContent className="space-y-2.5 py-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{client.name}</p>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `${getIncomeCategoryColor(client.category)}1a`,
                  color: getIncomeCategoryColor(client.category),
                }}
              >
                {getIncomeCategoryLabel(client.category)}
              </span>
            </div>
            {client.company && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="size-3" />
                {client.company}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" aria-label="Edit client" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
          </Button>
        </div>

        {(client.phone || client.email) && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {client.phone && (
              <span className="flex items-center gap-1">
                <Phone className="size-3" />
                {client.phone}
              </span>
            )}
            {client.email && (
              <span className="flex items-center gap-1">
                <Mail className="size-3" />
                {client.email}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between rounded-md bg-muted/60 p-2.5">
          <span className="text-xs text-muted-foreground">This month</span>
          <span className="text-sm font-semibold">{formatMoney(monthTotal, client.currency)}</span>
        </div>

        {client.projectCount > 0 && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-muted-foreground">Billed</p>
              <p className="font-semibold">{formatMoney(client.totalBilled, client.currency)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Received</p>
              <p className="font-semibold">
                {formatMoney(client.totalReceivedOnProjects, client.currency)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Outstanding</p>
              <p className="font-semibold text-destructive">
                {formatMoney(client.outstanding, client.currency)}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {client.projectCount} project{client.projectCount === 1 ? "" : "s"}
          </span>
          {client.lastPaymentDate && <span>Last paid {formatDate(client.lastPaymentDate)}</span>}
        </div>
      </CardContent>

      <SourceFormDialog
        source={source}
        recurringIncome={recurringIncome}
        accounts={accounts}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </Card>
  );
}
