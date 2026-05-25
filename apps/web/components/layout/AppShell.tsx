"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@upgradian/types";
import { cn } from "@upgradian/ui";
import { RankBadge } from "@upgradian/ui";
import { useGameStore } from "@/store/gameStore";
import { XPNotification } from "@/components/gamification/XPNotification";

const NAV_ITEMS = [
  { href: "/dashboard",    icon: "🏠", label: "Dashboard"   },
  { href: "/arena",        icon: "⚔️",  label: "Coding Arena"},
  { href: "/contests",     icon: "🏆", label: "Contests"    },
  { href: "/leaderboard",  icon: "📊", label: "Leaderboard" },
  { href: "/internships",  icon: "🎯", label: "Internships" },
  { href: "/interview",    icon: "🤖", label: "AI Interview"},
  { href: "/tracks",       icon: "🗺️", label: "Skill Tracks"},
  { href: "/profile",      icon: "👤", label: "Profile"     },
] as const;

interface AppShellProps {
  profile: Profile | null;
  children: React.ReactNode;
}

export function AppShell({ profile, children }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { xp, rank, streakDays, showXPGain, lastXPGain, nextRankInfo } = useGameStore();

  const isArena = pathname === "/arena" || pathname.startsWith("/arena/");

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-1)]">
      {/* ── Sidebar ── */}
      <aside
        id="sidebar"
        aria-label="Navigation sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-[var(--bg-2)] border-r border-[var(--border)] transition-transform duration-300",
          "lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
          <Link href="/dashboard" className="text-xl font-extrabold tracking-tight text-[var(--text-1)]">
            Upgradian<span className="text-brand">.</span>Tech
          </Link>
        </div>

        {/* Profile summary */}
        {profile && (
          <div className="px-4 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {profile.full_name?.[0] ?? profile.username[0]}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[var(--text-1)] truncate">
                  {profile.full_name ?? profile.username}
                </div>
                <RankBadge rank={rank} className="mt-0.5 text-[10px]" />
              </div>
            </div>
            {/* XP bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-[var(--text-3)] mb-1">
                <span>⚡ {xp.toLocaleString()} XP</span>
                <span>🔥 {streakDays}d</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--bg-3)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand to-brand-dark rounded-full transition-all duration-700"
                  style={{ width: `${nextRankInfo().progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-0.5",
                  active
                    ? "bg-brand/15 text-brand border border-brand/20"
                    : "text-[var(--text-2)] hover:bg-[var(--bg-3)] hover:text-[var(--text-1)]"
                )}
                onClick={() => setSidebarOpen(false)}
                aria-current={active ? "page" : undefined}
              >
                <span className="text-base w-5 flex-shrink-0">{item.icon}</span>
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-[var(--border)]">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-2)] hover:bg-[var(--bg-3)] hover:text-[var(--text-1)] transition-colors"
          >
            ⚙️ Settings
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between gap-3 px-4 sm:px-6 border-b border-[var(--border)] bg-[#09090e]/90 backdrop-blur-md">
          {/* Left: hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
            className="lg:hidden p-2 rounded-lg border border-[var(--border)] text-[var(--text-2)] hover:border-brand/40 hover:text-brand transition-colors"
          >
            ☰
          </button>

          {/* Centre spacer */}
          <div className="flex-1" />

          {/* Right: actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Practice CTA — hidden on the arena page itself */}
            {!isArena && (
              <Link
                href="/arena"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-dark transition-all duration-200 active:scale-95 shadow-sm shadow-brand/30"
              >
                ⚔️ Practice
              </Link>
            )}

            {/* Streak */}
            <span className="text-xs font-bold text-[var(--text-3)] hidden md:block">
              🔥 {streakDays} day streak
            </span>

            {/* Notifications */}
            <button
              aria-label="Notifications"
              className="relative p-2 rounded-lg border border-[var(--border)] text-[var(--text-2)] hover:border-brand/40 hover:text-brand transition-colors"
            >
              🔔
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand" aria-hidden="true" />
            </button>

            {/* Mobile avatar (shows user initial when sidebar is closed) */}
            {profile && (
              <Link
                href="/profile"
                aria-label="Go to profile"
                className="lg:hidden w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white font-bold text-sm hover:opacity-80 transition-opacity"
              >
                {profile.full_name?.[0] ?? profile.username[0]}
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* XP notification overlay */}
      {showXPGain && <XPNotification amount={lastXPGain} />}
    </div>
  );
}
