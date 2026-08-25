import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type SearchResultType =
  | "income"
  | "expense"
  | "account"
  | "client"
  | "project"
  | "category"
  | "bill"
  | "goal";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string | null;
  amount: number | null;
  currency: string | null;
  href: string;
};

const TYPE_LABEL: Record<SearchResultType, string> = {
  income: "Income",
  expense: "Expense",
  account: "Account",
  client: "Client",
  project: "Project",
  category: "Category",
  bill: "Bill",
  goal: "Goal",
};

export { TYPE_LABEL };

export async function getSearchResults(
  supabase: SupabaseClient<Database>,
  query: string
): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  // Commas/parens are PostgREST .or() filter syntax delimiters — strip them so
  // an unusual search term can't malform the multi-column OR filters below.
  const safeQ = q.replace(/[,()]/g, " ").trim();
  if (safeQ.length < 2) return [];
  const like = `%${safeQ}%`;

  const [
    { data: incomeEntries },
    { data: expenses },
    { data: accounts },
    { data: sources },
    { data: projects },
    { data: categories },
    { data: bills },
    { data: goals },
  ] = await Promise.all([
    supabase
      .from("income_entries")
      .select("id, amount, currency, date, description, income_sources(name)")
      .ilike("description", like)
      .limit(5),
    supabase
      .from("expenses")
      .select("id, amount, currency, date, description, payee")
      .or(`description.ilike.${like},payee.ilike.${like}`)
      .limit(5),
    supabase.from("accounts").select("id, name, currency").ilike("name", like).limit(5),
    supabase
      .from("income_sources")
      .select("id, name, company")
      .or(`name.ilike.${like},company.ilike.${like}`)
      .limit(5),
    supabase.from("projects").select("id, title, total_amount, currency").ilike("title", like).limit(5),
    supabase.from("expense_categories").select("id, name").ilike("name", like).limit(5),
    supabase.from("bills").select("id, payee, amount, currency").ilike("payee", like).limit(5),
    supabase
      .from("savings_goals")
      .select("id, name, target_amount")
      .ilike("name", like)
      .limit(5),
  ]);

  const results: SearchResult[] = [];

  for (const r of incomeEntries ?? []) {
    const source = r.income_sources as unknown as { name?: string } | null;
    results.push({
      id: r.id,
      type: "income",
      title: r.description ?? source?.name ?? "Income",
      subtitle: r.date,
      amount: r.amount,
      currency: r.currency,
      href: "/income",
    });
  }

  for (const r of expenses ?? []) {
    results.push({
      id: r.id,
      type: "expense",
      title: r.description ?? r.payee ?? "Expense",
      subtitle: r.date,
      amount: r.amount,
      currency: r.currency,
      href: "/expenses",
    });
  }

  for (const r of accounts ?? []) {
    results.push({
      id: r.id,
      type: "account",
      title: r.name,
      subtitle: null,
      amount: null,
      currency: null,
      href: "/accounts",
    });
  }

  for (const r of sources ?? []) {
    results.push({
      id: r.id,
      type: "client",
      title: r.name,
      subtitle: r.company,
      amount: null,
      currency: null,
      href: "/income?tab=clients",
    });
  }

  for (const r of projects ?? []) {
    results.push({
      id: r.id,
      type: "project",
      title: r.title,
      subtitle: null,
      amount: r.total_amount,
      currency: r.currency,
      href: "/income?tab=projects",
    });
  }

  for (const r of categories ?? []) {
    results.push({
      id: r.id,
      type: "category",
      title: r.name,
      subtitle: null,
      amount: null,
      currency: null,
      href: "/expenses",
    });
  }

  for (const r of bills ?? []) {
    results.push({
      id: r.id,
      type: "bill",
      title: r.payee,
      subtitle: null,
      amount: r.amount,
      currency: r.currency,
      href: "/expenses?tab=bills",
    });
  }

  for (const r of goals ?? []) {
    results.push({
      id: r.id,
      type: "goal",
      title: r.name,
      subtitle: null,
      amount: r.target_amount,
      currency: "GHS",
      href: "/savings",
    });
  }

  return results;
}
