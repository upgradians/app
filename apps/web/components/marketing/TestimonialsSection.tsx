"use client";

interface Testimonial {
  name: string;
  role: string;
  initials: string;
  colorA: string;
  colorB: string;
  text: string;
}

const ALL: Testimonial[] = [
  {
    name: "Priya Sharma",
    role: "SWE Intern @ Google",
    initials: "PS",
    colorA: "#f472b6",
    colorB: "#e11d48",
    text: "Upgradian's coding arena helped me crack my Google interview. The AI feedback was incredibly specific and the competitive environment kept me motivated every single day.",
  },
  {
    name: "Rahul Kumar",
    role: "Full Stack Intern @ Swiggy",
    initials: "RK",
    colorA: "#fb923c",
    colorB: "#d97706",
    text: "I went from zero coding knowledge to landing a paid internship in 4 months. The structured tracks and real-world projects made all the difference.",
  },
  {
    name: "Ananya Patel",
    role: "ML Intern @ Razorpay",
    initials: "AP",
    colorA: "#a78bfa",
    colorB: "#7c3aed",
    text: "The AI interview practice is next level. I completed 30+ mock sessions before my actual interview and felt completely prepared for every question.",
  },
  {
    name: "Vikram Singh",
    role: "Backend Dev @ Zepto",
    initials: "VS",
    colorA: "#60a5fa",
    colorB: "#0284c7",
    text: "The leaderboard system is addictive in the best way. I spent every weekend grinding DSA problems to climb the ranks — and it genuinely paid off.",
  },
  {
    name: "Arjun Nair",
    role: "Data Intern @ Microsoft",
    initials: "AN",
    colorA: "#34d399",
    colorB: "#059669",
    text: "I solved 200+ problems over 3 months before interview season. Got 4 offers — including Microsoft. Upgradian made the grind feel worthwhile.",
  },
  {
    name: "Shreya Menon",
    role: "SWE @ Flipkart",
    initials: "SM",
    colorA: "#f97316",
    colorB: "#ea580c",
    text: "The weekly contests are genuinely competitive. Finishing in the top 10 gave me confidence to crack product-based company rounds with ease.",
  },
  {
    name: "Karthik Iyer",
    role: "AI/ML Intern @ Juspay",
    initials: "KI",
    colorA: "#e879f9",
    colorB: "#a21caf",
    text: "The AI mock interviewer asked me the exact same questions that came up in my actual interview. It's like they have insider knowledge!",
  },
  {
    name: "Divya Rao",
    role: "Full Stack Dev @ Groww",
    initials: "DR",
    colorA: "#fbbf24",
    colorB: "#d97706",
    text: "Upgradian's internship program connected me directly with startups. I got real project experience, a stipend, and a full-time offer afterward.",
  },
];

// Two rows with the second row using a different subset for visual variety
const ROW_1 = ALL;
const ROW_2 = [...ALL.slice(4), ...ALL.slice(0, 4)];

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div
      className="flex-shrink-0 w-[300px] sm:w-[320px] rounded-2xl p-5 flex flex-col"
      style={{
        border: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="text-[13px]" style={{ color: "#D97757" }}>★</span>
        ))}
      </div>

      {/* Quote */}
      <p
        className="text-sm leading-relaxed flex-1 mb-4"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        &ldquo;{t.text}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg,${t.colorA},${t.colorB})` }}
        >
          {t.initials}
        </div>
        <div>
          <div className="text-sm font-bold text-white leading-none mb-0.5">{t.name}</div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{t.role}</div>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({
  items,
  duration,
  reverse,
}: {
  items: Testimonial[];
  duration: number;
  reverse?: boolean;
}) {
  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div
        className="absolute inset-y-0 left-0 z-10 w-24 pointer-events-none"
        style={{ background: "linear-gradient(90deg,#09090e,transparent)" }}
      />
      <div
        className="absolute inset-y-0 right-0 z-10 w-24 pointer-events-none"
        style={{ background: "linear-gradient(-90deg,#09090e,transparent)" }}
      />

      <div
        className="flex gap-4"
        style={{
          width: "max-content",
          animation: `marquee-${reverse ? "right" : "left"} ${duration}s linear infinite`,
          willChange: "transform",
        }}
      >
        {/* Two identical copies for seamless loop */}
        {[...items, ...items].map((t, i) => (
          <TestimonialCard key={`${t.name}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section id="about" className="py-24 bg-[#09090e] overflow-hidden">
      {/* CSS keyframes injected at component level */}
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-14">
        <div className="text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-4 uppercase tracking-widest"
            style={{
              borderColor: "rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Student Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Developers Who{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(135deg,#D97757,#f0a882)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Made It
            </span>
          </h2>
          <p className="mt-3 text-white/40 max-w-md mx-auto text-sm">
            Real students. Real jobs. Real results — from across India.
          </p>
        </div>
      </div>

      {/* Marquee rows */}
      <div className="space-y-4">
        <MarqueeRow items={ROW_1} duration={42} />
        <MarqueeRow items={ROW_2} duration={36} reverse />
      </div>
    </section>
  );
}
