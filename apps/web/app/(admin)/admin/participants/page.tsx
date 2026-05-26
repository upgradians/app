"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Participant {
  id: string;
  full_name: string | null;
  username: string | null;
  phone_number?: string | null;
  role?: string | null;
  qualification?: string | null;
  nationality?: string | null;
  address?: string | null;
  college?: string | null;
  created_at: string;
  total_xp?: number;
  streak_days?: number;
  rank?: string | null;
}

type ParticipantAction = "ban" | "unban" | "warn" | "clear_violations" | "reset_xp" | "reset_streak";
type PendingAction = { userId: string; action: ParticipantAction } | null;

const PAGE_SIZE = 20;

async function callAdminAction(userId: string, action: string): Promise<boolean> {
  const res = await fetch("/api/admin/participant", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, action }),
  });
  return res.ok;
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(0);
  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("");
  const [loading,      setLoading]      = useState(true);
  const [pending,      setPending]      = useState<PendingAction>(null);
  const [acting,       setActing]       = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("profiles")
      .select("id,full_name,username,phone_number,role,qualification,nationality,address,college,created_at,total_xp,streak_days,rank", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (search.trim()) {
      query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`);
    }
    if (roleFilter) {
      query = query.eq("role", roleFilter);
    }

    const { data, count } = await query;
    setParticipants((data ?? []) as Participant[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search, roleFilter]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  function exportCSV() {
    const headers = ["Name", "Username", "Phone", "Role", "Qualification", "Nationality", "Address", "College", "Joined", "XP", "Streak", "Rank"];
    const rows = participants.map(p => [
      p.full_name ?? "",
      p.username ?? "",
      p.phone_number ?? "",
      p.role ?? "",
      p.qualification ?? "",
      p.nationality ?? "",
      p.address ?? "",
      p.college ?? "",
      p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN") : "",
      String(p.total_xp ?? 0),
      String(p.streak_days ?? 0),
      p.rank ?? "",
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "participants.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const triggerAction = (userId: string, action: ParticipantAction) => {
    if (pending?.userId === userId && pending?.action === action) {
      // Second click → execute
      void executeAction(userId, action);
    } else {
      setPending({ userId, action });
    }
  };

  const executeAction = async (userId: string, action: string) => {
    setActing(true);
    const ok = await callAdminAction(userId, action);
    setActing(false);
    setPending(null);
    if (ok) {
      const labels: Record<string, string> = {
        ban: "User banned", unban: "User unbanned",
        reset_xp: "XP reset to 0", reset_streak: "Streak reset",
      };
      toast.success(labels[action] ?? "Done");
      void fetchData();
    } else {
      toast.error("Action failed. Check permissions.");
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const ActionButton = ({
    userId, action, label, color,
  }: { userId: string; action: ParticipantAction; label: string; color: string }) => {
    const isConfirming = pending?.userId === userId && pending?.action === action;
    return (
      <button
        onClick={() => triggerAction(userId, action)}
        disabled={acting}
        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all disabled:opacity-40 ${
          isConfirming
            ? "bg-red-500 text-white border-red-500 animate-pulse"
            : `${color} hover:opacity-80`
        }`}
      >
        {isConfirming ? "Confirm?" : label}
      </button>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Participants 🧑‍💻</h1>
          <p className="text-[var(--text-2)] mt-1 text-sm">{total.toLocaleString()} registered participants</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-brand border border-brand/30 bg-brand/5 hover:bg-brand/10 transition-colors"
        >
          📥 Export CSV
        </button>
      </div>

      {/* Dismiss confirm on outside click */}
      {pending && (
        <div className="fixed inset-0 z-10" onClick={() => setPending(null)} />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or username…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl text-sm text-[var(--text-1)] outline-none bg-[var(--bg-2)] border border-[var(--border)] focus:border-brand transition-colors"
        />
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(0); }}
          className="px-4 py-2 rounded-xl text-sm text-[var(--text-1)] outline-none bg-[var(--bg-2)] border border-[var(--border)] focus:border-brand"
        >
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="employee">Employee</option>
          <option value="job_seeker">Job Seeker</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-3)]">
                {["Name", "Phone", "Role", "Qualification", "Nationality", "College/Company", "Joined", "XP", "Streak", "Rank", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-3)] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={11} className="py-12 text-center text-[var(--text-3)] text-sm">Loading…</td></tr>
              ) : participants.length === 0 ? (
                <tr><td colSpan={11} className="py-12 text-center text-[var(--text-3)] text-sm">No participants found</td></tr>
              ) : participants.map(p => (
                <tr key={p.id} className="hover:bg-[var(--bg-3)] transition-colors relative">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-semibold text-[var(--text-1)]">{p.full_name ?? "—"}</div>
                    <div className="text-xs text-[var(--text-3)]">@{p.username ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-2)] whitespace-nowrap">{p.phone_number ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      p.role === "admin"     ? "text-red-400 bg-red-400/10 border-red-400/20" :
                      p.role === "recruiter" ? "text-amber-400 bg-amber-400/10 border-amber-400/20" :
                      "text-brand bg-brand/10 border-brand/20"
                    }`}>{p.role ?? "student"}</span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-2)] max-w-[120px] truncate">{p.qualification ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--text-2)] whitespace-nowrap">{p.nationality ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--text-2)] max-w-[120px] truncate">{p.college ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--text-3)] whitespace-nowrap text-xs">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-4 py-3 font-bold text-brand whitespace-nowrap">{Number(p.total_xp ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-[var(--text-2)] whitespace-nowrap">🔥 {Number(p.streak_days ?? 0)}</td>
                  <td className="px-4 py-3 text-[var(--text-3)] text-xs whitespace-nowrap">{p.rank ?? "Bronze Coder"}</td>
                  <td className="px-4 py-3 whitespace-nowrap z-20 relative">
                    <div className="flex items-center gap-1 flex-wrap">
                      <ActionButton userId={p.id} action="warn"            label="Warn"   color="text-orange-500 border-orange-500/30 bg-orange-500/5" />
                      <ActionButton userId={p.id} action="clear_violations" label="Clear⚠" color="text-sky-500 border-sky-500/30 bg-sky-500/5" />
                      <ActionButton userId={p.id} action="reset_xp"        label="0 XP"   color="text-amber-500 border-amber-500/30 bg-amber-500/5" />
                      <ActionButton userId={p.id} action="reset_streak"    label="🔥 0"   color="text-yellow-500 border-yellow-500/30 bg-yellow-500/5" />
                      <ActionButton userId={p.id} action="ban"             label="Ban"    color="text-red-500 border-red-500/30 bg-red-500/5" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-3)]">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--bg-3)] disabled:opacity-40 transition-colors">
                ← Prev
              </button>
              <span className="px-3 py-1.5 text-xs text-[var(--text-3)]">{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--bg-3)] disabled:opacity-40 transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
