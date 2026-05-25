import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign In | Upgradian" };

export default function LoginPage() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4"
      style={{ background: "#09090e" }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%,rgba(217,119,87,0.1) 0%,transparent 65%)",
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(217,119,87,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(217,119,87,0.04) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-md" data-theme="dark">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-extrabold tracking-tight text-white hover:opacity-80 transition-opacity">
            Upgradian<span style={{ color: "#D97757" }}>.</span>Tech
          </Link>
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          }}
        >
          <LoginForm />
        </div>

        {/* Back to home */}
        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.25)" }}>
          <Link href="/" className="hover:text-white transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
