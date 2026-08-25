"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DATE_RANGE_PRESETS } from "@/lib/date-range";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DateRangeFilter({
  range,
  from,
  to,
  label,
}: {
  range: string;
  from?: string;
  to?: string;
  label: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-2">
      <Select
        value={range}
        onValueChange={(v) =>
          updateParams({
            range: v === "this_month" ? null : v,
            from: v === "custom" ? (from ?? null) : null,
            to: v === "custom" ? (to ?? null) : null,
            month: null,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {() => DATE_RANGE_PRESETS.find((p) => p.value === range)?.label ?? label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {DATE_RANGE_PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {range === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            defaultValue={from ?? ""}
            onChange={(e) => updateParams({ from: e.target.value || null })}
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            defaultValue={to ?? ""}
            onChange={(e) => updateParams({ to: e.target.value || null })}
          />
        </div>
      )}
      {range !== "custom" && (
        <p className="text-center text-xs text-muted-foreground">{label}</p>
      )}
    </div>
  );
}
