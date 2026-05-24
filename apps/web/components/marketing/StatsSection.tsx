"use client";

import { useEffect, useRef, useState } from "react";
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
  { value: 50000, suffix: "+", label: "Students Trained", icon: "🎓" },
  { value: 200, suffix: "+", label: "Projects Shipped", icon: "🚀" },
  { value: 1200, suffix: "+", label: "Internships Placed", icon: "💼" },
  { value: 500, suffix: "+", label: "Coding Challenges", icon: "⚔️" },
  { value: 98, suffix: "%", label: "Satisfaction Rate", icon: "⭐" },
  { value: 15, suffix: "+", label: "Industry Partners", icon: "🤝" },
];

function StatCard({ value, suffix, label, icon }: (typeof STATS)[number]) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center py-6 px-4">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-3xl sm:text-4xl font-black text-white mb-1 tabular-nums">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </div>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="py-16 bg-[#0e0e15]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className="rounded-3xl p-8"
          style={{
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Trusted by Thousands of{" "}
              <span
                style={{
                  backgroundImage: "linear-gradient(135deg,#D97757,#f0a882)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Developers
              </span>
            </h2>
          </motion.div>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  borderRight:
                    i < STATS.length - 1
                      ? "1px solid rgba(255,255,255,0.05)"
                      : "none",
                }}
              >
                <StatCard {...stat} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
