"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export interface StudentRow {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  created_at: string | null;
  qualification: string | null;
  college: string | null;
  last_active_at: string | null;
  role: string | null;
}

interface Props {
  stats: {
    users: number;
    challenges: number;
    submissions: number;
    contests: number;
    interviews: number;
    activeStreaks: number;
  };
  students: StudentRow[];
}

function timeAgo(iso: string | null): string {
  if (!iso) return "Never logged in";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Active just now";
  if (h < 24) return `Logged in ${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Logged in yesterday";
  if (d < 30) return `Logged in ${d}d ago`;
  return `Inactive ${Math.floor(d / 30)}mo ago`;
}

function deriveStatus(last_active_at: string | null): "Active" | "Pending" {
  if (!last_active_at) return "Pending";
  return (Date.now() - new Date(last_active_at).getTime()) / 86_400_000 < 30
    ? "Active"
    : "Pending";
}

const STAT_CARDS = (stats: Props["stats"]) => [
  { label: "Total Students",  value: stats.users,         icon: "👥", href: "/admin/participants", cls: "border-orange-200 bg-orange-50"   },
  { label: "Challenges",      value: stats.challenges,    icon: "⚔️",  href: "/admin/challenges",  cls: "border-blue-200 bg-blue-50"       },
  { label: "Submissions",     value: stats.submissions,   icon: "📤", href: "/admin/submissions", cls: "border-emerald-200 bg-emerald-50" },
  { label: "Active Contests", value: stats.contests,      icon: "🏆", href: "/admin/contests",    cls: "border-purple-200 bg-purple-50"   },
  { label: "AI Interviews",   value: stats.interviews,    icon: "🤖", href: "/admin/analytics",   cls: "border-cyan-200 bg-cyan-50"       },
  { label: "Active Streaks",  value: stats.activeStreaks, icon: "🔥", href: "/admin/participants", cls: "border-orange-200 bg-orange-50"   },
];

const QUICK_ACTIONS = [
  { label: "Add Challenge",   href: "/admin/challenges/new",  icon: "➕" },
  { label: "Create Contest",  href: "/admin/contests/new",    icon: "🏁" },
  { label: "Participants",    href: "/admin/participants",    icon: "🧑‍💻" },
  { label: "Add Mission",     href: "/admin/missions/new",    icon: "🎯" },
  { label: "Skill Tracks",    href: "/admin/tracks/new",      icon: "📚" },
  { label: "Analytics",       href: "/admin/analytics",       icon: "📈" },
];

export function AdminDashboardClient({ stats, students }: Props) {
  const [search,       setSearch]       = useState("");
  const [deleteTarget, setDeleteTarget] = useState<StudentRow | null>(null);
  const [deleting,     setDeleting]     = useState(false);
  const [deleteError,  setDeleteError]  = useState("");
  const [rows,         setRows]         = useState<StudentRow[]>(students);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(s =>
      (s.full_name  ?? "").toLowerCase().includes(q) ||
      (s.username   ?? "").toLowerCase().includes(q) ||
      (s.email      ?? "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/admin/participant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deleteTarget.id, action: "delete_account" }),
      });
      if (res.ok) {
        setRows(r => r.filter(s => s.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        const body = await res.json().catch(() => ({}));
        setDeleteError((body as { error?: string }).error ?? "Delete failed. Try again.");
      }
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Command Center</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Student management and platform overview</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
          {rows.length.toLocaleString()} students registered
        </span>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAT_CARDS(stats).map((c, i) => (
          <motion.div key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}>
            <Link href={c.href}>
              <div className={`border rounded-2xl p-4 bg-white hover:border-orange-400 hover:shadow-md transition-all ${c.cls}`}>
                <div className="text-xl mb-2">{c.icon}</div>
                <div className="text-2xl font-extrabold text-gray-900 tabular-nums">{Number(c.value ?? 0).toLocaleString()}</div>
                <div className="text-[10px] text-gray-500 mt-1 font-semibold uppercase tracking-wide">{c.label}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Quick actions strip ── */}
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map(a => (
          <Link key={a.href} href={a.href}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 bg-white hover:border-orange-400 hover:text-orange-600 transition-colors">
            <span>{a.icon}</span>{a.label}
          </Link>
        ))}
      </div>

      {/* ── Student registration table ── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

        {/* Table header / search */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-gray-900">Student Registrations</h2>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm select-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl text-sm text-gray-800 bg-gray-50 border border-gray-200 focus:border-orange-400 focus:outline-none transition-colors w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Student", "Email", "Registered", "Course / Program", "Status", "Latest Activity", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-sm text-gray-400">
                    {search ? `No students match "${search}"` : "No students registered yet."}
                  </td>
                </tr>
              ) : filtered.map(s => {
                const status = deriveStatus(s.last_active_at);
                const program = s.qualification ?? s.college ?? null;
                return (
                  <tr key={s.id} className="hover:bg-orange-50/30 transition-colors group">

                    {/* Name */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                          {(s.full_name ?? s.username ?? "?")[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{s.full_name ?? "—"}</div>
                          <div className="text-[11px] text-gray-400">@{s.username ?? "—"}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{s.email ?? "—"}</td>

                    {/* Registered date */}
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {s.created_at
                        ? new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </td>

                    {/* Course / Program */}
                    <td className="px-4 py-3">
                      {program ? (
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 block truncate max-w-[140px]">
                          {program}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status === "Active" ? "bg-emerald-500" : "bg-amber-400"}`} />
                        {status}
                      </span>
                    </td>

                    {/* Latest activity */}
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {timeAgo(s.last_active_at)}
                    </td>

                    {/* Delete action */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => setDeleteTarget(s)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          {search
            ? `${filtered.length} of ${rows.length} students`
            : `${rows.length} students total`}
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget && !deleting) setDeleteTarget(null); }}
          >
            <motion.div
              key="modal-panel"
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ type: "spring", duration: 0.25 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0 text-lg">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Delete Account</h3>
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                    Are you sure you want to permanently delete{" "}
                    <span className="font-semibold text-gray-900">
                      {deleteTarget.full_name ?? deleteTarget.username ?? "this student"}
                    </span>
                    {"'"}s account? This will wipe their application history.
                  </p>
                </div>
              </div>

              {deleteError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                  {deleteError}
                </p>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setDeleteTarget(null); setDeleteError(""); }}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 min-w-[140px]"
                >
                  {deleting ? "Deleting…" : "Yes, Delete Account"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
