"use client";

import React from "react";

const TICKER_ITEMS = [
  "PIZZA",
  "PASTRIES",
  "GROCERIES",
  "SANDWICHES",
  "SUSHI",
  "MUFFINS",
  "BURGERS",
  "SANDWICH",
  "POKE",
  "BURRITO",
  "SALADS",
  "DONUTS",
];

export function TgtgTicker() {
  return (
    <section className="relative py-7 sm:py-9 bg-[#00615f] overflow-hidden select-none border-y border-[#014d4b]">
      <div className="flex w-max animate-tgtg-ticker items-center">
        {/* Render multiple sets to ensure seamless infinite looping */}
        {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map(
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
