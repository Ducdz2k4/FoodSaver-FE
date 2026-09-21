"use client";

import React from "react";
import { Clock, ShieldCheck, AlertCircle, Utensils, Leaf, Store } from "lucide-react";

const COMMITMENTS = [
  {
    icon: Clock,
    title: "Exact expiry time on every listing",
    description:
      "A live countdown timer shows the exact hours and minutes remaining, updating its status automatically as expiry approaches.",
  },
  {
    icon: ShieldCheck,
    title: "Expired listings cannot be ordered",
    description:
      "Our strict platform cutoff prevents any transaction once a listing reaches its cutoff time. Safe food only.",
  },
  {
    icon: AlertCircle,
    title: "Storage & safety notes from the seller",
    description:
      "Every item includes clear food-handling, storage instructions and seller verification notes before you commit to purchase.",
  },
];

const IMPACT_FIGURES = [
  {
    icon: Utensils,
    value: "12,480",
    label: "Meals rescued",
    desc: "Quality food enjoyed, not wasted",
  },
  {
    icon: Leaf,
    value: "3.2 t",
    label: "Food waste avoided",
    desc: "Direct reduction in landfill carbon emissions",
  },
  {
    icon: Store,
    value: "86",
    label: "Partner stores",
    desc: "Bakeries, corner shops & local businesses",
  },
];

export function TgtgMission() {
  return (
    <section id="impact" className="py-20 sm:py-28 lg:py-32 bg-[#f9f3f0] text-[#252d2d] relative border-b border-stone-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Statement Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#00615f]/70">
            Food Safety &amp; Trust
          </p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#00615f] tracking-tight leading-tight">
            Every listing shows its expiry before you ever pay.
          </h2>
          <p className="text-base sm:text-lg text-[#252d2d]/80 leading-relaxed max-w-2xl mx-auto font-normal">
            FoodSaver is a marketplace connecting convenience stores, bakeries, small food businesses and neighbours with safe food close to its expiry time at a fair, reduced price.
          </p>
        </div>

        {/* 3 Core Commitments Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {COMMITMENTS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-7 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                <div>
                  <div className="size-12 rounded-2xl bg-[#00615f]/10 text-[#00615f] flex items-center justify-center mb-5 group-hover:bg-[#00615f] group-hover:text-white transition-colors duration-200">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#00615f] mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#252d2d]/75 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer Banner */}
        <div className="mb-20 p-4 sm:p-5 rounded-2xl bg-[#f3ebe8] border border-stone-300/70 text-center max-w-3xl mx-auto flex items-center justify-center gap-3 text-xs sm:text-sm text-[#252d2d]/80">
          <AlertCircle className="size-4 sm:size-5 text-[#00615f] shrink-0" />
          <span>
            <strong>Safety disclaimer:</strong> FoodSaver does not replace food-safety inspection. Always check the product at pickup.
          </span>
        </div>

        {/* Impact Figures Section */}
        <div className="pt-8 border-t border-stone-200/70">
          <div className="text-center mb-10">
            <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#00615f]/70">
              Community Impact
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-[#00615f] mt-1">
              Real results across our local network
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {IMPACT_FIGURES.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-sm flex flex-col items-center text-center"
                >
                  <div className="size-12 rounded-2xl bg-[#79e4a7]/20 text-[#00615f] flex items-center justify-center mb-4">
                    <Icon className="size-6" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#00615f] tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-[#252d2d] mt-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    {stat.desc}
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
