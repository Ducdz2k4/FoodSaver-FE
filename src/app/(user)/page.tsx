import React from "react";
import {
  TgtgHero,
  TgtgMission,
  TgtgWhyUs,
  TgtgTicker,
  TgtgHowItWorks,
  TgtgVisualBanner,
  TgtgBusiness,
  TgtgCtaBanner,
} from "@/components/toogoodtogo";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-[#f9f3f0] text-[#252d2d] selection:bg-[#79e4a7] selection:text-[#00615f]">
      {/* 1. Hero Section: Video Background + Dual CTAs */}
      <TgtgHero />

      {/* 2. Mission Statement: Social Impact + App Badges */}
      <TgtgMission />

      {/* 3. Why Use Too Good To Go: Surprise Bag + 4 Benefit Callouts */}
      <TgtgWhyUs />

      {/* 4. Infinite Category Ticker: PIZZA, PASTRIES, GROCERIES, etc. */}
      <TgtgTicker />

      {/* 5. How It Works: Interactive 4-step Carousel + Mockup Images */}
      <TgtgHowItWorks />

      {/* 6. Full-Width Visual Parallax Banner */}
      <TgtgVisualBanner />

      {/* 7. Business Solutions: 3 Interactive Tiles + Paired Visual Showcase */}
      <TgtgBusiness />

      {/* 8. Join Over 180,000 Businesses CTA */}
      <TgtgCtaBanner />
    </div>
  );
}
