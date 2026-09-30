"use client";

import React from "react";
import Link from "next/link";
import { IMAGES } from "@/constants/images";
import { ArrowRight, Sparkles } from "lucide-react";

export function TgtgHero() {
  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#18181B] text-white pt-24 pb-16">
      {/* Background with Vietnamese Hero Image & Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={IMAGES.heroSaigonGirl}
          className="w-full h-full object-cover scale-105"
        >
          <source
            src="https://static-mkt.toogoodtogo.com/video/web_hero_en_us_1080.mp4"
            type="video/mp4"
          />
        </video>
        {/* Fallback image when video loading / paused */}
        <div
          className="absolute inset-0 bg-cover bg-center -z-10"
          style={{ backgroundImage: `url(${IMAGES.heroSaigonGirl})` }}
        />
        {/* Subtle dark vignette overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Hero Overline */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white/95 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-md">
          <span className="size-2 rounded-full bg-[#79e4a7] animate-pulse" aria-hidden="true" />
          <span>Đang hoạt động gần bạn • Hơn 120+ suất ăn cứu trợ hôm nay</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] font-black tracking-tight text-white leading-[1.08] max-w-4xl mx-auto drop-shadow-sm select-none">
          Món ngon giải cứu, trong những giờ vàng.
        </h1>

        {/* Hero Subtext */}
        <p className="mt-6 text-base sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-normal">
          FoodSaver kết nối tiệm bánh, nhà hàng và cửa hàng tiện lợi với người tiêu dùng gần nhất để thưởng thức đồ ăn tươi ngon chuẩn ATTP với giá giảm 50–80% trước giờ đóng cửa.
        </p>

        {/* Dual Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/search"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-white hover:bg-stone-100 text-[#00615f] font-black text-sm sm:text-base shadow-xl hover:scale-102 active:scale-98 transition-all duration-200"
          >
            <span>Khám phá món gần bạn</span>
            <ArrowRight className="size-4 ml-2" />
          </Link>

          <Link
            href="/partner/apply"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-transparent hover:bg-white/15 text-white font-bold text-sm sm:text-base border-2 border-white hover:scale-102 active:scale-98 transition-all duration-200"
          >
            Trở thành đối tác bán hàng
          </Link>
        </div>
      </div>
    </section>
  );
}
