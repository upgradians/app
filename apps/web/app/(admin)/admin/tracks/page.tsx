import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin – Skill Tracks" };

export default function AdminTracksPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">
            Skill Tracks <span className="text-brand">📚</span>
          </h1>
          <p className="text-[var(--text-2)] mt-1 text-sm">Manage learning paths and skill tracks</p>
        </div>
        <Link
          href="/admin/tracks/new"
          className="px-4 py-2 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-dark transition-colors"
        >
          + New Track
        </Link>
      </div>

      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl p-12 text-center">
        <div className="text-4xl mb-4">📚</div>
        <h2 className="font-bold text-[var(--text-1)] mb-2">Skill Track Management</h2>
        <p className="text-sm text-[var(--text-3)] max-w-sm mx-auto">
          Skill track creation and management coming soon. Use the database directly in the meantime.
        </p>
      </div>
    </div>
  );
}
