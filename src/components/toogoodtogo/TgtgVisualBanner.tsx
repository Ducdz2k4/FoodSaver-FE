"use client";

import React from "react";
import { Sparkles, Heart } from "lucide-react";

export function TgtgVisualBanner() {
  return (
    <section className="relative h-[380px] sm:h-[480px] lg:h-[560px] overflow-hidden flex items-center justify-center">
      {/* Background Image with Parallax look */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: "url(/images/tgtg/asset_20.jpg)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/80" />
      </div>

      {/* Floating Center Card */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center text-white space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg">
          <Sparkles className="size-3.5" />
          <span>Món ăn ngon xứng đáng được trân trọng</span>
        </div>

        <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
          Hơn 350 triệu bữa ăn đã được cứu sống khỏi thùng rác.
        </h3>

        <p className="text-sm sm:text-base text-stone-200 max-w-xl mx-auto leading-relaxed">
          Mỗi chiếc bánh mì, mỗi suất sushi hay đĩa pasta được bạn mang về nhà hôm nay là một bước tiến nhỏ vì tương lai bền vững của Trái Đất.
        </p>
      </div>
    </section>
  );
}
