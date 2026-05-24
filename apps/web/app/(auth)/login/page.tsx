import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-1)] px-4">
      <div className="absolute inset-0 bg-[image:var(--tw-gradient-stops)] opacity-30 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(217,119,87,.15), transparent)" }}
      />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-3xl font-extrabold tracking-tight mb-2">
            Upgradian<span className="text-brand">.</span>Tech
          </div>
          <p className="text-[var(--text-2)] text-sm">Sign in to your account</p>
        </div>
        <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-8 shadow-card">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
