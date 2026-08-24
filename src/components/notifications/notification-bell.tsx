import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveAlertCount } from "@/lib/data/notifications";

export async function NotificationBell() {
  const supabase = await createClient();
  const count = await getActiveAlertCount(supabase);

  return (
    <Link
      href="/notifications"
      aria-label={count > 0 ? `${count} active alerts` : "Notifications"}
      className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Bell className="size-5" />
      {count > 0 && (
        <span className="absolute right-1.5 top-1.5 flex size-2 items-center justify-center rounded-full bg-destructive ring-2 ring-background" />
      )}
    </Link>
  );
}
