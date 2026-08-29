import { createServiceClient } from "@/lib/supabase/service";

export default async function AdminDebugPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (!email) {
    return <p className="text-neutral-400">Add ?email=someone@example.com to the URL.</p>;
  }

  const service = createServiceClient();

  const { data: users } = await service.auth.admin.listUsers();
  const target = users?.users.find((u) => u.email === email);
  if (!target) {
    return <p className="text-red-400">No user found for {email}</p>;
  }

  const [{ data: accounts }, { data: bills }, { data: recurring }] = await Promise.all([
    service.from("accounts").select("*").eq("user_id", target.id),
    service.from("bills").select("*").eq("user_id", target.id),
    service.from("recurring_income").select("*").eq("user_id", target.id),
  ]);

  const activeAccountIds = new Set((accounts ?? []).filter((a) => a.is_active).map((a) => a.id));

  const orphanBills = (bills ?? []).filter(
    (b) => b.default_account_id && !activeAccountIds.has(b.default_account_id)
  );
  const orphanRecurring = (recurring ?? []).filter(
    (r) => r.default_account_id && !activeAccountIds.has(r.default_account_id)
  );

  return (
    <div className="space-y-4 text-xs text-neutral-200">
      <section>
        <p className="text-neutral-400">All accounts ({accounts?.length ?? 0}):</p>
        <pre className="overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(
            (accounts ?? []).map((a) => ({ id: a.id, name: a.name, is_active: a.is_active })),
            null,
            2
          )}
        </pre>
      </section>
      <section>
        <p className="text-neutral-400">
          Bills whose default_account_id is NOT an active account ({orphanBills.length}):
        </p>
        <pre className="overflow-x-auto whitespace-pre-wrap break-all">
          {JSON.stringify(
            orphanBills.map((b) => ({
              id: b.id,
              payee: b.payee,
              is_subscription: b.is_subscription,
              default_account_id: b.default_account_id,
            })),
            null,
            2
          )}
        </pre>
      </section>
      <section>
        <p className="text-neutral-400">
          recurring_income whose default_account_id is NOT an active account (
          {orphanRecurring.length}):
        </p>
        <pre className="overflow-x-auto whitespace-pre-wrap break-all">
          {JSON.stringify(
            orphanRecurring.map((r) => ({
              id: r.id,
              status: r.status,
              default_account_id: r.default_account_id,
            })),
            null,
            2
          )}
        </pre>
      </section>
    </div>
  );
}
