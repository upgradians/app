"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { RankBadge } from "@upgradian/ui";
import type { Profile } from "@upgradian/types";

type UserSummary = Pick<Profile, "id" | "username" | "full_name" | "rank" | "created_at">;

interface Props {
  stats: { users: number; challenges: number; submissions: number; contests: number };
  recentUsers: UserSummary[];
}

export function AdminDashboardClient({ stats, recentUsers }: Props) {
  const cards = [
    { label: "Total Users",      value: stats.users,       icon: "👥", href: "/admin/users",       color: "from-brand/20 to-brand/5" },
    { label: "Challenges",       value: stats.challenges,  icon: "⚔️",  href: "/admin/challenges",  color: "from-blue-500/20 to-blue-500/5" },
    { label: "Submissions",      value: stats.submissions, icon: "📤", href: "/admin/submissions", color: "from-emerald-500/20 to-emerald-500/5" },
    { label: "Active Contests",  value: stats.contests,    icon: "🏆", href: "/admin/contests",    color: "from-purple-500/20 to-purple-500/5" },
  ];

  const quickActions = [
    { label: "Add Challenge",   href: "/admin/challenges/new",  icon: "➕" },
    { label: "Create Contest",  href: "/admin/contests/new",    icon: "🏁" },
    { label: "Manage Users",    href: "/admin/users",           icon: "👤" },
    { label: "Add Mission",     href: "/admin/missions/new",    icon: "🎯" },
    { label: "Add Skill Track", href: "/admin/tracks/new",      icon: "📚" },
    { label: "View Analytics",  href: "/admin/analytics",       icon: "📊" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Admin Dashboard ⚙️</h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}>
            <Link href={c.href}>
              <div className={`bg-gradient-to-br ${c.color} border border-[var(--border)] rounded-2xl p-5 hover:border-brand/30 transition-colors`}>
                <div className="text-2xl mb-3">{c.icon}</div>
                <div className="text-3xl font-extrabold text-[var(--text-1)]">{c.value.toLocaleString()}</div>
                <div className="text-xs text-[var(--text-3)] mt-1 font-semibold">{c.label}</div>
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
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--bg-3)] border border-[var(--border)] text-xs font-semibold text-[var(--text-2)] hover:border-brand/30 hover:text-brand transition-colors">
                <span>{action.icon}</span>
                <span className="truncate">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="lg:col-span-2 bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-bold text-sm text-[var(--text-1)]">Recent Signups</h2>
            <Link href="/admin/users" className="text-xs text-brand hover:underline font-semibold">View all →</Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentUsers.map((u) => (
              <div key={u.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-xs font-bold text-brand flex-shrink-0">
                  {u.username?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[var(--text-1)] truncate">{u.full_name ?? ""}</div>
                  <div className="text-xs text-[var(--text-3)]">@{u.username}</div>
                </div>
                {u.rank && <RankBadge rank={u.rank} />}
                <div className="text-xs text-[var(--text-3)]">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : ""}
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <div className="py-10 text-center text-xs text-[var(--text-3)]">No users yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
