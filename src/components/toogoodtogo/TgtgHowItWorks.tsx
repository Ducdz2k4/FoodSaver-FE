"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IMAGES } from "@/constants/images";

const STEPS = [
  {
    step: "01 Đăng món",
    title: "Cửa hàng đăng bán thực phẩm cận date",
    description:
      "Các tiệm bánh, nhà hàng và cửa hàng tiện lợi đăng món ăn với hạn sử dụng chính xác, số lượng tồn và mức giá ưu đãi giảm 50–80%.",
  },
  {
    step: "02 Đếm ngược",
    title: "Đồng hồ đếm lùi thời gian thực",
    description:
      "Mọi bài đăng đều hiển thị đồng hồ đếm ngược từng giây theo thời gian thực. Hết hạn sẽ tự động khóa để bảo vệ an toàn cho người dùng.",
  },
  {
    step: "03 Khám phá",
    title: "Tìm kiếm & định vị quán gần bạn",
    description:
      "Khách hàng dễ dàng tìm kiếm món ngon quanh mình theo khoảng cách geohash (tối đa 20km), danh mục và mức độ cấp bách.",
  },
  {
    step: "04 Nhận món",
    title: "Đặt giữ & thưởng thức trọn vẹn",
    description:
      "Xác nhận đặt giữ món trên ứng dụng, nhận mã QR và đến cửa hàng lấy đồ hoặc chọn shipper giao tận nơi nhanh chóng.",
  },
];

export function TgtgHowItWorks() {
  const [currentStep, setCurrentStep] = useState(0);

  const prevStep = () => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const nextStep = () => {
    setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
  };

  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28 lg:py-32 bg-[#00615f] text-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Interactive Step Carousel */}
          <div className="space-y-6 sm:space-y-8 flex flex-col justify-center">
            {/* Pre-title */}
            <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#79e4a7]">
              Quy trình đơn giản &amp; minh bạch
            </p>

            {/* Step Heading */}
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#f9f3f0] select-none transition-all duration-300">
              {STEPS[currentStep].step}
            </h2>

            {/* Step Title & Description */}
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-[#79e4a7]">
                {STEPS[currentStep].title}
              </h3>
              <p className="text-base sm:text-xl text-[#dee3e3] leading-relaxed max-w-lg min-h-[4.5rem]">
                {STEPS[currentStep].description}
              </p>
            </div>

            {/* Carousel Navigation: Prev button + Dots + Next button */}
            <div className="pt-4 flex items-center gap-6">
              {/* Previous button */}
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                aria-label="Bước trước"
                className={`p-2.5 rounded-full border border-white/30 text-white transition-all ${
                  currentStep === 0
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-white/20 active:scale-95 cursor-pointer"
                }`}
              >
                <ChevronLeft className="size-6" />
              </button>

              {/* Step indicator dots */}
              <div className="flex items-center gap-2.5">
                {STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentStep(idx)}
                    aria-label={`Chuyển đến bước ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentStep === idx
                        ? "w-8 bg-[#79e4a7]"
                        : "w-2.5 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>

              {/* Next button */}
              <button
                type="button"
                onClick={nextStep}
                disabled={currentStep === STEPS.length - 1}
                aria-label="Bước tiếp theo"
                className={`p-2.5 rounded-full border border-white/30 text-white transition-all ${
                  currentStep === STEPS.length - 1
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-white/20 active:scale-95 cursor-pointer"
                }`}
              >
                <ChevronRight className="size-6" />
              </button>
            </div>
          </div>

          {/* Right Column: Layered Images with Vietnamese Models */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px] aspect-square">
              {/* Main Phone discovery image */}
              <div className="relative w-[85%] sm:w-[88%] aspect-square ml-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 bg-emerald-950">
                <img
                  src={IMAGES.howItWorksDiscoverApp}
                  alt="Khách hàng khám phá món ăn giải cứu trên ứng dụng FoodSaver"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Overlapping sub-image at bottom-left */}
              <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-6 w-44 sm:w-56 aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-[#00615f] bg-[#013d3c]">
                <img
                  src={IMAGES.howItWorksBakerOffer}
                  alt="Thợ làm bánh Việt Nam chuẩn bị các hộp bánh tươi ngon trao cho khách"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
