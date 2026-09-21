"use client";

import React from "react";
import Link from "next/link";
import { Download, Store, Sparkles, ShieldCheck } from "lucide-react";

export function TgtgCtaBanner() {
  return (
    <section id="download" className="py-20 sm:py-28 bg-[#FFFDF5] text-stone-900 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2.5rem] bg-[#18181B] text-white p-8 sm:p-16 lg:p-20 overflow-hidden shadow-2xl border-2 border-yellow-400/40">
          {/* Yellow ambient glow balls */}
          <div className="absolute -top-24 -right-24 size-80 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 size-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-black text-xs uppercase tracking-wider">
              <Sparkles className="size-3.5 text-yellow-400" />
              <span>Chung tay hành động ngay</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              CÙNG HƠN{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">
                180,000 ĐỐI TÁC
              </span>{" "}
              CHỐNG LÃNG PHÍ THỰC PHẨM
            </h2>

            <p className="text-sm sm:text-lg text-stone-300 max-w-xl mx-auto leading-relaxed">
              Tải ứng dụng miễn phí trên iOS và Android để bắt đầu cứu lấy những món ăn ngon lành ngay quanh bạn hôm nay.
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#download"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-black text-sm sm:text-base shadow-xl hover:scale-105 active:scale-98 transition-all duration-200"
              >
                <Download className="size-5" />
                <span>Tải ứng dụng miễn phí</span>
              </Link>

              <Link
                href="#business"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm sm:text-base border border-stone-700 hover:border-yellow-400/50 transition-all duration-200"
              >
                <Store className="size-5 text-yellow-400" />
                <span>Đăng ký đối tác cửa hàng</span>
              </Link>
            </div>

            {/* App Store / Google Play badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noreferrer"
                className="hover:scale-105 transition-transform"
              >
                <img
                  src="/images/tgtg/asset_9.png"
                  alt="Download on the App Store"
                  className="h-11 w-auto rounded-xl border border-stone-800"
                />
              </a>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noreferrer"
                className="hover:scale-105 transition-transform"
              >
                <img
                  src="/images/tgtg/asset_10.png"
                  alt="Get it on Google Play"
                  className="h-11 w-auto rounded-xl border border-stone-800"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
