"use client";

import React from "react";
import {
  BagHalfPriceIcon,
  BagRescueNearYouIcon,
  BagHelpEnvironmentIcon,
  BagTrySomethingNewIcon,
} from "./TgtgIcons";

export function TgtgWhyUs() {
  return (
    <section id="why-us" className="pt-16 pb-20 sm:pt-20 sm:pb-28 bg-[#f9f3f0] text-[#00615f] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#00615f]/70 mb-2">
            Why use
          </p>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#00615f] uppercase select-none">
            TOO GOOD TO GO
          </h2>
        </div>

        {/* Central Bag Showcase with Surrounding Benefit Callouts */}
        <div className="relative max-w-5xl mx-auto">
          {/* Desktop 3-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4 items-center">
            {/* Left 2 Callouts (aligned right towards bag) */}
            <div className="space-y-12 sm:space-y-16 lg:text-right flex flex-col items-center lg:items-end">
              {/* Callout 1 */}
              <div className="flex flex-col items-center lg:items-end max-w-xs group">
                <div className="text-[#00615f] mb-3 group-hover:scale-110 transition-transform">
                  <BagHalfPriceIcon className="size-12 sm:size-14 text-[#00615f]" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#00615f] text-center lg:text-right leading-snug">
                  Enjoy good food at ½ price or less
                </h3>
              </div>

              {/* Callout 3 */}
              <div className="flex flex-col items-center lg:items-end max-w-xs group">
                <div className="text-[#00615f] mb-3 group-hover:scale-110 transition-transform">
                  <BagHelpEnvironmentIcon className="size-12 sm:size-14 text-[#00615f]" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#00615f] text-center lg:text-right leading-snug">
                  Help the environment by reducing food waste
                </h3>
              </div>
            </div>

            {/* Center: The Iconic Surprise Bag */}
            <div className="flex justify-center items-center py-4 my-2 lg:my-0">
              <div className="relative w-64 sm:w-80 lg:w-96 aspect-square flex items-center justify-center">
                {/* Ambient glow behind bag */}
                <div className="absolute inset-0 bg-[#79e4a7]/20 rounded-full blur-3xl pointer-events-none" />
                
                {/* Paper grocery bag representation with fresh goods & brand badge */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
                  <img
                    src="/images/tgtg/asset_16.png"
                    alt="Too Good To Go Surprise Bag"
                    className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Floating TGTG logo badge */}
                  <div className="absolute -bottom-2 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-md border border-stone-200/80 flex items-center gap-2">
                    <img
                      src="/images/tgtg/asset_7.png"
                      alt="TGTG icon"
                      className="size-5 object-contain"
                    />
                    <span className="text-[11px] font-black text-[#00615f] tracking-wider uppercase">
                      Surprise Bag
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 2 Callouts (aligned left towards bag) */}
            <div className="space-y-12 sm:space-y-16 lg:text-left flex flex-col items-center lg:items-start">
              {/* Callout 2 */}
              <div className="flex flex-col items-center lg:items-start max-w-xs group">
                <div className="text-[#00615f] mb-3 group-hover:scale-110 transition-transform">
                  <BagRescueNearYouIcon className="size-12 sm:size-14 text-[#00615f]" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#00615f] text-center lg:text-left leading-snug">
                  Rescue food near you
                </h3>
              </div>

              {/* Callout 4 */}
              <div className="flex flex-col items-center lg:items-start max-w-xs group">
                <div className="text-[#00615f] mb-3 group-hover:scale-110 transition-transform">
                  <BagTrySomethingNewIcon className="size-12 sm:size-14 text-[#00615f]" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#00615f] text-center lg:text-left leading-snug">
                  Try something new from local cafes, bakeries or restaurants
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
