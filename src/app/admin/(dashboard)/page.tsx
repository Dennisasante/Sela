import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUserOverview, getAdminStats } from "@/lib/data/admin";
import { AdminUserRow } from "@/components/admin/admin-user-row";
import { AdminSearch } from "@/components/admin/admin-search";
import { PromoteAdminForm } from "@/components/admin/promote-admin-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const serviceClient = createServiceClient();
  const users = await getAdminUserOverview(serviceClient);
  const stats = getAdminStats(users);

  const filtered = q
    ? users.filter((u) => u.email?.toLowerCase().includes(q.toLowerCase()))
    : users;
  const admins = users.filter((u) => u.isAdmin);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-neutral-800 bg-neutral-900 text-white">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold">{stats.totalUsers}</p>
            <p className="text-xs text-neutral-400">Total users</p>
          </CardContent>
        </Card>
        <Card className="border-neutral-800 bg-neutral-900 text-white">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold">{stats.newThisWeek}</p>
            <p className="text-xs text-neutral-400">New this week</p>
          </CardContent>
        </Card>
        <Card className="border-neutral-800 bg-neutral-900 text-white">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold">{stats.activeThisWeek}</p>
            <p className="text-xs text-neutral-400">Active this week</p>
          </CardContent>
        </Card>
        <Card className="border-neutral-800 bg-neutral-900 text-white">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold">{stats.unconfirmed}</p>
            <p className="text-xs text-neutral-400">Unconfirmed emails</p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-neutral-400">Admins ({admins.length})</h2>
        <Card className="border-neutral-800 bg-neutral-900 text-white">
          <CardContent className="space-y-3 py-4">
            <div className="space-y-1">
              {admins.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span>{a.email}</span>
                  <span className="text-xs text-neutral-500">
                    Last active {a.lastSignInAt ? new Date(a.lastSignInAt).toLocaleDateString() : "never"}
                  </span>
                </div>
              ))}
            </div>
            <PromoteAdminForm />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-400">
            Users ({filtered.length}{q ? ` of ${users.length}` : ""})
          </h2>
        </div>
        <AdminSearch query={q} />
        <div className="space-y-2">
          {filtered.map((row) => (
            <AdminUserRow key={row.id} row={row} />
          ))}
          {filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-neutral-400">No matching users.</p>
          )}
        </div>
      </section>
    </div>
  );
}
