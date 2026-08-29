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
    { data: bills, error: billsError },
    { data: projects, error: projectsError },
    { data: categories, error: categoriesError },
    { data: sources, error: sourcesError },
  ] = await Promise.all([
    service
      .from("bills")
      .select("*, expense_categories(name), accounts(name)")
      .eq("user_id", user.id),
    service
      .from("projects")
      .select("*, income_sources(name, category)")
      .eq("user_id", user.id),
    service.from("expense_categories").select("*").eq("user_id", user.id),
    service.from("income_sources").select("*").eq("user_id", user.id),
  ]);

  const dump = {
    userId: user.id,
    bills: { data: bills, error: billsError?.message },
    projects: { data: projects, error: projectsError?.message },
    expense_categories: { data: categories, error: categoriesError?.message },
    income_sources: { data: sources, error: sourcesError?.message },
  };

  return (
    <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs text-neutral-200">
      {JSON.stringify(dump, null, 2)}
    </pre>
  );
}
