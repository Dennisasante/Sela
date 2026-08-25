import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin";
import { adminSignOut } from "@/app/admin/actions";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (!(await isAdminUser(supabase, user))) {
    await supabase.auth.signOut();
    redirect(
      `/admin/login?error=${encodeURIComponent("This account doesn't have admin access.")}`
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-white">
      <header className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <LogoMark className="size-7 rounded-md" />
          <span className="font-semibold">Sela Admin</span>
        </div>
        <form action={adminSignOut}>
          <Button type="submit" variant="ghost" size="sm" className="text-neutral-300 hover:text-white">
            <LogOut className="size-4" />
            Sign out
          </Button>
        </form>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
