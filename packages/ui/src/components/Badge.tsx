import React from "react";
import { cn } from "../utils";
import type { Difficulty, GalaxyRank } from "@upgradian/types";

// ─── Difficulty Badge ─────────────────────────────────────────────────────────

const difficultyConfig: Record<Difficulty, { label: string; className: string }> = {
  easy:   { label: "Easy",   className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  medium: { label: "Medium", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"   },
  hard:   { label: "Hard",   className: "bg-red-500/15    text-red-400    border-red-500/30"       },
};

export function DifficultyBadge({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  const { label, className: dc } = difficultyConfig[difficulty];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border", dc, className)}>
      {label}
    </span>
  );
}

// ─── Rank Badge ───────────────────────────────────────────────────────────────

const rankConfig: Record<GalaxyRank, { emoji: string; className: string }> = {
  "Bronze Coder":     { emoji: "🥉", className: "bg-amber-900/20  text-amber-600  border-amber-700/40"  },
  "Silver Developer": { emoji: "🥈", className: "bg-slate-500/15  text-slate-400  border-slate-500/30"  },
  "Gold Engineer":    { emoji: "🥇", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  "Cosmic Master":    { emoji: "🌌", className: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
};

export function RankBadge({ rank, showEmoji = true, className }: { rank: GalaxyRank; showEmoji?: boolean; className?: string }) {
  const { emoji, className: rc } = rankConfig[rank];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border", rc, className)}>
      {showEmoji && <span>{emoji}</span>}
      {rank}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusConfig: Record<string, string> = {
  accepted:      "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  wrong_answer:  "bg-red-500/15     text-red-400     border-red-500/30",
  timeout:       "bg-yellow-500/15  text-yellow-400  border-yellow-500/30",
  time_limit:    "bg-yellow-500/15  text-yellow-400  border-yellow-500/30", // legacy
  runtime_error: "bg-orange-500/15  text-orange-400  border-orange-500/30",
  compile_error: "bg-pink-500/15    text-pink-400    border-pink-500/30",
  pending:       "bg-slate-500/15   text-slate-400   border-slate-500/30",
  running:       "bg-blue-500/15    text-blue-400    border-blue-500/30",
  live:          "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  upcoming:      "bg-blue-500/15    text-blue-400    border-blue-500/30",
  ended:         "bg-slate-500/15   text-slate-400   border-slate-500/30",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const cls = statusConfig[status] ?? statusConfig.pending;
  const isLive = status === "live" || status === "running";
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border", cls, className)}>
      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {status.replace("_", " ")}
    </span>
  );
}

// ─── XP Badge ─────────────────────────────────────────────────────────────────

export function XPBadge({ xp, className }: { xp: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold text-brand border border-brand/25 bg-brand/10", className)}>
      ⚡ {xp.toLocaleString()} XP
    </span>
  );
}
