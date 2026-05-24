import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin – Analytics" };

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalSubmissions },
    { count: totalChallenges },
    { count: totalContests },
    { data: topUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("submissions").select("*", { count: "exact", head: true }),
    supabase.from("challenges").select("*", { count: "exact", head: true }),
    supabase.from("contests").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("username,xp,rank").order("xp", { ascending: false }).limit(10),
  ]);

  const stats = [
    { label: "Total Users", value: totalUsers ?? 0, icon: "👥" },
    { label: "Total Submissions", value: totalSubmissions ?? 0, icon: "📤" },
    { label: "Total Challenges", value: totalChallenges ?? 0, icon: "⚔️" },
    { label: "Total Contests", value: totalContests ?? 0, icon: "🏆" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">
          Analytics <span className="text-brand">📈</span>
        </h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">Platform-wide statistics and insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl p-5">
            <div className="text-2xl mb-3" aria-hidden="true">{s.icon}</div>
            <div className="text-3xl font-extrabold text-[var(--text-1)] tabular-nums">{s.value.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-3)] mt-1 font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)]">
          <h2 className="font-bold text-sm text-[var(--text-1)]">Top 10 Users by XP</h2>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {topUsers?.map((u, i) => (
            <div key={u.username} className="px-5 py-3 flex items-center gap-3">
              <span className="text-sm font-bold text-[var(--text-3)] w-6 tabular-nums text-right">{i + 1}</span>
              <div className="flex-1 text-sm font-bold text-[var(--text-1)]">@{u.username}</div>
              <span className="text-xs text-[var(--text-3)]">{u.rank ?? "—"}</span>
              <span className="text-xs font-bold text-brand tabular-nums">{(u.xp ?? 0).toLocaleString()} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
