import { createClient } from "@/lib/supabase/server";
import { getIncomeEntries, getClientTotals, getProjectBalances } from "@/lib/data/income";
import { monthRangeForOffset } from "@/lib/format";
import { formatMoney } from "@/lib/format";
import { IncomeFilters } from "@/components/income/income-filters";
import { IncomeEntryRow } from "@/components/income/income-entry-row";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; source?: string; category?: string }>;
}) {
  const { month, source, category } = await searchParams;
  const monthOffset = month ? parseInt(month, 10) || 0 : 0;
  const { start, end, label } = monthRangeForOffset(monthOffset);

  const supabase = await createClient();

  const [entries, clientTotals, projects, { data: sources }] = await Promise.all([
    getIncomeEntries(supabase, { start, end, sourceId: source, category }),
    getClientTotals(supabase, start, end),
    getProjectBalances(supabase),
    supabase.from("income_sources").select("*").order("name"),
  ]);

  const monthTotal = entries.reduce((sum, e) => sum + e.amount, 0);
  const currency = entries[0]?.currency ?? "GHS";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Income</h1>

      <Tabs defaultValue="entries">
        <TabsList className="w-full">
          <TabsTrigger value="entries" className="flex-1">
            Entries
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex-1">
            By client
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

        <TabsContent value="clients" className="space-y-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Card>
            <CardContent className="divide-y py-0">
              {clientTotals.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No client income this month.
                </p>
              )}
              {clientTotals.map((client) => (
                <div key={client.sourceId} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{client.name}</p>
                    <Badge variant="secondary" className="capitalize">
                      {client.category}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatMoney(client.total, client.currency)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-3">
          {projects.length === 0 && (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          )}
          {projects.map((project) => {
            const balance = project.totalAmount - project.paidToDate;
            return (
              <Card key={project.id}>
                <CardContent className="space-y-2 py-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{project.title}</p>
                    <Badge
                      variant={
                        project.status === "completed"
                          ? "success"
                          : project.status === "cancelled"
                            ? "destructive"
                            : "info"
                      }
                      className="capitalize"
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${Math.min(100, (project.paidToDate / project.totalAmount) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Paid {formatMoney(project.paidToDate, project.currency)} of{" "}
                      {formatMoney(project.totalAmount, project.currency)}
                    </span>
                    <span className="font-medium text-foreground">
                      {formatMoney(balance, project.currency)} left
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
