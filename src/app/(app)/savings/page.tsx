import { createClient } from "@/lib/supabase/server";
import { getSavingsRulesProgress, getSavingsGoalsProgress } from "@/lib/data/savings";
import { SavingsRuleFormDialog } from "@/components/savings/savings-rule-form-dialog";
import { SavingsRuleCard } from "@/components/savings/savings-rule-card";
import { SavingsGoalFormDialog } from "@/components/savings/savings-goal-form-dialog";
import { SavingsGoalCard } from "@/components/savings/savings-goal-card";
import { Button } from "@/components/ui/button";
import { Plus, PiggyBank, CalendarClock } from "lucide-react";

export default async function SavingsPage() {
  const supabase = await createClient();

  const [rules, goals, sinkingFunds, { data: sources }, { data: accounts }] = await Promise.all([
    getSavingsRulesProgress(supabase),
    getSavingsGoalsProgress(supabase, "goal"),
    getSavingsGoalsProgress(supabase, "sinking_fund"),
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
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted">
              <PiggyBank className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Start building something</p>
            <p className="max-w-[24rem] text-xs text-muted-foreground">
              Create your first savings goal and let Sela keep you on track.
            </p>
            <SavingsGoalFormDialog
              accounts={accounts ?? []}
              trigger={
                <Button size="sm" className="mt-1">
                  <Plus className="size-4" />
                  Create goal
                </Button>
              }
            />
          </div>
        )}
        <div className="space-y-3">
          {goals.map((goal) => (
            <SavingsGoalCard key={goal.id} goal={goal} accounts={accounts ?? []} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Sinking funds</h2>
          <SavingsGoalFormDialog
            accounts={accounts ?? []}
            kind="sinking_fund"
            trigger={
              <Button size="sm">
                <Plus className="size-4" />
                Add
              </Button>
            }
          />
        </div>
        {sinkingFunds.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted">
              <CalendarClock className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Save ahead for known expenses</p>
            <p className="max-w-[24rem] text-xs text-muted-foreground">
              Insurance renewal, Christmas, school fees — set a target and due date, and Sela
              spreads the saving out so it never hits you all at once.
            </p>
            <SavingsGoalFormDialog
              accounts={accounts ?? []}
              kind="sinking_fund"
              trigger={
                <Button size="sm" className="mt-1">
                  <Plus className="size-4" />
                  Create sinking fund
                </Button>
              }
            />
          </div>
        )}
        <div className="space-y-3">
          {sinkingFunds.map((goal) => (
            <SavingsGoalCard key={goal.id} goal={goal} accounts={accounts ?? []} />
          ))}
        </div>
      </section>
    </div>
  );
}
