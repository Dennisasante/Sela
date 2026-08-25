"use client";

import { useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { X, Plus } from "lucide-react";
import { deleteIncomeSource } from "@/app/(app)/settings/actions";
import { SourceFormDialog } from "@/components/clients/source-form-dialog";
import type { IncomeSource } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CATEGORY_LABEL: Record<string, string> = {
  stable: "Stable",
  gig: "Gig",
  product: "Product",
};

export function SourceManager({ sources }: { sources: IncomeSource[] }) {
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteIncomeSource(id);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {sources.length === 0 && (
          <p className="text-sm text-muted-foreground">No clients/sources yet.</p>
        )}
        {sources.map((s) => (
          <Badge key={s.id} variant="secondary" className="gap-1 py-1 pl-2.5 pr-1.5">
            {s.name}
            <span className="text-[10px] uppercase text-muted-foreground">
              {CATEGORY_LABEL[s.category]}
            </span>
            <button
              type="button"
              aria-label={`Remove ${s.name}`}
              disabled={pending}
              onClick={() => handleDelete(s.id)}
              className="rounded-full p-0.5 hover:bg-foreground/10"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <SourceFormDialog
        trigger={
          <Button size="sm" variant="outline">
            <Plus className="size-4" />
            Add source
          </Button>
        }
      />
    </div>
  );
}
