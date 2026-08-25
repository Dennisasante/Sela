"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IncomeSource } from "@/lib/supabase/types";

const CATEGORIES = [
  { value: "stable", label: "Stable" },
  { value: "gig", label: "Gig" },
  { value: "product", label: "Product" },
];

export function IncomeFilters({
  sources,
  monthOffset,
  monthLabel,
  sourceId,
  category,
  search,
  minAmount,
  maxAmount,
}: {
  sources: IncomeSource[];
  monthOffset: number;
  monthLabel: string;
  sourceId?: string;
  category?: string;
  search?: string;
  minAmount?: string;
  maxAmount?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous month"
          onClick={() => updateParam("month", String(monthOffset - 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <p className="text-sm font-medium">{monthLabel}</p>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next month"
          onClick={() => updateParam("month", monthOffset < 0 ? String(monthOffset + 1) : null)}
          disabled={monthOffset >= 0}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
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
      <div className="relative">
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
    </div>
  );
}
