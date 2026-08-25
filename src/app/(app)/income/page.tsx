import { createClient } from "@/lib/supabase/server";
import {
  getIncomeEntries,
  getClientTotals,
  getClientOverviews,
  getProjectBalances,
  getMilestonesByProject,
} from "@/lib/data/income";
import { ensureCurrentOccurrences, getExpectedIncome } from "@/lib/data/planning";
import { monthRangeForOffset } from "@/lib/format";
import { formatMoney } from "@/lib/format";
import { IncomeFilters } from "@/components/income/income-filters";
import { IncomeEntryRow } from "@/components/income/income-entry-row";
import { ExpectedIncomeCard } from "@/components/income/expected-income-card";
import { RecurringIncomeFormDialog } from "@/components/income/recurring-income-form-dialog";
import { ClientCard } from "@/components/clients/client-card";
import { SourceFormDialog } from "@/components/clients/source-form-dialog";
import { ProjectCard } from "@/components/clients/project-card";
import { ProjectFormDialog } from "@/components/clients/project-form-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const INCOME_TABS = ["entries", "expected", "clients", "projects"] as const;

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; source?: string; category?: string; tab?: string }>;
}) {
  const { month, source, category, tab } = await searchParams;
  const monthOffset = month ? parseInt(month, 10) || 0 : 0;
  const { start, end, label } = monthRangeForOffset(monthOffset);
  const activeTab = INCOME_TABS.includes(tab as (typeof INCOME_TABS)[number])
    ? (tab as (typeof INCOME_TABS)[number])
    : "entries";

  const supabase = await createClient();
  await ensureCurrentOccurrences(supabase);

  const [
    entries,
    clientTotals,
    clientOverviews,
    projects,
    milestonesByProject,
    { data: sources },
    expected,
    { data: accounts },
  ] = await Promise.all([
    getIncomeEntries(supabase, { start, end, sourceId: source, category }),
    getClientTotals(supabase, start, end),
    getClientOverviews(supabase),
    getProjectBalances(supabase),
    getMilestonesByProject(supabase),
    supabase.from("income_sources").select("*").order("name"),
    getExpectedIncome(supabase),
    supabase.from("accounts").select("*").eq("is_active", true).order("name"),
  ]);

  const monthTotalBySource = new Map(clientTotals.map((c) => [c.sourceId, c.total]));

  const totalExpected = expected
    .filter((e) => e.status === "expected" || e.status === "partial")
    .reduce((sum, e) => sum + e.expectedAmount, 0);

  const monthTotal = entries.reduce((sum, e) => sum + e.amount, 0);
  const currency = entries[0]?.currency ?? "GHS";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Income</h1>

      <Tabs key={activeTab} defaultValue={activeTab}>
        <TabsList className="w-full">
          <TabsTrigger value="entries" className="flex-1">
            Entries
          </TabsTrigger>
          <TabsTrigger value="expected" className="flex-1">
            Expected
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex-1">
            Clients
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex-1">
            Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-3">
          <IncomeFilters
            sources={sources ?? []}
            monthOffset={monthOffset}
            monthLabel={label}
            sourceId={source}
            category={category}
          />
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{formatMoney(monthTotal, currency)}</span>
          </p>
          <Card>
            <CardContent className="divide-y py-0">
              {entries.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No income logged for this period.
                </p>
              )}
              {entries.map((entry) => (
                <IncomeEntryRow key={entry.id} entry={entry} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expected" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Expected this month:{" "}
              <span className="font-semibold text-foreground">
                {formatMoney(totalExpected, "GHS")}
              </span>
            </p>
            <RecurringIncomeFormDialog
              sources={sources ?? []}
              accounts={accounts ?? []}
              trigger={
                <Button size="sm">
                  <Plus className="size-4" />
                  Add
                </Button>
              }
            />
          </div>
          {expected.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No recurring income set up yet. Add a stable client/salary to see it forecasted
              here every month, without it counting as received until you confirm it.
            </p>
          )}
          <div className="space-y-2">
            {expected.map((occurrence) => (
              <ExpectedIncomeCard
                key={occurrence.id}
                occurrence={occurrence}
                accounts={accounts ?? []}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{label}</p>
            <SourceFormDialog
              trigger={
                <Button size="sm">
                  <Plus className="size-4" />
                  Add client
                </Button>
              }
            />
          </div>
          {clientOverviews.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No clients/sources yet — add one to start tracking income against them.
            </p>
          )}
          <div className="space-y-3">
            {clientOverviews.map((client) => {
              const fullSource = (sources ?? []).find((s) => s.id === client.sourceId);
              if (!fullSource) return null;
              return (
                <ClientCard
                  key={client.sourceId}
                  client={client}
                  source={fullSource}
                  monthTotal={monthTotalBySource.get(client.sourceId) ?? 0}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-3">
          <div className="flex justify-end">
            <ProjectFormDialog
              sources={sources ?? []}
              trigger={
                <Button size="sm">
                  <Plus className="size-4" />
                  New project
                </Button>
              }
            />
          </div>
          {projects.length === 0 && (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          )}
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              milestones={milestonesByProject.get(project.id) ?? []}
              accounts={accounts ?? []}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
