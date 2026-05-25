import Link from "next/link";
import { UserPlus, Code2, Trophy, Briefcase, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const STEPS = [
  {
    n: "01",
    icon: UserPlus,
    title: "Sign up in 60 seconds",
    desc: "Create your free account. No credit card. No friction. Start building your developer profile immediately.",
    accent: "#4361ee",
  },
  {
    n: "02",
    icon: Code2,
    title: "Practice real challenges",
    desc: "Solve 500+ curated DSA problems across 10+ languages. Get AI-powered feedback on every submission.",
    accent: "#7c3aed",
  },
  {
    n: "03",
    icon: Trophy,
    title: "Compete and rank up",
    desc: "Join weekly timed contests, earn XP, and climb from Novice to Legend on the global leaderboard.",
    accent: "#06b6d4",
  },
  {
    n: "04",
    icon: Briefcase,
    title: "Land your offer",
    desc: "Apply to real internships from partner companies. Get discovered by recruiters hiring directly on the platform.",
    accent: "#f59e0b",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden" style={{ background: "#000008" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(67,97,238,0.06), transparent)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center mb-20">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-5 uppercase tracking-widest"
            style={{ borderColor: "rgba(67,97,238,0.3)", background: "rgba(67,97,238,0.08)", color: "#6c8aff" }}
          >
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            From Zero to{" "}
            <span style={{ backgroundImage: "linear-gradient(135deg, #6c8aff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Hired
            </span>{" "}
            in 4 Steps
          </h2>
          <p className="text-white/40 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            A proven path that has helped thousands of Indian students go from beginner to industry-ready in under 6 months.
          </p>
        </ScrollReveal>

        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="hidden lg:block absolute top-8 left-[calc(12.5%+40px)] right-[calc(12.5%+40px)] h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)" }} />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.n} delay={i * 0.1} className="flex flex-col items-center text-center group relative">
                {i < STEPS.length - 1 && (
                  <div className="sm:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/10 text-lg">↓</div>
                )}
                <div
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 flex-shrink-0"
                  style={{ background: `${step.accent}15`, border: `1px solid ${step.accent}30` }}
                >
                  <Icon className="w-7 h-7" style={{ color: step.accent }} strokeWidth={1.5} />
                  <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: step.accent }}>
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-2.5 leading-snug">{step.title}</h3>
                <p className="text-sm leading-relaxed max-w-[220px]" style={{ color: "rgba(136,146,176,0.7)" }}>{step.desc}</p>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={0.35} className="mt-20 text-center">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 0 0 1px rgba(67,97,238,0.4), 0 8px 32px rgba(67,97,238,0.3)" }}
          >
            Start Your Journey Free
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="mt-3 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>No credit card required · 2-minute setup</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
