"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Compass,
  SlidersHorizontal,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { MOCK_LISTINGS } from "@/mocks/mockData";
import { ExpiryCountdown } from "@/components/common/ExpiryCountdown";
import { FoodSafetyBadge } from "@/components/common/FoodSafetyBadge";
import { ListingDTO, FoodCategory } from "@/types/contract";

export default function FoodMapPage() {
  const [selectedListing, setSelectedListing] = useState<ListingDTO>(MOCK_LISTINGS[0]);
  const [categoryFilter, setCategoryFilter] = useState<FoodCategory | "ALL">("ALL");
  const [radiusKm, setRadiusKm] = useState<number>(3);
  const [urgentOnly, setUrgentOnly] = useState(false);

  // Pin Coordinates on visual canvas map (percent 0-100)
  const pinPositions: Record<string, { x: number; y: number }> = {
    "list-1": { x: 42, y: 56 }, // Bến Thành, Q1
    "list-2": { x: 44, y: 53 }, // Nguyễn Trãi, Q1
    "list-3": { x: 35, y: 38 }, // Tú Xương, Q3
    "list-4": { x: 62, y: 44 }, // Hai Bà Trưng, Q1
  };

  const filteredListings = MOCK_LISTINGS.filter((item) => {
    if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
    if (item.distanceKm && item.distanceKm > radiusKm) return false;
    if (urgentOnly && item.status !== "EXPIRING_SOON") return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-bold mb-1.5">
              <Compass className="size-3.5" />
              <span>RADAR BẢN ĐỒ CỨU TRỢ • GEOHASH LOCAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
              Bản đồ món ngon lân cận
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Định vị các cửa hàng F&B có thực phẩm cận date đạt chuẩn ATTP quanh bạn.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setUrgentOnly(!urgentOnly)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border ${
                urgentOnly
                  ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                  : "bg-white text-stone-700 hover:bg-stone-50 border-stone-200"
              }`}
            >
              <Clock className="size-3.5" />
              <span>Chỉ món cấp bách (&lt; 2h)</span>
            </button>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-white border border-stone-200 px-3 py-2 rounded-2xl text-xs font-bold text-stone-800 shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả danh mục</option>
              <option value="BAKERY">Tiệm bánh</option>
              <option value="COOKED_MEAL">Món nấu chín</option>
              <option value="DRINKS">Đồ uống</option>
            </select>
          </div>
        </div>

        {/* Map Grid Canvas + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Interactive Visual Map (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200/90 shadow-md overflow-hidden relative">
            {/* Top Toolbar overlay */}
            <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-3 text-xs font-bold text-stone-700">
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5 text-[#00615f]" />
                <span>Bán kính radar:</span>
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRadiusKm(r)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                      radiusKm === r
                        ? "bg-[#00615f] text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            </div>

            {/* Map Canvas Background (Simulated City Map of Saigon Downtown) */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-[#f4ece6] overflow-hidden select-none">
              {/* Grid Roads & River Graphic */}
              <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                {/* River */}
                <path
                  d="M0,280 C200,260 350,340 500,310 C650,280 800,380 1000,350"
                  fill="none"
                  stroke="#a7d8de"
                  strokeWidth="48"
                  strokeLinecap="round"
                />
                {/* Major Roads */}
                <line x1="80" y1="0" x2="250" y2="600" stroke="#dfd2c4" strokeWidth="12" />
                <line x1="0" y1="200" x2="1000" y2="280" stroke="#dfd2c4" strokeWidth="10" />
                <line x1="300" y1="0" x2="450" y2="600" stroke="#dfd2c4" strokeWidth="14" />
                <line x1="0" y1="420" x2="1000" y2="350" stroke="#dfd2c4" strokeWidth="10" />
                <line x1="550" y1="0" x2="650" y2="600" stroke="#dfd2c4" strokeWidth="8" />
              </svg>

              {/* User Current Position (Center) */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
                style={{ left: "50%", top: "50%" }}
              >
                {/* Radar Ripple */}
                <div
                  className="rounded-full bg-emerald-500/15 border border-emerald-500/40 absolute -translate-x-1/2 -translate-y-1/2 animate-ping"
                  style={{ width: `${radiusKm * 65}px`, height: `${radiusKm * 65}px` }}
                />
                <div
                  className="rounded-full bg-emerald-500/10 border border-emerald-500/30 absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ width: `${radiusKm * 65}px`, height: `${radiusKm * 65}px` }}
                />

                <div className="size-5 rounded-full bg-[#00615f] border-2 border-white shadow-lg flex items-center justify-center">
                  <div className="size-2 rounded-full bg-white animate-pulse" />
                </div>
                <span className="text-[10px] font-black text-[#00615f] bg-white/90 px-1.5 py-0.5 rounded shadow mt-1">
                  Vị trí của bạn
                </span>
              </div>

              {/* Listing Food Pins */}
              {filteredListings.map((item) => {
                const pos = pinPositions[item.id] || { x: 50, y: 50 };
                const isSelected = selectedListing?.id === item.id;
                const isUrgent = item.status === "EXPIRING_SOON";

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedListing(item)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-xl transition-all duration-200 border ${
                        isSelected
                          ? "bg-[#00615f] text-white border-white scale-110 ring-4 ring-[#00615f]/25"
                          : isUrgent
                          ? "bg-rose-500 text-white border-rose-200 hover:scale-105 animate-bounce"
                          : "bg-white text-stone-900 border-stone-200 hover:scale-105"
                      }`}
                    >
                      <MapPin
                        className={`size-3.5 ${
                          isSelected || isUrgent ? "text-white" : "text-[#00615f]"
                        }`}
                      />
                      <span className="text-xs font-black whitespace-nowrap">
                        {item.discountPrice.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar: Selected Food Popup & Quick Action (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
              Địa điểm đã chọn
            </span>

            {selectedListing ? (
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-lg space-y-4 animate-in fade-in duration-200">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-stone-100">
                  <img
                    src={selectedListing.imageUrls[0]}
                    alt={selectedListing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow">
                      -{Math.round(((selectedListing.originalPrice - selectedListing.discountPrice) / selectedListing.originalPrice) * 100)}%
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5">
                    <ExpiryCountdown expiryAt={selectedListing.expiryAt} compact />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-bold text-[#00615f]">{selectedListing.partnerName}</span>
                    <span>Cách bạn {selectedListing.distanceKm} km</span>
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm leading-snug line-clamp-2">
                    {selectedListing.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2">
                    {selectedListing.description}
                  </p>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-stone-100">
                  <div>
                    <span className="text-lg font-black text-[#00615f]">
                      {selectedListing.discountPrice.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-xs text-stone-400 line-through ml-1.5">
                      {selectedListing.originalPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    Còn {selectedListing.quantity} {selectedListing.unit}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={`/listing/${selectedListing.id}`}
                    className="py-2.5 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold text-center transition"
                  >
                    Xem chi tiết
                  </Link>
                  <Link
                    href={`/checkout/${selectedListing.id}`}
                    className="py-2.5 px-3 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold text-center shadow-md transition flex items-center justify-center gap-1"
                  >
                    <ShoppingBag className="size-3.5" />
                    <span>Đặt giữ</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center text-xs text-stone-500">
                Nhấp vào một điểm ghim trên bản đồ để xem chi tiết món ăn giải cứu.
              </div>
            )}

            {/* List of other spots */}
            <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-sm space-y-2">
              <span className="text-xs font-bold text-stone-700 block mb-1">
                Tất cả điểm cứu trợ gần bạn ({filteredListings.length}):
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredListings.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedListing(item)}
                    className={`p-2.5 rounded-2xl cursor-pointer transition flex items-center justify-between gap-2 border ${
                      selectedListing?.id === item.id
                        ? "bg-emerald-50 border-emerald-300"
                        : "bg-stone-50 hover:bg-stone-100 border-stone-100"
                    }`}
                  >
                    <div className="min-w-0">
                      <strong className="text-xs font-bold text-stone-900 block truncate">
                        {item.title}
                      </strong>
                      <span className="text-[11px] text-stone-500">
                        {item.partnerName} • {item.distanceKm} km
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#00615f] shrink-0">
                      {item.discountPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
