import Link from "next/link";
import { ArrowRight, Cpu, Globe, Layers, Zap, Building2, Code2 } from "lucide-react";

interface HeroSectionProps {
  isAuthenticated: boolean;
}

const STATS = [
  { value: "200+",  label: "Projects Shipped"   },
  { value: "15+",   label: "Enterprise Clients" },
  { value: "50K+",  label: "Developer Community"},
  { value: "3+",    label: "Years Building"     },
];

const CAPABILITIES = [
  { icon: Cpu,    label: "AI Product Dev"  },
  { icon: Globe,  label: "SaaS Platforms"  },
  { icon: Layers, label: "Cloud & DevOps"  },
  { icon: Code2,  label: "Custom Software" },
];

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-white pt-16">

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Subtle top glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 45% at 50% -5%, rgba(249,115,22,0.07) 0%, transparent 65%)" }} />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center py-20">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 text-xs font-semibold tracking-wide"
          style={{
            background: "rgba(249,115,22,0.06)",
            borderColor: "rgba(249,115,22,0.2)",
            color: "#ea580c",
            opacity: 0,
            animation: "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
          }}
        >
          <Building2 className="w-3.5 h-3.5" />
          AI Engineering &amp; Software Development Company
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-[5.25rem] font-black tracking-tight leading-[1.04] text-slate-900 mb-6"
          style={{
            opacity: 0,
            animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
            animationDelay: "0.1s",
          }}
        >
          Building AI Products
          <br className="hidden sm:block" />{" "}
          <span
            style={{
              backgroundImage: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            &amp; Scalable Software
          </span>
        </h1>

        {/* Sub */}
        <p
          className="text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed mb-10 text-slate-500"
          style={{
            opacity: 0,
            animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
            animationDelay: "0.2s",
          }}
        >
          We design, engineer, and deploy cutting-edge AI-powered software solutions for startups and enterprises.
          <br className="hidden sm:block" />
          From MVP to scale — we build the technology that moves your business forward.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          style={{
            opacity: 0,
            animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
            animationDelay: "0.3s",
          }}
        >
          <Link
            href="/#services"
            className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              boxShadow: "0 4px 20px rgba(249,115,22,0.30)",
            }}
          >
            Explore Services
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-slate-200 text-slate-700 text-sm font-semibold transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95"
          >
            <Zap className="w-4 h-4" />
            Build With Us
          </Link>
        </div>

        {/* Capability pills */}
        <div
          className="flex flex-wrap items-center justify-center gap-3 mb-14"
          style={{
            opacity: 0,
            animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
            animationDelay: "0.4s",
          }}
        >
          {CAPABILITIES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 shadow-sm"
            >
              <Icon className="w-3.5 h-3.5 text-orange-500" />
              {label}
            </div>
          ))}
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-orange-50 border border-orange-200 text-orange-600 transition-all hover:bg-orange-100"
            >
              Go to Dashboard
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Stats strip */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
          style={{
            opacity: 0,
            animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
            animationDelay: "0.5s",
            background: "#e2e8f0",
          }}
        >
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center py-6 px-4 bg-white">
              <div className="text-2xl sm:text-3xl font-black mb-1 text-slate-900">{value}</div>
              <div className="text-xs font-medium text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to top, #f8fafc, transparent)" }} />
    </section>
  );
}
