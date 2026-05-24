"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Challenge } from "@upgradian/types";
import { Card, DifficultyBadge, XPBadge } from "@upgradian/ui";
import { SUPPORTED_LANGUAGES } from "@upgradian/types";

interface Props { challenge: Challenge }

export function ChallengeCard({ challenge }: Props) {
  const langMeta = SUPPORTED_LANGUAGES.find(l => l.id === challenge.language);
  const acceptanceColor = challenge.acceptance_rate
    ? challenge.acceptance_rate >= 60 ? "text-emerald-400"
    : challenge.acceptance_rate >= 40 ? "text-amber-400"
    : "text-red-400"
    : "text-[var(--text-3)]";

  return (
    <Link href={`/arena/${challenge.slug}`}>
      <Card hover glow className="h-full flex flex-col group">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-brand/15 border border-brand/20 flex items-center justify-center text-xl flex-shrink-0">
            {langMeta?.icon ?? "💻"}
          </div>
          <DifficultyBadge difficulty={challenge.difficulty} />
        </div>

        {/* Title */}
        <h3 className="font-bold text-[var(--text-1)] text-sm leading-snug mb-1 group-hover:text-brand transition-colors line-clamp-2">
          {challenge.title}
        </h3>
        <p className="text-xs text-[var(--text-3)] font-semibold uppercase tracking-wider mb-3">
          {langMeta?.label ?? challenge.language}
        </p>

        {/* Tags */}
        {challenge.tags?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-3">
            {challenge.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-md bg-[var(--bg-3)] text-[var(--text-3)] text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto space-y-2">
          {/* Stats row */}
          <div className="flex items-center justify-between text-xs text-[var(--text-3)]">
            <span>👥 {challenge.solved_by?.toLocaleString() ?? 0} solved</span>
            {challenge.acceptance_rate !== undefined && (
              <span className={`font-semibold ${acceptanceColor}`}>
                {challenge.acceptance_rate.toFixed(0)}% acceptance
              </span>
            )}
          </div>

          {/* XP + CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
            <XPBadge xp={challenge.xp_reward} />
            <span className="text-xs font-bold text-brand group-hover:translate-x-0.5 transition-transform">
              Solve →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
