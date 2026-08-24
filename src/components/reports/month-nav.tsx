"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MonthNav({ monthOffset, monthLabel }: { monthOffset: number; monthLabel: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function go(offset: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (offset === 0) params.delete("month");
    else params.set("month", String(offset));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => go(monthOffset - 1)}>
        <ChevronLeft className="size-4" />
      </Button>
      <p className="text-sm font-medium">{monthLabel}</p>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Next month"
        onClick={() => go(monthOffset < 0 ? monthOffset + 1 : 0)}
        disabled={monthOffset >= 0}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
