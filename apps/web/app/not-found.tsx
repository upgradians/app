import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "404 – Page Not Found" };

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-1)] text-[var(--text-1)] px-4 text-center">
      <div className="text-6xl mb-4">🔭</div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">404</h1>
      <p className="text-[var(--text-2)] text-sm mb-8">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-2.5 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-dark transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
