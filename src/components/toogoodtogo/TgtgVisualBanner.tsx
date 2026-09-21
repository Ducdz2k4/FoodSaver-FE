"use client";

import React from "react";

export function TgtgVisualBanner() {
  return (
    <section className="relative w-full h-[360px] sm:h-[460px] lg:h-[560px] overflow-hidden">
      <div
        className="w-full h-full bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url(/images/tgtg/asset_20.jpg)" }}
        role="img"
        aria-label="Fresh bakery, bread and safe surplus food rescued with FoodSaver"
      />
    </section>
  );
}
