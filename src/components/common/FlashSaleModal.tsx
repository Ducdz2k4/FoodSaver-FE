"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, Zap, Flame } from "lucide-react";
import { IMAGES } from "@/constants/images";

export function FlashSaleModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 1,
    minutes: 59,
    seconds: 11,
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

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
      {/* Floating Trigger Widget */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 left-5 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-[#00615f] text-white text-xs font-black shadow-2xl border border-emerald-400/50 cursor-pointer transition-colors"
        title="Mở ưu đãi Flash Sale"
      >
        <Zap className="size-3.5 text-amber-300 fill-amber-300 animate-pulse" />
        <span className="tracking-tight">Flash Sale -70%</span>
      </button>

      {/* Popup Modal Backdrop (Barely dark, almost 0 blur) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/10 backdrop-blur-[1px] animate-in fade-in duration-150"
          onClick={() => handleClose()}
        >
          {/* Main Visual Container */}
          <div
            className="relative w-full max-w-[620px] sm:max-w-[700px] select-none animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={(e) => handleClose(e)}
              className="absolute -top-3 -right-2 sm:-top-4 sm:-right-3 z-30 size-9 sm:size-10 rounded-full bg-white/95 hover:bg-white text-stone-900 flex items-center justify-center shadow-2xl border border-stone-200 cursor-pointer"
              title="Đóng popup"
            >
              <X className="size-5 font-black" />
            </button>

            {/* Clickable Graphic Artwork - NO ZOOM on hover */}
            <div
              onClick={handleAction}
              className="relative w-full aspect-[1536/1024] cursor-pointer"
              title="Bấm để xem các món ưu đãi giảm kịch sàn gần bạn"
            >
              <img
                src={IMAGES.flashSalePopupFrame}
                alt="Flash Sale 70% FoodSaver"
                className="w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_50px_rgba(0,97,95,0.4)]"
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
                className="absolute z-20 flex flex-col items-center justify-between px-1.5 sm:px-2 py-2 sm:py-2.5 text-center bg-white/98 rounded-xl sm:rounded-2xl border border-emerald-400/40 shadow-inner overflow-hidden"
              >
                {/* Header: Cứu Gấp Còn */}
                <div className="flex items-center justify-center gap-1 pt-0.5">
                  <Flame className="size-3 sm:size-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                  <span className="text-[9px] sm:text-xs font-black uppercase tracking-tight text-rose-600">
                    CỨU GẤP CÒN:
                  </span>
                </div>

                {/* Unified Large Digital Countdown Display - Never Overflows */}
                <div className="w-full flex flex-col items-center justify-center my-auto px-0.5">
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1 w-full bg-rose-50/90 border border-rose-200/90 rounded-lg sm:rounded-xl py-1 sm:py-1.5 px-1 shadow-inner">
                    <span className="font-mono font-black text-sm sm:text-lg lg:text-xl text-rose-600 tracking-tight">
                      {pad(timeLeft.hours)}
                    </span>
                    <span className="font-mono font-black text-xs sm:text-base text-rose-400 animate-pulse">
                      :
                    </span>
                    <span className="font-mono font-black text-sm sm:text-lg lg:text-xl text-rose-600 tracking-tight">
                      {pad(timeLeft.minutes)}
                    </span>
                    <span className="font-mono font-black text-xs sm:text-base text-rose-400 animate-pulse">
                      :
                    </span>
                    <span className="font-mono font-black text-sm sm:text-lg lg:text-xl text-rose-600 tracking-tight animate-pulse">
                      {pad(timeLeft.seconds)}
                    </span>
                  </div>

                  <div className="flex justify-between w-full px-2 text-[7px] sm:text-[9px] font-bold text-stone-400 uppercase tracking-tight mt-0.5">
                    <span>Giờ</span>
                    <span>Phút</span>
                    <span>Giây</span>
                  </div>
                </div>

                {/* Deal Tag & Link (No Truncation) */}
                <div className="w-full space-y-0.5 pb-0.5">
                  <div className="inline-flex items-center justify-center gap-0.5 text-[8px] sm:text-[10px] font-black text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-full w-full">
                    <Zap className="size-2.5 sm:size-3 text-amber-500 fill-amber-500 shrink-0" />
                    <span>Giảm kịch sàn 70%</span>
                  </div>

                  <span className="text-[8px] sm:text-[10px] font-extrabold text-[#00615f] underline flex items-center justify-center gap-0.5 pt-0.5">
                    <span>Xem món quanh bạn</span>
                    <ArrowRight className="size-2.5 sm:size-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
