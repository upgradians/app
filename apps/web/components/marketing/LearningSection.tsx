import Link from "next/link";
import { Code2, Trophy, Bot, BarChart3, ArrowRight, Layers } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const PLATFORM_FEATURES = [
  { icon: Code2,     title: "Coding Arena",       desc: "500+ DSA challenges across Easy, Medium, Hard with real-time execution in 10+ languages.", accent: "#4361ee" },
  { icon: Bot,       title: "AI Mock Interviews", desc: "Practice with an AI interviewer. Get instant feedback on technical and behavioral answers.",  accent: "#7c3aed" },
  { icon: Trophy,    title: "Live Contests",       desc: "Weekly timed coding contests with global rankings, prizes, and recognition.",               accent: "#f59e0b" },
  { icon: BarChart3, title: "Leaderboard",         desc: "Track your global rank, compare with peers, and climb from Novice to Legend.",              accent: "#10b981" },
];

export function LearningSection() {
  return (
    <section id="platform" className="relative py-28 overflow-hidden" style={{ background: "#000008" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(67,97,238,0.06), transparent)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-5 uppercase tracking-widest" style={{ borderColor: "rgba(67,97,238,0.3)", background: "rgba(67,97,238,0.08)", color: "#6c8aff" }}>
            <Layers className="w-3 h-3" />
            Developer Practice Platform
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Sharpen Your Skills on{" "}
            <span style={{ backgroundImage: "linear-gradient(135deg, #6c8aff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Real Challenges
            </span>
          </h2>
          <p className="text-white/35 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Beyond our engineering services, Upgradian runs a developer ecosystem — helping engineers practice, compete, and grow.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {PLATFORM_FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <ScrollReveal key={f.title} delay={i * 0.08}>
                <div className="rounded-2xl p-6 h-full transition-all duration-300 hover:-translate-y-0.5 group border border-white/[0.07] bg-white/[0.025]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: `${f.accent}18`, border: `1px solid ${f.accent}30` }}>
                    <Icon className="w-4 h-4" style={{ color: f.accent, width: "18px", height: "18px" }} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(136,146,176,0.65)" }}>{f.desc}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={0.2} className="text-center">
          <Link
            href="/practice"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 0 0 1px rgba(67,97,238,0.4), 0 8px 32px rgba(67,97,238,0.3)" }}
          >
            Explore Practice Platform
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="mt-3 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Free to join · 50,000+ developers</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
