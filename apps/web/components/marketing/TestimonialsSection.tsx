const TESTIMONIALS = [
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
];

export function TestimonialsSection() {
  return (
    <section id="about" className="py-24 bg-[#09090e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-4 uppercase tracking-widest"
            style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)" }}
          >
            Student Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Developers Who Made It
          </h2>
          <p className="mt-3 text-white/40 max-w-md mx-auto text-sm">
            Real students. Real jobs. Real results.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl p-6 flex flex-col"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
            >
              <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} style={{ color: "#D97757" }} className="text-sm">★</span>
                ))}
              </div>
              <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg,${t.colorA},${t.colorB})`,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
