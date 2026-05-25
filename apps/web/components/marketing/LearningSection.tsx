import Link from "next/link";
import { Code2, Trophy, Bot, Map, BarChart3, Zap, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const FEATURES = [
  { icon: Code2,    title: "Coding Arena",        desc: "500+ DSA challenges across Easy, Medium, Hard — with real-time code execution in 10+ languages.", accent: "#4361ee" },
  { icon: Trophy,   title: "Coding Contests",      desc: "Weekly timed contests with global rankings, real prizes, and recognition for top performers.",    accent: "#f59e0b" },
  { icon: Bot,      title: "AI Mock Interviews",   desc: "Practice with our AI interviewer. Get instant, detailed feedback on your technical answers.",       accent: "#7c3aed" },
  { icon: Map,      title: "Skill Tracks",         desc: "Curated learning paths for DSA, System Design, Full Stack, AI/ML, and more.",                      accent: "#06b6d4" },
  { icon: BarChart3,title: "Global Leaderboard",   desc: "Track your rank worldwide. See how you compare against thousands of developers.",                   accent: "#10b981" },
  { icon: Zap,      title: "XP & Rank System",     desc: "Earn XP, level up through ranks from Novice to Legend, and maintain daily streaks.",               accent: "#6c8aff" },
];

const LANGUAGES = ["Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust", "Kotlin"];

export function LearningSection() {
  return (
    <section id="learning" className="relative py-32 overflow-hidden" style={{ background: "#000008" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(67,97,238,0.06), transparent)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-5 uppercase tracking-widest" style={{ borderColor: "rgba(67,97,238,0.3)", background: "rgba(67,97,238,0.08)", color: "#6c8aff" }}>
            Learning Hub
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Everything to{" "}
            <span style={{ backgroundImage: "linear-gradient(135deg, #6c8aff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Land Your Dream Job
            </span>
          </h2>
          <p className="text-white/35 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            From your first Hello World to your first offer letter — the tools, content, and community to get you there.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <ScrollReveal key={f.title} delay={i * 0.07}>
                <div
                  className="rounded-2xl p-6 h-full transition-all duration-300 hover:-translate-y-0.5 group"
                  style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: `${f.accent}18`, border: `1px solid ${f.accent}30` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: f.accent, width: "18px", height: "18px" }} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(136,146,176,0.65)" }}>{f.desc}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={0.1} className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: "rgba(255,255,255,0.2)" }}>
            Supports all major languages
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {LANGUAGES.map(lang => (
              <span key={lang} className="px-4 py-2 rounded-xl text-xs font-mono" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)" }}>
                {lang}
              </span>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="text-center">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 0 0 1px rgba(67,97,238,0.4), 0 8px 32px rgba(67,97,238,0.3)" }}
          >
            Start Practicing Free
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
