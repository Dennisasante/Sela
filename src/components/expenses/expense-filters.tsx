"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import type { Account, ExpenseCategory } from "@/lib/supabase/types";

export function ExpenseFilters({
  categories,
  accounts,
  range,
  from,
  to,
  rangeLabel,
  categoryId,
  accountId,
  search,
  minAmount,
  maxAmount,
}: {
  categories: ExpenseCategory[];
  accounts: Account[];
  range: string;
  from?: string;
  to?: string;
  rangeLabel: string;
  categoryId?: string;
  accountId?: string;
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
      <DateRangeFilter range={range} from={from} to={to} label={rangeLabel} />
      <div className="flex gap-2">
        <Select value={categoryId ?? "all"} onValueChange={(v) => updateParam("category", v)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string | null) =>
                value && value !== "all"
                  ? (categories.find((c) => c.id === value)?.name ?? "All categories")
                  : "All categories"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={accountId ?? "all"} onValueChange={(v) => updateParam("account", v)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string | null) =>
                value && value !== "all"
                  ? (accounts.find((a) => a.id === value)?.name ?? "All accounts")
                  : "All accounts"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={search ?? ""}
          placeholder="Search payee or description"
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
