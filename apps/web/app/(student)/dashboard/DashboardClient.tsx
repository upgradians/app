"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Profile, Submission, Challenge } from "@upgradian/types";
import { Card, RankBadge, DifficultyBadge, StatusBadge, XPBadge } from "@upgradian/ui";
import { useGameStore } from "@/store/gameStore";
import { EmptyState } from "@/components/ui/EmptyState";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: .5, ease: [.22, 1, .36, 1] } },
};

interface DailyInfo {
  challenge:     Challenge;
  xp_multiplier: number;
  bonus_xp:      number;
}

interface DashboardClientProps {
  profile: Profile | null;
  recentSubmissions: (Submission & { challenge?: { title: string; difficulty: string; slug: string } | null })[];
  topPlayers: Pick<Profile, "username" | "full_name" | "total_xp" | "rank" | "avatar_url">[];
  dailyChallenge: DailyInfo | null;
}

interface StatItem {
  icon: string;
  label: string;
  key: string;
  color: string;
  suffix?: string;
}

const STATS: StatItem[] = [
  { icon: "⚔️",  label: "Challenges", key: "challenges_solved", color: "text-brand"     },
  { icon: "🏆", label: "Contests",   key: "contests_won",      color: "text-amber-400" },
  { icon: "🔥", label: "Streak",     key: "streak_days",       color: "text-orange-400", suffix: "d" },
  { icon: "🎯", label: "Missions",   key: "missions_done",     color: "text-sky-400"   },
];

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    function update() {
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const ms = midnight.getTime() - Date.now();
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
}

export function DashboardClient({ profile, recentSubmissions, topPlayers, dailyChallenge }: DashboardClientProps) {
  const { setFromProfile, xp, rank, nextRankInfo } = useGameStore();
  const timeLeft = useCountdown();

  useEffect(() => {
    if (profile) {
      setFromProfile(Number(profile.total_xp ?? 0), Number(profile.streak_days ?? 0));
    }
  }, [profile, setFromProfile]);

  const { next, needed, progress } = nextRankInfo();

  const safeXP        = Number(xp ?? 0);
  const safeNeeded    = Number(needed ?? 0);
  const safeProgress  = Number(progress ?? 0);
  const challengesSolved = Number((profile as Record<string, number> | null)?.challenges_solved ?? 0);
  const profileComplete  = !!(profile?.full_name);

  const safeSubmissions = Array.isArray(recentSubmissions) ? recentSubmissions : [];
  const safePlayers     = Array.isArray(topPlayers) ? topPlayers : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">
          Welcome back, {profile?.full_name?.split(" ")?.[0] ?? profile?.username ?? "Coder"} 👋
        </h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">
          Keep pushing — you&apos;re {safeNeeded.toLocaleString()} XP away from {next ?? "the top"}.
        </p>
      </motion.div>

      {/* Daily Challenge */}
      {dailyChallenge && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: .02 }}>
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Daily Challenge</span>
              </div>
              <div className="text-xs text-[var(--text-3)] font-mono tabular-nums">Resets in {timeLeft}</div>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[var(--text-1)] mb-1">{dailyChallenge.challenge.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <DifficultyBadge difficulty={dailyChallenge.challenge.difficulty} />
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                    +{((dailyChallenge.challenge.xp_reward ?? 0) * dailyChallenge.xp_multiplier) + dailyChallenge.bonus_xp} XP bonus
                  </span>
                </div>
              </div>
              <Link
                href={`/arena/${dailyChallenge.challenge.slug}`}
                className="flex-shrink-0 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold transition-colors whitespace-nowrap"
              >
                Solve Now →
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Onboarding checklist */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: .04 }}>
        <OnboardingChecklist
          challengesSolved={challengesSolved}
          profileComplete={profileComplete}
        />
      </motion.div>

      {/* XP Progress */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: .08 }}>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-extrabold text-[var(--text-1)] tracking-tight">
                {safeXP.toLocaleString()} <span className="text-brand text-xl">XP</span>
              </div>
              <RankBadge rank={rank} className="mt-1.5" />
            </div>
            {next && (
              <div className="text-right">
                <div className="text-xs text-[var(--text-3)] mb-1">Next: {next}</div>
                <div className="text-sm font-bold text-[var(--text-2)]">{safeNeeded.toLocaleString()} XP needed</div>
              </div>
            )}
          </div>
          <div className="h-2 rounded-full bg-[var(--bg-3)] overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand to-brand-dark rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(safeProgress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: .3 }}
            />
          </div>
        </Card>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.key}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: .12 + i * .05 }}
          >
            <Card hover padding="sm" className="text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-extrabold ${s.color}`}>
                {Number((profile as Record<string, number> | null)?.[s.key] ?? 0)}{s.suffix ?? ""}
              </div>
              <div className="text-xs text-[var(--text-3)] font-semibold uppercase tracking-wider mt-0.5">
                {s.label}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent submissions */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: .22 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[var(--text-1)]">Recent Submissions</h2>
            <Link href="/arena" className="text-xs text-brand font-semibold hover:underline transition-colors">
              View all →
            </Link>
          </div>
          <Card padding="none">
            {safeSubmissions.length === 0 ? (
              <EmptyState
                icon="⚔️"
                title="No submissions yet"
                description="Solve your first challenge to start building your track record."
                action={{ label: "Go to Arena", href: "/arena" }}
                compact
              />
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {safeSubmissions.map((sub) => (
                  <div
                    key={sub.id ?? Math.random()}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-2)] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusBadge status={sub.status ?? "pending"} />
                      <div className="min-w-0">
                        <Link
                          href={sub.challenge?.slug ? `/arena/${sub.challenge.slug}` : "/arena"}
                          className="text-sm font-semibold text-[var(--text-1)] hover:text-brand truncate block transition-colors"
                        >
                          {sub.challenge?.title ?? "Unknown Challenge"}
                        </Link>
                        <span className="text-xs text-[var(--text-3)]">{sub.language ?? ""}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {sub.challenge && (
                        <DifficultyBadge difficulty={sub.challenge.difficulty as "easy" | "medium" | "hard"} />
                      )}
                      {Number(sub.xp_earned ?? 0) > 0 && <XPBadge xp={Number(sub.xp_earned)} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Top players */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: .26 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[var(--text-1)]">Top Coders This Week</h2>
            <Link href="/leaderboard" className="text-xs text-brand font-semibold hover:underline transition-colors">
              Full board →
            </Link>
          </div>
          <Card padding="none">
            {safePlayers.length === 0 ? (
              <EmptyState
                icon="🏆"
                title="Leaderboard loading"
                description="Come back shortly to see who's leading the pack."
                compact
              />
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {safePlayers.map((p, i) => (
                  <div
                    key={p.username ?? i}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-2)] transition-colors"
                  >
                    <span className="text-sm font-extrabold w-5 text-center text-[var(--text-3)]">
                      {i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(p.full_name ?? p.username ?? "?")[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-[var(--text-1)] truncate">
                        {p.full_name ?? p.username ?? "Anonymous"}
                      </div>
                      <RankBadge rank={p.rank as Profile["rank"]} showEmoji={false} className="text-[10px] mt-0.5" />
                    </div>
                    <div className="text-sm font-extrabold text-brand">
                      {Number(p.total_xp ?? 0).toLocaleString()} XP
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: .3 }}>
        <h2 className="text-base font-bold text-[var(--text-1)] mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/arena",       icon: "⚔️",  label: "Solve a Challenge",  color: "from-brand/15 to-brand/5"           },
            { href: "/contests",    icon: "🏆", label: "Join a Contest",      color: "from-amber-500/15 to-amber-500/5"   },
            { href: "/interview",   icon: "🤖", label: "Practice Interview",  color: "from-indigo-500/15 to-indigo-500/5" },
            { href: "/internships", icon: "🎯", label: "Pick a Mission",      color: "from-emerald-500/15 to-emerald-500/5" },
          ].map((a) => (
            <Link key={a.href} href={a.href}>
              <Card
                hover
                glow
                padding="sm"
                className={`bg-gradient-to-br ${a.color} text-center active:scale-95 transition-transform`}
              >
                <div className="text-2xl mb-2">{a.icon}</div>
                <div className="text-xs font-bold text-[var(--text-1)]">{a.label}</div>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
