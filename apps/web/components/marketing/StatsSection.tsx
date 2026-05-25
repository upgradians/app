"use client";

import { useEffect, useRef, useState } from "react";
import { GraduationCap, Rocket, Briefcase, Code2, Star, Handshake } from "lucide-react";
import { motion } from "framer-motion";

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setCount(Math.round(ease * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { count, ref };
}

const STATS = [
  { value: 50000, suffix: "+", label: "Students Trained",    icon: GraduationCap, accent: "#4361ee" },
  { value: 200,   suffix: "+", label: "Projects Shipped",    icon: Rocket,        accent: "#7c3aed" },
  { value: 1200,  suffix: "+", label: "Internships Placed",  icon: Briefcase,     accent: "#06b6d4" },
  { value: 500,   suffix: "+", label: "Coding Challenges",   icon: Code2,         accent: "#f59e0b" },
  { value: 98,    suffix: "%", label: "Satisfaction Rate",   icon: Star,          accent: "#10b981" },
  { value: 15,    suffix: "+", label: "Industry Partners",   icon: Handshake,     accent: "#6c8aff" },
];

function StatCard({ value, suffix, label, icon: Icon, accent }: typeof STATS[number]) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="flex flex-col items-center py-8 px-4 group">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110" style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
        <Icon className="w-5 h-5" style={{ color: accent }} strokeWidth={1.5} />
      </div>
      <div
        className="text-3xl sm:text-4xl font-black mb-1 tabular-nums"
        style={{
          backgroundImage: "linear-gradient(135deg, #f0f4ff, #a0aec0)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs font-medium" style={{ color: "rgba(136,146,176,0.6)" }}>{label}</div>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="relative py-24 overflow-hidden" style={{ background: "#07070f" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(67,97,238,0.05), transparent)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="rounded-3xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Top line glow */}
          <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(67,97,238,0.4), rgba(124,58,237,0.4), transparent)" }} />

          <div className="px-8 pt-10 pb-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Trusted by Thousands of{" "}
              <span style={{ backgroundImage: "linear-gradient(135deg, #6c8aff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Developers
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-white/[0.05]">
            {STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
