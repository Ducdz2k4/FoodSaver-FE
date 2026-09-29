"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { MOCK_LISTINGS } from "@/mocks/mockData";
import { ListingCard } from "@/components/common/ListingCard";
import { useGetListingsQuery } from "@/redux/api/listingApi";

export function TgtgWhyUs() {
  const { data: realListings, isLoading } = useGetListingsQuery({ limit: 8 });

  // Use real database listings if available, fallback gracefully to mock items
  const listings = realListings && realListings.length > 0 ? realListings : MOCK_LISTINGS;

  return (
    <section id="listings" className="py-16 sm:py-24 bg-[#f9f3f0] text-[#252d2d] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>SẮP HẾT HẠN • ĐÃ KIỂM ĐỊNH AN TOÀN ATTP</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#00615f]">
              Món ngon đang chờ giải cứu
            </h2>
            <p className="text-sm text-stone-600 max-w-xl">
              Thực phẩm ngon chuẩn vị từ các tiệm bánh, nhà hàng và cửa hàng tiện lợi đối tác. Giảm giá 50–75% trong những giờ vàng cuối cùng.
            </p>
          </div>

          {/* Quick CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white px-5 py-3.5 rounded-2xl border border-stone-200/80 shadow-sm">
            <p className="text-xs sm:text-sm font-bold text-stone-800">
              Tìm theo vị trí gần bạn nhất:
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold transition shrink-0 shadow-sm"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading && !realListings ? (
          <div className="flex items-center justify-center p-12 text-stone-500 gap-2">
            <Loader2 className="size-6 animate-spin text-[#00615f]" />
            <span className="text-sm font-bold">Đang tải món ăn giải cứu gần bạn...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {listings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

