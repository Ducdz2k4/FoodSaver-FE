"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, Server, Tag, Check, ArrowRight, Store, Building } from "lucide-react";

const SOLUTIONS = [
  {
    tag: "SURPRISE BAGS",
    title: "Túi Bất Ngờ cho Cửa Hàng",
    headline: "Biến thực phẩm dư thành doanh thu mới",
    description:
      "Đăng bán đồ ăn còn lại trong ngày dưới hình thức 'Túi Bất Ngờ' trên FoodSaver để khách hàng đến nhận tận nơi vào giờ đã định. Không phát sinh chi phí giao hàng hay vận hành.",
    forWho: "Tiệm bánh, Quán cà phê, Nhà hàng, Catering",
    badgeColor: "bg-yellow-400 text-stone-950",
    icon: ShoppingBag,
    features: [
      "Thu hồi chi phí nguyên vật liệu dư thừa",
      "Tiếp cận hàng nghìn khách hàng tiềm năng mới",
      "Thao tác quản lý đơn hàng chỉ trong 30 giây",
    ],
  },
  {
    tag: "FOODSAVER PLATFORM",
    title: "Nền Tảng Quản Trị Siêu Thị",
    headline: "Giải pháp quản lý hạn sử dụng toàn diện",
    description:
      "Phần mềm dạng module AI hỗ trợ các chuỗi siêu thị và bán lẻ thực phẩm tự động theo dõi hạn dùng, chiết khấu động thông minh và tái phân phối lượng hàng cận date.",
    forWho: "Chuỗi siêu thị, Bách hóa, Chuỗi tiện lợi",
    badgeColor: "bg-amber-500 text-white",
    icon: Server,
    features: [
      "Kiểm kê hạn dùng nhanh hơn 60%",
      "Tối ưu chiết khấu động theo thời gian thực",
      "Báo cáo giảm thiểu rác thải theo chuẩn ESG",
    ],
  },
  {
    tag: "DATE LABELING INITIATIVE",
    title: "Nhãn 'Nhìn - Ngửi - Nếm'",
    headline: "Giảm lãng phí thực phẩm trong từng hộ gia đình",
    description:
      "Gia nhập liên minh các thương hiệu thực phẩm hàng đầu thế giới với nhãn dán thông minh 'Look - Smell - Taste' trước khi vứt bỏ, giúp người tiêu dùng hiểu rõ Best-Before.",
    forWho: "Nhãn hàng FMCG, Nhà sản xuất thực phẩm",
    badgeColor: "bg-stone-900 text-yellow-300",
    icon: Tag,
    features: [
      "Giáo dục hành vi người tiêu dùng tích cực",
      "Nâng cao chỉ số trách nhiệm xã hội thương hiệu",
      "Áp dụng trên hàng tỷ bao bì sản phẩm",
    ],
  },
];

export function TgtgBusiness() {
  return (
    <section id="business" className="py-20 sm:py-28 bg-[#18181B] text-white relative overflow-hidden">
      {/* Decorative yellow ambient shapes */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 font-bold text-xs uppercase tracking-wider">
              <Store className="size-3.5 text-yellow-400" />
              <span>Dành cho đối tác</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Giải pháp cho <span className="text-yellow-400">Doanh nghiệp</span>
            </h2>
          </div>
          <p className="text-stone-300 max-w-md text-sm sm:text-base leading-relaxed">
            Chúng tôi cung cấp hệ thống giải pháp toàn diện giúp các nhà bán lẻ và phân phối thực phẩm hàng đầu tối ưu hóa doanh thu và loại bỏ lãng phí.
          </p>
        </div>

        {/* 3 Solution Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {SOLUTIONS.map((sol, index) => {
            const Icon = sol.icon;
            return (
              <div
                key={index}
                className="p-8 sm:p-9 rounded-3xl bg-[#27272A] border border-stone-700/80 hover:border-yellow-400/80 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase ${sol.badgeColor}`}>
                      {sol.tag}
                    </span>
                    <div className="size-11 rounded-xl bg-stone-800 text-yellow-400 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-stone-950 transition-colors">
                      <Icon className="size-5" />
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                    {sol.title}
                  </h3>
                  <h4 className="text-xs font-bold text-yellow-400 mb-4 uppercase tracking-wide">
                    {sol.headline}
                  </h4>

                  <p className="text-stone-300 text-sm leading-relaxed mb-6">
                    {sol.description}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-stone-700/60 mb-6">
                    {sol.features.map((f, fi) => (
                      <div key={fi} className="flex items-start gap-2.5 text-xs text-stone-200">
                        <Check className="size-3.5 text-yellow-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="p-3 rounded-xl bg-stone-800/80 text-[11px] text-stone-300 mb-6 border border-stone-700/40">
                    <strong className="text-white block mb-0.5">Phù hợp nhất cho:</strong>
                    <span>{sol.forWho}</span>
                  </div>

                  <Link
                    href="#contact"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-stone-800 hover:bg-yellow-400 hover:text-stone-950 text-white font-bold text-xs transition-all duration-200"
                  >
                    <span>Hợp tác cùng chúng tôi</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-stone-950 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xl sm:text-2xl font-black tracking-tight">
              Bạn là chủ nhà hàng, tiệm bánh hoặc quán cafe?
            </h4>
            <p className="text-xs sm:text-sm font-semibold text-stone-900/80">
              Đăng ký đối tác chỉ trong 10 phút và bắt đầu tạo ra doanh thu từ thực phẩm dư thừa ngay hôm nay.
            </p>
          </div>
          <Link
            href="/register"
            className="shrink-0 px-6 py-3 rounded-full bg-stone-950 hover:bg-stone-800 text-yellow-300 font-extrabold text-xs sm:text-sm shadow-lg transition-transform hover:scale-105 active:scale-98"
          >
            Đăng ký đối tác ngay
          </Link>
        </div>
      </div>
    </section>
  );
}
