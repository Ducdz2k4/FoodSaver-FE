"use client";

import React from "react";
import Link from "next/link";
import { Clock, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export default function PartnerPendingPage() {
  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-28 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-stone-200/90 shadow-sm text-center space-y-5">
          <div className="size-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto animate-pulse">
            <Clock className="size-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">
              Trạng thái: Đang xét duyệt
            </span>
            <h1 className="text-2xl font-black text-[#00615f]">
              Hồ Sơ Của Bạn Đang Được Thẩm Định!
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
              Ban Quản Trị FoodSaver đang tiến hành kiểm tra tính hợp lệ của Giấy phép kinh doanh và Chứng nhận Vệ sinh ATTP.
            </p>
          </div>

          {/* Timeline 3 bước */}
          <div className="bg-stone-50 border border-stone-200 p-6 rounded-3xl text-left space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <strong className="text-stone-900 block">Bước 1: Tiếp nhận hồ sơ</strong>
                <span className="text-stone-500">Đã hoàn tất tiếp nhận dữ liệu và chứng từ</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="size-5 text-amber-600 shrink-0 animate-spin" />
              <div className="text-xs">
                <strong className="text-amber-800 block">Bước 2: Đối chiếu pháp lý & Chứng nhận ATTP</strong>
                <span className="text-amber-700">Đang thực hiện (Thời gian ước tính: 2 - 24 giờ)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 opacity-50">
              <ShieldCheck className="size-5 text-stone-400 shrink-0" />
              <div className="text-xs">
                <strong className="text-stone-700 block">Bước 3: Mở khóa Partner Center</strong>
                <span className="text-stone-500">Bắt đầu đăng bán thực phẩm cứu trợ</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-2.5 rounded-full bg-[#00615f] hover:bg-[#089184] text-white font-bold text-xs shadow-md transition"
            >
              Về trang chủ khám phá
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
