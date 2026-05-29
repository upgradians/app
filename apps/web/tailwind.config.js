const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, "app/**/*.{js,ts,jsx,tsx,mdx}"),
    path.join(__dirname, "components/**/*.{js,ts,jsx,tsx,mdx}"),
    path.join(__dirname, "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}"),
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand:   { DEFAULT: "#4361ee", dark: "#3451d1", light: "#6c8aff" },
        orange:  { DEFAULT: "#f97316", dark: "#ea580c", light: "#fed7aa" },
        violet:  { DEFAULT: "#7c3aed", light: "#a78bfa" },
        cyan:    { DEFAULT: "#06b6d4", light: "#67e8f9" },
        amber:   { DEFAULT: "#f59e0b" },
        surface: {
          1:    "var(--bg-1)",
          2:    "var(--bg-2)",
          3:    "var(--bg-3)",
          card: "var(--surface-card)",
        },
        text: { 1: "var(--text-1)", 2: "var(--text-2)", 3: "var(--text-3)" },
        border: "var(--border)",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Fira Code", "Courier New", "monospace"],
      },
      animation: {
        "fade-up":     "fadeUp .5s ease forwards",
        "fade-in":     "fadeIn .3s ease forwards",
        "slide-in":    "slideIn .4s cubic-bezier(.22,1,.36,1) forwards",
        "float":       "float 4s ease-in-out infinite",
        "pulse-glow":  "pulse-glow 3s ease-in-out infinite",
        "shimmer":     "shimmer 1.5s linear infinite",
        "spin-slow":   "spin-slow 8s linear infinite",
        "marquee-l":   "marquee-left 40s linear infinite",
        "marquee-r":   "marquee-right 36s linear infinite",
      },
      keyframes: {
        fadeUp:   { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn:   { from: { opacity: "0" }, to: { opacity: "1" } },
        slideIn:  { from: { opacity: "0", transform: "translateX(-16px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        float:    { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        shimmer:  { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
      },
      boxShadow: {
        brand:        "0 4px 24px rgba(67,97,238,0.3)",
        "brand-lg":   "0 8px 48px rgba(67,97,238,0.4)",
        orange:       "0 4px 20px rgba(249,115,22,0.28)",
        "orange-lg":  "0 8px 40px rgba(249,115,22,0.38)",
        violet:       "0 4px 24px rgba(124,58,237,0.3)",
        glow:         "0 0 60px rgba(67,97,238,0.2)",
        card:         "0 1px 3px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.04)",
        "card-hover": "0 4px 20px rgba(0,0,0,.10)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        "gradient-brand":    "linear-gradient(135deg, #4361ee, #7c3aed)",
        "gradient-cool":     "linear-gradient(135deg, #06b6d4, #4361ee)",
        "gradient-warm":     "linear-gradient(135deg, #f59e0b, #ef4444)",
        "gradient-full":     "linear-gradient(135deg, #06b6d4, #4361ee, #7c3aed)",
        "grid-dots":         "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
        "grid-lines":        "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "shimmer-gradient":  "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
      },
      backgroundSize: {
        "grid-32": "32px 32px",
        "grid-48": "48px 48px",
        "grid-64": "64px 64px",
      },
    },
  },
  plugins: [],
};
