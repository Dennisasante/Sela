import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ProjectMilestone } from "@/lib/supabase/types";

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
  description: string | null;
  status: string;
  totalAmount: number;
  paidToDate: number;
  projectExpenses: number;
  netReceived: number;
  currency: string;
};

export async function getProjectBalances(
  supabase: SupabaseClient<Database>
): Promise<ProjectBalance[]> {
  const [{ data: projects }, { data: entries }, { data: expenses }] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("income_entries").select("amount, project_id").not("project_id", "is", null),
    supabase.from("expenses").select("amount, project_id").not("project_id", "is", null),
  ]);

  const paidByProject = new Map<string, number>();
  for (const row of entries ?? []) {
    if (!row.project_id) continue;
    paidByProject.set(row.project_id, (paidByProject.get(row.project_id) ?? 0) + row.amount);
  }

  const expensesByProject = new Map<string, number>();
  for (const row of expenses ?? []) {
    if (!row.project_id) continue;
    expensesByProject.set(row.project_id, (expensesByProject.get(row.project_id) ?? 0) + row.amount);
  }

  return (projects ?? []).map((p) => {
    const paidToDate = paidByProject.get(p.id) ?? 0;
    const projectExpenses = expensesByProject.get(p.id) ?? 0;
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      totalAmount: p.total_amount,
      paidToDate,
      projectExpenses,
      netReceived: paidToDate - projectExpenses,
      currency: p.currency,
    };
  });
}

export type ClientOverview = {
  sourceId: string;
  name: string;
  category: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  projectCount: number;
  totalBilled: number;
  totalReceivedOnProjects: number;
  outstanding: number;
  lifetimeReceived: number;
  lastPaymentDate: string | null;
  currency: string;
};

export async function getClientOverviews(
  supabase: SupabaseClient<Database>
): Promise<ClientOverview[]> {
  const [{ data: sources }, { data: projects }, { data: entries }] = await Promise.all([
    supabase.from("income_sources").select("*").order("name"),
    supabase.from("projects").select("id, source_id, total_amount"),
    supabase
      .from("income_entries")
      .select("amount, currency, date, source_id, project_id")
      .not("source_id", "is", null),
  ]);

  const projectsBySource = new Map<string, { id: string; total_amount: number }[]>();
  for (const p of projects ?? []) {
    if (!p.source_id) continue;
    const list = projectsBySource.get(p.source_id) ?? [];
    list.push({ id: p.id, total_amount: p.total_amount });
    projectsBySource.set(p.source_id, list);
  }

  const receivedByProject = new Map<string, number>();
  const lifetimeBySource = new Map<string, number>();
  const lastPaymentBySource = new Map<string, string>();
  let anyCurrency = "GHS";

  for (const e of entries ?? []) {
    anyCurrency = e.currency;
    if (e.project_id) {
      receivedByProject.set(e.project_id, (receivedByProject.get(e.project_id) ?? 0) + e.amount);
    }
    if (e.source_id) {
      lifetimeBySource.set(e.source_id, (lifetimeBySource.get(e.source_id) ?? 0) + e.amount);
      const prevDate = lastPaymentBySource.get(e.source_id);
      if (!prevDate || e.date > prevDate) lastPaymentBySource.set(e.source_id, e.date);
    }
  }

  return (sources ?? []).map((s) => {
    const sourceProjects = projectsBySource.get(s.id) ?? [];
    const totalBilled = sourceProjects.reduce((sum, p) => sum + p.total_amount, 0);
    const totalReceivedOnProjects = sourceProjects.reduce(
      (sum, p) => sum + (receivedByProject.get(p.id) ?? 0),
      0
    );

    return {
      sourceId: s.id,
      name: s.name,
      category: s.category,
      company: s.company,
      phone: s.phone,
      email: s.email,
      projectCount: sourceProjects.length,
      totalBilled,
      totalReceivedOnProjects,
      outstanding: totalBilled - totalReceivedOnProjects,
      lifetimeReceived: lifetimeBySource.get(s.id) ?? 0,
      lastPaymentDate: lastPaymentBySource.get(s.id) ?? null,
      currency: anyCurrency,
    };
  });
}

export async function getMilestonesByProject(
  supabase: SupabaseClient<Database>
): Promise<Map<string, ProjectMilestone[]>> {
  const { data } = await supabase
    .from("project_milestones")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false });

  const byProject = new Map<string, ProjectMilestone[]>();
  for (const m of data ?? []) {
    const list = byProject.get(m.project_id) ?? [];
    list.push(m);
    byProject.set(m.project_id, list);
  }
  return byProject;
}
