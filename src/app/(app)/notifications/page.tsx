import { createClient } from "@/lib/supabase/server";
import { getActiveAlerts } from "@/lib/data/notifications";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, AlertOctagon } from "lucide-react";
import Link from "next/link";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const alerts = await getActiveAlerts(supabase);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Notifications</h1>

      {alerts.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            You&apos;re all caught up — no active alerts.
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {alerts.map((alert) => (
          <Link key={alert.id} href={alert.href}>
            <Card>
              <CardContent className="flex items-start gap-3 py-4">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                    alert.severity === "danger" ? "bg-destructive/10" : "bg-info/10"
                  }`}
                >
                  {alert.severity === "danger" ? (
                    <AlertOctagon className="size-4 text-destructive" />
                  ) : (
                    <AlertTriangle className="size-4 text-info" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
