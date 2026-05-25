import Link from "next/link";
import { Search, Pencil, Cpu, Rocket, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const STEPS = [
  {
    n: "01",
    icon: Search,
    title: "Discovery & Strategy",
    desc: "We start by deeply understanding your business goals, technical constraints, and competitive landscape to define the right solution architecture.",
    accent: "#4361ee",
  },
  {
    n: "02",
    icon: Pencil,
    title: "Design & Architecture",
    desc: "Our engineers design scalable system architectures and intuitive interfaces before writing a single line of code — reducing rework and technical debt.",
    accent: "#7c3aed",
  },
  {
    n: "03",
    icon: Cpu,
    title: "Engineering & Build",
    desc: "Agile sprints with full-stack engineers, AI specialists, and QA. We ship production-ready features with automated testing and CI/CD pipelines.",
    accent: "#06b6d4",
  },
  {
    n: "04",
    icon: Rocket,
    title: "Deploy & Scale",
    desc: "Cloud-native deployment on AWS, GCP, or Azure. We handle infra, monitoring, and post-launch support so you can focus on growth.",
    accent: "#f59e0b",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden" style={{ background: "#000008" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(67,97,238,0.06), transparent)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center mb-20">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-5 uppercase tracking-widest"
            style={{ borderColor: "rgba(67,97,238,0.3)", background: "rgba(67,97,238,0.08)", color: "#6c8aff" }}
          >
            How We Work
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            From Idea to{" "}
            <span style={{ backgroundImage: "linear-gradient(135deg, #6c8aff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Production
            </span>{" "}
            in Weeks
          </h2>
          <p className="text-white/40 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            A battle-tested engineering process that delivers working software fast — without cutting corners on quality, security, or scalability.
          </p>
        </ScrollReveal>

        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="hidden lg:block absolute top-8 left-[calc(12.5%+40px)] right-[calc(12.5%+40px)] h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)" }} />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.n} delay={i * 0.1} className="flex flex-col items-center text-center group relative">
                <div
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 flex-shrink-0"
                  style={{ background: `${step.accent}15`, border: `1px solid ${step.accent}30` }}
                >
                  <Icon className="w-7 h-7" style={{ color: step.accent }} strokeWidth={1.5} />
                  <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: step.accent }}>
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-2.5 leading-snug">{step.title}</h3>
                <p className="text-sm leading-relaxed max-w-[220px]" style={{ color: "rgba(136,146,176,0.7)" }}>{step.desc}</p>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={0.35} className="mt-20 text-center">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 0 0 1px rgba(67,97,238,0.4), 0 8px 32px rgba(67,97,238,0.3)" }}
          >
            Start Your Project
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="mt-3 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Free consultation · No commitment</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
