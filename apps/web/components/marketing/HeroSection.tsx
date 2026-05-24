import Link from "next/link";

const FLOATERS = [
  { text: "const ai = await upgradian.build()", pos: "left-[4%] top-[32%]", delay: "0.9s" },
  { text: "rank: 'Legend' ✓",                  pos: "right-[6%] top-[28%]", delay: "1.05s" },
  { text: "offer.status = 'accepted' 🎉",       pos: "left-[2%] bottom-[32%]", delay: "1.2s" },
  { text: "streak: 🔥 42 days",                 pos: "right-[4%] bottom-[36%]", delay: "1.35s" },
];

interface HeroSectionProps {
  isAuthenticated: boolean;
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-[#09090e] pt-16">
      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(217,119,87,0.045) 1px,transparent 1px),linear-gradient(90deg,rgba(217,119,87,0.045) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Primary radial glow — top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% -5%,rgba(217,119,87,0.2) 0%,transparent 65%)",
        }}
      />
      {/* Secondary glow — bottom-right accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 85% 80%,rgba(96,165,250,0.07) 0%,transparent 60%)",
        }}
      />

      {/* Floating code labels — xl only */}
      {FLOATERS.map((f) => (
        <div
          key={f.text}
          className={`absolute hidden xl:block font-mono text-xs select-none pointer-events-none ${f.pos}`}
          style={{
            color: "rgba(217,119,87,0.4)",
            opacity: 0,
            animation: "fadeIn 1s ease forwards",
            animationDelay: f.delay,
          }}
        >
          {f.text}
        </div>
      ))}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center py-20">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D97757]/25 bg-[#D97757]/[0.08] mb-8"
          style={{ opacity: 0, animation: "fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97757] animate-pulse" />
          <span className="text-[#D97757] text-xs font-semibold tracking-wide">
            India&apos;s #1 AI-Powered Developer Platform
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-[5.5rem] font-black tracking-tight leading-[1.05] text-white mb-6"
          style={{
            opacity: 0,
            animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
            animationDelay: "0.1s",
          }}
        >
          Building{" "}
          <span
            style={{
              backgroundImage: "linear-gradient(135deg,#D97757,#f0a882)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            AI Products.
          </span>
          <br className="hidden sm:block" />{" "}
          Empowering{" "}
          <span
            style={{
              backgroundImage: "linear-gradient(135deg,#60a5fa,#c084fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Future Developers.
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-base sm:text-lg lg:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10"
          style={{
            opacity: 0,
            animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
            animationDelay: "0.2s",
          }}
        >
          Practice DSA. Compete in contests. Land real internships.
          <br className="hidden sm:block" />
          Your complete journey from student to hired developer — powered by AI.
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          style={{
            opacity: 0,
            animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
            animationDelay: "0.32s",
          }}
        >
          <Link
            href={isAuthenticated ? "/arena" : "/register"}
            className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#D97757] text-white text-sm font-bold transition-all hover:bg-[#C96442] hover:shadow-[0_0_40px_rgba(217,119,87,0.4)] hover:-translate-y-0.5 active:scale-95"
          >
            Start Learning Free
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            href="/internships"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/10 text-white/80 text-sm font-semibold transition-all hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
          >
            Explore Internships
          </Link>
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-2xl mx-auto"
          style={{
            opacity: 0,
            animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
            animationDelay: "0.46s",
          }}
        >
          {[
            { value: "50K+", label: "Students Trained" },
            { value: "200+", label: "Projects Built" },
            { value: "1.2K+", label: "Internships Placed" },
            { value: "98%", label: "Satisfaction" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-white mb-1">{value}</div>
              <div className="text-xs text-white/35 uppercase tracking-wider font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade into next section */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#09090e] to-transparent pointer-events-none" />
    </section>
  );
}
