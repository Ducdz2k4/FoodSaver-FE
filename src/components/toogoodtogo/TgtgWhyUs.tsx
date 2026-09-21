"use client";

import React from "react";
import { Tag, MapPin, Globe2, Compass, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const REASONS = [
  {
    icon: Tag,
    title: "Thưởng thức món ngon với 1/2 giá hoặc rẻ hơn",
    desc: "Tiết kiệm chi phí mỗi ngày cho bánh ngọt tươi ngon, bữa trưa nóng hổi và đồ uống đặc sắc chỉ vì quán chuẩn bị đóng cửa.",
    badge: "Tiết kiệm tới 70%",
    accentColor: "bg-amber-50 border-amber-200 text-amber-900",
  },
  {
    icon: MapPin,
    title: "Giải cứu đồ ăn ngay gần bạn",
    desc: "Bản đồ thông minh giúp bạn tìm thấy các tiệm bánh, nhà hàng và quán ăn quen thuộc ngay góc phố chỉ sau vài lần chạm.",
    badge: "Định vị tức thì",
    accentColor: "bg-yellow-50 border-yellow-200 text-yellow-900",
  },
  {
    icon: Globe2,
    title: "Bảo vệ môi trường bằng cách giảm lãng phí",
    desc: "Thực phẩm bị bỏ phí đóng góp đến 10% lượng khí thải nhà kính toàn cầu. Mỗi túi đồ ăn bạn mua là một hành động xanh thiết thực.",
    badge: "Tác động tích cực",
    accentColor: "bg-emerald-50 border-emerald-200 text-emerald-900",
  },
  {
    icon: Compass,
    title: "Khám phá hương vị mới từ các quán địa phương",
    desc: "Trải nghiệm 'Túi Bất Ngờ' (Surprise Bag) thú vị — mỗi ngày một điều bất ngờ tươi mới với chi phí cực kỳ mềm.",
    badge: "Trải nghiệm độc đáo",
    accentColor: "bg-orange-50 border-orange-200 text-orange-900",
  },
];

export function TgtgWhyUs() {
  return (
    <section id="why-us" className="py-20 sm:py-28 bg-[#FFFBEB] text-stone-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-400 text-stone-950 font-black text-xs uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>Giá trị mang lại</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-stone-950 tracking-tight">
              Tại sao nên dùng <span className="underline decoration-yellow-400 decoration-4 underline-offset-6">FoodSaver</span>?
            </h2>
          </div>
          <p className="text-stone-600 max-w-md text-sm sm:text-base leading-relaxed">
            Chúng tôi tin rằng món ăn ngon xứng đáng được thưởng thức thay vì kết thúc trong thùng rác. Dưới đây là 4 lý do bạn sẽ yêu thích FoodSaver.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {REASONS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-8 sm:p-10 rounded-3xl bg-white border border-yellow-200/80 shadow-lg shadow-yellow-500/5 hover:shadow-xl hover:border-yellow-400 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="size-14 rounded-2xl bg-yellow-400 text-stone-950 flex items-center justify-center shadow-md shadow-yellow-400/20 group-hover:scale-110 transition-transform">
                      <Icon className="size-7" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.accentColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-stone-950 mb-3 group-hover:text-amber-600 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-900">
                  <span className="text-yellow-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                    <span>Tìm hiểu thêm</span>
                    <ArrowRight className="size-3.5" />
                  </span>
                  <span className="text-stone-300 font-mono">0{index + 1}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Decorative Highlight Box with Surprise Bag image */}
        <div className="mt-14 p-8 sm:p-10 rounded-3xl bg-[#18181B] text-white flex flex-col lg:flex-row items-center justify-between gap-8 border border-yellow-400/30 shadow-2xl">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <span className="px-3 py-1 rounded-full bg-yellow-400 text-stone-950 font-black text-xs uppercase tracking-wider">
              Khái niệm đặc trưng
            </span>
            <h4 className="text-2xl sm:text-3xl font-black text-white">
              Túi Bất Ngờ (Surprise Bag) là gì?
            </h4>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              Vì các cửa hàng không thể dự đoán chính xác món nào sẽ còn dư vào cuối ngày, các món ngon sẽ được đóng gói vào chiếc Túi Bất Ngờ. Bạn luôn nhận được đồ ăn tươi với giá trị cao gấp 3 lần số tiền bỏ ra!
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl animate-pulse" />
              <img
                src="/images/tgtg/asset_16.png"
                alt="Surprise Bag FoodSaver"
                className="relative z-10 w-44 sm:w-56 h-auto drop-shadow-2xl hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
