import Link from "next/link";
import { ArrowRight, Code2, Trophy, Briefcase, Sparkles, Bot } from "lucide-react";

interface HeroSectionProps {
  isAuthenticated: boolean;
}

const STATS = [
  { value: "50K+",  label: "Students" },
  { value: "500+",  label: "Challenges" },
  { value: "1.2K+", label: "Placed" },
  { value: "98%",   label: "Satisfaction" },
];

const FEATURES = [
  { icon: Code2,    label: "500+ DSA Challenges" },
  { icon: Bot,      label: "AI Mock Interviews"  },
  { icon: Trophy,   label: "Live Contests"        },
  { icon: Briefcase,label: "Real Internships"     },
];

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-[#000008] pt-16">

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Glows */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(67,97,238,0.18) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 40% at 90% 90%, rgba(124,58,237,0.12) 0%, transparent 60%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 40% 30% at 10% 80%, rgba(6,182,212,0.07) 0%, transparent 60%)" }} />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center py-20">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 text-xs font-semibold tracking-wide"
          style={{
            background: "rgba(67,97,238,0.1)",
            borderColor: "rgba(67,97,238,0.3)",
            color: "#6c8aff",
            opacity: 0,
            animation: "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          India&apos;s #1 AI-Powered Developer Platform
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-[5.25rem] font-black tracking-tight leading-[1.04] text-white mb-6"
          style={{
            opacity: 0,
            animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
            animationDelay: "0.1s",
          }}
        >
          Build the Future.
          <br className="hidden sm:block" />{" "}
          <span
            style={{
              backgroundImage: "linear-gradient(135deg, #6c8aff 0%, #a78bfa 50%, #67e8f9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Get Hired Faster.
          </span>
        </h1>

        {/* Sub */}
        <p
          className="text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
          style={{
            color: "rgba(136,146,176,0.9)",
            opacity: 0,
            animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
            animationDelay: "0.2s",
          }}
        >
          Practice DSA. Compete globally. Land real internships.
          <br className="hidden sm:block" />
          The complete AI-powered journey from student to hired developer.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          style={{
            opacity: 0,
            animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
            animationDelay: "0.3s",
          }}
        >
          <Link
            href={isAuthenticated ? "/arena" : "/register"}
            className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #4361ee, #7c3aed)",
              boxShadow: "0 0 0 1px rgba(67,97,238,0.4), 0 8px 32px rgba(67,97,238,0.35)",
            }}
          >
            Start Learning Free
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/internships"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border text-white/70 text-sm font-semibold transition-all duration-200 hover:text-white hover:border-white/20 hover:bg-white/[0.04]"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            Explore Internships
          </Link>
        </div>

        {/* Feature pills */}
        <div
          className="flex flex-wrap items-center justify-center gap-3 mb-14"
          style={{
            opacity: 0,
            animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
            animationDelay: "0.4s",
          }}
        >
          {FEATURES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: "#6c8aff" }} />
              {label}
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden"
          style={{
            opacity: 0,
            animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
            animationDelay: "0.5s",
            background: "rgba(255,255,255,0.06)",
          }}
        >
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center py-6 px-4" style={{ background: "#000008" }}>
              <div
                className="text-2xl sm:text-3xl font-black mb-1"
                style={{
                  backgroundImage: "linear-gradient(135deg, #6c8aff, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {value}
              </div>
              <div className="text-xs font-medium" style={{ color: "rgba(136,146,176,0.7)" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to top, #000008, transparent)" }} />
    </section>
  );
}
