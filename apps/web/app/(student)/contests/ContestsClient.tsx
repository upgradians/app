"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Contest } from "@upgradian/types";
import { Card } from "@upgradian/ui";

const TABS = ["upcoming", "live", "past"] as const;
type Tab = typeof TABS[number];

interface Props { contests: Partial<Contest>[] }

function statusOf(c: Partial<Contest>): Tab {
  const now = Date.now();
  const start = c.start_time ? new Date(c.start_time).getTime() : 0;
  const end   = c.end_time   ? new Date(c.end_time).getTime()   : 0;
  if (now < start) return "upcoming";
  if (now > end)   return "past";
  return "live";
}

function Countdown({ target }: { target: string }) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return <span>{h}h {m}m {s}s</span>;
}

export function ContestsClient({ contests }: Props) {
  const [tab, setTab] = useState<Tab>("live");

  const filtered = contests.filter(c => statusOf(c) === tab);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Contests ⚔️</h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">Compete. Win prizes. Earn glory.</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-[var(--border)] overflow-hidden w-fit mb-8">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 text-xs font-bold capitalize transition-colors flex items-center gap-1.5 ${
              tab === t ? "bg-brand text-white" : "bg-[var(--bg-2)] text-[var(--text-2)] hover:bg-[var(--bg-3)]"
            }`}>
            {t === "live" && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            {t}
            <span className={`text-xs px-1.5 rounded-full ${tab === t ? "bg-white/20" : "bg-[var(--bg-3)]"}`}>
              {contests.filter(c => statusOf(c) === t).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-[var(--text-3)]">
          <div className="text-4xl mb-3">🗓️</div>
          <div className="font-semibold">No {tab} contests right now</div>
          {tab === "upcoming" && <div className="text-sm mt-1">Check back soon for new contests</div>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((contest, i) => {
            const status = statusOf(contest);
            return (
              <motion.div key={contest.id ?? i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}>
                <Link href={`/contests/${contest.slug ?? contest.id}`}>
                  <Card hover glow className="h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {status === "live" && (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              LIVE
                            </span>
                          )}
                          {status === "upcoming" && (
                            <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                              UPCOMING
                            </span>
                          )}
                          {status === "past" && (
                            <span className="text-xs font-bold text-[var(--text-3)] bg-[var(--bg-3)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                              ENDED
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-[var(--text-1)] text-base leading-tight">{contest.title}</h3>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        status === "live" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                        status === "upcoming" ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" :
                        "text-[var(--text-3)] bg-[var(--bg-3)] border-[var(--border)]"
                      }`}>{status}</span>
                    </div>

                    {contest.description && (
                      <p className="text-xs text-[var(--text-3)] line-clamp-2 mb-4">{contest.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-[var(--bg-2)] rounded-lg p-2.5 text-center">
                        <div className="text-xs text-[var(--text-3)] mb-0.5">Duration</div>
                        <div className="text-sm font-bold text-[var(--text-1)]">
                          {contest.start_time && contest.end_time
                            ? `${Math.round((new Date(contest.end_time).getTime() - new Date(contest.start_time).getTime()) / 3600000)}h`
                            : "—"}
                        </div>
                      </div>
                      <div className="bg-[var(--bg-2)] rounded-lg p-2.5 text-center">
                        <div className="text-xs text-[var(--text-3)] mb-0.5">Participants</div>
                        <div className="text-sm font-bold text-[var(--text-1)]">
                          {contest.participant_count?.toLocaleString() ?? 0}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                      {status === "upcoming" && contest.start_time && (
                        <div className="text-xs text-yellow-400 font-semibold">
                          ⏰ Starts in <Countdown target={contest.start_time} />
                        </div>
                      )}
                      {status === "live" && contest.end_time && (
                        <div className="text-xs text-emerald-400 font-semibold">
                          ⏱ Ends in <Countdown target={contest.end_time} />
                        </div>
                      )}
                      {status === "past" && (
                        <div className="text-xs text-[var(--text-3)]">Contest ended</div>
                      )}
                      {contest.prize_pool && (
                        <div className="text-xs font-bold text-brand">
                          🏆 {contest.prize_pool.first}
                        </div>
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
