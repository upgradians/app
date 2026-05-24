import Link from "next/link";

const FEATURES = [
  {
    icon: "⚔️",
    title: "Coding Arena",
    desc: "500+ DSA challenges across Easy, Medium, Hard — with real-time code execution in 10+ languages.",
    accent: "#D97757",
  },
  {
    icon: "🏆",
    title: "Coding Contests",
    desc: "Weekly timed contests with global rankings, real prizes, and recognition for top performers.",
    accent: "#f59e0b",
  },
  {
    icon: "🤖",
    title: "AI Mock Interviews",
    desc: "Practice with our AI interviewer. Get instant, detailed feedback on your technical answers.",
    accent: "#8b5cf6",
  },
  {
    icon: "🗺️",
    title: "Skill Tracks",
    desc: "Curated learning paths for DSA, System Design, Full Stack, AI/ML, and more.",
    accent: "#06b6d4",
  },
  {
    icon: "📊",
    title: "Global Leaderboard",
    desc: "Track your rank worldwide. See how you compare against thousands of developers.",
    accent: "#10b981",
  },
  {
    icon: "⚡",
    title: "XP & Rank System",
    desc: "Earn XP, level up through ranks from Novice to Legend, and maintain daily streaks.",
    accent: "#3b82f6",
  },
];

const LANGUAGES = ["Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust", "Kotlin"];

export function LearningSection() {
  return (
    <section id="learning" className="py-24 bg-[#09090e] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 100%,rgba(96,165,250,0.07),transparent)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-4 uppercase tracking-widest"
            style={{ borderColor: "rgba(96,165,250,0.25)", background: "rgba(96,165,250,0.08)", color: "#93c5fd" }}
          >
            Learning Hub
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Everything You Need to{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(135deg,#60a5fa,#c084fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Land Your Dream Job
            </span>
          </h2>
          <p className="mt-4 text-white/40 max-w-xl mx-auto text-sm sm:text-base">
            From your first Hello World to your first offer letter — the tools, content, and community to get you there.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-6 group transition-all duration-300 hover:-translate-y-0.5"
              style={{
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.025)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${f.accent}30`;
                (e.currentTarget as HTMLDivElement).style.background = `${f.accent}08`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.025)";
              }}
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: "rgba(255,255,255,0.25)" }}>
            Supports all major languages
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {LANGUAGES.map((lang) => (
              <span
                key={lang}
                className="px-4 py-2 rounded-xl text-sm font-mono"
                style={{
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.03)",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white text-sm font-bold transition-all hover:shadow-[0_0_40px_rgba(96,165,250,0.25)] hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}
          >
            Start Practicing Free →
          </Link>
        </div>
      </div>
    </section>
  );
}
