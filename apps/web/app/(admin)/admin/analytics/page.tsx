import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { AnalyticsCharts } from "./AnalyticsCharts";

export const metadata: Metadata = { title: "Admin – Analytics" };

export default async function AdminAnalyticsPage() {
  const admin = await createAdminClient();

  const [
    { count: totalUsers },
    { count: totalSubmissions },
    { count: totalChallenges },
    { count: totalContests },
    { count: activeThisWeek },
    { data: topUsers },
    { data: recentSubmissions },
    { data: interviewStats },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("submissions").select("*", { count: "exact", head: true }),
    admin.from("challenges").select("*", { count: "exact", head: true }),
    admin.from("contests").select("*", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("last_active_at", new Date(Date.now() - 7 * 86_400_000).toISOString()),
    admin
      .from("profiles")
      .select("username,total_xp,rank,challenges_solved")
      .neq("role", "admin")
      .order("total_xp", { ascending: false })
      .limit(10),
    admin
      .from("submissions")
      .select("status,language,submitted_at")
      .order("submitted_at", { ascending: false })
      .limit(500),
    admin
      .from("interview_sessions")
      .select("status,overall_score,created_at")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const stats = [
    { label: "Total Users",        value: totalUsers       ?? 0, icon: "👥", color: "text-brand"       },
    { label: "Total Submissions",  value: totalSubmissions ?? 0, icon: "📤", color: "text-sky-400"     },
    { label: "Total Challenges",   value: totalChallenges  ?? 0, icon: "⚔️",  color: "text-amber-400"  },
    { label: "Total Contests",     value: totalContests    ?? 0, icon: "🏆", color: "text-purple-400" },
    { label: "Active This Week",   value: activeThisWeek   ?? 0, icon: "🔥", color: "text-orange-400" },
  ];

  // Build chart data server-side
  const statusTally: Record<string, number> = {};
  const langTally:   Record<string, number> = {};
  const dailySolves: Record<string, number> = {};

  for (const sub of recentSubmissions ?? []) {
    if (sub.status)    statusTally[sub.status]   = (statusTally[sub.status]   ?? 0) + 1;
    if (sub.language)  langTally[sub.language]   = (langTally[sub.language]   ?? 0) + 1;
    if (sub.submitted_at) {
      const day = sub.submitted_at.slice(0, 10);
      dailySolves[day] = (dailySolves[day] ?? 0) + 1;
    }
  }

  const statusData = Object.entries(statusTally).map(([name, value]) => ({ name, value }));
  const langData   = Object.entries(langTally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));
  const dailyData  = Object.entries(dailySolves)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([date, submissions]) => ({ date, submissions }));

  const completedInterviews = (interviewStats ?? []).filter(s => s.status === "completed").length;
  const avgScore = completedInterviews > 0
    ? Math.round(
        (interviewStats ?? [])
          .filter(s => s.status === "completed" && s.overall_score != null)
          .reduce((acc, s) => acc + (s.overall_score ?? 0), 0) / completedInterviews,
      )
    : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">
          Analytics <span className="text-brand">📈</span>
        </h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">Platform-wide statistics and insights</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl p-5">
            <div className="text-2xl mb-3" aria-hidden="true">{s.icon}</div>
            <div className={`text-3xl font-extrabold tabular-nums ${s.color}`}>{s.value.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-3)] mt-1 font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Interview summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl p-5">
          <div className="text-2xl mb-3">🤖</div>
          <div className="text-3xl font-extrabold tabular-nums text-indigo-400">{completedInterviews}</div>
          <div className="text-xs text-[var(--text-3)] mt-1 font-semibold">Interviews Completed</div>
        </div>
        <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl p-5">
          <div className="text-2xl mb-3">⭐</div>
          <div className="text-3xl font-extrabold tabular-nums text-yellow-400">{avgScore}</div>
          <div className="text-xs text-[var(--text-3)] mt-1 font-semibold">Avg Interview Score</div>
        </div>
      </div>

      {/* Charts — client component */}
      <AnalyticsCharts
        statusData={statusData}
        langData={langData}
        dailyData={dailyData}
      />

      {/* Top users table */}
      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)]">
          <h2 className="font-bold text-sm text-[var(--text-1)]">Top 10 Users by XP</h2>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {(topUsers ?? []).map((u, i) => (
            <div key={u.username} className="px-5 py-3 flex items-center gap-3">
              <span className="text-sm font-bold text-[var(--text-3)] w-6 tabular-nums text-right">{i + 1}</span>
              <div className="flex-1 text-sm font-bold text-[var(--text-1)]">@{u.username}</div>
              <span className="text-xs text-[var(--text-3)]">{u.rank ?? "—"}</span>
              <span className="text-xs text-[var(--text-3)]">{u.challenges_solved ?? 0} solved</span>
              <span className="text-xs font-bold text-brand tabular-nums">{(u.total_xp ?? 0).toLocaleString()} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
