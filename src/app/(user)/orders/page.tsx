"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, Clock, MapPin, ArrowRight } from "lucide-react";
import { MOCK_ORDERS } from "@/mocks/mockData";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
            Đơn hàng giải cứu của bạn
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Theo dõi trạng thái chuẩn bị món và mã nhận đồ tại các cửa hàng đối tác.
          </p>
        </div>

        <div className="space-y-4">
          {MOCK_ORDERS.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs sm:text-sm text-[#00615f]">
                    #{order.orderNumber}
                  </span>
                  <span className="text-stone-300">•</span>
                  <span className="text-xs text-stone-500">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 w-fit">
                  ✓ {order.status === "ACCEPTED" ? "Quán đã xác nhận - Chờ lấy" : order.status}
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="size-16 sm:size-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <img
                    src={order.listingImage}
                    alt={order.listingTitle}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <span className="text-xs font-bold text-emerald-700 block">
                    {order.partnerName}
                  </span>
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug">
                    {order.listingTitle}
                  </h3>
                  <p className="text-xs text-stone-500 flex items-center gap-1 pt-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Khung giờ hẹn lấy: <strong>{order.pickupTimeWindow}</strong></span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base sm:text-lg font-black text-[#00615f] block">
                    {order.totalPrice.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-xs text-stone-400">
                    {order.quantity} suất
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-stone-500">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span className="truncate max-w-[200px] sm:max-w-md">
                    {order.partnerAddress}
                  </span>
                </div>

                <Link
                  href={`/orders/${order.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#00615f] hover:underline"
                >
                  <span>Xem mã nhận đồ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
