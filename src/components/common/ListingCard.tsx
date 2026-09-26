"use client";

import React from "react";
import Link from "next/link";
import { MapPin, ShoppingBag } from "lucide-react";
import { ListingDTO } from "@/types/contract";
import { ExpiryCountdown } from "./ExpiryCountdown";
import { FoodSafetyBadge } from "./FoodSafetyBadge";

export const ListingCard: React.FC<{ listing: ListingDTO }> = ({ listing }) => {
  const discountPercent = Math.round(
    ((listing.originalPrice - listing.discountPrice) / listing.originalPrice) * 100
  );

  return (
    <div className="group relative flex flex-col bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300">
      {/* Khối Ảnh & Badges */}
      <Link href={`/listing/${listing.id}`} className="block relative aspect-[16/10] overflow-hidden bg-stone-100">
        <img
          src={listing.imageUrls[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badge Discount */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-md tracking-tight">
            -{discountPercent}%
          </span>
        </div>

        {/* Badge ATTP */}
        <div className="absolute top-3 right-3">
          <FoodSafetyBadge
            certUrl={listing.foodSafetyCertUrl}
            partnerName={listing.partnerName}
          />
        </div>

        {/* Countdown Timer ở góc dưới ảnh */}
        <div className="absolute bottom-3 left-3">
          <ExpiryCountdown expiryAt={listing.expiryAt} />
        </div>
      </Link>

      {/* Nội dung Card */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5">
            <span className="font-bold text-[#00615f] hover:underline cursor-pointer">
              {listing.partnerName}
            </span>
            {listing.distanceKm !== undefined && (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-stone-600 font-medium">
                  <MapPin className="w-3 h-3 text-stone-400" /> {listing.distanceKm} km
                </span>
              </>
            )}
          </div>

          <Link href={`/listing/${listing.id}`}>
            <h3 className="font-bold text-stone-900 text-sm sm:text-base line-clamp-2 group-hover:text-[#00615f] transition-colors leading-snug">
              {listing.title}
            </h3>
          </Link>

          <p className="text-xs text-stone-500 mt-2 line-clamp-1">
            Nhận đồ:{" "}
            <span className="font-semibold text-stone-700">
              {listing.pickupStartTime} - {listing.pickupEndTime}
            </span>
          </p>
        </div>

        {/* Giá & Nút Đặt */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-[#00615f]">
                {listing.discountPrice.toLocaleString("vi-VN")}đ
              </span>
              <span className="text-xs text-stone-400 line-through">
                {listing.originalPrice.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <span className="text-[11px] text-stone-500 font-medium">
              Còn {listing.quantity} {listing.unit}
            </span>
          </div>

          <Link
            href={`/checkout/${listing.id}`}
            className="px-4 py-2 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Đặt giữ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
