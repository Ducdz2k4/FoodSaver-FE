"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Zap, ArrowRight, Clock } from "lucide-react";
import { IMAGES } from "@/constants/images";

export function FlashSaleModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 1,
    minutes: 45,
    seconds: 20,
  });
  const router = useRouter();

  // Auto-open modal after 1.8 seconds on mount if not dismissed in session
  useEffect(() => {
    const dismissed = sessionStorage.getItem("flash_sale_dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Live countdown timer ticking down
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 2, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("flash_sale_dismissed", "true");
  };

  const handleAction = () => {
    setIsOpen(false);
    sessionStorage.setItem("flash_sale_dismissed", "true");
    router.push("/search?q=urgent");
  };

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <>
      {/* Floating Trigger Widget (Always available to reopen popup) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 left-5 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-[#00615f] text-white text-xs font-black shadow-2xl hover:scale-105 active:scale-95 transition-all border border-emerald-400/50 cursor-pointer animate-bounce"
        title="Mở ưu đãi Flash Sale Jev AI"
      >
        <Zap className="size-3.5 text-amber-300 fill-amber-300 animate-pulse" />
        <span className="tracking-tight">Flash Sale -70%</span>
      </button>

      {/* Popup Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={handleClose}
        >
          {/* Main Visual Container */}
          <div
            className="relative w-full max-w-[620px] sm:max-w-[700px] select-none animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute -top-3 -right-2 sm:-top-4 sm:-right-3 z-30 size-9 sm:size-10 rounded-full bg-white/90 hover:bg-white text-stone-900 flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 border border-stone-200 cursor-pointer"
              title="Đóng popup"
            >
              <X className="size-5 font-black" />
            </button>

            {/* Graphic Image Backdrop */}
            <div className="relative w-full aspect-[1536/1024]">
              <img
                src={IMAGES.flashSalePopupFrame}
                alt="Flash Sale 70% FoodSaver Jev AI"
                className="w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_50px_rgba(0,97,95,0.45)]"
              />

              {/* Exact Cutout Frame Position:
                  Left: 38.3%, Top: 42.3%, Width: 22.7%, Height: 34.0%
              */}
              <div
                style={{
                  left: "38.3%",
                  top: "42.3%",
                  width: "22.7%",
                  height: "34.0%",
                }}
                className="absolute z-20 flex flex-col items-center justify-between p-1.5 sm:p-2.5 text-center bg-white/95 rounded-xl sm:rounded-2xl border border-emerald-400/40 shadow-inner overflow-hidden"
              >
                {/* Header Tag */}
                <div className="w-full flex items-center justify-center gap-1">
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-[#00615f] bg-emerald-100/90 px-1.5 py-0.5 rounded-full">
                    JEV AI ĐỀ XUẤT
                  </span>
                </div>

                {/* Live Countdown Clock */}
                <div className="flex flex-col items-center justify-center my-auto py-0.5 sm:py-1">
                  <span className="text-[8px] sm:text-[9px] font-bold text-stone-500 uppercase tracking-tight flex items-center gap-0.5">
                    <Clock className="size-2.5 sm:size-3 text-rose-500" />
                    <span>Cứu gấp còn:</span>
                  </span>

                  {/* Digital Clock Numbers */}
                  <div className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-base font-black font-mono text-rose-600 tracking-tight pt-0.5">
                    <span className="bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                      {pad(timeLeft.hours)}
                    </span>
                    <span>:</span>
                    <span className="bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                      {pad(timeLeft.minutes)}
                    </span>
                    <span>:</span>
                    <span className="bg-rose-50 px-1 py-0.5 rounded border border-rose-200 animate-pulse">
                      {pad(timeLeft.seconds)}
                    </span>
                  </div>

                  <span className="text-[8px] sm:text-[10px] font-extrabold text-emerald-700 mt-0.5 sm:mt-1 line-clamp-1">
                    ⚡ Giảm kịch sàn 70%
                  </span>
                </div>

                {/* Action CTA Button */}
                <button
                  type="button"
                  onClick={handleAction}
                  className="w-full py-1 sm:py-1.5 px-1 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-[9px] sm:text-xs shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-0.5 cursor-pointer"
                >
                  <span>Săn deal gần bạn</span>
                  <ArrowRight className="size-2.5 sm:size-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
