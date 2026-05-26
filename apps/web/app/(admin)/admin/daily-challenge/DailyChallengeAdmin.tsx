"use client";

import { useState } from "react";

interface ScheduledEntry {
  id:            string;
  challenge_id:  string;
  challenge_date: string;
  xp_multiplier: number;
  bonus_xp:      number;
}

interface ChallengeOption {
  id:         string;
  title:      string;
  slug:       string;
  difficulty: string;
}

interface Props {
  scheduled:       ScheduledEntry[];
  dbChallenges:    ChallengeOption[];
  seedChallenges:  ChallengeOption[];
}

export function DailyChallengeAdmin({ scheduled, dbChallenges, seedChallenges }: Props) {
  const allChallenges = [...seedChallenges, ...dbChallenges];

  const [date,         setDate]         = useState(new Date().toISOString().slice(0, 10));
  const [challengeId,  setChallengeId]  = useState(allChallenges[0]?.id ?? "");
  const [xpMultiplier, setXpMultiplier] = useState("2");
  const [bonusXp,      setBonusXp]      = useState("0");
  const [saving,       setSaving]       = useState(false);
  const [msg,          setMsg]          = useState<{ ok: boolean; text: string } | null>(null);
  const [list,         setList]         = useState(scheduled);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/daily-challenge", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge_id:  challengeId,
          challenge_date: date,
          xp_multiplier: Number(xpMultiplier),
          bonus_xp:      Number(bonusXp),
        }),
      });
      const json = await res.json() as { error?: string; entry?: ScheduledEntry };
      if (!res.ok) {
        setMsg({ ok: false, text: json.error ?? "Failed to save." });
      } else {
        setMsg({ ok: true, text: `Daily challenge scheduled for ${date}.` });
        if (json.entry) setList(prev => [json.entry!, ...prev.filter(e => e.challenge_date !== date)]);
      }
    } catch {
      setMsg({ ok: false, text: "Network error." });
    } finally {
      setSaving(false);
    }
  }

  const diffColor: Record<string, string> = {
    easy:   "text-emerald-400",
    medium: "text-yellow-400",
    hard:   "text-red-400",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Daily Challenge Scheduler</h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">Schedule which challenge appears on students&apos; dashboards each day.</p>
      </div>

      {/* Schedule form */}
      <form onSubmit={handleSave} className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-sm text-[var(--text-1)] mb-1">Schedule a Day</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-2)] mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-1)] text-[var(--text-1)] text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-2)] mb-1.5">Challenge</label>
            <select
              value={challengeId}
              onChange={e => setChallengeId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-1)] text-[var(--text-1)] text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
            >
              <optgroup label="Seed Challenges">
                {seedChallenges.map(c => (
                  <option key={c.id} value={c.id}>{c.title} ({c.difficulty})</option>
                ))}
              </optgroup>
              {dbChallenges.length > 0 && (
                <optgroup label="DB Challenges">
                  {dbChallenges.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.difficulty})</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-2)] mb-1.5">XP Multiplier</label>
            <input
              type="number"
              value={xpMultiplier}
              onChange={e => setXpMultiplier(e.target.value)}
              min="1"
              max="10"
              step="0.5"
              required
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-1)] text-[var(--text-1)] text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-2)] mb-1.5">Bonus XP (flat)</label>
            <input
              type="number"
              value={bonusXp}
              onChange={e => setBonusXp(e.target.value)}
              min="0"
              required
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-1)] text-[var(--text-1)] text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>
        </div>

        {msg && (
          <div className={`text-xs font-semibold px-3 py-2 rounded-lg border ${
            msg.ok
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}>
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-brand text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? "Saving…" : "Schedule Challenge"}
        </button>
      </form>

      {/* Upcoming schedule */}
      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)]">
          <h2 className="font-bold text-sm text-[var(--text-1)]">Scheduled Challenges</h2>
        </div>
        {list.length === 0 ? (
          <div className="py-10 text-center text-[var(--text-3)] text-sm">No challenges scheduled yet.</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {list.map(entry => {
              const ch = allChallenges.find(c => c.id === entry.challenge_id);
              return (
                <div key={entry.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="text-xs font-mono font-bold text-[var(--text-3)] w-28">{entry.challenge_date}</div>
                  <div className="flex-1 text-sm font-bold text-[var(--text-1)]">{ch?.title ?? entry.challenge_id}</div>
                  {ch && (
                    <span className={`text-xs font-bold capitalize ${diffColor[ch.difficulty] ?? "text-[var(--text-3)]"}`}>
                      {ch.difficulty}
                    </span>
                  )}
                  <span className="text-xs text-[var(--text-3)]">{entry.xp_multiplier}× XP</span>
                  {entry.bonus_xp > 0 && (
                    <span className="text-xs text-brand">+{entry.bonus_xp} bonus</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
