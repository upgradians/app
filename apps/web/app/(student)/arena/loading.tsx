export default function ArenaLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-pulse">
      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="h-9 w-32 rounded-xl bg-[var(--bg-3)]" />
        <div className="h-9 w-32 rounded-xl bg-[var(--bg-3)]" />
        <div className="h-9 flex-1 rounded-xl bg-[var(--bg-3)]" />
      </div>
      {/* Challenge cards */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-[var(--bg-3)]" />
        ))}
      </div>
    </div>
  );
}
