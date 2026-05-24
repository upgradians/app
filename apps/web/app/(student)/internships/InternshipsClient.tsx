"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Mission, MissionSubmission } from "@upgradian/types";
import { Card, DifficultyBadge, XPBadge, StatusBadge } from "@upgradian/ui";

interface Props {
  missions: Partial<Mission>[];
  mySubmissions: Partial<MissionSubmission>[];
}

export function InternshipsClient({ missions, mySubmissions }: Props) {
  const [search, setSearch] = useState("");
  const [diff,   setDiff]   = useState("all");

  const submittedIds = useMemo(
    () => new Set(mySubmissions.map(s => s.mission_id)),
    [mySubmissions]
  );

  const filtered = useMemo(() =>
    missions.filter(m => {
      const matchSearch = !search || m.title?.toLowerCase().includes(search.toLowerCase());
      const matchDiff   = diff === "all" || m.difficulty === diff;
      return matchSearch && matchDiff;
    }),
    [missions, search, diff]
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Internship Missions 🎯</h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">Real-world projects from top companies. Build your portfolio.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search missions…"
          className="flex-1 min-w-48 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand transition-colors" />
        <div className="flex rounded-xl border border-[var(--border)] overflow-hidden">
          {["all", "easy", "medium", "hard"].map(d => (
            <button key={d} onClick={() => setDiff(d)}
              className={`px-4 py-2 text-xs font-bold capitalize transition-colors ${
                diff === d ? "bg-brand text-white" : "bg-[var(--bg-2)] text-[var(--text-2)] hover:bg-[var(--bg-3)]"
              }`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-[var(--text-3)] mb-4 font-semibold">
        {filtered.length} missions available
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-[var(--text-3)]">
          <div className="text-4xl mb-3">🔍</div>
          <div className="font-semibold">No missions match your filters</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((mission, i) => {
            const submitted = submittedIds.has(mission.id);
            const sub = mySubmissions.find(s => s.mission_id === mission.id);
            return (
              <motion.div key={mission.id ?? i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <Link href={`/internships/${mission.id}`}>
                  <Card hover glow className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] flex items-center justify-center text-sm font-bold text-[var(--text-2)]">
                          🎯
                        </div>
                        <span className="text-xs font-semibold text-[var(--text-3)]">{mission.duration_weeks ? `${mission.duration_weeks}w` : "Project"}</span>
                      </div>
                      {submitted && sub?.status && <StatusBadge status={sub.status} />}
                    </div>

                    <h3 className="font-extrabold text-[var(--text-1)] text-sm leading-snug mb-1.5 line-clamp-2">
                      {mission.title}
                    </h3>

                    {mission.description && (
                      <p className="text-xs text-[var(--text-3)] line-clamp-2 mb-3">{mission.description}</p>
                    )}

                    {mission.tech_stack && mission.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {mission.tech_stack.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-md bg-[var(--bg-3)] text-[var(--text-3)] text-xs">{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DifficultyBadge difficulty={mission.difficulty ?? "medium"} />
                        <XPBadge xp={mission.xp_reward ?? 0} />
                      </div>
                      {mission.duration_weeks && (
                        <span className="text-xs text-[var(--text-3)]">
                          📅 {mission.duration_weeks}w project
                        </span>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
