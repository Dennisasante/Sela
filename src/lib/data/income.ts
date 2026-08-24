import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type IncomeEntryRow = {
  id: string;
  amount: number;
  currency: string;
  date: string;
  description: string | null;
  sourceId: string | null;
  sourceName: string | null;
  projectId: string | null;
  projectTitle: string | null;
  accountName: string;
  isProductSale: boolean;
};

export async function getIncomeEntries(
  supabase: SupabaseClient<Database>,
  filters: { start: string; end: string; sourceId?: string; category?: string }
): Promise<IncomeEntryRow[]> {
  let query = supabase
    .from("income_entries")
    .select(
      "id, amount, currency, date, description, source_id, project_id, product_sale_id, income_sources(name, category), projects(title), accounts(name)"
    )
    .gte("date", filters.start)
    .lte("date", filters.end)
    .order("date", { ascending: false });

  if (filters.sourceId) {
    query = query.eq("source_id", filters.sourceId);
  }

  const { data } = await query;

  const filtered = filters.category
    ? (data ?? []).filter((row) => {
        const source = row.income_sources as unknown as { category?: string } | null;
        return source?.category === filters.category;
      })
    : (data ?? []);

  return filtered.map((row) => {
    const source = row.income_sources as unknown as { name?: string; category?: string } | null;
    const project = row.projects as unknown as { title?: string } | null;
    const account = row.accounts as unknown as { name?: string } | null;
    return {
      id: row.id,
      amount: row.amount,
      currency: row.currency,
      date: row.date,
      description: row.description,
      sourceId: row.source_id,
      sourceName: source?.name ?? null,
      projectId: row.project_id,
      projectTitle: project?.title ?? null,
      accountName: account?.name ?? "",
      isProductSale: !!row.product_sale_id,
    };
  });
}

export type ClientTotal = {
  sourceId: string;
  name: string;
  category: string;
  total: number;
  currency: string;
};

export async function getClientTotals(
  supabase: SupabaseClient<Database>,
  start: string,
  end: string
): Promise<ClientTotal[]> {
  const { data } = await supabase
    .from("income_entries")
    .select("amount, currency, source_id, income_sources(name, category)")
    .gte("date", start)
    .lte("date", end)
    .not("source_id", "is", null);

  const totals = new Map<string, ClientTotal>();
  for (const row of data ?? []) {
    if (!row.source_id) continue;
    const source = row.income_sources as unknown as { name?: string; category?: string } | null;
    const existing = totals.get(row.source_id);
    if (existing) {
      existing.total += row.amount;
    } else {
      totals.set(row.source_id, {
        sourceId: row.source_id,
        name: source?.name ?? "Unknown",
        category: source?.category ?? "gig",
        total: row.amount,
        currency: row.currency,
      });
    }
  }

  return Array.from(totals.values()).sort((a, b) => b.total - a.total);
}

export type ProjectBalance = {
  id: string;
  title: string;
  status: string;
  totalAmount: number;
  paidToDate: number;
  currency: string;
};

export async function getProjectBalances(
  supabase: SupabaseClient<Database>
): Promise<ProjectBalance[]> {
  const [{ data: projects }, { data: entries }] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("income_entries").select("amount, project_id").not("project_id", "is", null),
  ]);

  const paidByProject = new Map<string, number>();
  for (const row of entries ?? []) {
    if (!row.project_id) continue;
    paidByProject.set(row.project_id, (paidByProject.get(row.project_id) ?? 0) + row.amount);
  }

  return (projects ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    totalAmount: p.total_amount,
    paidToDate: paidByProject.get(p.id) ?? 0,
    currency: p.currency,
  }));
}
