"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Store,
  CheckCircle2,
} from "lucide-react";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "@/redux/api/notificationApi";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { data: realNotifications, isLoading, isFetching } = useGetNotificationsQuery();
  const [markAsReadMutation] = useMarkAsReadMutation();
  const [markAllAsReadMutation] = useMarkAllAsReadMutation();

  const notifications = realNotifications || [];

  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation().unwrap();
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc.");
    } catch {
      toast.info("Đã đánh dấu tất cả thông báo là đã đọc.");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await markAsReadMutation(id).unwrap();
    } catch {
      // Ignored
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "PICKUP_REMINDER":
        return (
          <div className="size-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="size-5" />
          </div>
        );
      case "NEW_LISTING_FOLLOWED":
      case "NEW_LISTING_NEARBY":
        return (
          <div className="size-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Store className="size-5" />
          </div>
        );
      case "FOOD_SAFETY_UPDATE":
        return (
          <div className="size-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5" />
          </div>
        );
      case "ORDER_STATUS_UPDATED":
      default:
        return (
          <div className="size-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShoppingBag className="size-5" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-28 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
              Trung tâm thông báo
            </h1>
            <p className="text-xs sm:text-sm text-stone-500">
              Cập nhật đơn hàng, nhắc giờ lấy món và ưu đãi từ quán yêu thích quanh bạn.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(isLoading || isFetching) && <Loader2 className="size-4 animate-spin text-[#00615f]" />}
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs font-bold text-[#00615f] hover:underline cursor-pointer"
            >
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        </div>

        {notifications.length === 0 && !isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
            <div className="size-12 rounded-full bg-emerald-50 text-[#00615f] flex items-center justify-center mx-auto">
              <Bell className="size-6 text-[#00615f]" />
            </div>
            <h3 className="font-bold text-stone-800 text-base">Bạn chưa có thông báo nào</h3>
            <p className="text-xs text-stone-500">Các cập nhật quan trọng về đơn hàng và khung giờ lấy món sẽ hiển thị tại đây.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => {
              const payload = item.payload || {};
              const orderId = payload.orderId;
              const actionUrl = payload.actionUrl || (orderId ? `/orders/${orderId}` : null);

              return (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-5 rounded-3xl border transition flex items-start gap-4 ${
                    !item.read
                      ? "bg-white border-emerald-300 shadow-sm"
                      : "bg-stone-50/80 border-stone-200/70 opacity-85"
                  }`}
                >
                  {getIconForType(item.type)}

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-stone-900 text-sm">{item.title}</h3>
                        {item.type === "PICKUP_REMINDER" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Nhắc giờ hẹn
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-400 shrink-0">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">{item.message}</p>

                    {/* Quick CTA Actions */}
                    {actionUrl && (
                      <div className="pt-1">
                        <Link
                          href={actionUrl}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold shadow-xs transition"
                        >
                          <span>Xem đơn & OTP nhận món</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {!item.read && (
                    <span className="size-2.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
