"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { RankBadge } from "@upgradian/ui";
import type { GalaxyRank } from "@upgradian/types";

interface UserSummary {
  id: string;
  full_name?: string | null;
  username?: string | null;
  xp?: number | null;
  rank?: string | null;
  role?: string | null;
  streak_days?: number | null;
  challenges_solved?: number | null;
  created_at?: string | null;
}

interface Props {
  stats: {
    users:        number;
    challenges:   number;
    submissions:  number;
    contests:     number;
    interviews:   number;
    activeStreaks: number;
  };
  recentUsers: UserSummary[];
  topUsers:    UserSummary[];
}

export function AdminDashboardClient({ stats, recentUsers, topUsers }: Props) {
  const cards = [
    { label: "Total Users",      value: stats.users,        icon: "👥", href: "/admin/participants", color: "from-brand/20 to-brand/5"           },
    { label: "Challenges",       value: stats.challenges,   icon: "⚔️",  href: "/admin/challenges",  color: "from-blue-500/20 to-blue-500/5"     },
    { label: "Submissions",      value: stats.submissions,  icon: "📤", href: "/admin/submissions", color: "from-emerald-500/20 to-emerald-500/5" },
    { label: "Active Contests",  value: stats.contests,     icon: "🏆", href: "/admin/contests",    color: "from-purple-500/20 to-purple-500/5"  },
    { label: "AI Interviews",    value: stats.interviews,   icon: "🤖", href: "/admin/analytics",   color: "from-cyan-500/20 to-cyan-500/5"      },
    { label: "Active Streaks",   value: stats.activeStreaks,icon: "🔥", href: "/admin/participants", color: "from-orange-500/20 to-orange-500/5" },
  ];

  const quickActions = [
    { label: "Add Challenge",    href: "/admin/challenges/new",   icon: "➕" },
    { label: "Create Contest",   href: "/admin/contests/new",     icon: "🏁" },
    { label: "Participants",     href: "/admin/participants",     icon: "🧑‍💻" },
    { label: "Add Mission",      href: "/admin/missions/new",     icon: "🎯" },
    { label: "Add Skill Track",  href: "/admin/tracks/new",       icon: "📚" },
    { label: "View Analytics",   href: "/admin/analytics",        icon: "📊" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Admin Dashboard ⚙️</h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">Platform overview and management</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}>
            <Link href={c.href}>
              <div className={`bg-gradient-to-br ${c.color} border border-[var(--border)] rounded-2xl p-4 hover:border-orange-300 hover:shadow-sm transition-all`}>
                <div className="text-xl mb-2">{c.icon}</div>
                <div className="text-2xl font-extrabold text-[var(--text-1)]">{Number(c.value ?? 0).toLocaleString()}</div>
                <div className="text-[10px] text-[var(--text-3)] mt-1 font-semibold uppercase tracking-wide">{c.label}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl p-5">
          <h2 className="font-bold text-sm text-[var(--text-1)] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map(action => (
              <Link key={action.href} href={action.href}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--bg-3)] border border-[var(--border)] text-xs font-semibold text-[var(--text-2)] hover:border-orange-300 hover:text-orange-600 transition-colors">
                <span>{action.icon}</span>
                <span className="truncate">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top XP Users */}
        <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-bold text-sm text-[var(--text-1)]">🏆 Top XP Users</h2>
            <Link href="/admin/participants" className="text-xs text-orange-500 hover:underline font-semibold">View all →</Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {(topUsers ?? []).map((u, i) => (
              <div key={u.id} className="px-5 py-3 flex items-center gap-3">
                <span className="text-sm font-extrabold w-5 text-center text-[var(--text-3)]">
                  {i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <div className="w-7 h-7 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-xs font-bold text-brand flex-shrink-0">
                  {(u.full_name ?? u.username ?? "?")[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[var(--text-1)] truncate">{u.full_name ?? u.username ?? "—"}</div>
                  <div className="text-[10px] text-[var(--text-3)]">🔥 {Number(u.streak_days ?? 0)}d streak</div>
                </div>
                <div className="text-xs font-extrabold text-brand">{Number(u.xp ?? 0).toLocaleString()} XP</div>
              </div>
            ))}
            {(!topUsers || topUsers.length === 0) && (
              <div className="py-8 text-center text-xs text-[var(--text-3)]">No users yet</div>
            )}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-bold text-sm text-[var(--text-1)]">Recent Signups</h2>
            <Link href="/admin/users" className="text-xs text-orange-500 hover:underline font-semibold">View all →</Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {(recentUsers ?? []).map((u) => (
              <div key={u.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-xs font-bold text-brand flex-shrink-0">
                  {(u.username ?? "?")[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[var(--text-1)] truncate">{u.full_name ?? "—"}</div>
                  <div className="text-[10px] text-[var(--text-3)]">@{u.username ?? "—"}</div>
                </div>
                {u.rank && <RankBadge rank={u.rank as GalaxyRank} />}
                <div className="text-[10px] text-[var(--text-3)] flex-shrink-0 hidden sm:block">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                </div>
              </div>
            ))}
            {(!recentUsers || recentUsers.length === 0) && (
              <div className="py-8 text-center text-xs text-[var(--text-3)]">No users yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
