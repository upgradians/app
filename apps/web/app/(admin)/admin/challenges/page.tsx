import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin – Challenges" };

export default async function AdminChallengesPage() {
  const supabase = await createClient();
  const { data: challenges } = await supabase
    .from("challenges")
    .select("id,title,difficulty,category,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const difficultyColor: Record<string, string> = {
    Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    Hard: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">
            Challenges <span className="text-brand">⚔️</span>
          </h1>
          <p className="text-[var(--text-2)] mt-1 text-sm">All coding challenges on the platform</p>
        </div>
        <Link
          href="/admin/challenges/new"
          className="px-4 py-2 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-dark transition-colors"
        >
          + New Challenge
        </Link>
      </div>

      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)]">
          <span className="text-sm font-bold text-[var(--text-1)]">{challenges?.length ?? 0} challenges</span>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {!challenges?.length && (
            <div className="py-12 text-center text-sm text-[var(--text-3)]">No challenges found</div>
          )}
          {challenges?.map((c) => (
            <div key={c.id} className="px-5 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[var(--text-1)] truncate">{c.title}</div>
                <div className="text-xs text-[var(--text-3)]">{c.category ?? "Uncategorized"}</div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full border font-bold ${difficultyColor[c.difficulty] ?? "text-[var(--text-3)] bg-[var(--bg-3)] border-[var(--border)]"}`}>
                  {c.difficulty}
                </span>
              </div>
              <div className="text-xs text-[var(--text-3)] flex-shrink-0 hidden md:block">
                {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
