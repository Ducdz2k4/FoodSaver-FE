"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Store, CheckCircle2 } from "lucide-react";
import { IMAGES } from "@/constants/images";

const SELLER_SOLUTIONS = [
  {
    title: "TIỆM BÁNH & BÁNH MÌ ARTISAN",
    description:
      "Đăng bán các mẻ bánh mì, bánh ngọt, croissant và bánh sừng trâu dư trong ngày chỉ với 1 phút. Thu hồi vốn nguyên liệu và mở rộng tệp khách hàng quen thuộc trong khu vực.",
    forWho: "Tiệm bánh Artisan, Tiệm bánh ngọt, Quầy bánh mì",
    href: "/partner/apply",
    mainImage: IMAGES.businessBakeryMain,
    subImage: IMAGES.businessBakerySub,
    altMain: "Khung cảnh tiệm bánh ấm áp buổi sáng cùng bánh sừng trâu thơm ngon",
    altSub: "Chủ cửa hàng quản lý và xác nhận đơn hàng trên thiết bị",
  },
  {
    title: "CỬA HÀNG TIỆN LỢI & SIÊU THỊ MINI",
    description:
      "Tự động áp dụng giá giải cứu cuối ngày cho sandwich đóng gói, sữa tươi, sữa chua và trái cây tươi. Đồng hồ đếm ngược đảm bảo hàng được bán hết trong khung giờ vàng an toàn.",
    forWho: "Cửa hàng tiện lợi, Mini-mart, Siêu thị bán lẻ",
    href: "/partner/apply",
    mainImage: IMAGES.businessStoreMain,
    subImage: IMAGES.businessStoreSub,
    altMain: "Khách hàng nhận đồ ăn tươi ngon đóng túi sạch sẽ tại cửa hàng tiện lợi",
    altSub: "Kệ hàng thực phẩm sạch sẽ, đóng gói vệ sinh đạt chuẩn",
  },
  {
    title: "BẾP ĂN THƯƠNG MẠI & CHUẨN VỆ SINH ATTP",
    description:
      "Hiển thị minh bạch giấy chứng nhận vệ sinh ATTP và hướng dẫn bảo quản trực tiếp tới khách hàng. Cơ chế tự động khóa đơn hết hạn giúp bảo vệ uy tín thương hiệu đối tác tuyệt đối.",
    forWho: "Nhà hàng, Quán cơm văn phòng, Bếp ăn đạt chuẩn ATTP",
    href: "/partner/apply",
    mainImage: IMAGES.businessKitchenMain,
    subImage: IMAGES.businessKitchenSub,
    altMain: "Suất cơm sườn nướng trứng ốp la sạch sẽ đạt chuẩn vệ sinh ATTP",
    altSub: "Quầy thực phẩm tươi ngon kiểm định chất lượng nghiêm ngặt",
  },
];

export function TgtgBusiness() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="for-sellers" className="py-20 sm:py-28 lg:py-32 bg-[#f9f3f0] text-[#252d2d] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#00615f]/70 mb-2">
            Dành Cho Doanh Nghiệp F&amp;B &amp; Đối Tác Kinh Doanh
          </p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#00615f] tracking-tight mb-4 select-none leading-tight">
            Biến thực phẩm dư hôm nay thành khách hàng gắn bó ngày mai.
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[#252d2d]/80 leading-relaxed font-normal mb-8">
            FoodSaver mang đến cho các tiệm bánh, nhà hàng và cửa hàng tiện lợi giải pháp bán thực phẩm cận date đạt chuẩn ATTP tới cộng đồng lân cận, thu hồi chi phí và giảm thiểu rác thải hữu cơ.
          </p>

          <Link
            href="/partner/apply"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#00615f] hover:bg-[#089184] text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Store className="size-4" />
            <span>Đăng ký làm đối tác F&amp;B</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Interactive Grid: Left Images + Right Tiles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Dynamic Paired Images */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="relative w-full max-w-[480px] aspect-square">
              {/* Main Image */}
              <div className="relative w-[85%] aspect-square ml-auto rounded-3xl overflow-hidden shadow-xl border-2 border-stone-200/80 bg-stone-100 transition-all duration-500">
                <img
                  src={SELLER_SOLUTIONS[activeIndex].mainImage}
                  alt={SELLER_SOLUTIONS[activeIndex].altMain}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  loading="lazy"
                />
              </div>

              {/* Overlapping Sub-Image */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-44 sm:w-52 aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white transition-all duration-500">
                <img
                  src={SELLER_SOLUTIONS[activeIndex].subImage}
                  alt={SELLER_SOLUTIONS[activeIndex].altSub}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Right: 3 Solution Tiles */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5">
            {SELLER_SOLUTIONS.map((item, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 cursor-pointer text-left ${
                    isActive
                      ? "bg-white border-[#00615f] shadow-lg scale-[1.01]"
                      : "bg-white/60 border-stone-300/80 hover:bg-white hover:border-[#00615f]/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2.5">
                    <h3
                      className={`text-lg sm:text-xl font-black uppercase tracking-tight transition-colors ${
                        isActive ? "text-[#00615f]" : "text-[#00615f]/80"
                      }`}
                    >
                      {item.title}
                    </h3>
                    <div
                      className={`size-7 rounded-full flex items-center justify-center transition-all ${
                        isActive ? "bg-[#00615f] text-white" : "bg-stone-200/60 text-stone-600"
                      }`}
                    >
                      <ArrowRight className="size-3.5" />
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-[#252d2d]/80 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00615f]">
                    <span className="text-stone-500 font-semibold">Phù hợp:</span>
                    <span className="underline decoration-[#79e4a7] underline-offset-2">
                      {item.forWho}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
