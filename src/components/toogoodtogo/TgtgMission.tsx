"use client";

import React from "react";
import { Utensils, Building2, Users2, Leaf, HeartHandshake } from "lucide-react";

const STATS = [
  {
    icon: Utensils,
    value: "350M+",
    label: "Bữa ăn được giải cứu",
    desc: "Món ăn ngon không bị lãng phí",
  },
  {
    icon: Building2,
    value: "180K+",
    label: "Cửa hàng đối tác",
    desc: "Tiệm bánh, quán cafe & siêu thị",
  },
  {
    icon: Users2,
    value: "100M+",
    label: "Chiến binh FoodSaver",
    desc: "Cộng đồng tiêu dùng thông minh",
  },
  {
    icon: Leaf,
    value: "890K+",
    label: "Tấn CO2e giảm phát thải",
    desc: "Bảo vệ môi trường sống bền vững",
  },
];

export function TgtgMission() {
  return (
    <section className="py-20 sm:py-28 bg-[#FFFDF5] text-stone-900 border-b border-yellow-200/50 relative overflow-hidden">
      {/* Decorative yellow background circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Mission Statement */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-yellow-400/20 text-yellow-800 font-bold text-xs uppercase tracking-wider">
            <HeartHandshake className="size-4 text-amber-600" />
            <span>Sứ mệnh vì cộng đồng</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-snug">
            FoodSaver là nền tảng kết nối hành động nhằm{" "}
            <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
              truyền cảm hứng và trao quyền
            </span>{" "}
            cho mọi người cùng chống lãng phí thực phẩm.
          </h2>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
            Ứng dụng của chúng tôi là cầu nối giúp hàng triệu người dùng tiếp cận nguồn thực phẩm dư thừa chất lượng cao từ các cửa hàng, quán cà phê và tiệm bánh địa phương với mức giá cực kỳ ưu đãi.
          </p>
        </div>

        {/* 4 Impact Stat Cards */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-yellow-200/60 shadow-md shadow-yellow-500/5 hover:shadow-xl hover:shadow-yellow-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className="size-14 rounded-2xl bg-yellow-400/20 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-yellow-400 group-hover:text-stone-950 transition-colors duration-200">
                  <Icon className="size-7" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-stone-950 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-stone-800 mt-1">
                  {stat.label}
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  {stat.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
