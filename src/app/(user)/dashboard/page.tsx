import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, TrendingUp } from "lucide-react";

export default function UserDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-28 pb-16 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 mb-2 transition">
            <ArrowLeft className="size-3.5" />
            <span>Về trang chủ</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">Dashboard Người Dùng</h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">Theo dõi hoạt động và thông tin tài khoản của bạn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-md border border-stone-200/80 shadow-sm space-y-2">
          <div className="size-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <TrendingUp className="size-5" />
          </div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Tiến trình</p>
          <p className="text-2xl font-bold text-stone-900">85%</p>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-md border border-stone-200/80 shadow-sm space-y-2">
          <div className="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="size-5" />
          </div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Đã hoàn thành</p>
          <p className="text-2xl font-bold text-stone-900">12 mục</p>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-md border border-stone-200/80 shadow-sm space-y-2">
          <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="size-5" />
          </div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Thời gian lưu</p>
          <p className="text-2xl font-bold text-stone-900">3 ngày trước</p>
        </div>
      </div>
    </div>
  );
}

