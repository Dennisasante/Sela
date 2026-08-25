import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>

      <Card className="border-none bg-muted/60">
        <CardContent className="space-y-4 py-5">
          <Skeleton className="h-4 w-24 bg-background/40" />
          <Skeleton className="h-8 w-40 bg-background/40" />
          <div className="grid grid-cols-3 gap-3 border-t border-background/20 pt-4">
            <Skeleton className="h-8 bg-background/40" />
            <Skeleton className="h-8 bg-background/40" />
            <Skeleton className="h-8 bg-background/40" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 py-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 py-4">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>

      <Card>
        <CardContent className="space-y-2 py-4">
          <Skeleton className="h-4 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
