"use client";

interface Testimonial {
  name: string;
  role: string;
  initials: string;
  accent: string;
  text: string;
}

const ALL: Testimonial[] = [
  { name: "Priya Sharma",  role: "SWE Intern @ Google",      initials: "PS", accent: "#4361ee", text: "Upgradian's coding arena helped me crack my Google interview. The AI feedback was incredibly specific and the competitive environment kept me motivated every single day." },
  { name: "Rahul Kumar",   role: "Full Stack Intern @ Swiggy",initials: "RK", accent: "#7c3aed", text: "I went from zero coding knowledge to landing a paid internship in 4 months. The structured tracks and real-world projects made all the difference." },
  { name: "Ananya Patel",  role: "ML Intern @ Razorpay",     initials: "AP", accent: "#06b6d4", text: "The AI interview practice is next level. I completed 30+ mock sessions before my actual interview and felt completely prepared for every question." },
  { name: "Vikram Singh",  role: "Backend Dev @ Zepto",      initials: "VS", accent: "#10b981", text: "The leaderboard system is addictive in the best way. I spent every weekend grinding DSA problems to climb the ranks — and it genuinely paid off." },
  { name: "Arjun Nair",   role: "Data Intern @ Microsoft",   initials: "AN", accent: "#f59e0b", text: "I solved 200+ problems over 3 months before interview season. Got 4 offers — including Microsoft. Upgradian made the grind feel worthwhile." },
  { name: "Shreya Menon",  role: "SWE @ Flipkart",           initials: "SM", accent: "#ec4899", text: "The weekly contests are genuinely competitive. Finishing in the top 10 gave me confidence to crack product-based company rounds with ease." },
  { name: "Karthik Iyer",  role: "AI/ML Intern @ Juspay",    initials: "KI", accent: "#a78bfa", text: "The AI mock interviewer asked me the exact same questions that came up in my actual interview. It's like they have insider knowledge!" },
  { name: "Divya Rao",    role: "Full Stack Dev @ Groww",    initials: "DR", accent: "#67e8f9", text: "Upgradian's internship program connected me directly with startups. I got real project experience, a stipend, and a full-time offer afterward." },
];

const ROW_1 = ALL;
const ROW_2 = [...ALL.slice(4), ...ALL.slice(0, 4)];

function Card({ t }: { t: Testimonial }) {
  return (
    <div
      className="flex-shrink-0 w-[300px] sm:w-[320px] rounded-2xl p-5 flex flex-col"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {[1,2,3,4,5].map(i => (
          <svg key={i} className="w-3.5 h-3.5" fill={t.accent} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
        &ldquo;{t.text}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: `${t.accent}40`, border: `1px solid ${t.accent}60` }}>
          {t.initials}
        </div>
        <div>
          <div className="text-sm font-bold text-white leading-none mb-0.5">{t.name}</div>
          <div className="text-xs" style={{ color: "rgba(136,146,176,0.5)" }}>{t.role}</div>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ items, reverse }: { items: Testimonial[]; reverse?: boolean }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 left-0 z-10 w-24 pointer-events-none" style={{ background: "linear-gradient(90deg,#000008,transparent)" }} />
      <div className="absolute inset-y-0 right-0 z-10 w-24 pointer-events-none" style={{ background: "linear-gradient(-90deg,#000008,transparent)" }} />
      <div
        className="flex gap-4"
        style={{
          width: "max-content",
          animation: `marquee-${reverse ? "right" : "left"} ${reverse ? "36s" : "42s"} linear infinite`,
          willChange: "transform",
        }}
      >
        {[...items, ...items].map((t, i) => (
          <Card key={`${t.name}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section id="about" className="relative py-28 overflow-hidden" style={{ background: "#000008" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(67,97,238,0.05), transparent)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-14 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-5 uppercase tracking-widest" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}>
          Developer Stories
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Engineers Who{" "}
          <span style={{ backgroundImage: "linear-gradient(135deg, #6c8aff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Levelled Up
          </span>
        </h2>
        <p className="mt-3 max-w-md mx-auto text-sm" style={{ color: "rgba(136,146,176,0.55)" }}>
          Developers from our ecosystem who landed top engineering roles.
        </p>
      </div>

      <div className="space-y-4">
        <MarqueeRow items={ROW_1} />
        <MarqueeRow items={ROW_2} reverse />
      </div>
    </section>
  );
}
