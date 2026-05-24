"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-5xl mb-4">💥</div>
      <h2 className="text-xl font-extrabold text-[var(--text-1)] mb-2">Something went wrong</h2>
      <p className="text-sm text-[var(--text-3)] mb-6 max-w-sm">
        {error.digest ? `Error ID: ${error.digest}` : "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-dark transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
