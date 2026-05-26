"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@upgradian/ui";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const NAV = [
  { href: "/admin/dashboard",    icon: "📊", label: "Overview"      },
  { href: "/admin/participants", icon: "🧑‍💻", label: "Participants"  },
  { href: "/admin/users",        icon: "👥", label: "Users"         },
  { href: "/admin/challenges",   icon: "⚔️",  label: "Challenges"   },
  { href: "/admin/contests",     icon: "🏆", label: "Contests"      },
  { href: "/admin/missions",     icon: "🎯", label: "Missions"      },
  { href: "/admin/tracks",       icon: "📚", label: "Skill Tracks"  },
  { href: "/admin/submissions",     icon: "📤", label: "Submissions"      },
  { href: "/admin/moderation",      icon: "🛡️", label: "Moderation"       },
  { href: "/admin/daily-challenge", icon: "📅", label: "Daily Challenge"  },
  { href: "/admin/analytics",       icon: "📈", label: "Analytics"        },
] as const;

interface AdminShellProps {
  adminName: string;
  children: React.ReactNode;
}

export function AdminShell({ adminName, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-1)]">
      {/* ── Sidebar ── */}
      <aside
        id="admin-sidebar"
        aria-label="Admin navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col w-60 bg-[var(--bg-2)] border-r border-[var(--border)] transition-transform duration-300",
          "lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-[var(--border)] gap-2">
          <span className="text-lg font-extrabold tracking-tight text-[var(--text-1)]">
            Upgradian<span className="text-brand">.</span>Admin
          </span>
        </div>

        {/* Admin badge */}
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-xs font-bold text-red-400 flex-shrink-0">
              {adminName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--text-1)] truncate">{adminName}</div>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                ⚙️ Admin
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5" aria-label="Admin pages">
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-0.5",
                  active
                    ? "bg-brand/15 text-brand border border-brand/20"
                    : "text-[var(--text-2)] hover:bg-[var(--bg-3)] hover:text-[var(--text-1)]"
                )}
              >
                <span className="text-base w-5 flex-shrink-0" aria-hidden="true">{item.icon}</span>
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border)] space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-2)] hover:bg-[var(--bg-3)] transition-colors"
          >
            ← Student View
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            🚪 Sign Out
          </button>
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
        <header className="h-14 flex items-center justify-between px-5 border-b border-[var(--border)] bg-[#09090e]/90 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open admin navigation"
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar"
            className="lg:hidden p-2 rounded-lg border border-[var(--border)] text-[var(--text-2)]"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              ⚙️ Admin Mode
            </span>
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
