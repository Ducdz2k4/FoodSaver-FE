"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Calendar as CalendarIcon,
  ChefHat,
  ChevronRight,
  ArrowRight,
  Sliders,
  Eye,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetMonthMealPlansQuery } from "@/redux/api/mealPlannerApi";
import { useChat } from "../ChatContext";
import { formatVND, getDishImage } from "../lib/chatUtils";
import { ChatSessionList } from "./ChatSessionList";
import { ChatConversation } from "./ChatConversation";
import { ChatComposer } from "./ChatComposer";

export function ChatWorkspace() {
  const {
    isTyping,
    createNewSession,
    resetCurrentChat,
    sendMessage,
    isMemoryModalOpen,
    setIsMemoryModalOpen,
    userFacts,
  } = useChat();

  // AI Meal Planner Calendar Query for Interactive Widget
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const { data: monthMealPlansRes } = useGetMonthMealPlansQuery({
    year: currentYear,
    month: currentMonth + 1,
  });

  const monthPlans = useMemo(() => monthMealPlansRes?.data || {}, [monthMealPlansRes?.data]);

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const formatDateKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  const tomorrowDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const tomorrowKey = formatDateKey(tomorrowDate);
  const [todayKey] = useState(() => formatDateKey(new Date()));

  const featuredDateInfo = useMemo(() => {
    if (monthPlans[tomorrowKey] && Object.keys(monthPlans[tomorrowKey]).length > 0) {
      return {
        dateKey: tomorrowKey,
        label: "Ngày mai",
        displayDate: `${pad2(tomorrowDate.getDate())}/${pad2(tomorrowDate.getMonth() + 1)}`,
        plan: monthPlans[tomorrowKey],
      };
    }
    if (monthPlans[todayKey] && Object.keys(monthPlans[todayKey]).length > 0) {
      const today = new Date();
      return {
        dateKey: todayKey,
        label: "Hôm nay",
        displayDate: `${pad2(today.getDate())}/${pad2(today.getMonth() + 1)}`,
        plan: monthPlans[todayKey],
      };
    }
    const sortedDates = Object.keys(monthPlans).sort();
    const nextDate = sortedDates.find((d) => d >= todayKey && Object.keys(monthPlans[d]).length > 0);
    if (nextDate) {
      const [y, m, d] = nextDate.split("-");
      return {
        dateKey: nextDate,
        label: `Ngày ${d}/${m}`,
        displayDate: `${d}/${m}`,
        plan: monthPlans[nextDate],
      };
    }
    if (sortedDates.length > 0) {
      const lastDate = sortedDates[sortedDates.length - 1];
      const [y, m, d] = lastDate.split("-");
      return {
        dateKey: lastDate,
        label: `Ngày ${d}/${m}`,
        displayDate: `${d}/${m}`,
        plan: monthPlans[lastDate],
      };
    }
    return {
      dateKey: tomorrowKey,
      label: "Ngày mai",
      displayDate: `${pad2(tomorrowDate.getDate())}/${pad2(tomorrowDate.getMonth() + 1)}`,
      plan: null,
    };
  }, [monthPlans, tomorrowKey, todayKey, tomorrowDate]);

  const featuredSlots = useMemo(() => {
    if (!featuredDateInfo.plan) return [];
    const list: Array<{
      slotKey: "breakfast" | "lunch" | "dinner" | "snack";
      label: string;
      icon: string;
      data: any;
    }> = [];

    if (featuredDateInfo.plan.breakfast) {
      list.push({ slotKey: "breakfast", label: "Sáng", icon: "🌅", data: featuredDateInfo.plan.breakfast });
    }
    if (featuredDateInfo.plan.lunch) {
      list.push({ slotKey: "lunch", label: "Trưa", icon: "☀️", data: featuredDateInfo.plan.lunch });
    }
    if (featuredDateInfo.plan.dinner) {
      list.push({ slotKey: "dinner", label: "Tối", icon: "🌙", data: featuredDateInfo.plan.dinner });
    }
    if (featuredDateInfo.plan.snack) {
      list.push({ slotKey: "snack", label: "Phụ", icon: "🍎", data: featuredDateInfo.plan.snack });
    }
    return list;
  }, [featuredDateInfo]);

  const dayTotalCost = useMemo(() => {
    return featuredSlots.reduce((sum, item) => sum + (item.data?.cost || 0), 0);
  }, [featuredSlots]);

  const dayTotalCalories = useMemo(() => {
    return featuredSlots.reduce((sum, item) => sum + (item.data?.calories || 0), 0);
  }, [featuredSlots]);

  return (
    <div className="space-y-4">
      {/* ══════ MAIN GRID: 4 COLS INTERACTIVE SIDEBAR + 8 COLS CHAT ══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Chat Sessions History + AI Meal Plan Interactive Widget + Memory */}
        <div className="lg:col-span-4 space-y-4">
          {/* SECTION 1: LỊCH SỬ TRÒ CHUYỆN (SESSIONS MANAGER) */}
          <ChatSessionList />

          {/* SECTION 2: WIDGET KẾ HOẠCH ĂN UỐNG AI GẦN NHẤT */}
          <div className="rounded-2xl bg-white border border-stone-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 uppercase tracking-wider">
                <Sparkles className="size-3.5 text-[#00615f]" />
                <span>Kế hoạch ăn uống AI</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#00615f] border border-emerald-200/80">
                {featuredDateInfo.label} · {featuredDateInfo.displayDate}
              </span>
            </div>

            {featuredSlots.length > 0 ? (
              <div className="space-y-2.5">
                {/* Daily Total Summary Strip */}
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-xs">
                  <span className="font-semibold text-stone-700">Dự kiến ngày:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#00615f]">{formatVND(dayTotalCost)}</span>
                    <span className="text-[11px] text-stone-500">({dayTotalCalories} kcal)</span>
                  </div>
                </div>

                {/* Slots with authentic food images */}
                <div className="space-y-1.5">
                  {featuredSlots.map((item) => {
                    const dish = item.data;
                    const imgSrc = getDishImage(dish.meal, dish.image);
                    return (
                      <Link
                        key={item.slotKey}
                        href={`/meal-planner/calendar?date=${featuredDateInfo.dateKey}`}
                        className="group flex items-center gap-2.5 p-2 rounded-xl bg-stone-50 hover:bg-emerald-50/70 border border-stone-200/60 hover:border-[#00615f]/40 transition-all cursor-pointer shadow-2xs"
                        title="Bấm để xem chi tiết trên Lịch ăn tháng"
                      >
                        <div className="relative shrink-0 size-11 rounded-lg overflow-hidden bg-stone-200 border border-stone-200/80">
                          <img
                            src={imgSrc}
                            alt={dish.meal}
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
                            }}
                          />
                          <span className="absolute bottom-0 right-0 px-1 py-0.2 rounded-tl text-[8px] font-bold bg-black/60 text-white backdrop-blur-2xs">
                            {item.icon}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500">
                              {item.label}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-stone-900 group-hover:text-[#00615f] truncate transition-colors">
                            {dish.meal}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-bold text-[#00615f]">
                              {formatVND(dish.cost)}
                            </span>
                            <span className="text-[10px] text-stone-400">·</span>
                            <span className="text-[10px] text-stone-500">
                              {dish.calories} kcal
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="size-4 text-stone-400 group-hover:text-[#00615f] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    );
                  })}
                </div>

                {/* Direct Action Link */}
                <Link
                  href={`/meal-planner/calendar?date=${featuredDateInfo.dateKey}`}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-[#00615f] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <CalendarIcon className="size-3.5 text-[#00615f]" />
                  <span>Mở xem chi tiết Lịch ăn tháng</span>
                  <ArrowRight className="size-3 text-[#00615f]" />
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-stone-200 p-4 text-center space-y-2.5 bg-stone-50/50">
                <div className="size-10 rounded-full bg-emerald-50 text-[#00615f] flex items-center justify-center mx-auto">
                  <ChefHat className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800">Chưa có thực đơn ngày mai</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Nhờ AI lên kế hoạch ăn uống ngon bổ rẻ và đồng bộ 1-chạm vào lịch:
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => sendMessage("Tạo thực đơn ăn chay ngày mai cho t đi")}
                  disabled={isTyping}
                  className="w-full rounded-xl text-xs font-bold gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Sparkles className="size-3.5" />
                  <span>✨ Lên thực đơn ngày mai ngay</span>
                </Button>
              </div>
            )}
          </div>

          {/* SECTION 3: AI MEMORY TRANSPARENCY CARD */}
          <div className="rounded-2xl bg-white border border-stone-200/90 shadow-2xs p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                <Sliders className="size-3.5 text-[#00615f]" />
                <span>Bộ nhớ cá nhân hóa</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#00615f] border border-emerald-200/80">
                {userFacts.length} ký ức
              </span>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              Trợ lý AI tự động ghi nhớ sở thích, xưng hô và ngân sách của bạn để tư vấn phù hợp hơn mà không làm lộ dữ liệu.
            </p>

            <button
              type="button"
              onClick={() => setIsMemoryModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="size-3.5 text-stone-500" />
              <span>Xem những gì bot đã nhớ</span>
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Chat Stream Feed */}
        <div className="lg:col-span-8 flex flex-col h-[680px] rounded-3xl bg-white border border-stone-200/90 shadow-2xs overflow-hidden relative">
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-[#00615f] text-white flex items-center justify-center shadow-2xs">
                <Bot className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-stone-900">
                    Trợ lý Tài chính &amp; Dinh dưỡng FoodSaver
                  </h2>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-[#00615f]">
                    Trợ lý AI
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-stone-500">
                    Trực tuyến · Tư vấn chi tiêu &amp; Suất ăn cận date
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={createNewSession}
                className="p-2 rounded-xl hover:bg-stone-200/60 text-stone-500 hover:text-stone-800 transition cursor-pointer"
                title="Mở đoạn chat mới"
              >
                <Plus className="size-4" />
              </button>
              <button
                type="button"
                onClick={resetCurrentChat}
                className="p-2 rounded-xl hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition cursor-pointer"
                title="Làm mới cuộc hội thoại"
              >
                <RotateCcw className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <ChatConversation />

          {/* Chat Composer */}
          <ChatComposer />
        </div>
      </div>

      {/* ══════ MODAL: USER AI MEMORY TRANSPARENCY ══════ */}
      {isMemoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-stone-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-emerald-50 text-[#00615f] flex items-center justify-center">
                  <Sliders className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900">Bộ nhớ AI của bạn</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMemoryModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Đây là các thông tin và thói quen mà AI đã ghi nhận trong các cuộc hội thoại để cá nhân hóa câu trả lời.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {userFacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  Chưa có thông tin cá nhân nào được lưu.
                </div>
              ) : (
                userFacts.map((fact: any) => (
                  <div
                    key={fact.key}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-stone-800">{fact.key}</p>
                      <p className="text-stone-600 mt-0.5">&quot;{fact.value}&quot;</p>
                    </div>
                    <span className="text-[10px] font-semibold text-[#00615f] bg-emerald-50 px-2 py-0.5 rounded">
                      Độ tin cậy: {Math.round((fact.confidence || 0.9) * 100)}%
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMemoryModalOpen(false)}
                className="rounded-xl px-4 cursor-pointer"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
