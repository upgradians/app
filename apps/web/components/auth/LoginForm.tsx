"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@upgradian/ui";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  async function handleGitHubLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Social logins */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button type="button" onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-transparent text-[var(--text-1)] text-sm font-semibold hover:border-brand/40 transition-colors">
          <span>🔵</span> Google
        </button>
        <button type="button" onClick={handleGitHubLogin}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-transparent text-[var(--text-1)] text-sm font-semibold hover:border-brand/40 transition-colors">
          <span>🐙</span> GitHub
        </button>
      </div>

      <div className="relative flex items-center gap-3 mb-2">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-xs text-[var(--text-3)] font-medium">or email</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-2)] mb-1.5">Email</label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@email.com" required autoComplete="email"
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none transition-colors focus:border-brand"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-2)]">Password</label>
          <Link href="/forgot-password" className="text-xs text-brand hover:underline">Forgot?</Link>
        </div>
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="••••••••" required autoComplete="current-password"
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none transition-colors focus:border-brand"
        />
      </div>

      <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
        Sign In
      </Button>

      <p className="text-center text-sm text-[var(--text-3)]">
        No account?{" "}
        <Link href="/register" className="text-brand font-semibold hover:underline">
          Register free
        </Link>
      </p>
    </form>
  );
}
