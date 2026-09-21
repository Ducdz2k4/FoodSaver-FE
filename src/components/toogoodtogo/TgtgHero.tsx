"use client";

import React from "react";
import Link from "next/link";

export function TgtgHero() {
  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#18181B] text-white pt-20 pb-16">
      {/* Video / Image Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/tgtg/asset_1.jpg"
          className="w-full h-full object-cover scale-105"
        >
          <source
            src="https://static-mkt.toogoodtogo.com/video/web_hero_en_us_1080.mp4"
            type="video/mp4"
          />
        </video>
        {/* Subtle dark overlay matching original */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] font-black tracking-tight text-white leading-[1.05] max-w-4xl mx-auto drop-shadow-sm select-none">
          Save good food from going to waste
        </h1>

        {/* Dual Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="#download"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-white hover:bg-stone-100 text-[#00615f] font-black text-sm sm:text-base shadow-xl hover:scale-102 active:scale-98 transition-all duration-200"
          >
            Download the app
          </Link>

          <Link
            href="#business"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-transparent hover:bg-white/15 text-white font-bold text-sm sm:text-base border-2 border-white hover:scale-102 active:scale-98 transition-all duration-200"
          >
            Business solutions
          </Link>
        </div>
      </div>
    </section>
  );
}
