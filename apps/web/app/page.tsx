import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { HeroSection } from "@/components/marketing/HeroSection";
import { ServicesSection } from "@/components/marketing/ServicesSection";
import { InternshipsSection } from "@/components/marketing/InternshipsSection";
import { LearningSection } from "@/components/marketing/LearningSection";
import { StatsSection } from "@/components/marketing/StatsSection";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const metadata: Metadata = {
  title: "Upgradian Technology – Building AI Products. Empowering Future Developers.",
  description:
    "India's AI-powered platform for coding practice, internships, contests, and placement. Practice DSA, compete globally, and get hired.",
  openGraph: {
    title: "Upgradian Technology",
    description: "Building AI Products. Empowering Future Developers.",
    type: "website",
    url: "https://upgradians.com",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Upgradian Technology",
    description: "Building AI Products. Empowering Future Developers.",
  },
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="bg-[#09090e] text-white overflow-x-hidden">
      <MarketingNav isAuthenticated={!!user} />
      <HeroSection isAuthenticated={!!user} />
      <ServicesSection />
      <InternshipsSection />
      <LearningSection />
      <StatsSection />
      <TestimonialsSection />
      <MarketingFooter />
    </div>
  );
}
