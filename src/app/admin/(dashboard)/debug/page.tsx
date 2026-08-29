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
  const { data, error } = await service.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error) {
    return <pre className="whitespace-pre-wrap text-xs text-red-400">{error.message}</pre>;
  }

  return (
    <div className="space-y-2 text-xs text-neutral-200">
      <p className="text-neutral-400">
        One-time sign-in link for {email} (diagnostic use only):
      </p>
      <pre className="overflow-x-auto whitespace-pre-wrap break-all">
        {data.properties.action_link}
      </pre>
    </div>
  );
}
