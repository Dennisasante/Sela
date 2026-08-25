import { Skeleton } from "@/components/ui/skeleton";

export default function AddIncomeLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
