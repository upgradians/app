export default function ChallengeLoading() {
  return (
    <div className="h-[calc(100vh-4rem)] flex animate-pulse">
      {/* Left panel */}
      <div className="w-full lg:w-[420px] border-r border-[var(--border)] p-6 space-y-4">
        <div className="h-7 w-3/4 rounded-lg bg-[var(--bg-3)]" />
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-lg bg-[var(--bg-3)]" />
          <div className="h-5 w-20 rounded-lg bg-[var(--bg-3)]" />
        </div>
        <div className="space-y-2 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 rounded bg-[var(--bg-3)]" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      </div>
      {/* Right: editor */}
      <div className="flex-1 bg-[var(--bg-2)]" />
    </div>
  );
}
