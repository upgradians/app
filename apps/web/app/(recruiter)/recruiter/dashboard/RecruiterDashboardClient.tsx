"use client";

import { motion } from "framer-motion";
import { RankBadge } from "@upgradian/ui";
import type { GalaxyRank } from "@upgradian/types";

interface Props {
  recruiter: Record<string, unknown> | null;
  topCandidates: Record<string, unknown>[];
  jobs: Record<string, unknown>[];
  recentApplications: Record<string, unknown>[];
}

const STAT_CARD_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RecruiterDashboardClient({ recruiter, topCandidates, jobs, recentApplications }: Props) {
  const stats = [
    { label: "Active Jobs",       value: jobs.length,             icon: "💼", color: "text-brand" },
    { label: "Total Candidates",  value: topCandidates.length,    icon: "👥", color: "text-blue-400" },
    { label: "Recent Applicants", value: recentApplications.length, icon: "📋", color: "text-purple-400" },
    { label: "Avg. XP Score",
      value: topCandidates.length
        ? Math.round(topCandidates.reduce((s, c) => s + ((c.total_xp as number) ?? 0), 0) / topCandidates.length)
        : 0,
      icon: "⚡", color: "text-yellow-400" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Recruiter Dashboard 🏢</h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">Find top talent ranked by real coding performance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} custom={i} variants={STAT_CARD_VARIANTS} initial="hidden" animate="visible"
            className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl p-4">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-3)] mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Candidates */}
        <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-bold text-sm text-[var(--text-1)]">Top Candidates by XP</h2>
            <a href="/recruiter/candidates" className="text-xs text-brand hover:underline font-semibold">View all →</a>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {topCandidates.slice(0, 6).map((c, i) => (
              <div key={c.id as string} className="px-5 py-3 flex items-center gap-3">
                <span className="text-sm font-bold text-[var(--text-3)] w-5">#{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-xs font-bold text-brand">
                  {(c.username as string)?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[var(--text-1)] truncate">{c.full_name as string}</div>
                  <div className="text-xs text-[var(--text-3)]">@{c.username as string}</div>
                </div>
                {typeof c.rank === "string" && <RankBadge rank={c.rank as GalaxyRank} />}
                <div className="text-xs font-bold text-brand">{(c.total_xp as number)?.toLocaleString()} XP</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--border)]">
            <h2 className="font-bold text-sm text-[var(--text-1)]">Recent Applications</h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentApplications.length === 0 ? (
              <div className="py-10 text-center text-xs text-[var(--text-3)]">No applications yet</div>
            ) : recentApplications.slice(0, 6).map((app) => {
              const profile = app.profiles as Record<string, unknown>;
              const job     = app.job_postings as Record<string, unknown>;
              return (
                <div key={app.id as string} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[var(--text-1)] truncate">{profile?.full_name as string}</div>
                    <div className="text-xs text-[var(--text-3)] truncate">{job?.title as string}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    app.status === "shortlisted" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                    app.status === "rejected"    ? "text-red-400 bg-red-400/10 border-red-400/20" :
                    "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                  }`}>
                    {app.status as string}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
