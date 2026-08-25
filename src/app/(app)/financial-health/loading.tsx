import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinancialHealthLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <Card className="border-none bg-muted/60">
        <CardContent className="space-y-2 py-5">
          <Skeleton className="h-4 w-24 bg-background/40" />
          <Skeleton className="h-7 w-48 bg-background/40" />
        </CardContent>
      </Card>
      {Array.from({ length: 7 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-3 py-4">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
