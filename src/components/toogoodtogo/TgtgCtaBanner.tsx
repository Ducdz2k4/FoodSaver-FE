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
        {/* Main CTA Heading */}
        <h3 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#00615f] uppercase tracking-tight max-w-3xl mx-auto leading-tight select-none">
          JOIN OVER 180,000 BUSINESSES FIGHTING FOOD WASTE WITH US
        </h3>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#download"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#00615f] hover:bg-[#089184] text-white font-black text-sm sm:text-base shadow-lg hover:scale-102 active:scale-98 transition-all duration-200"
          >
            Download the app
          </Link>

          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-transparent border-2 border-[#00615f] text-[#00615f] hover:bg-[#00615f] hover:text-white font-bold text-sm sm:text-base hover:scale-102 active:scale-98 transition-all duration-200"
          >
            Business sign up
          </Link>
        </div>
      </div>
    </section>
  );
}
