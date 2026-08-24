import { createClient } from "@/lib/supabase/server";
import { AddTransferForm } from "@/components/add/add-transfer-form";

export default async function AddTransferPage() {
  const supabase = await createClient();
  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Transfer between accounts</h1>
      <AddTransferForm accounts={accounts ?? []} />
    </div>
  );
}
