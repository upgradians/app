import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin – Users" };

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id,full_name,username,total_xp,rank,role,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">
          Users <span className="text-brand">👥</span>
        </h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">All registered platform users</p>
      </div>

      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)]">
          <span className="text-sm font-bold text-[var(--text-1)]">{users?.length ?? 0} users (latest 50)</span>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {!users?.length && (
            <div className="py-12 text-center text-sm text-[var(--text-3)]">No users found</div>
          )}
          {users?.map((u) => (
            <div key={u.id} className="px-5 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-xs font-bold text-brand flex-shrink-0">
                {(u.full_name ?? u.username ?? "?")[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[var(--text-1)] truncate">{u.full_name ?? u.username}</div>
                <div className="text-xs text-[var(--text-3)]">@{u.username}</div>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs text-[var(--text-3)]">
                <span className="font-bold text-brand tabular-nums">{Number((u as Record<string, number>).total_xp ?? 0).toLocaleString()} XP</span>
                <span className="px-2 py-0.5 rounded-full bg-[var(--bg-3)] border border-[var(--border)]">{u.rank ?? "—"}</span>
                {u.role !== "student" && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 uppercase tracking-wider font-bold">
                    {u.role}
                  </span>
                )}
              </div>
              <div className="text-xs text-[var(--text-3)] flex-shrink-0 hidden md:block">
                {new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
