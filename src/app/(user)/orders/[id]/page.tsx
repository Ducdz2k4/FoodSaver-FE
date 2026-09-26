"use client";

import React, { use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, MapPin, Phone, QrCode } from "lucide-react";
import { MOCK_ORDERS } from "@/mocks/mockData";
import { notFound } from "next/navigation";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const order = MOCK_ORDERS.find((o) => o.id === resolvedParams.id) || MOCK_ORDERS[0];

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-24 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00615f] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Danh sách đơn của bạn
        </Link>

        {/* Card xác nhận thành công */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm text-center space-y-4">
          <div className="size-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#00615f]">
              Đặt Giữ Món Thành Công!
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Mã đơn hàng của bạn: <strong className="font-mono text-stone-900">#{order.orderNumber}</strong>
            </p>
          </div>

          {/* Khối Mã QR nhận đồ */}
          <div className="bg-stone-50 border border-stone-200 p-6 rounded-3xl max-w-xs mx-auto space-y-3">
            <div className="size-44 bg-white p-3 mx-auto rounded-2xl border border-stone-300 shadow-inner flex flex-col items-center justify-center">
              <QrCode className="size-32 text-stone-800" />
              <span className="font-mono text-[10px] font-bold text-stone-500 tracking-widest mt-1">
                {order.orderNumber}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Đưa mã QR này cho nhân viên quán khi đến lấy đồ
            </p>
          </div>

          {/* Chi tiết đơn */}
          <div className="text-left border-t border-stone-100 pt-5 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1">
              <span className="text-stone-500">Món ăn:</span>
              <span className="font-bold text-stone-900 text-right">{order.listingTitle}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-stone-500">Số lượng:</span>
              <span className="font-bold text-stone-900">{order.quantity} phần</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-stone-500">Giờ hẹn lấy:</span>
              <span className="font-bold text-[#00615f]">{order.pickupTimeWindow}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-stone-500">Địa chỉ quán:</span>
              <span className="font-bold text-stone-900 text-right">{order.partnerAddress}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-stone-100 text-base font-black">
              <span>Thanh toán tại quán:</span>
              <span className="text-[#00615f]">{order.totalPrice.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
