"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { Challenge } from "@upgradian/types";
import { ChallengeCard } from "@/components/arena/ChallengeCard";
import { SUPPORTED_LANGUAGES } from "@upgradian/types";

const DIFFICULTIES = ["all", "easy", "medium", "hard"] as const;

export function ArenaClient({ challenges }: { challenges: Partial<Challenge>[] }) {
  const [search,   setSearch]   = useState("");
  const [lang,     setLang]     = useState("all");
  const [diff,     setDiff]     = useState<string>("all");

  const filtered = useMemo(() => {
    return challenges.filter(c => {
      const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase());
      const matchLang   = lang === "all" || c.language === lang;
      const matchDiff   = diff === "all" || c.difficulty === diff;
      return matchSearch && matchLang && matchDiff;
    });
  }, [challenges, search, lang, diff]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Coding Arena ⚔️</h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">{challenges.length} challenges · Earn XP · Climb the ranks</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search challenges…"
          className="flex-1 min-w-48 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand transition-colors"
        />
        {/* Language filter */}
        <select value={lang} onChange={e => setLang(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand transition-colors">
          <option value="all">All Languages</option>
          {SUPPORTED_LANGUAGES.map(l => (
            <option key={l.id} value={l.id}>{l.icon} {l.label}</option>
          ))}
        </select>
        {/* Difficulty filter */}
        <div className="flex rounded-xl border border-[var(--border)] overflow-hidden">
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => setDiff(d)}
              className={`px-4 py-2 text-xs font-bold capitalize transition-colors ${
                diff === d
                  ? "bg-brand text-white"
                  : "bg-[var(--bg-2)] text-[var(--text-2)] hover:bg-[var(--bg-3)]"
              }`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-[var(--text-3)] mb-4 font-semibold">
        Showing {filtered.length} of {challenges.length} challenges
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-[var(--text-3)]">
          <div className="text-4xl mb-3">🔍</div>
          <div className="font-semibold">No challenges match your filters</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((challenge, i) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: .4, ease: [.22,1,.36,1] }}
            >
              <ChallengeCard challenge={challenge as Challenge} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
