import { cn } from "@upgradian/ui";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse bg-[var(--bg-3)] rounded-xl", className)} />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-2xl bg-[var(--bg-2)] border border-[var(--border)] p-6 animate-pulse", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--bg-3)]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[var(--bg-3)] rounded-lg w-2/3" />
          <div className="h-3 bg-[var(--bg-3)] rounded-lg w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-[var(--bg-3)] rounded-lg" />
        <div className="h-3 bg-[var(--bg-3)] rounded-lg w-4/5" />
      </div>
    </div>
  );
}

export function SkeletonRow({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center gap-3 px-4 py-3 animate-pulse", className)}>
      <div className="w-16 h-5 bg-[var(--bg-3)] rounded-md flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-[var(--bg-3)] rounded-lg w-2/3 mb-1.5" />
        <div className="h-3 bg-[var(--bg-3)] rounded-lg w-1/4" />
      </div>
      <div className="w-12 h-5 bg-[var(--bg-3)] rounded-md flex-shrink-0" />
    </div>
  );
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2 animate-pulse", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn("h-4 bg-[var(--bg-3)] rounded-lg", i === lines - 1 && lines > 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}
