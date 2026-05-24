import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin – Contests" };

export default async function AdminContestsPage() {
  const supabase = await createClient();
  const { data: contests } = await supabase
    .from("contests")
    .select("id,title,status,start_time,end_time,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const statusColor: Record<string, string> = {
    upcoming: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    active: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    ended: "text-[var(--text-3)] bg-[var(--bg-3)] border-[var(--border)]",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">
            Contests <span className="text-brand">🏆</span>
          </h1>
          <p className="text-[var(--text-2)] mt-1 text-sm">All platform contests</p>
        </div>
        <Link
          href="/admin/contests/new"
          className="px-4 py-2 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-dark transition-colors"
        >
          + New Contest
        </Link>
      </div>

      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)]">
          <span className="text-sm font-bold text-[var(--text-1)]">{contests?.length ?? 0} contests</span>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {!contests?.length && (
            <div className="py-12 text-center text-sm text-[var(--text-3)]">No contests found</div>
          )}
          {contests?.map((c) => (
            <div key={c.id} className="px-5 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[var(--text-1)] truncate">{c.title}</div>
                <div className="text-xs text-[var(--text-3)]">
                  {c.start_time ? new Date(c.start_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                  {c.end_time ? ` → ${new Date(c.end_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}` : ""}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${statusColor[c.status ?? "ended"] ?? statusColor.ended}`}>
                {c.status ?? "ended"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
