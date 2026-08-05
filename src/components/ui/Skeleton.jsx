import { cn } from '../../utils/cn.js';

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-surface-strong',
        className,
      )}
      {...props}
    />
  );
}

function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-3 rounded-full',
            i === lines - 1 ? 'w-3/5' : 'w-full',
          )}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-surface p-5', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-3 w-40 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-5 pb-28 pt-6 lg:max-w-5xl lg:pb-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-7 w-36 rounded-full" />
        </div>
        <Skeleton className="size-9 rounded-full" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[72px] rounded-2xl" />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>

      <div className="mt-8 space-y-3">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-11 w-full rounded-full" />
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, DashboardSkeleton };
export default Skeleton;
