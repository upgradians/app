export default function LeaderboardLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-pulse">
      <div className="h-8 w-48 bg-[var(--bg-3)] rounded-lg mb-6" />
      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-xl bg-[var(--bg-3)]" />
        ))}
      </div>
      {/* Rows */}
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-14 rounded-2xl bg-[var(--bg-3)]" />
        ))}
      </div>
    </div>
  );
}
