"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router   = useRouter();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      toast.error(error.message);
      setLoading(false);
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        toast.success("Welcome to Upgradian!");
        router.push("/dashboard");
      } else {
        toast.success("Check your email to confirm your account!");
        setLoading(false);
      }
    }
  }

  const inputClass = `
    w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200
    bg-white/[0.04] border border-white/[0.09]
    placeholder:text-white/25
    focus:border-brand/60 focus:bg-white/[0.06]
  `;

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Create your account</h1>
        <p className="text-sm mt-1.5" style={{ color: "rgba(136,146,176,0.6)" }}>
          Join 50,000+ developers on Upgradian
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(136,146,176,0.7)" }}>
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Your name"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(136,146,176,0.7)" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(136,146,176,0.7)" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            className={inputClass}
          />
        </div>

        {error && (
          <div className="text-xs rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-px active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
          style={{
            background: "linear-gradient(135deg, #4361ee, #7c3aed)",
            boxShadow: "0 0 0 1px rgba(67,97,238,0.4), 0 8px 32px rgba(67,97,238,0.3)",
          }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: "rgba(136,146,176,0.5)" }}>
        Already have an account?{" "}
        <Link href="/login" className="font-semibold transition-colors" style={{ color: "#6c8aff" }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
