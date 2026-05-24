import Link from "next/link";

const STEPS = [
  {
    n: "01",
    icon: "🚀",
    title: "Sign up in 60 seconds",
    desc: "Create your free account with Google or GitHub. No credit card. No friction. Start building your developer profile right away.",
    color: "#D97757",
    glow: "rgba(217,119,87,0.18)",
  },
  {
    n: "02",
    icon: "⚔️",
    title: "Practice 500+ real challenges",
    desc: "Solve curated DSA problems — Arrays to DP — in 10+ languages. Get AI-powered feedback on every single submission.",
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.18)",
  },
  {
    n: "03",
    icon: "🏆",
    title: "Compete and climb the ranks",
    desc: "Join weekly timed contests, earn XP, and level up from Bronze Coder to Legend. Your name on the global leaderboard.",
    color: "#c084fc",
    glow: "rgba(192,132,252,0.18)",
  },
  {
    n: "04",
    icon: "💼",
    title: "Land internships & offers",
    desc: "Apply to real internships from partner companies. Get discovered by recruiters hiring directly on the platform.",
    color: "#34d399",
    glow: "rgba(52,211,153,0.18)",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 bg-[#09090e] relative overflow-hidden">
      {/* Subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 100%,rgba(52,211,153,0.05),transparent)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-4 uppercase tracking-widest"
            style={{
              borderColor: "rgba(52,211,153,0.25)",
              background: "rgba(52,211,153,0.07)",
              color: "#6ee7b7",
            }}
          >
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            From Zero to{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(135deg,#34d399,#60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Hired
            </span>{" "}
            in 4 Steps
          </h2>
          <p className="mt-4 text-white/40 max-w-lg mx-auto text-sm sm:text-base">
            A proven path that has helped thousands of Indian students go from beginner to
            industry-ready — often in under 6 months.
          </p>
        </div>

        {/* Steps grid */}
        <div className="relative">
          {/* Connector line — desktop only */}
          <div
            className="hidden lg:block absolute top-[52px] left-[calc(12.5%+32px)] right-[calc(12.5%+32px)] h-px pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg,transparent,rgba(255,255,255,0.08) 20%,rgba(255,255,255,0.08) 80%,transparent)",
            }}
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                className="flex flex-col items-center text-center group relative"
              >
                {/* Mobile connector arrow between steps */}
                {i < STEPS.length - 1 && (
                  <div className="sm:hidden absolute -bottom-7 left-1/2 -translate-x-1/2 text-white/15 text-xl">
                    ↓
                  </div>
                )}

                {/* Icon circle */}
                <div
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-6 transition-transform duration-300 group-hover:scale-110 flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg,${step.color}22,${step.color}08)`,
                    border: `1px solid ${step.color}35`,
                  }}
                >
                  {step.icon}

                  {/* Step number badge */}
                  <div
                    className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black"
                    style={{
                      background: step.color,
                      color: "#09090e",
                      boxShadow: `0 0 12px ${step.glow}`,
                    }}
                  >
                    {i + 1}
                  </div>
                </div>

                {/* Text */}
                <h3 className="text-base font-bold text-white mb-2.5 group-hover:text-white/90 transition-colors leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm text-white/45 leading-relaxed max-w-[210px]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#D97757] text-white text-sm font-bold transition-all hover:bg-[#C96442] hover:shadow-[0_0_40px_rgba(217,119,87,0.35)] hover:-translate-y-0.5 active:scale-95"
          >
            Start Your Journey Free →
          </Link>
          <p className="mt-3 text-xs text-white/25">No credit card required · 2-minute setup</p>
        </div>
      </div>
    </section>
  );
}
