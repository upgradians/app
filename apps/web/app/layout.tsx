import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Providers } from "./providers";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Upgradian Technology", template: "%s | Upgradian" },
  description: "Learn. Practice. Compete. Get Hired. India's AI-powered coding and placement platform.",
  keywords: ["coding platform", "coding challenges", "internships", "AI interview", "tech jobs India"],
  authors: [{ name: "Upgradian Technology" }],
  openGraph: {
    title: "Upgradian Technology — Learn. Practice. Compete. Get Hired.",
    description: "AI-powered coding, internship and placement platform for Indian developers.",
    type: "website",
    locale: "en_IN",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#D97757",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={jakarta.variable}>
        {/* Skip-to-content for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-brand focus:text-white focus:font-bold focus:text-sm"
        >
          Skip to main content
        </a>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--surface-card)",
                color: "var(--text-1)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                fontSize: "0.875rem",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
