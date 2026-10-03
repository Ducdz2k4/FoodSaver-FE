"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, Zap, Flame } from "lucide-react";
import { IMAGES } from "@/constants/images";
import { useGetListingsQuery } from "@/redux/api/listingApi";

export function FlashSaleModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Query real listings from backend API
  const { data: realListings } = useGetListingsQuery();
  const allListings = realListings || [];

  // 1. Calculate dynamic highest discount percentage among all active listings
  const dynamicDiscount = useMemo(() => {
    if (allListings.length === 0) return 0;
    const maxPercent = allListings.reduce((max, item) => {
      if (!item.originalPrice || !item.discountPrice) return max;
      const discount = Math.round(
        ((item.originalPrice - item.discountPrice) / item.originalPrice) * 100
      );
      return Math.max(max, discount);
    }, 0);
    return maxPercent;
  }, [allListings]);

  // 2. Find the most urgent listing (earliest expiryAt) to drive real-time dynamic countdown
  const urgentListing = useMemo(() => {
    if (allListings.length === 0) return null;
    const now = Date.now();
    const active = [...allListings].filter(
      (item) => new Date(item.expiryAt).getTime() > now
    );
    if (active.length === 0) return null;
    return active.sort(
      (a, b) => new Date(a.expiryAt).getTime() - new Date(b.expiryAt).getTime()
    )[0];
  }, [allListings]);

  // 3. Dynamic countdown timer driven by real expiry timestamp
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!urgentListing?.expiryAt) return;

    const calculate = () => {
      const diffMs = new Date(urgentListing.expiryAt).getTime() - Date.now();
      if (diffMs <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [urgentListing?.expiryAt]);

  // Auto-open modal after 1.8 seconds on mount if not dismissed in session
  useEffect(() => {
    const dismissed = sessionStorage.getItem("flash_sale_dismissed");
    if (!dismissed && urgentListing) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [urgentListing]);

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
    sessionStorage.setItem("flash_sale_dismissed", "true");
  };

  const handleAction = () => {
    setIsOpen(false);
    sessionStorage.setItem("flash_sale_dismissed", "true");
    if (urgentListing?.id) {
      router.push(`/listing/${urgentListing.id}`);
    }
  };

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <>
      {/* Floating Trigger Widget - Sleek, Clean, No Clashing Colors, Positioned away from N badge */}
      {allListings.length > 0 && (
        <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-16 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#00615f] hover:bg-[#089184] text-white text-xs font-extrabold border-2 border-[#79e4a7] shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
        title={`Bấm để mở ưu đãi Flash Sale - Giảm đến ${dynamicDiscount}%`}
      >
        <Zap className="size-3.5 text-amber-300 fill-amber-300 shrink-0" />
        <span className="tracking-tight">Flash Sale -{dynamicDiscount}%</span>
        <span className="bg-[#79e4a7] text-[#00615f] px-1.5 py-0.2 rounded-md text-[9px] font-black tracking-wider">
          HOT
        </span>
        </button>
      )}

      {/* Popup Modal Backdrop (Barely dark, almost 0 blur) */}
      {isOpen && urgentListing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/10 backdrop-blur-[1px] animate-in fade-in duration-150"
          onClick={() => handleClose()}
        >
          {/* Main Visual Container */}
          <div
            className="relative w-full max-w-[680px] sm:max-w-[780px] select-none animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={(e) => handleClose(e)}
              className="absolute -top-3 -right-2 sm:-top-4 sm:-right-3 z-30 size-9 sm:size-10 rounded-full bg-white/95 hover:bg-white text-stone-900 flex items-center justify-center shadow-2xl border border-stone-200 cursor-pointer transition-transform hover:scale-110 active:scale-95"
              title="Đóng popup"
            >
              <X className="size-5 font-black" />
            </button>

            {/* Clickable Graphic Artwork - NO ZOOM on hover */}
            <div
              onClick={handleAction}
              className="relative w-full aspect-[1672/941] cursor-pointer"
              title="Bấm để xem các món ưu đãi giảm kịch sàn gần bạn"
            >
              {/* The new transparent PNG artwork */}
              <img
                src="/images/flash-sale-popup.png"
                alt={`Flash Sale ${dynamicDiscount}% FoodSaver`}
                className="w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_50px_rgba(0,97,95,0.4)]"
              />

              {/* =========================================================
                  ZONE 1: RIGHT TICKET CUTOUT (Dynamic Discount %)
                  Tilted at -6deg to match ticket slant, positioned right before %
                  Left: 71.0%, Top: 29.0%, Width: 13.0%, Height: 19.0%
              ========================================================= */}
              <div
                style={{
                  left: "73.2%",
                  top: "32.2%",
                  width: "13.5%",
                  height: "19.0%",
                  transform: "rotate(-15deg)",
                  transformOrigin: "center center",
                }}
                className="absolute z-20 flex items-center justify-center pointer-events-none"
              >
                <span className="font-black text-2xl sm:text-4xl md:text-5xl tracking-tighter text-rose-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] select-none">
                  -{dynamicDiscount}
                </span>
              </div>

              {/* =========================================================
                  ZONE 2: CENTER HORIZONTAL NEON FRAME (Timer & Action)
                  Tilted at -1.5deg to match neon frame slant
                  Left: 35.2%, Top: 51.0%, Width: 34.2%, Height: 28.5%
              ========================================================= */}
              <div
                style={{
                  left: "37.8%",
                  top: "54%",
                  width: "30%",
                  height: "21%",
                  transform: "rotate(-1.5deg)",
                  transformOrigin: "center center",
                }}
                className="absolute z-20 flex flex-col items-center justify-between px-2 sm:px-3 py-0.5 sm:py-1 text-center bg-black/40 backdrop-blur-[1px] rounded-xl sm:rounded-2xl border border-emerald-400/40 shadow-inner overflow-hidden"
              >
                {/* Header: Cứu Gấp Còn */}
                <div className="flex items-center justify-center gap-1">
                  <Flame className="size-3 sm:size-4 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
                  <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider text-amber-300 drop-shadow-sm">
                    CỨU GẤP CÒN:
                  </span>
                </div>

                {/* Unified Large Digital Countdown Display - Spacious & Clean */}
                <div className="w-full flex flex-col items-center justify-center my-auto px-1">
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full bg-white/10 border border-white/20 rounded-lg sm:rounded-xl py-0.5 px-2 shadow-inner backdrop-blur-xs">
                    <span className="font-mono font-black text-xs sm:text-base md:text-xl text-white tracking-tight drop-shadow">
                      {pad(timeLeft.hours)}
                    </span>
                    <span className="font-mono font-black text-[11px] sm:text-sm text-amber-300 animate-pulse">
                      :
                    </span>
                    <span className="font-mono font-black text-xs sm:text-base md:text-xl text-white tracking-tight drop-shadow">
                      {pad(timeLeft.minutes)}
                    </span>
                    <span className="font-mono font-black text-[11px] sm:text-sm text-amber-300 animate-pulse">
                      :
                    </span>
                    <span className="font-mono font-black text-xs sm:text-base md:text-xl text-emerald-300 tracking-tight animate-pulse drop-shadow">
                      {pad(timeLeft.seconds)}
                    </span>
                  </div>

                  <div className="flex justify-between w-full px-2.5 text-[7px] sm:text-[8px] font-bold text-emerald-200/70 uppercase tracking-tight mt-0.5">
                    <span>Giờ</span>
                    <span>Phút</span>
                    <span>Giây</span>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
