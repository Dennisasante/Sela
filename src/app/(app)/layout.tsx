import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin";
import { BottomNav } from "@/components/nav/bottom-nav";
import { TopBar } from "@/components/nav/top-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Admin accounts are a separate identity space with their own login and
  // dashboard — they should never land in the consumer app shell.
  if (await isAdminUser(supabase, user)) {
    redirect("/admin");
  }

  if (!user.user_metadata?.onboarding_completed) {
    const { count } = await supabase
      .from("accounts")
      .select("id", { count: "exact", head: true });
    if (!count) redirect("/onboarding");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-muted/20">
      <TopBar email={user.email ?? ""} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
