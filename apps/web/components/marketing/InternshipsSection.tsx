import Link from "next/link";
import { Monitor, Bot, BarChart3, Palette, Megaphone, Server, Check, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const PROGRAMS = [
  { icon: Monitor,   title: "Full Stack Development", duration: "3 months", spots: "120+ spots", accent: "#4361ee" },
  { icon: Bot,       title: "AI / Machine Learning",  duration: "3 months", spots: "80+ spots",  accent: "#7c3aed" },
  { icon: BarChart3, title: "Data Science",           duration: "3 months", spots: "60+ spots",  accent: "#06b6d4" },
  { icon: Palette,   title: "UI / UX Design",         duration: "2 months", spots: "40+ spots",  accent: "#ec4899" },
  { icon: Megaphone, title: "Digital Marketing",      duration: "2 months", spots: "50+ spots",  accent: "#10b981" },
  { icon: Server,    title: "DevOps & Cloud",         duration: "3 months", spots: "30+ spots",  accent: "#f59e0b" },
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
    <section id="internships" className="relative py-32 overflow-hidden" style={{ background: "#07070f" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-start">

          {/* Left — sticky */}
          <div className="lg:w-2/5 lg:sticky lg:top-24">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-6 uppercase tracking-widest" style={{ borderColor: "rgba(67,97,238,0.3)", background: "rgba(67,97,238,0.08)", color: "#6c8aff" }}>
                Internship Programs
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-5">
                Real Projects.
                <br />
                <span style={{ backgroundImage: "linear-gradient(135deg, #6c8aff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Real Experience.
                </span>
              </h2>
              <p className="leading-relaxed mb-8 text-sm sm:text-base" style={{ color: "rgba(136,146,176,0.75)" }}>
                Our programs connect freshers with live projects. Work alongside senior engineers, build products used by real users, and launch your career with confidence.
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
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 0 0 1px rgba(67,97,238,0.4), 0 8px 32px rgba(67,97,238,0.25)" }}
              >
                Apply for Internship
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </ScrollReveal>
          </div>

          {/* Right — program grid */}
          <div className="lg:w-3/5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROGRAMS.map((p, i) => {
              const Icon = p.icon;
              return (
                <ScrollReveal key={p.title} delay={i * 0.07}>
                  <div
                    className="rounded-2xl p-5 h-full transition-all duration-300 hover:-translate-y-0.5 group"
                    style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: `${p.accent}18`, border: `1px solid ${p.accent}30` }}>
                      <Icon className="w-5 h-5" style={{ color: p.accent }} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{p.title}</h3>
                    <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(136,146,176,0.5)" }}>
                      <span>{p.duration}</span>
                      <span>·</span>
                      <span>{p.spots}</span>
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
