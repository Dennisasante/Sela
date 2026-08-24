export function formatMoney(amount: number, currency = "GHS") {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  }).format(amount);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function currentMonthRange(): { start: string; end: string } {
  return monthRangeForOffset(0);
}

export function monthRangeForOffset(offset: number): {
  start: string;
  end: string;
  label: string;
} {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  const label = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(start);
  return { start: toISODate(start), end: toISODate(end), label };
}

export function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}
