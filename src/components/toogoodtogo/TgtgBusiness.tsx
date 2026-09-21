"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BUSINESS_SOLUTIONS = [
  {
    title: "SURPRISE BAGS",
    description:
      "Unlock revenue from surplus food: Sell your unsold food in 'Surprise Bags' through the Too Good To Go app, for users to come collect in-store at a pre-determined time.",
    forWho: "Food Retail, Food Service, Catering",
    href: "/register",
    mainImage: "/images/tgtg/asset_21.jpg",
    subImage: "/images/tgtg/asset_25.jpg",
    altMain: "A woman putting a croissant on a table while another woman looks on",
    altSub: "A person holding a cell phone in their hand",
  },
  {
    title: "TOO GOOD TO GO PLATFORM",
    description:
      "Your end-to-end surplus food management solution: Modular software that helps retailers seamlessly track, manage and redistribute surplus food.",
    forWho: "Grocery Retail",
    href: "/register",
    mainImage: "/images/tgtg/asset_29.png",
    subImage: "/images/tgtg/asset_33.jpg",
    altMain: "A man looking at his phone while holding a Too Good To Go bag",
    altSub: "A person holding a cell phone in a grocery store",
  },
  {
    title: "DATE LABELING INITIATIVE",
    description:
      "Reduce waste in households: Join a coalition of the world's leading brands with our bespoke 'Look-Smell-Taste' label printed on billions of Best Before products.",
    forWho: "FMCGs, Wholesale, Retail",
    href: "/register",
    mainImage: "/images/tgtg/asset_37.png",
    subImage: "/images/tgtg/asset_41.png",
    altMain: "A product container sitting on a table",
    altSub: "A person testing food quality with senses",
  },
];

export function TgtgBusiness() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="business" className="py-20 sm:py-28 lg:py-32 bg-[#f9f3f0] text-[#252d2d] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#00615f] tracking-tight mb-4 select-none">
            Our Business solutions
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[#252d2d]/80 leading-relaxed font-normal">
            We offer a range of solutions to empower the world&apos;s leading food distributors to avoid good food from going to waste.
          </p>
        </div>

        {/* Interactive Grid: Left Images + Right Tiles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Dynamic Paired Images */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="relative w-full max-w-[480px] aspect-square">
              {/* Main Image */}
              <div className="relative w-[85%] aspect-square ml-auto rounded-3xl overflow-hidden shadow-xl border-2 border-stone-200/80 bg-stone-100 transition-all duration-500">
                <img
                  src={BUSINESS_SOLUTIONS[activeIndex].mainImage}
                  alt={BUSINESS_SOLUTIONS[activeIndex].altMain}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  loading="lazy"
                />
              </div>

              {/* Overlapping Sub-Image */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-44 sm:w-52 aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white transition-all duration-500">
                <img
                  src={BUSINESS_SOLUTIONS[activeIndex].subImage}
                  alt={BUSINESS_SOLUTIONS[activeIndex].altSub}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Right: 3 Solution Tiles */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5">
            {BUSINESS_SOLUTIONS.map((item, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 cursor-pointer text-left ${
                    isActive
                      ? "bg-white border-[#00615f] shadow-lg scale-[1.01]"
                      : "bg-white/60 border-stone-300/80 hover:bg-white hover:border-[#00615f]/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2.5">
                    <h3
                      className={`text-lg sm:text-xl font-black uppercase tracking-tight transition-colors ${
                        isActive ? "text-[#00615f]" : "text-[#00615f]/80"
                      }`}
                    >
                      {item.title}
                    </h3>
                    <div
                      className={`size-7 rounded-full flex items-center justify-center transition-all ${
                        isActive ? "bg-[#00615f] text-white" : "bg-stone-200/60 text-stone-600"
                      }`}
                    >
                      <ArrowRight className="size-3.5" />
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-[#252d2d]/80 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00615f]">
                    <span className="text-stone-500 font-semibold">For:</span>
                    <span className="underline decoration-[#79e4a7] underline-offset-2">
                      {item.forWho}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
