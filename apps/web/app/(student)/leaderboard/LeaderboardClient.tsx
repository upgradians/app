"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { LeaderboardEntry } from "@upgradian/types";
import { RankBadge } from "@upgradian/ui";

const PERIODS = ["weekly", "monthly", "all-time"] as const;
type Period = typeof PERIODS[number];

interface Props {
  entries: (Partial<LeaderboardEntry> & { last_active_at?: string | null })[];
  currentUserId?: string;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardClient({ entries, currentUserId }: Props) {
  const [period, setPeriod] = useState<Period>("all-time");

  const safeEntries = Array.isArray(entries) ? entries : [];

  const now = Date.now();
  const filteredEntries = safeEntries.filter(e => {
    if (period === "all-time") return true;
    const cutoff = period === "weekly" ? 7 : 30;
    const active = e.last_active_at ? new Date(e.last_active_at).getTime() : 0;
    return active > now - cutoff * 86_400_000;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Leaderboard 🏆</h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">Top coders ranked by XP earned</p>
      </div>

      {/* Period tabs */}
      <div className="flex rounded-xl border border-[var(--border)] overflow-hidden w-fit mb-8">
        {PERIODS.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-5 py-2 text-xs font-bold capitalize transition-colors ${
              period === p ? "bg-brand text-white" : "bg-[var(--bg-2)] text-[var(--text-2)] hover:bg-[var(--bg-3)]"
            }`}>
            {p}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {filteredEntries.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {[1, 0, 2].map((rank) => {
            const entry = filteredEntries[rank];
            if (!entry) return null;
            const isFirst = rank === 0;
            return (
              <motion.div
                key={rank}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rank * 0.1 }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${
                  isFirst
                    ? "border-brand/40 bg-brand/5 pb-8 pt-6"
                    : "border-[var(--border)] bg-[var(--bg-2)] pt-4"
                }`}
                style={{ minWidth: isFirst ? 140 : 120 }}
              >
                <div className="text-3xl">{MEDALS[rank]}</div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 border-2 border-brand/30 flex items-center justify-center text-lg font-bold text-brand">
                  {(entry.username ?? "?")[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm text-[var(--text-1)] truncate max-w-[100px]">{entry.username ?? "—"}</div>
                  <div className="text-xs text-brand font-bold mt-0.5">{Number(entry.total_xp ?? 0).toLocaleString()} XP</div>
                </div>
                {entry.rank && <RankBadge rank={entry.rank} />}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="grid grid-cols-[auto,1fr,auto,auto,auto] items-center px-5 py-3 text-xs font-bold uppercase tracking-wider text-[var(--text-3)] border-b border-[var(--border)] bg-[var(--bg-2)]">
          <div className="w-10">#</div>
          <div>Coder</div>
          <div className="hidden sm:block text-right pr-6">Solved</div>
          <div className="hidden sm:block text-right pr-6">Streak</div>
          <div className="text-right">XP</div>
        </div>

        {filteredEntries.map((entry, i) => {
          const isMe = entry.user_id === currentUserId;
          return (
            <motion.div
              key={entry.user_id ?? i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`grid grid-cols-[auto,1fr,auto,auto,auto] items-center px-5 py-3.5 border-b border-[var(--border)] last:border-0 transition-colors ${
                isMe ? "bg-brand/5" : "hover:bg-[var(--bg-2)]"
              }`}
            >
              <div className="w-10 text-sm font-bold text-[var(--text-3)]">
                {i < 3 ? MEDALS[i] : <span className="text-[var(--text-3)]">#{i + 1}</span>}
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/20 flex items-center justify-center text-sm font-bold text-brand flex-shrink-0">
                  {(entry.username ?? "?")[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <div className={`font-bold text-sm truncate ${isMe ? "text-brand" : "text-[var(--text-1)]"}`}>
                    {entry.username ?? "Anonymous"} {isMe && <span className="text-xs">(you)</span>}
                  </div>
                  {entry.rank && <div className="mt-0.5"><RankBadge rank={entry.rank} /></div>}
                </div>
              </div>

              <div className="hidden sm:block text-right pr-6 text-sm text-[var(--text-2)] font-semibold">
                {Number(entry.challenges_solved ?? 0)}
              </div>
              <div className="hidden sm:block text-right pr-6 text-sm text-[var(--text-2)] font-semibold">
                🔥 {Number(entry.streak_days ?? 0)}
              </div>
              <div className="text-right text-sm font-bold text-brand">
                {Number(entry.total_xp ?? 0).toLocaleString()}
              </div>
            </motion.div>
          );
        })}

        {filteredEntries.length === 0 && (
          <div className="py-16 text-center text-[var(--text-3)]">
            <div className="text-4xl mb-3">🏆</div>
            <div className="font-semibold">
              {period === "all-time" ? "No data yet. Start coding!" : `No activity in the last ${period === "weekly" ? "7" : "30"} days.`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
