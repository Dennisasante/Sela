import { toISODate } from "@/lib/format";

export const DATE_RANGE_PRESETS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
  { value: "last_7", label: "Last 7 days" },
  { value: "last_30", label: "Last 30 days" },
  { value: "last_90", label: "Last 90 days" },
  { value: "this_year", label: "This year" },
  { value: "custom", label: "Custom range" },
] as const;

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number]["value"];

const MIN_DATE = "2000-01-01";

export function resolveDateRange(
  preset: string | undefined,
  from?: string,
  to?: string
): { start: string; end: string; label: string } {
  const now = new Date();
  const today = toISODate(now);

  switch (preset) {
    case "all":
      return { start: MIN_DATE, end: today, label: "All time" };
    case "today":
      return { start: today, end: today, label: "Today" };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const iso = toISODate(y);
      return { start: iso, end: iso, label: "Yesterday" };
    }
    case "this_week": {
      const start = new Date(now);
      start.setDate(start.getDate() - start.getDay());
      return { start: toISODate(start), end: today, label: "This week" };
    }
    case "last_7": {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      return { start: toISODate(start), end: today, label: "Last 7 days" };
    }
    case "last_30": {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      return { start: toISODate(start), end: today, label: "Last 30 days" };
    }
    case "last_90": {
      const start = new Date(now);
      start.setDate(start.getDate() - 89);
      return { start: toISODate(start), end: today, label: "Last 90 days" };
    }
    case "this_year": {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start: toISODate(start), end: today, label: "This year" };
    }
    case "custom":
      if (from && to) {
        return { start: from, end: to, label: `${from} – ${to}` };
      }
      // Fall through to this_month if custom is selected without dates yet.
      return resolveDateRange("this_month");
    case "this_month":
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const label = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
        start
      );
      return { start: toISODate(start), end: toISODate(end), label };
    }
  }
}
