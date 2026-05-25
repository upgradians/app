import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Providers } from "./providers";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { WhatsAppButton } from "@/components/marketing/WhatsAppButton";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Upgradian Technology", template: "%s | Upgradian" },
  description: "Upgradian Technology — AI product development and software engineering company. We build SaaS, web apps, mobile apps, AI solutions, and developer tools.",
  keywords: ["AI development", "software engineering", "SaaS development", "mobile apps", "coding platform", "internships India"],
  authors: [{ name: "Upgradian Technology" }],
  openGraph: {
    title: "Upgradian Technology — AI Engineering & Software Development",
    description: "Building AI Products & Scalable Software for startups and enterprises.",
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
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${jakarta.variable} antialiased`}>
        {/* Skip-to-content for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-brand focus:text-white focus:font-bold focus:text-sm"
        >
          Skip to main content
        </a>
        <Providers>
          {children}
          <WhatsAppButton />
          <ChatWidget />
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
