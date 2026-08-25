"use client";

import { useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { X } from "lucide-react";
import { deleteThreshold } from "@/app/(app)/settings/actions";
import type { AlertThreshold } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";

const METRIC_LABELS: Record<string, string> = {
  total_spend: "Total spend",
  total_income: "Total income",
  category_spend: "Category spend",
};

export function ThresholdRow({
  threshold,
  categoryName,
}: {
  threshold: AlertThreshold;
  categoryName?: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteThreshold(threshold.id);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <div className="flex items-center justify-between py-2.5">
      <p className="text-sm">
        {METRIC_LABELS[threshold.metric]}
        {categoryName ? ` (${categoryName})` : ""} {threshold.direction} {threshold.threshold_amount}
      </p>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Remove alert"
        disabled={pending}
        onClick={handleDelete}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
