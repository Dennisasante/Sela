"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import type { IncomeSource } from "@/lib/supabase/types";

const CATEGORIES = [
  { value: "stable", label: "Stable" },
  { value: "gig", label: "Gig" },
  { value: "product", label: "Product" },
];

export function IncomeFilters({
  sources,
  range,
  from,
  to,
  rangeLabel,
  sourceId,
  category,
  search,
  minAmount,
  maxAmount,
}: {
  sources: IncomeSource[];
  range: string;
  from?: string;
  to?: string;
  rangeLabel: string;
  sourceId?: string;
  category?: string;
  search?: string;
  minAmount?: string;
  maxAmount?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showMore, setShowMore] = useState(!!(minAmount || maxAmount));

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-2">
      <DateRangeFilter range={range} from={from} to={to} label={rangeLabel} />
      <div className="flex gap-2">
        <Select value={sourceId ?? "all"} onValueChange={(v) => updateParam("source", v)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string | null) =>
                value && value !== "all"
                  ? (sources.find((s) => s.id === value)?.name ?? "All sources")
                  : "All sources"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {sources.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category ?? "all"} onValueChange={(v) => updateParam("category", v)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string | null) =>
                value && value !== "all"
                  ? (CATEGORIES.find((c) => c.value === value)?.label ?? "All categories")
                  : "All categories"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            defaultValue={search ?? ""}
            placeholder="Search description"
            className="pl-8"
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParam("search", e.currentTarget.value || null);
            }}
            onBlur={(e) => updateParam("search", e.currentTarget.value || null)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="More filters"
          onClick={() => setShowMore((v) => !v)}
          className={showMore ? "border-primary text-primary" : undefined}
        >
          <SlidersHorizontal className="size-4" />
        </Button>
      </div>
      {showMore && (
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.01"
            defaultValue={minAmount ?? ""}
            placeholder="Min amount"
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParam("min", e.currentTarget.value || null);
            }}
            onBlur={(e) => updateParam("min", e.currentTarget.value || null)}
          />
          <Input
            type="number"
            step="0.01"
            defaultValue={maxAmount ?? ""}
            placeholder="Max amount"
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParam("max", e.currentTarget.value || null);
            }}
            onBlur={(e) => updateParam("max", e.currentTarget.value || null)}
          />
        </div>
      )}
    </div>
  );
}
