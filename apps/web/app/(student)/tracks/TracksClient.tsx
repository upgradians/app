"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { SkillTrack, UserTrackProgress } from "@upgradian/types";
import { Card } from "@upgradian/ui";

interface Props {
  tracks: Partial<SkillTrack>[];
  progress: Partial<UserTrackProgress>[];
}

export function TracksClient({ tracks, progress }: Props) {
  const getProgress = (trackId: string) =>
    progress.find(p => p.track_id === trackId);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Skill Tracks 📚</h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">Structured learning paths. Master one skill at a time.</p>
      </div>

      {tracks.length === 0 ? (
        <div className="py-20 text-center text-[var(--text-3)]">
          <div className="text-4xl mb-3">📚</div>
          <div className="font-semibold">No tracks available yet</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tracks.map((track, i) => {
            const prog = track.id ? getProgress(track.id) : undefined;
            const completedCount = prog?.completed_challenges ?? 0;
            const totalCount = prog?.total_challenges ?? track.challenges?.length ?? 0;
            const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const isCompleted = totalCount > 0 && completedCount >= totalCount;

            return (
              <motion.div key={track.id ?? i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}>
                <Link href={`/tracks/${track.id}`}>
                  <Card hover glow className="h-full flex flex-col">
                    {/* Icon + status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-2xl">
                        {track.icon ?? "📘"}
                      </div>
                      {isCompleted && (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                          ✓ Completed
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-[var(--text-1)] text-base leading-snug mb-1.5">
                      {track.name}
                    </h3>

                    {track.description && (
                      <p className="text-xs text-[var(--text-3)] line-clamp-2 mb-3">{track.description}</p>
                    )}

                    {track.estimated_weeks && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="px-2 py-0.5 rounded-md bg-[var(--bg-3)] text-[10px] text-[var(--text-3)]">~{track.estimated_weeks}w</span>
                        {track.challenges && <span className="px-2 py-0.5 rounded-md bg-[var(--bg-3)] text-[10px] text-[var(--text-3)]">{track.challenges.length} challenges</span>}
                      </div>
                    )}

                    {/* Progress */}
                    {totalCount > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-[var(--text-3)]">{completedCount}/{totalCount} challenges</span>
                          <span className="font-bold text-brand">{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[var(--bg-3)] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-brand to-brand/70"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: .8, delay: i * 0.06 + .3, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between">
                      <span className="text-xs text-[var(--text-3)]">
                        {completedCount}/{totalCount} done
                      </span>
                      <span className="text-xs font-bold text-brand">
                        {pct > 0 ? "Continue →" : "Start →"}
                      </span>
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
