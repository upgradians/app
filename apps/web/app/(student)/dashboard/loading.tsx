export default function DashboardLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Header */}
      <div className="h-8 w-64 bg-[var(--bg-3)] rounded-lg" />
      <div className="h-4 w-96 bg-[var(--bg-3)] rounded-lg" />

      {/* XP card */}
      <div className="h-28 rounded-2xl bg-[var(--bg-3)]" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-[var(--bg-3)]" />
        ))}
      </div>

      {/* Two column grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl bg-[var(--bg-3)]" />
        <div className="h-64 rounded-2xl bg-[var(--bg-3)]" />
      </div>
    </div>
  );
}
