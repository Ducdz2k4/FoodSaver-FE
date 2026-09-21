"use client";

import React from "react";
import Link from "next/link";

export function TgtgMission() {
  return (
    <section className="py-20 sm:py-28 lg:py-32 bg-[#f9f3f0] text-[#252d2d] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
        {/* Mission Statement Headline */}
        <h2 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-black text-[#00615f] leading-snug sm:leading-tight tracking-tight">
          Too Good To Go is a social impact company on a mission to inspire and empower everyone to{" "}
          <Link
            href="#why-us"
            className="underline decoration-[#79e4a7] decoration-2 underline-offset-4 hover:text-[#089184] transition-colors"
          >
            fight food waste
          </Link>{" "}
          together.
        </h2>

        {/* Supporting Explanation */}
        <p className="text-base sm:text-lg lg:text-xl text-[#252d2d]/80 leading-relaxed max-w-2xl mx-auto font-normal">
          Our app is the world&apos;s largest marketplace for surplus food. We help users rescue good food from going to waste, offering great value for money at local stores, cafes and restaurants.
        </p>

        {/* App Store & Google Play Badges */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform duration-200"
          >
            <img
              src="/images/tgtg/asset_9.png"
              alt="Download on the Apple App Store"
              className="h-10 sm:h-11 w-auto object-contain"
              loading="lazy"
            />
          </a>
          <a
            href="https://play.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform duration-200"
          >
            <img
              src="/images/tgtg/asset_10.png"
              alt="Get it on Google Play"
              className="h-10 sm:h-11 w-auto object-contain"
              loading="lazy"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
