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
    <div className="w-full min-h-screen bg-[#FFFDF5] text-stone-900 selection:bg-yellow-300 selection:text-stone-900">
      {/* 1. Hero Section with Video Background and Download CTAs */}
      <TgtgHero />

      {/* 2. Mission Statement and Impact Stats */}
      <TgtgMission />

      {/* 3. Why Use FoodSaver (4 Value Prop Cards + Surprise Bag Explainer) */}
      <TgtgWhyUs />

      {/* 4. Scrolling Category Ticker */}
      <TgtgTicker />

      {/* 5. How It Works (4 Steps with Interactive Navigation) */}
      <TgtgHowItWorks />

      {/* 6. Visual Parallax Food Rescue Showcase Banner */}
      <TgtgVisualBanner />

      {/* 7. B2B Enterprise Solutions (Surprise Bags, Platform, Date Labeling) */}
      <TgtgBusiness />

      {/* 8. Global Community CTA Banner */}
      <TgtgCtaBanner />
    </div>
  );
}
