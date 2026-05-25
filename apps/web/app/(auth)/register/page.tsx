import type { Metadata } from "next";
import Link from "next/link";
import { Zap } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Create Account | Upgradian" };

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16" style={{ background: "#000008" }}>

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.1), transparent 65%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 40% 30% at 20% 80%, rgba(6,182,212,0.07), transparent 60%)" }} />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight text-white hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
              <Zap className="w-4.5 h-4.5 text-white" style={{ width: "18px", height: "18px" }} strokeWidth={2.5} />
            </div>
            Upgradian<span style={{ color: "#6c8aff" }}>.</span>Tech
          </Link>
        </div>

        {/* Card */}
        <div
          className="relative rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 0 0 1px rgba(124,58,237,0.1), 0 32px 64px rgba(0,0,0,0.6)",
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl" style={{ background: "linear-gradient(90deg, transparent, rgba(67,97,238,0.5), rgba(124,58,237,0.5), transparent)" }} />
          <RegisterForm />
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "rgba(136,146,176,0.25)" }}>
          <Link href="/" className="hover:text-white/60 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
