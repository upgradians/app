export default function AdminDashboardLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-56 rounded-lg bg-[var(--bg-3)]" />
      <div className="h-4 w-72 rounded-lg bg-[var(--bg-3)]" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-[var(--bg-3)]" />
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-64 rounded-2xl bg-[var(--bg-3)]" />
        <div className="lg:col-span-2 h-64 rounded-2xl bg-[var(--bg-3)]" />
      </div>
    </div>
  );
}
