import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUserOverview } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatDateTime(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  const serviceClient = createServiceClient();
  const users = await getAdminUserOverview(serviceClient);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="text-sm text-neutral-400">
          {users.length} user{users.length === 1 ? "" : "s"} signed up.
        </p>
      </div>

      <div className="space-y-2">
        {users.map((row) => (
          <Card key={row.id} className="border-neutral-800 bg-neutral-900 text-white">
            <CardContent className="space-y-2 py-4">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate font-medium">{row.email ?? "(no email)"}</p>
                <Badge variant={row.emailConfirmed ? "success" : "secondary"} className="shrink-0">
                  {row.emailConfirmed ? "Verified" : "Unverified"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-400">
                <span>Signed up {formatDateTime(row.createdAt)}</span>
                <span>Last sign-in {formatDateTime(row.lastSignInAt)}</span>
                <span>{row.accounts} account{row.accounts === 1 ? "" : "s"}</span>
                <span>{row.expenses} expense{row.expenses === 1 ? "" : "s"}</span>
                <span>{row.incomeEntries} income entr{row.incomeEntries === 1 ? "y" : "ies"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {users.length === 0 && (
          <p className="py-6 text-center text-sm text-neutral-400">No users yet.</p>
        )}
      </div>
    </div>
  );
}
