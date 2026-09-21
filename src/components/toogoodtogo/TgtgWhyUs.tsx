"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, MapPin, ArrowRight, Sparkles } from "lucide-react";

interface ListingItem {
  id: string;
  name: string;
  store: string;
  price: string;
  originalPrice: string;
  distance: string;
  initialSeconds: number;
  status: "Available" | "Expiring soon" | "Last minutes";
  image: string;
  alt: string;
}

const SAMPLE_LISTINGS: ListingItem[] = [
  {
    id: "1",
    name: "Butter croissant",
    store: "from a neighbourhood bakery",
    price: "25.000₫",
    originalPrice: "45.000₫",
    distance: "0.4 km",
    initialSeconds: 2 * 3600 + 14 * 60 + 36, // 02:14:36
    status: "Available",
    image: "/images/tgtg/asset_21.jpg",
    alt: "Fresh golden butter croissants from local bakery",
  },
  {
    id: "2",
    name: "Grilled pork bánh mì",
    store: "from a corner shop",
    price: "15.000₫",
    originalPrice: "30.000₫",
    distance: "0.8 km",
    initialSeconds: 1 * 3600 + 5 * 60 + 12, // 01:05:12
    status: "Expiring soon",
    image: "/images/tgtg/asset_16.png",
    alt: "Crisp Vietnamese grilled pork bánh mì with herbs",
  },
  {
    id: "3",
    name: "Fresh fruit yogurt cup",
    store: "from a convenience store",
    price: "12.000₫",
    originalPrice: "22.000₫",
    distance: "1.2 km",
    initialSeconds: 18 * 60 + 40, // 00:18:40
    status: "Last minutes",
    image: "/images/tgtg/asset_37.png",
    alt: "Fresh fruit yogurt cup packaged for quick pickup",
  },
  {
    id: "4",
    name: "Sourdough loaf",
    store: "from a small bakery",
    price: "35.000₫",
    originalPrice: "70.000₫",
    distance: "2.1 km",
    initialSeconds: 5 * 3600 + 30 * 60, // 05:30:00
    status: "Available",
    image: "/images/tgtg/asset_11.jpg",
    alt: "Artisan sourdough bread loaf baked daily",
  },
];

function formatTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return "00:00:00 left";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} left`;
}

function getStatusBadge(status: ListingItem["status"]) {
  switch (status) {
    case "Available":
      return {
        bg: "bg-[#00615f] text-white",
        dot: "bg-[#79e4a7]",
        label: "Available",
      };
    case "Expiring soon":
      return {
        bg: "bg-amber-600 text-white",
        dot: "bg-amber-300",
        label: "Expiring soon",
      };
    case "Last minutes":
      return {
        bg: "bg-[#ff7973] text-stone-950 font-black",
        dot: "bg-stone-950 animate-ping",
        label: "Last minutes",
      };
  }
}

export function TgtgWhyUs() {
  const [timers, setTimers] = useState<number[]>(
    SAMPLE_LISTINGS.map((l) => l.initialSeconds)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((sec) => (sec > 0 ? sec - 1 : 0))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="listings" className="py-20 sm:py-28 lg:py-32 bg-[#f9f3f0] text-[#252d2d] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 sm:mb-16">
          <div className="space-y-3">
            <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#00615f]/70">
              Live marketplace countdown
            </p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#00615f]">
              Ending soon near you
            </h2>
          </div>

          {/* Customers Block CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white px-5 py-3.5 rounded-2xl border border-stone-200 shadow-sm">
            <p className="text-sm font-bold text-[#252d2d]">
              Real food, fair prices, close to you.
            </p>
            <Link
              href="#listings"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold transition shrink-0"
            >
              <span>Find food nearby</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Featured Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {SAMPLE_LISTINGS.map((item, idx) => {
            const badge = getStatusBadge(item.status);
            const remaining = timers[idx] ?? item.initialSeconds;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-[#00615f]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Image & Status Tag */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-sm">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.bg}`}
                    >
                      <span className={`size-1.5 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  {/* Distance badge */}
                  <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-sm text-white text-[11px] font-semibold">
                    <MapPin className="size-3 text-[#79e4a7]" />
                    <span>{item.distance}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-[#00615f] group-hover:text-[#089184] transition-colors leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#252d2d]/70 mt-1 capitalize">
                      {item.store}
                    </p>
                  </div>

                  {/* Live Countdown & Pricing */}
                  <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
                    {/* Countdown */}
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#00615f]">
                      <Clock className="size-3.5 text-[#00615f] shrink-0" />
                      <span>{formatTime(remaining)}</span>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-[#00615f]">
                          {item.price}
                        </span>
                        <span className="text-xs text-stone-400 line-through">
                          {item.originalPrice}
                        </span>
                      </div>

                      <Link
                        href="#listings"
                        className="text-xs font-bold text-[#00615f] hover:underline"
                      >
                        Claim
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
