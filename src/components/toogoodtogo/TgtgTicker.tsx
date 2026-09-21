"use client";

import React from "react";
import {
  Pizza,
  Croissant,
  ShoppingBag,
  Sandwich,
  Fish,
  UtensilsCrossed,
  CakeSlice,
  Soup,
  Coffee,
} from "lucide-react";

const CATEGORIES = [
  { name: "PIZZA", icon: Pizza },
  { name: "BÁNH NGỌT & PASTRIES", icon: Croissant },
  { name: "THỰC PHẨM & GROCERIES", icon: ShoppingBag },
  { name: "SANDWICHES", icon: Sandwich },
  { name: "SUSHI & SASHIMI", icon: Fish },
  { name: "MUFFINS & CUPCAKES", icon: CakeSlice },
  { name: "BURGERS", icon: UtensilsCrossed },
  { name: "POKE BOWLS", icon: Soup },
  { name: "CÀ PHÊ & ĐỒ UỐNG", icon: Coffee },
  { name: "SALADS & HEALTHY", icon: Soup },
  { name: "DONUTS", icon: CakeSlice },
];

export function TgtgTicker() {
  return (
    <div className="relative py-6 bg-yellow-400 overflow-hidden border-y-2 border-stone-950 select-none">
      <div className="flex w-max animate-marquee space-x-6 items-center">
        {[...CATEGORIES, ...CATEGORIES, ...CATEGORIES].map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-stone-950 text-yellow-300 font-black text-sm tracking-wider uppercase whitespace-nowrap shadow-sm hover:scale-105 transition-transform"
            >
              <Icon className="size-4 text-yellow-400 shrink-0" />
              <span>{item.name}</span>
              <span className="size-1.5 rounded-full bg-yellow-400 ml-1 inline-block" />
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
