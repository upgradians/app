"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Swords, Trophy, BarChart3, Briefcase,
  Bot, Map, User, Settings, Menu, Bell, Zap, Flame, ClipboardList,
} from "lucide-react";
import type { Profile } from "@upgradian/types";
import { cn } from "@upgradian/ui";
import { RankBadge } from "@upgradian/ui";
import { useGameStore } from "@/store/gameStore";
import { XPNotification } from "@/components/gamification/XPNotification";

const NAV_ITEMS = [
  { href: "/dashboard",   icon: LayoutDashboard, label: "Dashboard"    },
  { href: "/arena",       icon: Swords,          label: "Coding Arena" },
  { href: "/assessment",  icon: ClipboardList,   label: "Assessment"   },
  { href: "/contests",    icon: Trophy,          label: "Contests"     },
  { href: "/leaderboard", icon: BarChart3,       label: "Leaderboard"  },
  { href: "/internships", icon: Briefcase,       label: "Internships"  },
  { href: "/interview",   icon: Bot,             label: "AI Interview" },
  { href: "/tracks",      icon: Map,             label: "Skill Tracks" },
  { href: "/profile",     icon: User,            label: "Profile"      },
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
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-1)" }}>

      {/* ── Sidebar ── */}
      <aside
        id="sidebar"
        aria-label="Navigation sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col w-64 transition-transform duration-300",
          "lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "var(--bg-2)", borderRight: "1px solid var(--border)" }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <Link href="/dashboard" className="flex items-center gap-2 text-base font-extrabold tracking-tight text-[var(--text-1)] hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            Upgradian<span className="text-brand">.</span>Tech
          </Link>
        </div>

        {/* Profile summary */}
        {profile && (
          <div className="px-4 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
              >
                {profile.full_name?.[0] ?? profile.username[0]}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: "var(--text-1)" }}>
                  {profile.full_name ?? profile.username}
                </div>
                <RankBadge rank={rank} className="mt-0.5 text-[10px]" />
              </div>
            </div>
            {/* XP bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-3)" }}>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3" style={{ color: "#6c8aff" }} />{xp.toLocaleString()} XP</span>
                <span className="flex items-center gap-1"><Flame className="w-3 h-3" style={{ color: "#f59e0b" }} />{streakDays}d streak</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-3)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${nextRankInfo().progress}%`, background: "linear-gradient(90deg, #4361ee, #7c3aed)" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-0.5",
                  active
                    ? "text-white"
                    : "hover:bg-[var(--bg-3)] hover:text-[var(--text-1)]"
                )}
                style={active ? {
                  background: "rgba(67,97,238,0.15)",
                  border: "1px solid rgba(67,97,238,0.25)",
                  color: "#6c8aff",
                } : {
                  color: "var(--text-3)",
                  border: "1px solid transparent",
                }}
                onClick={() => setSidebarOpen(false)}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2 : 1.5} />
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#6c8aff" }} aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-[var(--bg-3)] hover:text-[var(--text-1)]"
            style={{ color: "var(--text-3)" }}
          >
            <Settings className="w-4 h-4" strokeWidth={1.5} />
            Settings
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="h-16 flex items-center justify-between gap-3 px-4 sm:px-6"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-1)", backdropFilter: "blur(12px)" }}
        >
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
            className="lg:hidden p-2 rounded-xl transition-all hover:bg-[var(--bg-3)]"
            style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!isArena && (
              <Link
                href="/arena"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold transition-all duration-200 active:scale-95"
                style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 4px 16px rgba(67,97,238,0.3)" }}
              >
                <Swords className="w-3.5 h-3.5" strokeWidth={2} />
                Practice
              </Link>
            )}

            <button
              aria-label="Notifications"
              className="relative p-2 rounded-xl transition-all hover:bg-[var(--bg-3)]"
              style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "#4361ee" }} aria-hidden="true" />
            </button>

            {profile && (
              <Link
                href="/profile"
                aria-label="Go to profile"
                className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm hover:opacity-80 transition-opacity flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
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

      {showXPGain && <XPNotification amount={lastXPGain} />}
    </div>
  );
}
