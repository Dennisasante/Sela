import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toISODate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Row = {
  date: string;
  type: "income" | "expense" | "transfer";
  description: string;
  category: string;
  amount: number;
  currency: string;
};

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsv(rows: Row[]) {
  const header = ["Date", "Type", "Description", "Category", "Amount", "Currency"];
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.date,
        row.type,
        csvEscape(row.description),
        csvEscape(row.category),
        row.amount.toFixed(2),
        row.currency,
      ].join(",")
    );
  }
  return lines.join("\n");
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? "2000-01-01";
  const to = url.searchParams.get("to") ?? toISODate(new Date());

  const [{ data: income }, { data: expenses }, { data: transfers }] = await Promise.all([
    supabase
      .from("income_entries")
      .select("date, amount, currency, description, income_sources(name)")
      .gte("date", from)
      .lte("date", to),
    supabase
      .from("expenses")
      .select("date, amount, currency, description, payee, expense_categories(name)")
      .gte("date", from)
      .lte("date", to),
    supabase
      .from("transfers")
      .select("date, amount, currency, description")
      .gte("date", from)
      .lte("date", to),
  ]);

  const rows: Row[] = [];

  for (const r of income ?? []) {
    const source = r.income_sources as unknown as { name?: string } | null;
    rows.push({
      date: r.date,
      type: "income",
      description: r.description ?? source?.name ?? "",
      category: source?.name ?? "",
      amount: r.amount,
      currency: r.currency,
    });
  }

  for (const r of expenses ?? []) {
    const category = r.expense_categories as unknown as { name?: string } | null;
    rows.push({
      date: r.date,
      type: "expense",
      description: r.description ?? r.payee ?? "",
      category: category?.name ?? "",
      amount: r.amount,
      currency: r.currency,
    });
  }

  for (const r of transfers ?? []) {
    rows.push({
      date: r.date,
      type: "transfer",
      description: r.description ?? "",
      category: "",
      amount: r.amount,
      currency: r.currency,
    });
  }

  rows.sort((a, b) => (a.date < b.date ? -1 : 1));

  const csv = toCsv(rows);
  const filename = `sela-export-${from}-to-${to}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
