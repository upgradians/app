"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-5xl mb-4">⚙️</div>
      <h2 className="text-xl font-extrabold text-[var(--text-1)] mb-2">Admin Page Error</h2>
      <p className="text-sm text-[var(--text-3)] mb-6 max-w-sm">
        {error.digest ? `Error ID: ${error.digest}` : "Something went wrong on this admin page."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-dark transition-colors"
        >
          Try again
        </button>
        <Link
          href="/admin/dashboard"
          className="px-5 py-2 rounded-xl border border-[var(--border)] text-[var(--text-2)] font-bold text-sm hover:border-brand/40 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
