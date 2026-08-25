import Link from "next/link";
import type { AppAlert } from "@/lib/data/notifications";
import { Card, CardContent } from "@/components/ui/card";
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, ChevronRight } from "lucide-react";

const MAX_VISIBLE = 5;

export function NeedsAttentionCard({ alerts }: { alerts: AppAlert[] }) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="size-4 text-success" />
          </div>
          <div>
            <p className="text-sm font-medium">You&apos;re all caught up</p>
            <p className="text-xs text-muted-foreground">Nothing needs your attention right now.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const visible = alerts.slice(0, MAX_VISIBLE);
  const remaining = alerts.length - visible.length;

  return (
    <Card>
      <CardContent className="space-y-1 py-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium">Needs your attention</h2>
          <span className="text-xs text-muted-foreground">{alerts.length} item{alerts.length === 1 ? "" : "s"}</span>
        </div>
        <div className="divide-y">
          {visible.map((alert) => (
            <Link
              key={alert.id}
              href={alert.href}
              className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                  alert.severity === "danger"
                    ? "bg-destructive/10"
                    : alert.severity === "warning"
                      ? "bg-info/10"
                      : "bg-muted"
                }`}
              >
                {alert.severity === "danger" ? (
                  <AlertOctagon className="size-4 text-destructive" />
                ) : alert.severity === "warning" ? (
                  <AlertTriangle className="size-4 text-info" />
                ) : (
                  <Info className="size-4 text-muted-foreground" />
                )}
              </div>
              <p className="flex-1 text-xs text-foreground">{alert.message}</p>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
        {remaining > 0 && (
          <Link
            href="/notifications"
            className="block pt-2 text-center text-xs font-medium text-primary"
          >
            +{remaining} more
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
