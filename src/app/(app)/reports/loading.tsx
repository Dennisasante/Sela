import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-24" />
      <div className="flex items-center justify-between">
        <Skeleton className="size-8" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="size-8" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>

      <Card>
        <CardContent className="space-y-4 py-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 py-4">
          <Skeleton className="h-4 w-32" />
          <div className="flex justify-center py-4">
            <Skeleton className="size-40 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
