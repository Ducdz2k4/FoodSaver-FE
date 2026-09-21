"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = [
  {
    step: "Step one",
    description: "Discover Surprise Bags available at stores and restaurants near you.",
  },
  {
    step: "Step two",
    description: "Confirm your choice, reserve your food, and pay through the app.",
  },
  {
    step: "Step three",
    description: "Head to the shop at the specified pickup time, swipe the app, and enjoy your food.",
  },
  {
    step: "Step four",
    description: "You've rescued good food from going to waste and done something good for the planet!",
  },
];

export function TgtgHowItWorks() {
  const [currentStep, setCurrentStep] = useState(0);

  const prevStep = () => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const nextStep = () => {
    setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
  };

  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28 lg:py-32 bg-[#00615f] text-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Interactive Step Carousel */}
          <div className="space-y-6 sm:space-y-8 flex flex-col justify-center">
            {/* Pre-title */}
            <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#79e4a7]">
              How to use the app
            </p>

            {/* Step Heading */}
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#f9f3f0] capitalize select-none transition-all duration-300">
              {STEPS[currentStep].step}
            </h2>

            {/* Step Description */}
            <p className="text-lg sm:text-2xl text-[#dee3e3] leading-relaxed max-w-lg min-h-[4.5rem]">
              {STEPS[currentStep].description}
            </p>

            {/* Carousel Navigation: Prev button + Dots + Next button */}
            <div className="pt-4 flex items-center gap-6">
              {/* Previous button */}
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                aria-label="Previous step"
                className={`p-2.5 rounded-full border border-white/30 text-white transition-all ${
                  currentStep === 0
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-white/20 active:scale-95"
                }`}
              >
                <ChevronLeft className="size-6" />
              </button>

              {/* Step indicator dots */}
              <div className="flex items-center gap-2.5">
                {STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentStep(idx)}
                    aria-label={`Go to ${STEPS[idx].step}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      currentStep === idx
                        ? "w-8 bg-[#79e4a7]"
                        : "w-2.5 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>

              {/* Next button */}
              <button
                type="button"
                onClick={nextStep}
                disabled={currentStep === STEPS.length - 1}
                aria-label="Next step"
                className={`p-2.5 rounded-full border border-white/30 text-white transition-all ${
                  currentStep === STEPS.length - 1
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-white/20 active:scale-95"
                }`}
              >
                <ChevronRight className="size-6" />
              </button>
            </div>
          </div>

          {/* Right Column: Layered Images */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px] aspect-square">
              {/* Main Phone image */}
              <div className="relative w-[85%] sm:w-[88%] aspect-square ml-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
                <img
                  src="/images/tgtg/asset_11.jpg"
                  alt="A person holding a phone showing Surprise Bags on the map"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Overlapping sub-image at bottom-left */}
              <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-6 w-44 sm:w-56 aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-[#00615f] bg-[#013d3c]">
                <img
                  src="/images/tgtg/asset_16.png"
                  alt="A baker in an apron with freshly baked bread"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
