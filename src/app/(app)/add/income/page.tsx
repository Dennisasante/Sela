import { createClient } from "@/lib/supabase/server";
import { AddIncomeForm } from "@/components/add/add-income-form";

export default async function AddIncomePage() {
  const supabase = await createClient();

  const [{ data: sources }, { data: projects }, { data: accounts }] = await Promise.all([
    supabase.from("income_sources").select("*").order("name"),
    supabase.from("projects").select("*").eq("status", "active").order("title"),
    supabase.from("accounts").select("*").eq("is_active", true).order("name"),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Add income</h1>
      <AddIncomeForm
        sources={sources ?? []}
        projects={projects ?? []}
        accounts={accounts ?? []}
      />
    </div>
  );
}
