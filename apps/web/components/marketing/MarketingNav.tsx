"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Zap, Menu, X, ArrowRight, ChevronDown, Code2, Bot, Trophy, BarChart3 } from "lucide-react";

interface MarketingNavProps {
  isAuthenticated: boolean;
}

const MAIN_LINKS = [
  { href: "/#services",  label: "Services"  },
  { href: "/#careers",   label: "Careers"   },
  { href: "/contact",    label: "Contact"   },
];

const PRACTICE_ITEMS = [
  { href: "/arena",       icon: Code2,     label: "Coding Arena",  desc: "500+ DSA challenges" },
  { href: "/interview",   icon: Bot,       label: "AI Interviews", desc: "Mock interview prep" },
  { href: "/contests",    icon: Trophy,    label: "Contests",      desc: "Compete & win prizes" },
  { href: "/leaderboard", icon: BarChart3, label: "Leaderboard",   desc: "Global rankings"     },
];

export function MarketingNav({ isAuthenticated }: MarketingNavProps) {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const practiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMobileOpen(false); setPracticeOpen(false); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (practiceRef.current && !practiceRef.current.contains(e.target as Node)) {
        setPracticeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navBg = scrolled || mobileOpen
    ? "bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm"
    : "bg-white/80 backdrop-blur-sm";

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900 flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          >
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          Upgradian<span className="text-orange-500">.</span>Tech
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {MAIN_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
            >
              {label}
            </Link>
          ))}

          {/* Practice dropdown */}
          <div ref={practiceRef} className="relative">
            <button
              onClick={() => setPracticeOpen(v => !v)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                practiceOpen
                  ? "text-slate-900 bg-slate-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Practice
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${practiceOpen ? "rotate-180" : ""}`} />
            </button>

            {practiceOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
                <div className="p-2">
                  {PRACTICE_ITEMS.map(({ href, icon: Icon, label, desc }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setPracticeOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group hover:bg-slate-50"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.15)" }}
                      >
                        <Icon className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 leading-none mb-0.5">{label}</div>
                        <div className="text-xs text-slate-400">{desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-slate-100 p-2">
                  <Link
                    href="/practice"
                    onClick={() => setPracticeOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-orange-500 transition-all hover:bg-orange-50"
                  >
                    View all practice tools
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:-translate-y-px active:scale-95"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 4px 14px rgba(249,115,22,0.25)" }}
            >
              Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:-translate-y-px active:scale-95"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 4px 14px rgba(249,115,22,0.25)" }}
              >
                Build With Us <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}

          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-slate-100 px-4 py-4 space-y-1 bg-white">
          {MAIN_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              {label}
            </Link>
          ))}
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400 mt-2">
            Practice Platform
          </div>
          {PRACTICE_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <Icon className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
              {label}
            </Link>
          ))}
          {!isAuthenticated && (
            <>
              <div className="h-px bg-slate-100 my-2" />
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
