"use client";

import React, { useState } from "react";
import { Search, CreditCard, ShoppingBag, Sparkles, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    number: "01",
    label: "Bước một",
    title: "Tìm kiếm Túi Bất Ngờ gần bạn",
    description:
      "Mở ứng dụng và khám phá các cửa hàng bánh, quán ăn, quán cà phê và siêu thị đang có Túi Bất Ngờ sẵn sàng để giải cứu quanh khu vực của bạn.",
    image: "/images/tgtg/asset_21.jpg",
    icon: Search,
    highlight: "Khám phá trên bản đồ thời gian thực",
  },
  {
    number: "02",
    label: "Bước hai",
    title: "Đặt mua và thanh toán an toàn",
    description:
      "Xác nhận lựa chọn, đặt trước phần ăn của bạn và thanh toán nhanh chóng, an toàn ngay trên ứng dụng với giá chỉ bằng 1/3 giá gốc.",
    image: "/images/tgtg/asset_29.png",
    icon: CreditCard,
    highlight: "Giá chỉ 1/3 giá niêm yết ban đầu",
  },
  {
    number: "03",
    label: "Bước ba",
    title: "Đến nhận đồ ăn đúng khung giờ",
    description:
      "Đến cửa hàng vào khung giờ nhận được thông báo, xác nhận biên nhận trên ứng dụng và nhận Túi Bất Ngờ tươi ngon nóng hổi từ nhân viên.",
    image: "/images/tgtg/asset_33.jpg",
    icon: ShoppingBag,
    highlight: "Nhận hàng nhanh gọn, không xếp hàng",
  },
  {
    number: "04",
    label: "Bước bốn",
    title: "Thưởng thức và tự hào vì Trái Đất",
    description:
      "Bạn vừa giải cứu một phần thức ăn chất lượng khỏi bị vứt bỏ, tiết kiệm một khoản chi phí và góp phần giảm thiểu khí thải nhà kính!",
    image: "/images/tgtg/asset_41.png",
    icon: Sparkles,
    highlight: "Mỗi bữa ăn = 2.7kg CO2e được cứu",
  },
];

export function TgtgHowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-white text-stone-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-400 text-stone-950 font-black text-xs uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            <span>Quy trình 4 bước đơn giản</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-stone-950 tracking-tight">
            Cách ứng dụng hoạt động
          </h2>
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
            Chỉ với 4 thao tác nhanh gọn, bạn đã có thể giải cứu món ăn yêu thích và lan tỏa hành động xanh.
          </p>
        </div>

        {/* Step Navigation Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${
                  isActive
                    ? "bg-[#18181B] border-yellow-400 text-white shadow-xl shadow-stone-900/10 scale-102"
                    : "bg-[#FFFDF5] border-yellow-200/70 text-stone-700 hover:bg-yellow-50 hover:border-yellow-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`size-7 rounded-full flex items-center justify-center font-mono text-xs font-black ${
                      isActive ? "bg-yellow-400 text-stone-950" : "bg-stone-200 text-stone-700"
                    }`}
                  >
                    {step.number}
                  </span>
                  <Icon
                    className={`size-4 ${isActive ? "text-yellow-400" : "text-stone-400"}`}
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold block uppercase tracking-wider opacity-75">
                    {step.label}
                  </span>
                  <p className="text-xs sm:text-sm font-black truncate">
                    {step.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase Card */}
        <div className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-[#FFFBEB] border-2 border-yellow-300/80 shadow-2xl flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          {/* Left Description */}
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-stone-950 font-black text-xs">
              <span>{STEPS[activeStep].label}</span>
              <span>•</span>
              <span>{STEPS[activeStep].number}</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black text-stone-950 tracking-tight leading-tight">
              {STEPS[activeStep].title}
            </h3>

            <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-normal">
              {STEPS[activeStep].description}
            </p>

            <div className="p-4 rounded-2xl bg-white border border-yellow-300/60 shadow-sm inline-flex items-center gap-3">
              <div className="size-8 rounded-full bg-yellow-400 text-stone-950 flex items-center justify-center shrink-0">
                <Check className="size-4 stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-stone-900">
                {STEPS[activeStep].highlight}
              </span>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href="#download"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-extrabold text-sm shadow-md transition-all duration-200"
              >
                <span>Tải app trải nghiệm ngay</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Right Image Illustration */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <div className="relative max-w-md w-full aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-white group">
              <img
                src={STEPS[activeStep].image}
                alt={STEPS[activeStep].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
