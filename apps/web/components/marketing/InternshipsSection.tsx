import Link from "next/link";
import { Monitor, Bot, BarChart3, Palette, Server, Code2, Check, ArrowRight, Users, Zap } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const ROLES = [
  { icon: Code2,     title: "Full Stack Engineering",  type: "Internship",      duration: "3 months", accent: "#4361ee" },
  { icon: Bot,       title: "AI / ML Engineering",     type: "Internship",      duration: "3 months", accent: "#7c3aed" },
  { icon: BarChart3, title: "Data Engineering",        type: "Internship",      duration: "3 months", accent: "#06b6d4" },
  { icon: Monitor,   title: "Frontend Engineering",    type: "Internship",      duration: "2 months", accent: "#10b981" },
  { icon: Server,    title: "DevOps & Cloud",          type: "Internship",      duration: "3 months", accent: "#f59e0b" },
  { icon: Palette,   title: "UI / UX Design",          type: "Internship",      duration: "2 months", accent: "#ec4899" },
];

const PERKS = [
  "Work on live production systems",
  "Mentorship from senior engineers",
  "Letter of recommendation",
  "Stipend for top performers",
  "Direct hiring pipeline for standouts",
  "Access to the full developer platform",
];

export function InternshipsSection() {
  return (
    <section id="careers" className="relative py-32 overflow-hidden" style={{ background: "#07070f" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-start">

          {/* Left — sticky */}
          <div className="lg:w-2/5 lg:sticky lg:top-24">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-6 uppercase tracking-widest" style={{ borderColor: "rgba(67,97,238,0.3)", background: "rgba(67,97,238,0.08)", color: "#6c8aff" }}>
                <Users className="w-3 h-3" />
                Careers &amp; Internships
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-5">
                Build Real Products.
                <br />
                <span style={{ backgroundImage: "linear-gradient(135deg, #6c8aff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Grow Your Career.
                </span>
              </h2>
              <p className="leading-relaxed mb-8 text-sm sm:text-base" style={{ color: "rgba(136,146,176,0.75)" }}>
                Join Upgradian and work alongside senior engineers on AI products and software that serves real users. We value curiosity, ownership, and the ability to ship.
              </p>
              <ul className="space-y-3 mb-8">
                {PERKS.map(perk => (
                  <li key={perk} className="flex items-center gap-3 text-sm" style={{ color: "rgba(136,146,176,0.7)" }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(67,97,238,0.15)", border: "1px solid rgba(67,97,238,0.3)" }}>
                      <Check className="w-3 h-3" style={{ color: "#6c8aff" }} strokeWidth={2.5} />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="mailto:career@upgradians.com"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 0 0 1px rgba(67,97,238,0.4), 0 8px 32px rgba(67,97,238,0.25)" }}
                >
                  <Zap className="w-4 h-4" />
                  Apply Now
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <p className="mt-3 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Send your resume to career@upgradians.com</p>
            </ScrollReveal>
          </div>

          {/* Right — open roles grid */}
          <div className="lg:w-3/5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES.map((r, i) => {
              const Icon = r.icon;
              return (
                <ScrollReveal key={r.title} delay={i * 0.07}>
                  <div className="rounded-2xl p-5 h-full transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 group border border-white/[0.07] bg-white/[0.025]">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: `${r.accent}18`, border: `1px solid ${r.accent}30` }}>
                      <Icon className="w-5 h-5" style={{ color: r.accent }} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{r.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${r.accent}18`, color: r.accent, border: `1px solid ${r.accent}30` }}>
                        {r.type}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: "rgba(136,146,176,0.5)" }}>
                      Duration: {r.duration}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
