import { Skeleton } from "@/components/ui/skeleton";

// loading.tsx placeholder shaped like a dashboard page: header, stat cards, table card
const DashboardSkeleton = ({ cards = 3, rows = 5 }: { cards?: number; rows?: number }) => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading">
    <div className="space-y-2">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-40" />
    </div>
    {cards > 0 && (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className="space-y-3 rounded-xl border bg-card p-5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    )}
    <div className="space-y-3 rounded-xl border bg-card p-5">
      <Skeleton className="h-5 w-48" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export default DashboardSkeleton;
