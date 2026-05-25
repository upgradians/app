import { Bot, Globe, Zap, Rocket } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const SERVICES = [
  {
    icon: Bot,
    title: "AI Product Development",
    desc: "We build cutting-edge AI-powered SaaS products — from LLM integrations to computer vision to intelligent automation systems.",
    tags: ["LLMs", "Computer Vision", "MLOps"],
    accent: "#7c3aed",
  },
  {
    icon: Globe,
    title: "Web & Mobile Platforms",
    desc: "Full-stack web apps and React Native mobile apps built on modern stacks — Next.js, Node.js, Supabase, and more.",
    tags: ["Next.js", "React Native", "Supabase"],
    accent: "#4361ee",
  },
  {
    icon: Zap,
    title: "Automation Systems",
    desc: "Intelligent workflow automation, RPA bots, and API integrations that eliminate manual work and cut operational costs.",
    tags: ["RPA", "Workflows", "Integrations"],
    accent: "#06b6d4",
  },
  {
    icon: Rocket,
    title: "Startup Tech Solutions",
    desc: "We partner with early-stage startups to architect scalable systems, build MVPs fast, and grow their engineering team.",
    tags: ["MVP", "Architecture", "Scale"],
    accent: "#f59e0b",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="relative py-32 overflow-hidden" style={{ background: "#07070f" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-5 uppercase tracking-widest" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)" }}>
            What We Build
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Building Tomorrow&apos;s{" "}
            <span style={{ backgroundImage: "linear-gradient(135deg, #6c8aff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Technology
            </span>
          </h2>
          <p className="text-white/35 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            From AI models to mobile apps — complete technology solutions for startups, scale-ups, and enterprises.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <ScrollReveal key={s.title} delay={i * 0.08}>
                <div
                  className="relative rounded-2xl p-6 h-full transition-all duration-300 hover:-translate-y-1 group cursor-default"
                  style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${s.accent}40`; (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.045)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.025)"; }}
                >
                  {/* Subtle top glow line */}
                  <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${s.accent}60, transparent)` }} />

                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: `${s.accent}18`, border: `1px solid ${s.accent}30` }}>
                    <Icon className="w-5 h-5" style={{ color: s.accent }} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-xs leading-relaxed mb-5" style={{ color: "rgba(136,146,176,0.7)" }}>{s.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
