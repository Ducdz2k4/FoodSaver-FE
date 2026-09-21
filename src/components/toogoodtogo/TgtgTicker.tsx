"use client";

import React from "react";

const FOODSAVER_CATEGORIES = [
  "BUTTER CROISSANTS",
  "GRILLED PORK BÁNH MÌ",
  "SOURDOUGH BREAD",
  "ARTISAN PASTRIES",
  "FRESH FRUIT YOGURT",
  "PACKAGED SANDWICHES",
  "ORGANIC SALADS",
  "NEIGHBOURHOOD BAKERIES",
  "CONVENIENCE STORES",
  "HOT MEALS",
  "ZERO FOOD WASTE",
];

export function TgtgTicker() {
  return (
    <section className="relative py-7 sm:py-9 bg-[#00615f] overflow-hidden select-none border-y border-[#014d4b]">
      <div className="flex w-max animate-tgtg-ticker items-center">
        {[...FOODSAVER_CATEGORIES, ...FOODSAVER_CATEGORIES, ...FOODSAVER_CATEGORIES, ...FOODSAVER_CATEGORIES].map(
          (item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-10 sm:gap-14 px-5 sm:px-7 shrink-0"
            >
              <span className="font-black text-2xl sm:text-3xl lg:text-4xl text-[#dee3e3] hover:text-[#fff29a] transition-colors tracking-wide uppercase">
                {item}
              </span>
              <span
                className="size-2 rounded-full bg-[#79e4a7]/60 shrink-0"
                aria-hidden="true"
              />
            </div>
          )
        )}
      </div>
    </section>
  );
}
