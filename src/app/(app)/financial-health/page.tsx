import { createClient } from "@/lib/supabase/server";
import { getFinancialHealth } from "@/lib/data/financial-health";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Eye, AlertTriangle, Minus } from "lucide-react";

const STATUS_STYLE = {
  good: { icon: CheckCircle2, bg: "bg-success/10", fg: "text-success" },
  watch: { icon: Eye, bg: "bg-info/10", fg: "text-info" },
  attention: { icon: AlertTriangle, bg: "bg-destructive/10", fg: "text-destructive" },
  neutral: { icon: Minus, bg: "bg-muted", fg: "text-muted-foreground" },
} as const;

export default async function FinancialHealthPage() {
  const supabase = await createClient();
  const factors = await getFinancialHealth(supabase);

  const goodCount = factors.filter((f) => f.status === "good").length;
  const trackedCount = factors.filter((f) => f.status !== "neutral").length;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Financial health</h1>

      <Card className="border-none bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="py-5">
          <p className="text-sm text-primary-foreground/80">Overview</p>
          <p className="mt-1 text-2xl font-semibold">
            {trackedCount > 0 ? `${goodCount} of ${trackedCount} factors healthy` : "Getting started"}
          </p>
          <p className="mt-2 text-xs leading-snug text-primary-foreground/70">
            Each factor below is calculated straight from your real data — no arbitrary score, just
            what&apos;s actually happening with your money.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {factors.map((factor) => {
          const { icon: Icon, bg, fg } = STATUS_STYLE[factor.status];
          return (
            <Card key={factor.key}>
              <CardContent className="flex items-start gap-3 py-4">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${bg}`}>
                  <Icon className={`size-4 ${fg}`} />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{factor.label}</p>
                    <p className="text-sm font-semibold">{factor.value}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{factor.detail}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
