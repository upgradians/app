/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand:   { DEFAULT: "#D97757", dark: "#C96442", light: "#E89070" },
        surface: {
          1:    "var(--bg-1)",
          2:    "var(--bg-2)",
          3:    "var(--bg-3)",
          card: "var(--surface-card)",
        },
        text:   { 1: "var(--text-1)", 2: "var(--text-2)", 3: "var(--text-3)" },
        border: "var(--border)",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Fira Code", "Courier New", "monospace"],
      },
      animation: {
        "fade-up":   "fadeUp .5s ease forwards",
        "fade-in":   "fadeIn .3s ease forwards",
        "slide-in":  "slideIn .4s cubic-bezier(.22,1,.36,1) forwards",
        "orb-pulse": "orbPulse 3s ease-in-out infinite",
        "wave":      "wave 1.2s ease-in-out infinite",
        "counter":   "counter 1s ease forwards",
        "glow":      "glow 2s ease-in-out infinite",
        "float":     "float 3s ease-in-out infinite",
        "shimmer":   "shimmer 1.5s linear infinite",
      },
      keyframes: {
        fadeUp:   { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn:   { from: { opacity: "0" }, to: { opacity: "1" } },
        slideIn:  { from: { opacity: "0", transform: "translateX(-16px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        orbPulse: { "0%,100%": { boxShadow: "0 0 40px rgba(217,119,87,.3)" }, "50%": { boxShadow: "0 0 80px rgba(217,119,87,.55)" } },
        wave:     { "0%,100%": { transform: "scaleY(.3)" }, "50%": { transform: "scaleY(1)" } },
        glow:     { "0%,100%": { opacity: ".6" }, "50%": { opacity: "1" } },
        float:    { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        shimmer:  { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
      },
      boxShadow: {
        brand:       "0 4px 24px rgba(217,119,87,.25)",
        glow:        "0 0 60px rgba(217,119,87,.2)",
        card:        "0 1px 3px rgba(0,0,0,.1), 0 1px 2px rgba(0,0,0,.06)",
        "card-hover":"0 10px 40px rgba(0,0,0,.15)",
      },
      backgroundImage: {
        "gradient-brand":   "linear-gradient(135deg, #D97757, #C96442)",
        "gradient-cosmic":  "linear-gradient(135deg, #c084fc, #60a5fa)",
        "grid-pattern":     "linear-gradient(rgba(217,119,87,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(217,119,87,.04) 1px, transparent 1px)",
        "shimmer-gradient": "linear-gradient(90deg, transparent, rgba(255,255,255,.05), transparent)",
      },
      backgroundSize: {
        "grid-60": "60px 60px",
      },
    },
  },
  plugins: [],
};
