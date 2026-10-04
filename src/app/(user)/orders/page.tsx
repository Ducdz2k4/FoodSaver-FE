"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  Truck,
  KeyRound,
  PackageCheck,
  CheckCircle2,
} from "lucide-react";
import { useGetMyOrdersQuery } from "@/redux/api/orderApi";
import type { OrderStatus } from "@/types/contract";

type OrderFilter = "ALL" | OrderStatus;

const ORDER_FILTERS: Array<{ value: OrderFilter; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "ACCEPTED", label: "Đang chuẩn bị" },
  { value: "READY", label: "Chờ lấy món" },
  { value: "HANDED_OVER", label: "Cần xác nhận" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export default function OrdersPage() {
  const { data: realOrders, isLoading, isFetching } = useGetMyOrdersQuery();
  const [selectedStatus, setSelectedStatus] = useState<OrderFilter>("ALL");

  const orders = realOrders || [];
  const filteredOrders = useMemo(
    () =>
      selectedStatus === "ALL"
        ? orders
        : orders.filter((order) => order.status === selectedStatus),
    [orders, selectedStatus]
  );

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
              Đơn hàng giải cứu của bạn
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Theo dõi trạng thái chuẩn bị món, mã OTP lấy đồ tại quán và xác nhận hoàn tất đơn.
            </p>
          </div>
          {(isLoading || isFetching) && <Loader2 className="size-5 animate-spin text-[#00615f]" />}
        </div>

        <div
          className="flex gap-2 overflow-x-auto border-b border-stone-200 pb-1 scrollbar-none"
          role="tablist"
          aria-label="Lọc trạng thái đơn hàng"
        >
          {ORDER_FILTERS.map((filter) => {
            const isSelected = selectedStatus === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedStatus(filter.value)}
                className={`shrink-0 border-b-2 px-3 py-2 text-xs sm:text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00615f]/40 ${
                  isSelected
                    ? "border-[#00615f] text-[#00615f]"
                    : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isPickup = order.fulfillmentType === "PICKUP" || order.fulfillmentType === "STORE_PICKUP";
              const isOnline = order.paymentMethod === "ONLINE" || order.paymentMethod === "SYSTEM_QR";

              return (
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
                      <span className="text-stone-300">•</span>
                      <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                        {isPickup ? (
                          <>
                            <ShoppingBag className="size-3.5 text-[#00615f]" /> Tới lấy tại quầy
                          </>
                        ) : (
                          <>
                            <Truck className="size-3.5 text-[#00615f]" /> Quán giao hàng
                          </>
                        )}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold w-fit ${
                        order.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : order.status === "AWAITING_PAYMENT"
                          ? "bg-orange-100 text-orange-800"
                          : order.status === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.status === "ACCEPTED" || order.status === "PREPARING"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.status === "READY"
                          ? "bg-teal-100 text-teal-800"
                          : order.status === "HANDED_OVER"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "COMPLETED"
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {order.status === "PENDING" && "Chờ quán xác nhận"}
                      {order.status === "AWAITING_PAYMENT" && "Chờ thanh toán online"}
                      {order.status === "PAID" && "Đã thanh toán (Ký quỹ)"}
                      {(order.status === "ACCEPTED" || order.status === "PREPARING") && "✓ Quán đang chuẩn bị món"}
                      {order.status === "READY" && "✓ Món đã sẵn sàng - Hãy đến lấy"}
                      {order.status === "HANDED_OVER" && "⚡ Quán đã giao - Chờ bạn xác nhận"}
                      {order.status === "COMPLETED" && "✓ Đã nhận thành công"}
                      {order.status === "CANCELLED" && "✕ Đã hủy đơn"}
                      {order.status === "REJECTED" && "✕ Quán từ chối"}
                      {order.status === "EXPIRED" && "✕ Quá hạn giữ món (No-Show)"}
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

                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className="font-bold text-stone-900 text-sm sm:text-base line-clamp-1">
                        {order.listingTitle}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-1">
                        {order.partnerName} • {order.partnerAddress}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-500">
                        <span>Số lượng: <strong className="text-stone-800">{order.quantity} suất</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[#00615f] font-bold">
                          <Clock className="size-3.5" /> Hẹn: {order.pickupTimeWindow}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base sm:text-lg font-black text-[#00615f] block">
                        {order.totalPrice.toLocaleString("vi-VN")}đ
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {isOnline ? "Đã ký quỹ" : "Tiền mặt khi nhận"}
                      </span>
                    </div>
                  </div>

                  {/* OTP 6 số hiển thị ngay trên card đối với Store Pickup */}
                  {isPickup && order.pickupOtp && order.status !== "CANCELLED" && order.status !== "COMPLETED" && order.status !== "EXPIRED" && (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold">
                        <KeyRound className="size-4 text-emerald-600" />
                        <span>MÃ OTP LẤY MÓN TẠI QUẦY:</span>
                      </div>
                      <span className="text-xl sm:text-2xl font-mono font-black text-[#00615f] tracking-widest bg-white px-3 py-1 rounded-xl border border-emerald-200 shadow-inner">
                        {order.pickupOtp}
                      </span>
                    </div>
                  )}

                  {/* Action Link */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs text-stone-500">
                      {order.status === "HANDED_OVER" ? (
                        <span className="text-blue-700 font-bold flex items-center gap-1">
                          <PackageCheck className="size-4 text-blue-600" />
                          <span>Quán đã bàn giao món. Vui lòng bấm xem chi tiết để xác nhận hoàn tất.</span>
                        </span>
                      ) : (
                        `Hình thức thanh toán: ${isOnline ? "Trực tuyến (ONLINE)" : "Tiền mặt (CASH)"}`
                      )}
                    </span>

                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-[#00615f] hover:underline"
                    >
                      <span>Xem chi tiết đơn</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center text-stone-500 border border-stone-200/90 space-y-3">
            <ShoppingBag className="size-12 text-stone-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-base text-stone-800">
                Chưa có đơn hàng nào
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Hãy khám phá các món ăn ngon cận date quanh bạn và chung tay giảm lãng phí thực phẩm!
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold shadow-md transition"
            >
              <span>Khám phá món gần bạn</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
