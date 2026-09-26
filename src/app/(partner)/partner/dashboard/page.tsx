"use client";

import React from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  DollarSign,
  Leaf,
  ShoppingBag,
  PlusCircle,
  ArrowRight,
  Clock,
} from "lucide-react";
import { MOCK_LISTINGS, MOCK_ORDERS } from "@/mocks/mockData";
import { ExpiryCountdown } from "@/components/common/ExpiryCountdown";

export default function PartnerDashboardPage() {
  const stats = [
    {
      title: "Suất ăn đã cứu",
      value: "142",
      change: "+18% tuần này",
      icon: UtensilsCrossed,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "Doanh thu thu hồi",
      value: "4.850.000đ",
      change: "Từ đồ ăn cận date",
      icon: DollarSign,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: "CO2 giảm phát thải",
      value: "355 kg",
      change: "Tương đương 35 cây xanh",
      icon: Leaf,
      color: "bg-[#79e4a7]/20 text-[#00615f] border-[#79e4a7]/40",
    },
    {
      title: "Đơn mới cần duyệt",
      value: "1 đơn",
      change: "Cần xác nhận chuẩn bị",
      icon: ShoppingBag,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
            Tổng quan đối tác
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Theo dõi hiệu quả giải cứu thực phẩm và đơn hàng trong ngày của quán.
          </p>
        </div>

        <Link
          href="/partner/listings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all shrink-0 active:scale-95"
        >
          <PlusCircle className="size-4" />
          <span>Đăng món giải cứu mới</span>
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500">{stat.title}</span>
                <div className={`p-2 rounded-xl border ${stat.color}`}>
                  <Icon className="size-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-stone-900 tracking-tight">
                  {stat.value}
                </span>
                <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2 Blocks: Món cận date cần lưu ý & Đơn hàng mới */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Món đang bán & sắp hết hạn (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-stone-900">
              Món ăn đang mở bán hôm nay
            </h2>
            <Link
              href="/partner/listings"
              className="text-xs font-bold text-[#00615f] hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {MOCK_LISTINGS.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/60 gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                    <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-stone-900 line-clamp-1">
                      {item.title}
                    </h3>
                    <span className="text-[11px] text-stone-500">
                      Còn {item.quantity} {item.unit} • {item.discountPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <ExpiryCountdown expiryAt={item.expiryAt} compact />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Đơn hàng mới (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-stone-900">
              Đơn hàng cần chuẩn bị
            </h2>
            <Link
              href="/partner/orders"
              className="text-xs font-bold text-[#00615f] hover:underline flex items-center gap-1"
            >
              <span>Xem đơn</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {MOCK_ORDERS.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-800">
                    #{order.orderNumber}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    {order.status}
                  </span>
                </div>
                <p className="font-bold text-xs text-stone-800 line-clamp-1">
                  {order.listingTitle} ({order.quantity} suất)
                </p>
                <p className="text-[11px] text-stone-500">
                  Khách: {order.customerName} • Lấy lúc: <strong>{order.pickupTimeWindow}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
