import Link from "next/link";

const PROGRAMS = [
  { icon: "💻", title: "Full Stack Development", duration: "3 months", spots: "120+ spots", color: "#3b82f6" },
  { icon: "🤖", title: "AI / Machine Learning", duration: "3 months", spots: "80+ spots", color: "#8b5cf6" },
  { icon: "📊", title: "Data Science", duration: "3 months", spots: "60+ spots", color: "#06b6d4" },
  { icon: "🎨", title: "UI / UX Design", duration: "2 months", spots: "40+ spots", color: "#ec4899" },
  { icon: "📱", title: "Digital Marketing", duration: "2 months", spots: "50+ spots", color: "#10b981" },
  { icon: "🔧", title: "DevOps & Cloud", duration: "3 months", spots: "30+ spots", color: "#f59e0b" },
];

const PERKS = [
  "Certificate of completion",
  "Real project experience",
  "Mentorship from industry experts",
  "Letter of recommendation",
  "Job referrals to hiring partners",
  "Stipend for top performers",
];

export function InternshipsSection() {
  return (
    <section id="internships" className="py-24 bg-[#0e0e15]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Left */}
          <div className="lg:w-2/5 lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D97757]/25 bg-[#D97757]/[0.08] text-[#D97757] text-xs font-semibold mb-6 uppercase tracking-widest">
              Internship Programs
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-5">
              Real Projects.
              <br />
              <span
                style={{
                  backgroundImage: "linear-gradient(135deg,#D97757,#f0a882)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Real Experience.
              </span>
            </h2>
            <p className="text-white/45 leading-relaxed mb-8 text-sm sm:text-base">
              Our programs connect freshers with live projects. Work alongside senior engineers,
              build products used by real users, and launch your career with confidence.
            </p>
            <ul className="space-y-3 mb-8">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-white/60">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(217,119,87,0.15)", border: "1px solid rgba(217,119,87,0.3)" }}
                  >
                    <svg className="w-3 h-3" style={{ color: "#D97757" }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold transition-all hover:bg-[#C96442] hover:shadow-[0_0_30px_rgba(217,119,87,0.3)]"
              style={{ background: "#D97757" }}
            >
              Apply for Internship →
            </Link>
          </div>

          {/* Right: Program grid */}
          <div className="lg:w-3/5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROGRAMS.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl p-5 group hover:-translate-y-0.5 transition-all duration-300 border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.14]"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform"
                  style={{ background: `${p.color}25`, border: `1px solid ${p.color}40` }}
                >
                  {p.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{p.title}</h3>
                <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  <span>⏱ {p.duration}</span>
                  <span>·</span>
                  <span>👥 {p.spots}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
