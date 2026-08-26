import Link from "next/link";
import type { GuardianInsight } from "@/lib/data/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, TrendingDown, PiggyBank, TriangleAlert } from "lucide-react";

const TONE_STYLES = {
  positive: { icon: TrendingDown, bg: "bg-success/10", fg: "text-success" },
  info: { icon: PiggyBank, bg: "bg-info/10", fg: "text-info" },
  warning: { icon: TriangleAlert, bg: "bg-destructive/10", fg: "text-destructive" },
  protected: { icon: ShieldCheck, bg: "bg-primary/10", fg: "text-primary" },
} as const;

export function GuardianInsightCard({ insight }: { insight: GuardianInsight }) {
  const { icon: Icon, bg, fg } = TONE_STYLES[insight.tone];

  return (
    <Link href={insight.href} className="block">
      <Card>
        <CardContent className="flex items-start gap-3 py-4">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${bg}`}>
            <Icon className={`size-5 ${fg}`} />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold">{insight.title}</p>
            <p className="text-sm text-muted-foreground">{insight.message}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
