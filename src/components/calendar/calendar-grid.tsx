"use client";

import { useState } from "react";
import Link from "next/link";
import type { CalendarEvent, CalendarEventType } from "@/lib/data/calendar";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const TYPE_COLOR: Record<CalendarEventType, string> = {
  expected_income: "bg-success",
  bill: "bg-destructive",
  milestone: "bg-info",
  goal_target: "bg-primary",
};

const TYPE_LABEL: Record<CalendarEventType, string> = {
  expected_income: "Expected income",
  bill: "Bill due",
  milestone: "Project milestone",
  goal_target: "Goal target date",
};

function toISODateLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function CalendarGrid({
  year,
  month,
  events,
  todayISO,
}: {
  year: number;
  month: number;
  events: CalendarEvent[];
  todayISO: string;
}) {
  const [selected, setSelected] = useState<string | null>(
    events.some((e) => e.date === todayISO) ? todayISO : null
  );

  const eventsByDate = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const list = eventsByDate.get(e.date) ?? [];
    list.push(e);
    eventsByDate.set(e.date, list);
  }

  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();

  const cells: (Date | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedEvents = selected ? (eventsByDate.get(selected) ?? []) : [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const iso = toISODateLocal(date);
          const dayEvents = eventsByDate.get(iso) ?? [];
          const isToday = iso === todayISO;
          const isSelected = iso === selected;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => setSelected(iso === selected ? null : iso)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-xs transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : isToday
                    ? "bg-primary/10 font-medium text-primary"
                    : "hover:bg-muted"
              )}
            >
              <span>{date.getDate()}</span>
              {dayEvents.length > 0 && (
                <span className="flex gap-0.5">
                  {Array.from(new Set(dayEvents.map((e) => e.type)))
                    .slice(0, 3)
                    .map((type) => (
                      <span
                        key={type}
                        className={cn(
                          "size-1 rounded-full",
                          isSelected ? "bg-primary-foreground" : TYPE_COLOR[type]
                        )}
                      />
                    ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {selected ? (
          selectedEvents.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {new Date(selected).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                })}
              </p>
              {selectedEvents.map((e) => (
                <Link
                  key={e.id}
                  href={e.href}
                  className="flex items-center gap-3 rounded-lg border border-border/70 p-3"
                >
                  <span className={cn("size-2 shrink-0 rounded-full", TYPE_COLOR[e.type])} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{TYPE_LABEL[e.type]}</p>
                  </div>
                  <span className="text-sm font-medium">{formatMoney(e.amount, e.currency)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-2 text-center text-xs text-muted-foreground">
              Nothing on this day.
            </p>
          )
        ) : (
          <p className="py-2 text-center text-xs text-muted-foreground">
            Tap a day to see what&apos;s happening.
          </p>
        )}
      </div>
    </div>
  );
}
