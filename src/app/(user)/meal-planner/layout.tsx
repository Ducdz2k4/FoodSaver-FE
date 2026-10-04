import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { MealPlannerTabs } from "./MealPlannerTabs";

export default function MealPlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f3f0] to-[#fef9f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 space-y-6">
        {/* Top Header */}
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#00615f] transition"
          >
            <ArrowLeft className="size-3.5" />
            <span>Về trang chủ</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00615f]/10 text-[#00615f] text-xs font-bold mb-2">
                <Sparkles className="size-3.5 text-[#00615f]" />
                <span>Ăn ngon · Tiết kiệm · Dinh dưỡng</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight">
                Hôm nay ăn gì<span className="text-[#00615f]">?</span>
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
                Khám phá công thức nấu ăn tiết kiệm, lên kế hoạch thực đơn theo tháng, học hỏi kinh nghiệm đi chợ từ mọi người và nhận tư vấn chi tiêu từ AI.
              </p>
            </div>
          </div>

          {/* Persistent Shared Tab Navigation */}
          <div className="pt-2">
            <MealPlannerTabs />
          </div>
        </div>

        {/* Tab Page Content */}
        <div className="pt-2">{children}</div>
      </div>
    </div>
  );
}
