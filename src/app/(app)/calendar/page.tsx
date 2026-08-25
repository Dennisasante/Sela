import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCalendarEvents } from "@/lib/data/calendar";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { toISODate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const monthOffset = month ? parseInt(month, 10) || 0 : 0;

  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = target.getFullYear();
  const monthIndex = target.getMonth();
  const start = toISODate(new Date(year, monthIndex, 1));
  const end = toISODate(new Date(year, monthIndex + 1, 0));
  const label = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(target);

  const supabase = await createClient();
  const events = await getCalendarEvents(supabase, start, end);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Financial calendar</h1>

      <div className="flex items-center justify-between">
        <Link
          href={`/calendar?month=${monthOffset - 1}`}
          aria-label="Previous month"
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
        </Link>
        <p className="text-sm font-medium">{label}</p>
        <Link
          href={`/calendar?month=${monthOffset + 1}`}
          aria-label="Next month"
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <Card>
        <CardContent className="py-4">
          <CalendarGrid
            year={year}
            month={monthIndex}
            events={events}
            todayISO={toISODate(now)}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-success" /> Expected income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-destructive" /> Bill due
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-info" /> Project milestone
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" /> Goal target
        </span>
      </div>
    </div>
  );
}
