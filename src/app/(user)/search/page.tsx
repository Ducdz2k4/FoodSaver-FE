"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Clock,
  Star,
  Heart,
  ShieldCheck,
  Compass,
  ArrowRight,
  Loader2,
  X,
  Truck,
  Sparkles,
} from "lucide-react";
import { MOCK_LISTINGS } from "@/mocks/mockData";
import { ExpiryCountdown } from "@/components/common/ExpiryCountdown";
import { FoodSafetyBadge } from "@/components/common/FoodSafetyBadge";
import { FoodCategory, ListingDTO } from "@/types/contract";
import { IMAGES } from "@/constants/images";
import { useGetListingsQuery } from "@/redux/api/listingApi";
import { toast } from "sonner";

// 1. Food Collection Categories with vibrant photography (Image #2)
const FOOD_COLLECTIONS: {
  id: FoodCategory | "ALL";
  label: string;
  image: string;
  tag: string;
}[] = [
  {
    id: "ALL",
    label: "Tất cả món",
    image: IMAGES.collectionAll,
    tag: "Đầy đủ lựa chọn",
  },
  {
    id: "DRINKS",
    label: "Đồ uống & Trà",
    image: IMAGES.collectionDrinks,
    tag: "Nước ép tươi",
  },
  {
    id: "BAKERY",
    label: "Bánh mì & Bakery",
    image: IMAGES.collectionBakery,
    tag: "Nướng trong ngày",
  },
  {
    id: "COOKED_MEAL",
    label: "Cơm & Món nóng",
    image: IMAGES.collectionCookedMeal,
    tag: "Cơm văn phòng",
  },
  {
    id: "FRUITS",
    label: "Trái cây & Rau củ",
    image: IMAGES.collectionFruits,
    tag: "Tươi mọng",
  },
  {
    id: "GROCERIES",
    label: "Thực phẩm tiện lợi",
    image: IMAGES.collectionGroceries,
    tag: "Cửa hàng tiện lợi",
  },
];

const PROMO_BANNERS = [
  {
    id: "banner-1",
    title: "Đại Tiệc Cứu Trợ",
    subtitle: "Giảm đến 70% các món ăn thơm ngon trước giờ đóng cửa",
    tag: "FLASH SALE",
    image: IMAGES.bannerSale70,
    actionLabel: "Săn deal ngay",
    filterTab: "BEST_SELLER" as QuickTab,
  },
  {
    id: "banner-2",
    title: "Freeship 0Đ Giờ Vàng",
    subtitle: "Giao đồ ăn ngon tận tay trong bán kính 20km, sống xanh",
    tag: "TIẾT KIỆM",
    image: IMAGES.bannerFreeshipEco,
    actionLabel: "Đặt ship ngay",
    filterTab: "FAST_DELIVERY" as QuickTab,
  },
  {
    id: "banner-3",
    title: "Radar Quán Ngon",
    subtitle: "Định vị tức thì các cửa hàng đối tác F&B gần bạn nhất",
    tag: "RADAR 3KM",
    image: IMAGES.bannerRadarMap,
    actionLabel: "Mở bản đồ",
    href: "/map",
  },
];

// 2. BeFood Quick Filter Tab Options (Image #1)
type QuickTab = "NEARBY" | "BEST_SELLER" | "RATING" | "FAST_DELIVERY";

function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | "ALL">("ALL");
  const [activeTab, setActiveTab] = useState<QuickTab>("NEARBY");
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [userAddress, setUserAddress] = useState("128 Nguyễn Trãi, Bến Thành, Quận 1, TP.HCM");

  useEffect(() => {
    if (initialQuery) {
      if (initialQuery === "urgent") {
        setActiveTab("FAST_DELIVERY");
        setSearchTerm("");
        toast.info("⚡ Đã lọc các món cận date giảm sâu cần giải cứu khẩn cấp do Jev AI đề xuất!");
      } else {
        setSearchTerm(initialQuery);
      }
    }
  }, [initialQuery]);

  // Query Backend with RTK Query
  const { data: realListings, isLoading, isFetching } = useGetListingsQuery({
    search: searchTerm.trim() || undefined,
    category: selectedCategory !== "ALL" ? selectedCategory : undefined,
    radiusKm,
    sortBy:
      activeTab === "NEARBY"
        ? "EXPIRY"
        : activeTab === "FAST_DELIVERY"
        ? "URGENCY"
        : activeTab === "BEST_SELLER"
        ? "PRICE_ASC"
        : "EXPIRY",
  });

  const baseListings = realListings && realListings.length > 0 ? realListings : MOCK_LISTINGS;

  // Client-side filtering & sorting for interactive tab feel
  const processedListings = useMemo(() => {
    let result = [...baseListings];

    // Filter by text search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.partnerName.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (selectedCategory !== "ALL") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Filter by radius
    result = result.filter((item) => (item.distanceKm || 1) <= radiusKm);

    // Apply Quick Tabs (Image #1)
    if (activeTab === "NEARBY") {
      result.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    } else if (activeTab === "BEST_SELLER") {
      result.sort((a, b) => a.discountPrice - b.discountPrice);
    } else if (activeTab === "FAST_DELIVERY") {
      result.sort(
        (a, b) => new Date(a.expiryAt).getTime() - new Date(b.expiryAt).getTime()
      );
    } else if (activeTab === "RATING") {
      result.sort((a, b) => (b.urgencyScore || 0) - (a.urgencyScore || 0));
    }

    return result;
  }, [baseListings, searchTerm, selectedCategory, radiusKm, activeTab]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    toast.success(
      favorites[id]
        ? "Đã xóa món khỏi danh sách yêu thích"
        : "Đã lưu món vào danh sách yêu thích!"
    );
  };

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserAddress(`Tọa độ: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (Quận 1)`);
          toast.success("Đã định vị vị trí hiện tại thành công!");
        },
        () => toast.error("Không thể lấy GPS, dùng địa chỉ mặc định.")
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-24 pb-28 px-4 sm:px-6 lg:px-8">
      {/* Standardized 7xl Container */}
      <div className="max-w-7xl mx-auto space-y-7">
        {/* =========================================================
            HEADER SEARCH & LOCATION (BeFood Top Bar Style)
        ========================================================= */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/90 shadow-sm space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Address Pill (Image #2) */}
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800 bg-[#f9f3f0] px-3.5 py-2 rounded-2xl border border-stone-200/80 min-w-0">
              <span className="uppercase tracking-wider text-[10px] text-stone-500 font-black shrink-0">
                GIAO TỚI:
              </span>
              <MapPin className="size-3.5 text-[#00615f] shrink-0" />
              <span className="truncate text-stone-900 font-semibold">{userAddress}</span>
              <button
                type="button"
                onClick={handleDetectGPS}
                className="text-[11px] text-[#00615f] hover:underline font-bold shrink-0 ml-1 cursor-pointer"
                title="Định vị vị trí GPS"
              >
                [Định vị]
              </button>
            </div>

            {/* Search Input Box (Image #2) */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm món ngon, bánh mì, quán ăn trên FoodSaver..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#f9f3f0] border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/25"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================
            PANEL SALE OFF & PROMOTIONAL BANNERS (Shopee/Grab Style)
        ========================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Ưu đãi giờ vàng hôm nay
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ⚡ Tiết kiệm đến 70%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {PROMO_BANNERS.map((banner) => (
              <div
                key={banner.id}
                className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-stone-200/90 aspect-[16/9] md:aspect-[16/10] bg-stone-900 flex flex-col justify-end p-5 text-white cursor-pointer select-none"
                onClick={() => {
                  if (banner.href) {
                    window.location.href = banner.href;
                  } else if (banner.filterTab) {
                    setActiveTab(banner.filterTab);
                    toast.info(`Đã lọc: ${banner.title}`);
                  }
                }}
              >
                {/* Background Banner Image */}
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                {/* Content Overlay */}
                <div className="relative z-10 space-y-1.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-sm uppercase tracking-wider">
                    {banner.tag}
                  </span>
                  <h3 className="font-black text-lg sm:text-xl text-white tracking-tight drop-shadow leading-tight">
                    {banner.title}
                  </h3>
                  <p className="text-xs text-white/85 line-clamp-1 drop-shadow-sm font-medium">
                    {banner.subtitle}
                  </p>

                  <div className="pt-1 flex items-center gap-1 text-xs font-black text-[#79e4a7] group-hover:translate-x-1 transition-transform">
                    <span>{banner.actionLabel}</span>
                    <ArrowRight className="size-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================
            BỘ SƯU TẬP MÓN ĂN (Image #2 - Visual Category Collection)
        ========================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Bộ sưu tập món ăn
            </h2>
            <span className="text-xs text-stone-500">Chọn danh mục bạn thích</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {FOOD_COLLECTIONS.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group relative flex flex-col items-center text-left bg-white rounded-3xl p-2.5 sm:p-3 border transition-all duration-200 cursor-pointer overflow-hidden ${
                    isSelected
                      ? "border-[#00615f] ring-2 ring-[#00615f]/30 shadow-md bg-emerald-50/20"
                      : "border-stone-200 hover:border-stone-300 hover:shadow-sm"
                  }`}
                >
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-100 mb-2.5">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 size-4 rounded-full bg-[#00615f] text-white flex items-center justify-center text-[9px] font-black">
                        ✓
                      </div>
                    )}
                  </div>
                  <strong className="text-xs font-bold text-stone-900 block truncate w-full text-center group-hover:text-[#00615f] transition-colors">
                    {cat.label}
                  </strong>
                  <span className="text-[10px] text-stone-400 block text-center truncate w-full">
                    {cat.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            QUICK FILTER TABS & RADIUS PILLS (Image #1 Style)
        ========================================================= */}
        <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Quick Filter Tabs (Image #1: Gần tôi, Bán chạy, Đánh giá, Giao nhanh) */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "NEARBY", label: "Gần tôi" },
              { id: "BEST_SELLER", label: "Bán chạy" },
              { id: "RATING", label: "Đánh giá ATTP" },
              { id: "FAST_DELIVERY", label: "Giao nhanh & Cận date" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as QuickTab)}
                  className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[#00615f] text-white shadow-sm"
                      : "text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Bán Kính Radar Pills (1km -> 20km) */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <span className="text-xs font-bold text-stone-500 hidden sm:inline">
              Bán kính:
            </span>
            {[1, 3, 5, 10, 20].map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setRadiusKm(km)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  radiusKm === km
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-black"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {km}km
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================
            DANH SÁCH QUÁN & MÓN ĂN QUANH ĐÂY (BeFood / Grab Cards)
        ========================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Quán ngon quanh đây
              </h2>
              <span className="text-xs font-bold text-stone-500 bg-white px-2.5 py-0.5 rounded-full border border-stone-200">
                {processedListings.length} địa điểm
              </span>
            </div>

            {(isLoading || isFetching) && (
              <div className="flex items-center gap-1.5 text-xs text-[#00615f] font-bold">
                <Loader2 className="size-3.5 animate-spin" />
                <span>Đang đồng bộ...</span>
              </div>
            )}
          </div>

          {processedListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {processedListings.map((item) => {
                const discountAmount = Math.max(0, item.originalPrice - item.discountPrice);
                const discountPercent = Math.round(
                  (discountAmount / item.originalPrice) * 100
                );
                const isFav = favorites[item.id];

                return (
                  <Link
                    key={item.id}
                    href={`/listing/${item.id}`}
                    className="group bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    {/* Ảnh món + Badges phong cách BeFood */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                      <img
                        src={item.imageUrls[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Tag Giảm đến XX (Image #2) */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-500 text-white shadow-md">
                          Giảm {discountPercent}% ({Math.round(discountAmount / 1000)}k)
                        </span>
                      </div>

                      {/* Nút Trái Tim Yêu Thích */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(e, item.id)}
                        className="absolute top-2.5 right-2.5 size-7 rounded-full bg-white/90 hover:bg-white text-stone-700 flex items-center justify-center shadow-md transition"
                        title="Lưu yêu thích"
                      >
                        <Heart
                          className={`size-3.5 ${
                            isFav ? "text-rose-500 fill-rose-500" : "text-stone-600"
                          }`}
                        />
                      </button>

                      {/* Badge Countdown: Đóng cửa trong X phút (Image #2) */}
                      <div className="absolute bottom-2.5 left-2.5">
                        <ExpiryCountdown expiryAt={item.expiryAt} compact />
                      </div>

                      {/* Huy hiệu ATTP */}
                      <div className="absolute bottom-2.5 right-2.5">
                        <FoodSafetyBadge
                          certUrl={item.foodSafetyCertUrl}
                          partnerName={item.partnerName}
                        />
                      </div>
                    </div>

                    {/* Nội dung quán & món */}
                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                      <div className="space-y-1">
                        {/* Tên Quán */}
                        <span className="text-xs font-extrabold text-[#00615f] truncate block">
                          {item.partnerName}
                        </span>

                        {/* Tên Món Ăn */}
                        <h3 className="font-extrabold text-stone-900 text-sm sm:text-base line-clamp-1 group-hover:text-[#00615f] transition-colors">
                          {item.title}
                        </h3>

                        {/* Rating & Distance (Image #2) */}
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-0.5">
                          <span className="flex items-center text-amber-500 font-bold">
                            <Star className="size-3 fill-amber-400 text-amber-400 mr-0.5" />
                            4.8
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-stone-600 font-semibold">
                            <MapPin className="size-3 text-stone-400" />
                            {item.distanceKm || 0.8} km
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-emerald-700 font-semibold">
                            <Truck className="size-3 text-emerald-600" />
                            Ship 20km
                          </span>
                        </div>

                        {/* Địa chỉ rút gọn */}
                        <p className="text-[11px] text-stone-400 truncate">
                          {item.pickupAddress}
                        </p>
                      </div>

                      {/* Giá & Nút Đặt */}
                      <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base sm:text-lg font-black text-[#00615f]">
                              {item.discountPrice.toLocaleString("vi-VN")}đ
                            </span>
                            <span className="text-xs text-stone-400 line-through">
                              {item.originalPrice.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400 font-medium">
                            Còn {item.quantity} {item.unit}
                          </span>
                        </div>

                        <span className="px-3.5 py-1.5 rounded-xl bg-[#00615f] group-hover:bg-[#089184] text-white text-xs font-bold transition flex items-center gap-1 shadow-sm">
                          <span>Đặt</span>
                          <ArrowRight className="size-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 shadow-sm space-y-3 max-w-lg mx-auto">
              <div className="size-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <Search className="size-6" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900">
                Không tìm thấy món ăn nào quanh đây
              </h3>
              <p className="text-xs text-stone-500">
                Hãy thử mở rộng bán kính lên 10km - 20km hoặc chọn mục "Tất cả món" nhé!
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("ALL");
                  setRadiusKm(20);
                }}
                className="mt-2 px-5 py-2.5 rounded-full bg-[#00615f] text-white text-xs font-bold hover:bg-[#089184] transition cursor-pointer"
              >
                Đặt lại bộ lọc (Bán kính 20km)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f9f3f0] flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-[#00615f] font-bold text-sm">
            <Loader2 className="size-6 animate-spin" />
            <span>Đang tải cổng khám phá FoodSaver...</span>
          </div>
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}

