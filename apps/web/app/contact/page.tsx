"use client";

import Link from "next/link";
import { useState } from "react";
import { Zap, MapPin, Mail, ArrowRight, MessageCircle, Building2, Clock, Send, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [message,  setMessage]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
      setName(""); setEmail(""); setMessage("");
      toast.success("Message sent! We'll reply within 24 hours.");
    } catch {
      toast.error("Failed to send message. Please try WhatsApp or email directly.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200 resize-none placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/20`;
  const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#000008" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(67,97,238,0.12), transparent 65%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 40% 30% at 80% 80%, rgba(124,58,237,0.08), transparent 60%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20">

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 text-xs font-semibold tracking-wide" style={{ background: "rgba(67,97,238,0.1)", borderColor: "rgba(67,97,238,0.3)", color: "#6c8aff" }}>
            <Building2 className="w-3.5 h-3.5" />
            Get In Touch
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-5">
            Let&apos;s Build Something{" "}
            <span style={{ backgroundImage: "linear-gradient(135deg, #6c8aff 0%, #a78bfa 50%, #67e8f9 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Great Together
            </span>
          </h1>
          <p className="text-white/50 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            Whether you need an AI product, a custom software solution, or want to join our team — we&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            {/* Email */}
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(67,97,238,0.15)", border: "1px solid rgba(67,97,238,0.25)" }}>
                  <Mail className="w-5 h-5" style={{ color: "#6c8aff" }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Email Us</h3>
                  <p className="text-xs mb-3" style={{ color: "rgba(136,146,176,0.6)" }}>For services, projects, and general enquiries</p>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&to=career@upgradians.com&su=Project+Enquiry`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-white"
                    style={{ color: "#6c8aff" }}
                  >
                    career@upgradians.com
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <MessageCircle className="w-5 h-5" style={{ color: "#10b981" }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Chat on WhatsApp</h3>
                  <p className="text-xs mb-3" style={{ color: "rgba(136,146,176,0.6)" }}>Quick questions, project briefs, partnership inquiries</p>
                  <a
                    href="https://wa.me/918553451935"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all hover:-translate-y-0.5 active:scale-95"
                    style={{ background: "#10b981", boxShadow: "0 4px 16px rgba(16,185,129,0.25)" }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
                  <MapPin className="w-5 h-5" style={{ color: "#a78bfa" }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Our Office</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(136,146,176,0.7)" }}>
                    TIDEL Neo<br />Villupuram, Tamil Nadu<br />India
                  </p>
                  <a href="https://maps.google.com/?q=TIDEL+Neo+Villupuram" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold transition-colors hover:text-white" style={{ color: "#a78bfa" }}>
                    View on Google Maps <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Office hours */}
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.2)" }}>
                  <Clock className="w-5 h-5" style={{ color: "#67e8f9" }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Office Hours</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(136,146,176,0.7)" }}>
                    Mon – Fri: 9:00 AM – 6:00 PM IST<br />Sat: 10:00 AM – 2:00 PM IST
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden h-52" style={{ background: "linear-gradient(135deg, rgba(67,97,238,0.12), rgba(124,58,237,0.08))", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(67,97,238,0.15)", border: "1px solid rgba(67,97,238,0.25)" }}>
                  <Building2 className="w-6 h-6" style={{ color: "#6c8aff" }} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-base">TIDEL Neo</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(136,146,176,0.6)" }}>Villupuram, Tamil Nadu</div>
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(67,97,238,0.4), transparent)" }} />
            </div>

            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 className="text-base font-bold text-white mb-1">Send a Quick Message</h3>
              <p className="text-xs mb-5" style={{ color: "rgba(136,146,176,0.55)" }}>We typically reply within 24 hours</p>

              {sent ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-400" />
                  <div className="text-white font-bold">Message Sent!</div>
                  <div className="text-sm" style={{ color: "rgba(136,146,176,0.6)" }}>We&apos;ll get back to you within 24 hours.</div>
                  <button onClick={() => setSent(false)} className="mt-2 text-xs text-brand hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name & company"
                    required
                    className={inputClass}
                    style={inputStyle}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className={inputClass}
                    style={inputStyle}
                  />
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tell us about your project or what you're looking for..."
                    rows={4}
                    required
                    className={inputClass}
                    style={inputStyle}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-px active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 0 0 1px rgba(67,97,238,0.4), 0 8px 32px rgba(67,97,238,0.3)" }}
                  >
                    {loading ? "Sending…" : <>Send Message <Send className="w-4 h-4" /></>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/" className="text-xs transition-colors hover:text-white/60" style={{ color: "rgba(136,146,176,0.25)" }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
