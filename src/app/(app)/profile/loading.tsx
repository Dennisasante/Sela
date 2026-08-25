import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-24" />
      <Card className="border-none bg-muted/60">
        <CardContent className="flex items-center gap-4 py-5">
          <Skeleton className="size-14 shrink-0 rounded-full bg-background/40" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40 bg-background/40" />
            <Skeleton className="h-3 w-28 bg-background/40" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4 py-0">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
