import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin – Submissions" };

export default async function AdminSubmissionsPage() {
  const supabase = await createClient();
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id,status,language,xp_awarded,created_at,profiles(username),challenges(title)")
    .order("created_at", { ascending: false })
    .limit(50);

  const statusColor: Record<string, string> = {
    accepted: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    wrong_answer: "text-red-400 bg-red-500/10 border-red-500/20",
    pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    error: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">
          Submissions <span className="text-brand">📤</span>
        </h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">Recent code submissions across the platform</p>
      </div>

      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)]">
          <span className="text-sm font-bold text-[var(--text-1)]">{submissions?.length ?? 0} submissions (latest 50)</span>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {!submissions?.length && (
            <div className="py-12 text-center text-sm text-[var(--text-3)]">No submissions found</div>
          )}
          {submissions?.map((s) => (
            <div key={s.id} className="px-5 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[var(--text-1)] truncate">
                  {(Array.isArray(s.challenges) ? s.challenges[0]?.title : (s.challenges as { title?: string } | null)?.title) ?? "Unknown challenge"}
                </div>
                <div className="text-xs text-[var(--text-3)]">
                  @{(Array.isArray(s.profiles) ? s.profiles[0]?.username : (s.profiles as { username?: string } | null)?.username) ?? "unknown"} · {s.language ?? "—"}
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs">
                {s.xp_awarded != null && s.xp_awarded > 0 && (
                  <span className="font-bold text-brand tabular-nums">+{s.xp_awarded} XP</span>
                )}
                <span className={`px-2 py-0.5 rounded-full border font-bold ${statusColor[s.status] ?? statusColor.pending}`}>
                  {s.status}
                </span>
              </div>
              <div className="text-xs text-[var(--text-3)] flex-shrink-0 hidden md:block">
                {new Date(s.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
