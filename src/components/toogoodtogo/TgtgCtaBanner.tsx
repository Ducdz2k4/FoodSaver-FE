"use client";

import React from "react";
import Link from "next/link";

export function TgtgCtaBanner() {
  return (
    <section
      id="download"
      className="py-20 sm:py-28 lg:py-32 bg-[#f9f3f0] text-center relative border-t border-stone-200/60"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#00615f]/70 mb-3">
          Get Started With FoodSaver
        </p>

        {/* Main CTA Heading */}
        <h3 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#00615f] uppercase tracking-tight max-w-3xl mx-auto leading-tight select-none">
          Real food, fair prices, close to you.
        </h3>

        <p className="mt-4 text-base sm:text-lg text-[#252d2d]/80 max-w-xl mx-auto leading-relaxed">
          Join bakeries, convenience stores and neighbours across the city cutting food waste together every day.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#listings"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#00615f] hover:bg-[#089184] text-white font-black text-sm sm:text-base shadow-lg hover:scale-102 active:scale-98 transition-all duration-200"
          >
            Find food nearby
          </Link>

          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-transparent border-2 border-[#00615f] text-[#00615f] hover:bg-[#00615f] hover:text-white font-bold text-sm sm:text-base hover:scale-102 active:scale-98 transition-all duration-200"
          >
            Start listing
          </Link>
        </div>
      </div>
    </section>
  );
}
