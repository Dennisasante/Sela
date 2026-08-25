import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>

      <Card className="border-none bg-muted/60">
        <CardContent className="flex items-center justify-between py-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-background/40" />
            <Skeleton className="h-7 w-32 bg-background/40" />
            <Skeleton className="h-4 w-40 bg-background/40" />
          </div>
          <Skeleton className="size-20 rounded-full bg-background/40" />
        </CardContent>
      </Card>

      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-3 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
