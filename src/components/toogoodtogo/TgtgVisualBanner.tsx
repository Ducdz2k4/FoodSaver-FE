"use client";

import React from "react";
import { IMAGES } from "@/constants/images";

export function TgtgVisualBanner() {
  return (
    <section className="relative w-full h-[360px] sm:h-[460px] lg:h-[560px] overflow-hidden">
      <div
        className="w-full h-full bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url("${IMAGES.visualBannerBanquet}")` }}
        role="img"
        aria-label="Tiệc bánh mì và thực phẩm tươi ngon giải cứu FoodSaver"
      />
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
    </section>
  );
}
