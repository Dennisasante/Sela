import { createClient } from "@/lib/supabase/server";
import { AddExpenseForm } from "@/components/add/add-expense-form";

export default async function AddExpensePage() {
  const supabase = await createClient();

  const [{ data: accounts }, { data: categories }, { data: events }, { data: projects }] =
    await Promise.all([
      supabase.from("accounts").select("*").eq("is_active", true).order("name"),
      supabase.from("expense_categories").select("*").order("name"),
      supabase.from("events").select("*").eq("status", "active").order("name"),
      supabase.from("projects").select("*").eq("status", "active").order("title"),
    ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Add expense</h1>
      <AddExpenseForm
        accounts={accounts ?? []}
        categories={categories ?? []}
        events={events ?? []}
        projects={projects ?? []}
      />
    </div>
  );
}
