"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Clock,
  ShieldCheck,
  ShoppingBag,
  ArrowLeft,
  Share2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { MOCK_LISTINGS } from "@/mocks/mockData";
import { ExpiryCountdown } from "@/components/common/ExpiryCountdown";
import { FoodSafetyBadge } from "@/components/common/FoodSafetyBadge";

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const listing = MOCK_LISTINGS.find((item) => item.id === resolvedParams.id);

  if (!listing) {
    return notFound();
  }

  const discountPercent = Math.round(
    ((listing.originalPrice - listing.discountPrice) / listing.originalPrice) * 100
  );

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-24 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00615f] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </Link>

          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: listing.title,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Đã sao chép link món ăn!");
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 shadow-sm transition"
          >
            <Share2 className="w-3.5 h-3.5" /> Chia sẻ
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Gallery & Store info (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Gallery Image */}
            <div className="relative aspect-[16/11] rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-md">
              <img
                src={listing.imageUrls[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-500 text-white shadow-lg tracking-tight">
                  TIẾT KIỆM {discountPercent}%
                </span>
              </div>

              <div className="absolute top-4 right-4">
                <FoodSafetyBadge
                  certUrl={listing.foodSafetyCertUrl}
                  partnerName={listing.partnerName}
                />
              </div>
            </div>

            {/* Thông tin đối tác F&B */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                    Đơn vị cung cấp
                  </span>
                  <h2 className="text-lg font-black text-[#00615f]">
                    {listing.partnerName}
                  </h2>
                </div>
                <FoodSafetyBadge
                  certUrl={listing.foodSafetyCertUrl}
                  partnerName={listing.partnerName}
                />
              </div>

              <div className="flex items-start gap-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
                <MapPin className="size-4 text-[#00615f] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-800">Địa chỉ lấy món:</strong>{" "}
                  {listing.pickupAddress}
                  {listing.distanceKm !== undefined && (
                    <span className="text-emerald-700 font-bold ml-1.5">
                      (Cách bạn {listing.distanceKm} km)
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Hướng dẫn an toàn & bảo quản */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-black uppercase tracking-wider">
                <AlertTriangle className="size-4 text-amber-600" />
                <span>Lưu ý vệ sinh an toàn thực phẩm</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                {listing.safetyNotes ||
                  "Sản phẩm còn hạn dùng trong ngày. Đề nghị sử dụng ngay sau khi nhận hoặc bảo quản đúng nhiệt độ hướng dẫn."}
              </p>
            </div>
          </div>

          {/* Right Column: Details, Live Countdown & Checkout Trigger (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-6">
              {/* Countdown Banner */}
              <div className="bg-[#00615f]/5 border border-[#00615f]/20 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-stone-500 block uppercase">
                    Thời gian giải cứu còn:
                  </span>
                  <ExpiryCountdown expiryAt={listing.expiryAt} />
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full">
                  Còn {listing.quantity} {listing.unit}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight leading-snug">
                  {listing.title}
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Khung giờ nhận hàng */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/70 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                  <Clock className="size-4 text-[#00615f]" />
                  <span>Khung giờ hẹn đến lấy đồ hôm nay:</span>
                </div>
                <p className="text-sm font-extrabold text-[#00615f] pl-5">
                  {listing.pickupStartTime} - {listing.pickupEndTime}
                </p>
              </div>

              {/* Giá và nút Đặt giữ */}
              <div className="pt-4 border-t border-stone-100 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-stone-500">Giá giải cứu:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#00615f]">
                      {listing.discountPrice.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-xs text-stone-400 line-through ml-2">
                      {listing.originalPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>

                <Link
                  href={`/checkout/${listing.id}`}
                  className="w-full py-3.5 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-98"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Đặt Giữ Món Này Ngay</span>
                </Link>

                <p className="text-center text-[11px] text-stone-400">
                  Thanh toán trực tiếp tại quán khi nhận đồ • Không trừ tiền trước
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
