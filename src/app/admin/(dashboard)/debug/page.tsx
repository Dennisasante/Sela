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
  const { data: usersPage, error: listError } = await service.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) {
    return <pre className="whitespace-pre-wrap text-xs text-red-400">{listError.message}</pre>;
  }

  const user = usersPage.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    return <p className="text-neutral-400">No user found for {email}.</p>;
  }

  const [
    { data: accounts, error: accountsError },
    { data: recurringIncome, error: recurringError },
    { data: occurrences, error: occurrencesError },
    { data: incomeEntries, error: incomeEntriesError },
    { data: billsSubs, error: billsSubsError },
  ] = await Promise.all([
    service.from("accounts").select("*").eq("user_id", user.id),
    service.from("recurring_income").select("*").eq("user_id", user.id),
    service
      .from("income_occurrences")
      .select("*, recurring_income(default_account_id, income_sources(name))")
      .eq("user_id", user.id),
    service.from("income_entries").select("*").eq("user_id", user.id),
    service.from("bills").select("*").eq("user_id", user.id).eq("is_subscription", true),
  ]);

  const dump = {
    userId: user.id,
    accounts: { count: accounts?.length, data: accounts, error: accountsError?.message },
    recurring_income: {
      count: recurringIncome?.length,
      data: recurringIncome,
      error: recurringError?.message,
    },
    income_occurrences: {
      count: occurrences?.length,
      data: occurrences,
      error: occurrencesError?.message,
    },
    income_entries: {
      count: incomeEntries?.length,
      data: incomeEntries,
      error: incomeEntriesError?.message,
    },
    subscriptions_bills: {
      count: billsSubs?.length,
      data: billsSubs,
      error: billsSubsError?.message,
    },
  };

  return (
    <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs text-neutral-200">
      {JSON.stringify(dump, null, 2)}
    </pre>
  );
}
