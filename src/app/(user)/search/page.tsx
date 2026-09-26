"use client";

import React, { useState, useMemo } from "react";
import { Search, MapPin, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { MOCK_LISTINGS } from "@/mocks/mockData";
import { ListingCard } from "@/components/common/ListingCard";
import { FoodCategory } from "@/types/contract";

const CATEGORIES: { label: string; value: FoodCategory | "ALL" }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Bánh mì & Bánh ngọt", value: "BAKERY" },
  { label: "Món nấu chín & Cơm", value: "COOKED_MEAL" },
  { label: "Đồ uống & Trà hoa quả", value: "DRINKS" },
  { label: "Trái cây & Rau củ", value: "FRUITS" },
  { label: "Thực phẩm tạp hóa", value: "GROCERIES" },
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | "ALL">("ALL");
  const [maxDistance, setMaxDistance] = useState<number>(5);
  const [sortBy, setSortBy] = useState<"EXPIRY" | "PRICE_ASC" | "DISTANCE">("EXPIRY");

  const filteredListings = useMemo(() => {
    return MOCK_LISTINGS.filter((item) => {
      // 1. Text search
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Category
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;

      // 3. Distance
      const matchesDistance =
        item.distanceKm === undefined || item.distanceKm <= maxDistance;

      return matchesSearch && matchesCategory && matchesDistance;
    }).sort((a, b) => {
      if (sortBy === "EXPIRY") {
        return new Date(a.expiryAt).getTime() - new Date(b.expiryAt).getTime();
      }
      if (sortBy === "PRICE_ASC") {
        return a.discountPrice - b.discountPrice;
      }
      if (sortBy === "DISTANCE") {
        return (a.distanceKm || 0) - (b.distanceKm || 0);
      }
      return 0;
    });
  }, [searchTerm, selectedCategory, maxDistance, sortBy]);

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Search Bar */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-[#00615f] tracking-tight">
              Tìm kiếm thực phẩm giải cứu
            </h1>
            <p className="text-sm text-stone-600">
              Khám phá các suất ăn ngon, sạch, đảm bảo ATTP từ các cửa hàng gần bạn nhất.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên món ăn, tên tiệm bánh, nhà hàng..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00615f]/30 transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
                >
                  Xóa
                </button>
              )}
            </div>

            {/* Sắp xếp */}
            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-stone-200/90 shadow-sm">
              <ArrowUpDown className="size-4 text-stone-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs sm:text-sm font-bold text-stone-800 focus:outline-none cursor-pointer"
              >
                <option value="EXPIRY">Sắp hết hạn trước</option>
                <option value="PRICE_ASC">Giá rẻ nhất trước</option>
                <option value="DISTANCE">Gần bạn nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bộ lọc: Danh mục & Khoảng cách */}
        <div className="space-y-4 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-sm">
          {/* Categories */}
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2.5">
              Danh mục thực phẩm
            </span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === cat.value
                      ? "bg-[#00615f] text-white shadow-sm"
                      : "bg-stone-100 hover:bg-stone-200/70 text-stone-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bán kính khoảng cách */}
          <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
              <MapPin className="size-4 text-[#00615f]" />
              <span>Bán kính tìm kiếm:</span>
              <span className="text-emerald-700 font-extrabold text-sm">{maxDistance} km</span>
            </div>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 5, 10].map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => setMaxDistance(km)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    maxDistance === km
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200"
                  }`}
                >
                  {km} km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Kết quả tìm kiếm */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-stone-700">
              Tìm thấy <strong className="text-[#00615f]">{filteredListings.length}</strong> món ăn phù hợp
            </span>
          </div>

          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm space-y-3">
              <p className="text-base font-bold text-stone-800">
                Không tìm thấy món ăn nào phù hợp với bộ lọc hiện tại.
              </p>
              <p className="text-xs text-stone-500">
                Hãy thử mở rộng bán kính khoảng cách hoặc chọn "Tất cả" danh mục nhé!
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("ALL");
                  setMaxDistance(10);
                }}
                className="mt-3 px-5 py-2.5 rounded-full bg-[#00615f] text-white text-xs font-bold hover:bg-[#089184] transition"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
