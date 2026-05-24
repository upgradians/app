"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const TASKS = [
  {
    id: "profile",
    label: "Complete your profile",
    desc: "Add your full name and bio",
    icon: "👤",
    href: "/profile",
  },
  {
    id: "first_challenge",
    label: "Solve your first challenge",
    desc: "Earn XP and start your streak",
    icon: "⚔️",
    href: "/arena",
  },
  {
    id: "join_contest",
    label: "Join a contest",
    desc: "Compete globally and win prizes",
    icon: "🏆",
    href: "/contests",
  },
  {
    id: "explore_tracks",
    label: "Explore Skill Tracks",
    desc: "Find your personalised learning path",
    icon: "🗺️",
    href: "/tracks",
  },
] as const;

type TaskId = (typeof TASKS)[number]["id"];

const STORAGE_KEY = "upgradian_onboarding_v1";

interface StoredState {
  dismissed: boolean;
  completed: TaskId[];
}

interface OnboardingChecklistProps {
  challengesSolved: number;
  profileComplete: boolean;
}

export function OnboardingChecklist({ challengesSolved, profileComplete }: OnboardingChecklistProps) {
  const [state, setState] = useState<StoredState>({ dismissed: false, completed: [] });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored: StoredState = raw ? JSON.parse(raw) : { dismissed: false, completed: [] };

    // Auto-mark tasks that we can detect from server data
    const auto = new Set<TaskId>(stored.completed);
    if (profileComplete) auto.add("profile");
    if (challengesSolved > 0) auto.add("first_challenge");

    const next = { ...stored, completed: Array.from(auto) };
    setState(next);
    setMounted(true);
  }, [challengesSolved, profileComplete]);

  function persist(next: StoredState) {
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function markVisited(id: TaskId) {
    if (state.completed.includes(id)) return;
    persist({ ...state, completed: [...state.completed, id] });
  }

  function dismiss() {
    persist({ ...state, dismissed: true });
  }

  if (!mounted || state.dismissed || state.completed.length >= TASKS.length) return null;

  const progress = Math.round((state.completed.length / TASKS.length) * 100);

  return (
    <div className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/[0.06] to-transparent p-5 relative">
      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss getting-started checklist"
        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-3)] transition-colors"
      >
        ✕
      </button>

      {/* Header */}
      <div className="mb-4 pr-6">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base">🚀</span>
          <h3 className="font-bold text-[var(--text-1)] text-sm">Getting started</h3>
        </div>
        <p className="text-xs text-[var(--text-3)] mb-2.5">
          {state.completed.length} of {TASKS.length} complete
        </p>
        <div className="h-1.5 rounded-full bg-[var(--bg-3)] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand to-brand-dark rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-1">
        {TASKS.map((task) => {
          const done = state.completed.includes(task.id);
          return (
            <Link
              key={task.id}
              href={task.href}
              onClick={() => markVisited(task.id)}
              aria-disabled={done}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                done
                  ? "opacity-50 pointer-events-none"
                  : "hover:bg-brand/[0.08] border border-transparent hover:border-brand/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
              ].join(" ")}
            >
              {/* Checkbox */}
              <div
                className={[
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200",
                  done ? "border-brand bg-brand" : "border-[var(--border)] group-hover:border-brand/50",
                ].join(" ")}
              >
                {done && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>

              <span className="text-base">{task.icon}</span>

              <div className="min-w-0 flex-1">
                <div className={`text-sm font-semibold leading-none mb-0.5 ${done ? "line-through text-[var(--text-3)]" : "text-[var(--text-1)]"}`}>
                  {task.label}
                </div>
                <div className="text-xs text-[var(--text-3)]">{task.desc}</div>
              </div>

              {!done && (
                <span className="text-xs text-brand font-bold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  Go →
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
