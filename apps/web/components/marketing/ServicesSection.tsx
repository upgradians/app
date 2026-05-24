import { ScrollReveal } from "@/components/ui/ScrollReveal";

const SERVICES = [
  {
    icon: "🤖",
    title: "AI Product Development",
    desc: "We build cutting-edge AI-powered SaaS products — from LLM integrations to computer vision to intelligent automation systems.",
    tags: ["LLMs", "Computer Vision", "MLOps"],
    gradFrom: "rgba(167,139,250,0.12)",
    gradTo: "rgba(139,92,246,0.04)",
    border: "rgba(167,139,250,0.2)",
  },
  {
    icon: "🚀",
    title: "Web & Mobile Platforms",
    desc: "Full-stack web apps and React Native mobile apps built on modern stacks — Next.js, Node.js, Supabase, and more.",
    tags: ["Next.js", "React Native", "Supabase"],
    gradFrom: "rgba(96,165,250,0.12)",
    gradTo: "rgba(59,130,246,0.04)",
    border: "rgba(96,165,250,0.2)",
  },
  {
    icon: "⚙️",
    title: "Automation Systems",
    desc: "Intelligent workflow automation, RPA bots, and API integrations that eliminate manual work and cut operational costs.",
    tags: ["RPA", "Workflows", "Integrations"],
    gradFrom: "rgba(217,119,87,0.12)",
    gradTo: "rgba(194,86,26,0.04)",
    border: "rgba(217,119,87,0.22)",
  },
  {
    icon: "💡",
    title: "Startup Tech Solutions",
    desc: "We partner with early-stage startups to architect scalable systems, build MVPs fast, and grow their engineering team.",
    tags: ["MVP", "Architecture", "Scale"],
    gradFrom: "rgba(52,211,153,0.12)",
    gradTo: "rgba(16,185,129,0.04)",
    border: "rgba(52,211,153,0.2)",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-[#09090e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-white/50 text-xs font-semibold mb-4 uppercase tracking-widest">
            What We Build
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Building Tomorrow&apos;s{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(135deg,#D97757,#f0a882)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Technology Today
            </span>
          </h2>
          <p className="mt-4 text-white/40 max-w-xl mx-auto text-sm sm:text-base">
            From AI models to mobile apps — complete technology solutions for startups, scale-ups, and enterprises.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s, i) => (
            <ScrollReveal key={s.title} delay={i * 0.08}>
            <div
              className="relative rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 group h-full"
              style={{
                background: `linear-gradient(135deg, ${s.gradFrom}, ${s.gradTo})`,
                border: `1px solid ${s.border}`,
              }}
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                {s.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed mb-5">{s.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {s.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/[0.06] border border-white/[0.08] text-white/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
