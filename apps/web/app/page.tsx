import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MarketingNav }       from "@/components/marketing/MarketingNav";
import { HeroSection }        from "@/components/marketing/HeroSection";
import { HowItWorks }         from "@/components/marketing/HowItWorks";
import { ServicesSection }    from "@/components/marketing/ServicesSection";
import { InternshipsSection } from "@/components/marketing/InternshipsSection";
import { LearningSection }    from "@/components/marketing/LearningSection";
import { StatsSection }       from "@/components/marketing/StatsSection";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { MarketingFooter }    from "@/components/marketing/MarketingFooter";

export const metadata: Metadata = {
  title: "Upgradian Technology – AI Engineering & Software Development",
  description:
    "Upgradian Technology is an AI product development and software engineering company. We build SaaS platforms, web apps, mobile apps, and AI-powered solutions for startups and enterprises.",
  openGraph: {
    title: "Upgradian Technology",
    description: "Building AI Products & Scalable Software.",
    type: "website",
    url: "https://upgradians.com",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Upgradian Technology",
    description: "AI Engineering & Software Development Company.",
  },
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="bg-[#000008] text-white overflow-x-hidden">
      <MarketingNav isAuthenticated={!!user} />

      {/* 1. Hero — IT/AI company positioning */}
      <HeroSection isAuthenticated={!!user} />

      {/* 2. How We Work — engineering process */}
      <HowItWorks />

      {/* 3. Services — complete IT services portfolio */}
      <ServicesSection />

      {/* 4. Careers — startup hiring, real projects */}
      <InternshipsSection />

      {/* 5. Practice Platform — brief ecosystem teaser */}
      <LearningSection />

      {/* 6. Stats — social proof */}
      <StatsSection />

      {/* 7. Developer stories marquee */}
      <TestimonialsSection />

      <MarketingFooter />
    </div>
  );
}
