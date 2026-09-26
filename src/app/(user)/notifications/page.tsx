"use client";

import React, { useState } from "react";
import { Bell, Check, ShoppingBag, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { MOCK_NOTIFICATIONS } from "@/mocks/mockData";
import { NotificationDTO } from "@/types/contract";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDTO[]>(MOCK_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-28 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
              Trung tâm thông báo
            </h1>
            <p className="text-xs sm:text-sm text-stone-500">
              Cập nhật đơn hàng, tình trạng duyệt đối tác và món ngon cận date quanh bạn.
            </p>
          </div>

          <button
            type="button"
            onClick={markAllAsRead}
            className="text-xs font-bold text-[#00615f] hover:underline"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className={`p-5 rounded-3xl border transition cursor-pointer flex items-start gap-4 ${
                !item.read
                  ? "bg-white border-emerald-300 shadow-sm"
                  : "bg-stone-50/80 border-stone-200/70 opacity-80"
              }`}
            >
              <div className="size-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShoppingBag className="size-5" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-900 text-sm">{item.title}</h3>
                  <span className="text-[11px] text-stone-400">
                    {new Date(item.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{item.message}</p>
              </div>

              {!item.read && (
                <span className="size-2.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
