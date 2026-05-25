import type { Metadata } from "next";
import Link from "next/link";
import { Code2, Bot, Trophy, BarChart3, Map, Zap, ArrowRight, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Practice Platform | Upgradian Technology",
  description: "Sharpen your engineering skills with 500+ DSA challenges, AI mock interviews, live coding contests, and global leaderboards.",
};

const TOOLS = [
  {
    icon: Code2,
    title: "Coding Arena",
    desc: "500+ curated DSA challenges across Easy, Medium, and Hard. Real-time code execution in Python, JavaScript, Java, C++, and 8 more languages.",
    href: "/arena",
    accent: "#4361ee",
    tag: "Most Popular",
  },
  {
    icon: Bot,
    title: "AI Mock Interviews",
    desc: "Practice technical and behavioral interviews with an AI that gives instant, detailed feedback. Used by engineers at Google, Microsoft, and Flipkart.",
    href: "/interview",
    accent: "#7c3aed",
    tag: "AI-Powered",
  },
  {
    icon: Trophy,
    title: "Live Coding Contests",
    desc: "Weekly timed competitive programming contests with real prizes, global rankings, and recognition for top performers.",
    href: "/contests",
    accent: "#f59e0b",
    tag: "Competitive",
  },
  {
    icon: BarChart3,
    title: "Global Leaderboard",
    desc: "See how you stack up against 50,000+ engineers worldwide. Earn XP, level up ranks, and maintain daily streaks.",
    href: "/leaderboard",
    accent: "#10b981",
    tag: "Community",
  },
  {
    icon: Map,
    title: "Skill Tracks",
    desc: "Curated learning paths for DSA, System Design, Full Stack Development, AI/ML, and DevOps — built by senior engineers.",
    href: "/tracks",
    accent: "#06b6d4",
    tag: "Structured",
  },
  {
    icon: Zap,
    title: "XP & Rank System",
    desc: "Earn XP points for every challenge solved. Progress from Novice through Amateur, Pro, Expert, Master to the coveted Legend rank.",
    href: "/arena",
    accent: "#6c8aff",
    tag: "Gamified",
  },
];

const LANGUAGES = ["Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust", "Kotlin", "C#", "PHP"];

export default function PracticePage() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#000008" }}>

      {/* Backgrounds */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(67,97,238,0.14), transparent 65%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 text-xs font-semibold tracking-wide" style={{ background: "rgba(67,97,238,0.1)", borderColor: "rgba(67,97,238,0.3)", color: "#6c8aff" }}>
            <Layers className="w-3.5 h-3.5" />
            Developer Practice Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-5">
            Level Up Your{" "}
            <span style={{ backgroundImage: "linear-gradient(135deg, #6c8aff 0%, #a78bfa 50%, #67e8f9 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Engineering Skills
            </span>
          </h1>
          <p className="text-white/50 max-w-xl mx-auto text-base sm:text-lg leading-relaxed mb-8">
            A complete developer ecosystem — coding challenges, AI interviews, live contests, and structured learning paths. Join 50,000+ engineers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
              style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 0 0 1px rgba(67,97,238,0.4), 0 8px 32px rgba(67,97,238,0.3)" }}
            >
              Start Practicing Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border text-white/60 text-sm font-semibold transition-all hover:text-white hover:border-white/20"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              Sign in to your account
            </Link>
          </div>
        </div>

        {/* Tools grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 group border border-white/[0.07] bg-white/[0.025] block"
              >
                <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${tool.accent}60, transparent)` }} />

                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: `${tool.accent}18`, border: `1px solid ${tool.accent}30` }}>
                    <Icon className="w-5 h-5" style={{ color: tool.accent }} strokeWidth={1.5} />
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${tool.accent}15`, border: `1px solid ${tool.accent}25`, color: tool.accent }}>
                    {tool.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{tool.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(136,146,176,0.65)" }}>{tool.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold transition-colors group-hover:text-white" style={{ color: tool.accent }}>
                  Open <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Languages */}
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: "rgba(255,255,255,0.2)" }}>Supported Languages</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {LANGUAGES.map(lang => (
              <span key={lang} className="px-4 py-2 rounded-xl text-xs font-mono" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)" }}>
                {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Back */}
        <div className="text-center mt-10">
          <Link href="/" className="text-xs transition-colors hover:text-white/60" style={{ color: "rgba(136,146,176,0.25)" }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
