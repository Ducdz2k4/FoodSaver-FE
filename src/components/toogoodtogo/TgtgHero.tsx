"use client";

import React from "react";
import Link from "next/link";
import { Star, ArrowRight, Store, Download, ShieldCheck, Sparkles } from "lucide-react";

export function TgtgHero() {
  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#18181B] text-white pt-24 pb-16">
      {/* Background Video with Dark & Yellow Glow Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/tgtg/asset_1.jpg"
          className="w-full h-full object-cover opacity-35 scale-105 transition-opacity duration-1000"
        >
          <source
            src="https://static-mkt.toogoodtogo.com/video/web_hero_en_us_1080.mp4"
            type="video/mp4"
          />
        </video>
        {/* Radial yellow ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-yellow-400/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-[#18181B]/60 to-[#18181B]/80" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 font-bold text-xs sm:text-sm mb-6 backdrop-blur-md animate-pulse">
          <Sparkles className="size-4 text-yellow-400" />
          <span>Ứng dụng giải cứu thực phẩm #1</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] max-w-4xl text-white">
          Save good food from{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 underline decoration-yellow-400/40 decoration-4 underline-offset-8">
            going to waste
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-stone-300 max-w-2xl leading-relaxed font-normal">
          Thưởng thức đồ ăn tươi ngon từ các nhà hàng, quán cafe và siêu thị hàng đầu với giá chỉ{" "}
          <strong className="text-yellow-400 font-bold">1/2 hoặc thấp hơn</strong>. Giúp ví tiền tiết kiệm và Trái Đất xanh hơn mỗi ngày.
        </p>

        {/* Rating and Social Proof */}
        <div className="mt-5 flex items-center gap-2 text-xs sm:text-sm text-stone-300">
          <div className="flex items-center text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="font-extrabold text-white">4.9 / 5</span>
          <span className="text-stone-400">• Trên 1,000,000+ lượt đánh giá hài lòng</span>
        </div>

        {/* Dual Primary Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="#download"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-black text-base shadow-xl shadow-yellow-400/20 hover:scale-105 active:scale-98 transition-all duration-200"
          >
            <Download className="size-5" />
            <span>Tải ứng dụng ngay</span>
          </Link>

          <Link
            href="#business"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-stone-900/90 hover:bg-stone-800 text-white font-bold text-base border border-stone-700 hover:border-yellow-400/50 transition-all duration-200"
          >
            <Store className="size-5 text-yellow-400" />
            <span>Giải pháp doanh nghiệp</span>
          </Link>
        </div>

        {/* App Store / Google Play Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noreferrer"
            className="hover:scale-105 transition-transform duration-200"
          >
            <img
              src="/images/tgtg/asset_9.png"
              alt="Download on the App Store"
              className="h-11 sm:h-12 w-auto object-contain rounded-xl shadow-sm border border-stone-800"
            />
          </a>
          <a
            href="https://play.google.com"
            target="_blank"
            rel="noreferrer"
            className="hover:scale-105 transition-transform duration-200"
          >
            <img
              src="/images/tgtg/asset_10.png"
              alt="Get it on Google Play"
              className="h-11 sm:h-12 w-auto object-contain rounded-xl shadow-sm border border-stone-800"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
