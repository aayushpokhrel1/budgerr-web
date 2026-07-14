import { Skeleton } from '@/components/ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="max-w-2xl space-y-4" aria-busy="true" aria-label="Loading dashboard">
      <Skeleton className="h-7 w-32 mb-2" />

      <div className="rounded-xl bg-surface p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-1.5 w-full" />
        <Skeleton className="h-3 w-40" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>

      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-16 w-full" />

      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}
