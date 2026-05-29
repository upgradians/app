import { Bot, Globe, Rocket, Smartphone, Database, Cloud, Workflow } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const SERVICES = [
  {
    icon: Bot,
    title: "AI Product Development",
    desc: "LLM integrations, RAG pipelines, computer vision, and intelligent automation. We build AI products that solve real business problems.",
    tags: ["LLMs", "RAG", "Computer Vision"],
    accent: "#7c3aed",
  },
  {
    icon: Globe,
    title: "SaaS Development",
    desc: "Full-stack SaaS platforms with multi-tenant architecture, billing integrations, admin dashboards, and scalable backend APIs.",
    tags: ["Next.js", "Node.js", "Supabase"],
    accent: "#4361ee",
  },
  {
    icon: Globe,
    title: "Web Application Development",
    desc: "High-performance web apps built on modern stacks — React, Next.js, TypeScript — with pixel-perfect UI and rock-solid infrastructure.",
    tags: ["React", "Next.js", "TypeScript"],
    accent: "#06b6d4",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    desc: "Cross-platform iOS and Android apps built with React Native. Native performance, shared codebase, rapid iteration.",
    tags: ["React Native", "iOS", "Android"],
    accent: "#10b981",
  },
  {
    icon: Database,
    title: "ERP & CRM Systems",
    desc: "Custom enterprise software — CRM, ERP, inventory, HR, and workflow management systems tailored to your business processes.",
    tags: ["Enterprise", "Workflow", "ERP"],
    accent: "#f59e0b",
  },
  {
    icon: Cloud,
    title: "Cloud & DevOps",
    desc: "Cloud infrastructure design, Kubernetes orchestration, CI/CD pipelines, and SRE practices for 99.9% uptime.",
    tags: ["AWS", "GCP", "Kubernetes"],
    accent: "#06b6d4",
  },
  {
    icon: Workflow,
    title: "AI Automation Systems",
    desc: "Intelligent workflow automation, RPA bots, and API integrations that eliminate manual work and cut operational costs by up to 70%.",
    tags: ["RPA", "Automation", "APIs"],
    accent: "#f97316",
  },
  {
    icon: Rocket,
    title: "Startup MVP Development",
    desc: "We partner with early-stage startups to architect and build MVPs fast — validated, deployed, and investor-ready in 4–8 weeks.",
    tags: ["MVP", "Rapid Dev", "Go-to-Market"],
    accent: "#4361ee",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="relative py-32 overflow-hidden bg-slate-50">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-5 uppercase tracking-widest"
            style={{ borderColor: "rgba(249,115,22,0.2)", background: "rgba(249,115,22,0.06)", color: "#ea580c" }}
          >
            Our Services
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
            End-to-End Software{" "}
            <span style={{ backgroundImage: "linear-gradient(135deg, #f97316, #ea580c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Engineering
            </span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            From AI models to enterprise platforms — complete technology solutions built by senior engineers who care about quality.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <ScrollReveal key={s.title} delay={i * 0.06}>
                <div className="relative rounded-2xl p-6 h-full bg-white border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 group cursor-default">
                  {/* Top accent line on hover */}
                  <div
                    className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${s.accent}80, transparent)` }}
                  />

                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${s.accent}12`, border: `1px solid ${s.accent}25` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: s.accent }} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-xs leading-relaxed mb-5 text-slate-500">{s.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 border border-slate-200 text-slate-600"
                      >
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
