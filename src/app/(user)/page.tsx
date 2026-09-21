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
      {/* 1. Hero: "Good food, in its last golden hours." */}
      <TgtgHero />

      {/* 2. Trust Statement & Commitments + Impact Figures */}
      <TgtgMission />

      {/* 3. Featured Listings: "Ending soon near you" with live countdowns */}
      <TgtgWhyUs />

      {/* 4. Category Ticker */}
      <TgtgTicker />

      {/* 5. How It Works (01 List, 02 Countdown, 03 Discover, 04 Collect) */}
      <TgtgHowItWorks />

      {/* 6. Full-Width Visual Food Rescue Banner */}
      <TgtgVisualBanner />

      {/* 7. For Sellers: "Turn today's surplus into tomorrow's customers." */}
      <TgtgBusiness />

      {/* 8. Customers Block CTA: "Real food, fair prices, close to you." */}
      <TgtgCtaBanner />
    </div>
  );
}
