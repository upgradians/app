"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface MarketingNavProps {
  isAuthenticated: boolean;
}

export function MarketingNav({ isAuthenticated }: MarketingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = [
    ["#services", "Services"],
    ["#internships", "Internships"],
    ["#learning", "Learning"],
    ["#about", "About"],
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "bg-[#09090e]/95 backdrop-blur-md border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-white flex-shrink-0">
          Upgradian<span className="text-[#D97757]">.</span>Tech
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-[#D97757] text-white text-sm font-semibold hover:bg-[#C96442] transition-colors"
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block text-sm text-white/60 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl bg-[#D97757] text-white text-sm font-semibold hover:bg-[#C96442] transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              {open ? (
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/[0.06] px-4 py-3 space-y-1 bg-[#09090e]">
          {navLinks.map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              {label}
            </a>
          ))}
          {!isAuthenticated && (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
