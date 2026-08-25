import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="flex items-center justify-between">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <Card>
        <CardContent className="py-4">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
