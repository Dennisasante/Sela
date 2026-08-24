import { createClient } from "@/lib/supabase/server";
import { getSavingsRulesProgress, getSavingsGoalsProgress } from "@/lib/data/savings";
import { SavingsRuleFormDialog } from "@/components/savings/savings-rule-form-dialog";
import { SavingsRuleCard } from "@/components/savings/savings-rule-card";
import { SavingsGoalFormDialog } from "@/components/savings/savings-goal-form-dialog";
import { SavingsGoalCard } from "@/components/savings/savings-goal-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function SavingsPage() {
  const supabase = await createClient();

  const [rules, goals, { data: sources }, { data: accounts }] = await Promise.all([
    getSavingsRulesProgress(supabase),
    getSavingsGoalsProgress(supabase),
    supabase.from("income_sources").select("*").order("name"),
    supabase.from("accounts").select("*").eq("is_active", true).order("name"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Savings &amp; Tax</h1>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Set-aside rules</h2>
          <SavingsRuleFormDialog
            sources={sources ?? []}
            trigger={
              <Button size="sm">
                <Plus className="size-4" />
                Add
              </Button>
            }
          />
        </div>
        {rules.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No rules yet — e.g. a 10% tax set-aside on all income.
          </p>
        )}
        <div className="space-y-3">
          {rules.map((rule) => (
            <SavingsRuleCard key={rule.id} rule={rule} accounts={accounts ?? []} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Savings goals</h2>
          <SavingsGoalFormDialog
            accounts={accounts ?? []}
            trigger={
              <Button size="sm">
                <Plus className="size-4" />
                Add
              </Button>
            }
          />
        </div>
        {goals.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No goals yet — track progress toward an investment or savings account.
          </p>
        )}
        <div className="space-y-3">
          {goals.map((goal) => (
            <SavingsGoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </section>
    </div>
  );
}
