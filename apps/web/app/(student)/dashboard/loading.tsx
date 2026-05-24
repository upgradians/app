import { Skeleton, SkeletonRow } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome text */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Onboarding checklist placeholder */}
      <Skeleton className="h-48 w-full" />

      {/* XP progress card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6 animate-pulse">
        <div className="flex items-end justify-between mb-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-3 w-20 ml-auto" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-4 animate-pulse text-center space-y-2">
            <Skeleton className="h-8 w-8 mx-auto rounded-xl" />
            <Skeleton className="h-7 w-12 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>

      {/* Two-column: submissions + top players */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Submissions skeleton */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden divide-y divide-[var(--border)]">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>

        {/* Top players skeleton */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden divide-y divide-[var(--border)]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-4 animate-pulse text-center space-y-2">
              <Skeleton className="h-8 w-8 mx-auto rounded-xl" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
