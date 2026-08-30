"use client";

import { useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { MoreVertical, Briefcase } from "lucide-react";
import { deleteIncomeEntry } from "@/app/(app)/income/actions";
import { formatMoney, formatDate } from "@/lib/format";
import type { IncomeEntryRow as Row } from "@/lib/data/income";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function IncomeEntryRow({ entry }: { entry: Row }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteIncomeEntry(entry.id);
        toast.success("Income entry deleted");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  const title = entry.sourceName ?? entry.description ?? "One-off income";

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Briefcase className="size-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {formatDate(entry.date)}
            {entry.projectTitle ? ` · ${entry.projectTitle}` : ""} · {entry.accountName}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <p className="text-sm font-semibold tabular-nums text-success">
          +{formatMoney(entry.amount, entry.currency)}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" aria-label="Entry actions">
                <MoreVertical className="size-4" />
              </Button>}
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive" disabled={pending} onClick={handleDelete}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
