"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, Clock, Phone, MapPin } from "lucide-react";
import { MOCK_ORDERS } from "@/mocks/mockData";
import { OrderDTO } from "@/types/contract";

export default function PartnerOrdersPage() {
  const [orders, setOrders] = useState<OrderDTO[]>(MOCK_ORDERS);

  const updateStatus = (id: string, newStatus: OrderDTO["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    alert(`Đã cập nhật đơn hàng sang: ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
          Đơn hàng cứu trợ từ khách
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Xác nhận tiếp nhận đơn và bàn giao khi khách mang mã QR đến lấy.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs sm:text-sm text-[#00615f]">
                  #{order.orderNumber}
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-xs text-stone-500">
                  {new Date(order.createdAt).toLocaleTimeString("vi-VN")}
                </span>
              </div>

              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold w-fit ${
                  order.status === "PENDING"
                    ? "bg-amber-100 text-amber-800"
                    : order.status === "ACCEPTED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {order.status === "PENDING" && "Chờ xác nhận"}
                {order.status === "ACCEPTED" && "Đã nhận chuẩn bị"}
                {order.status === "COMPLETED" && "Đã giao thành công"}
                {order.status === "REJECTED" && "Đã từ chối"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                  {order.listingTitle} ({order.quantity} suất)
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  <span>Khách: <strong className="text-stone-700">{order.customerName}</strong></span>
                  <span>SĐT: <strong className="text-stone-700">{order.customerPhone}</strong></span>
                  <span className="flex items-center gap-1 text-[#00615f] font-bold">
                    <Clock className="size-3.5" /> Hẹn lấy: {order.pickupTimeWindow}
                  </span>
                </div>
                {order.customerNotes && (
                  <p className="text-xs text-amber-700 italic bg-amber-50 p-2 rounded-xl border border-amber-100 mt-1">
                    Ghi chú: "{order.customerNotes}"
                  </p>
                )}
              </div>

              <div className="text-right sm:shrink-0">
                <span className="text-base sm:text-lg font-black text-[#00615f] block">
                  {order.totalPrice.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-xs text-stone-400">Thu tiền mặt tại quầy</span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              {order.status === "PENDING" && (
                <>
                  <button
                    type="button"
                    onClick={() => updateStatus(order.id, "REJECTED")}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
                  >
                    Từ chối (Hết hàng)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(order.id, "ACCEPTED")}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00615f] hover:bg-[#089184] text-white shadow-sm transition"
                  >
                    ✓ Chấp nhận chuẩn bị
                  </button>
                </>
              )}

              {order.status === "ACCEPTED" && (
                <button
                  type="button"
                  onClick={() => updateStatus(order.id, "COMPLETED")}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Đã giao đồ cho khách</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
