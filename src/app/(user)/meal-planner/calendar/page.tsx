"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Flame,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
  Sparkles,
  Search,
  Check,
  Utensils,
} from "lucide-react";
import {
  useGetMonthMealPlansQuery,
  useGetMonthSummaryQuery,
  useGetRecipesQuery,
  useSaveMealPlanSlotMutation,
  useDeleteMealPlanSlotMutation,
  MealPlanSlotDTO,
  RecipeDTO,
} from "@/redux/api/mealPlannerApi";
import { toast } from "sonner";

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const SLOT_META = {
  breakfast: { label: "Sáng", icon: "🌅" },
  lunch: { label: "Trưa", icon: "☀️" },
  dinner: { label: "Tối", icon: "🌙" },
  snack: { label: "Snack", icon: "🍎" },
} as const;

function formatVND(n: number) {
  return (n || 0).toLocaleString("vi-VN") + "đ";
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function DishThumbnail({ src, alt, size = "md" }: { src?: string | null; alt: string; size?: "sm" | "md" | "lg" }) {
  const [hasError, setHasError] = useState(false);
  const isUrl = src && (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/"));

  const sizeClasses = {
    sm: "size-8 rounded-lg text-sm",
    md: "size-10 rounded-lg text-base",
    lg: "size-14 rounded-xl text-xl",
  }[size];

  if (!isUrl || hasError) {
    return (
      <div className={`${sizeClasses} bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200 select-none text-stone-400`}>
        {src && !isUrl ? src : "🍲"}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} overflow-hidden shrink-0 border border-stone-200/80 relative bg-stone-100`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

export default function MealCalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Suggested Shelf Filter state
  const [shelfCategory, setShelfCategory] = useState("all");
  const [shelfSearch, setShelfSearch] = useState("");
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  // API Hooks
  const { data: plansRes, isLoading: isPlansLoading } = useGetMonthMealPlansQuery({
    year,
    month: month + 1,
  });
  const { data: summaryRes } = useGetMonthSummaryQuery({
    year,
    month: month + 1,
  });
  const { data: recipesRes, isLoading: isRecipesLoading } = useGetRecipesQuery({
    category: shelfCategory === "all" ? undefined : shelfCategory,
    search: shelfSearch || undefined,
  });

  const [saveSlot, { isLoading: isSaving }] = useSaveMealPlanSlotMutation();
  const [deleteSlot] = useDeleteMealPlanSlotMutation();

  const plans = plansRes?.data || {};
  const recipes = recipesRes?.data || [];
  const summary = summaryRes?.data || {
    totalCost: 0,
    totalCalories: 0,
    plannedDays: 0,
    ingredientCount: 0,
    shoppingList: [],
  };

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
    setSelectedDay(null);
  };

  const selectedKey = selectedDay ? dateKey(year, month, selectedDay) : null;
  const selectedPlan = selectedKey ? plans[selectedKey] : null;

  // 1-Click Quick Add Dish from Shelf
  const handleQuickAddDish = async (
    dish: RecipeDTO,
    slot: "breakfast" | "lunch" | "dinner" | "snack"
  ) => {
    const targetDay = selectedDay || today.getDate();
    const targetKey = dateKey(year, month, targetDay);

    const slotNames = {
      breakfast: "Bữa sáng",
      lunch: "Bữa trưa",
      dinner: "Bữa tối",
      snack: "Ăn vặt",
    };

    const imageUrl = dish.partnerImage || dish.image;
    const ingNames = Array.isArray(dish.ingredients)
      ? dish.ingredients.map((i) => i.name)
      : [];

    try {
      await saveSlot({
        date: targetKey,
        slot,
        meal: dish.name,
        image: imageUrl,
        calories: Number(dish.calories) || 0,
        cost: Number(dish.cost) || 0,
        ingredients: ingNames,
      }).unwrap();

      toast.success(
        `Đã thêm "${dish.name}" vào ${slotNames[slot]} ngày ${targetDay}/${month + 1}!`
      );
      if (!selectedDay) {
        setSelectedDay(targetDay);
      }
    } catch {
      toast.error("Không thể lưu món ăn. Vui lòng thử lại");
    }
  };

  const handleDeleteSlot = async (slotId?: string, slotName?: string) => {
    if (!slotId) return;
    try {
      await deleteSlot(slotId).unwrap();
      toast.success(`Đã xóa món khỏi ${slotName || "kế hoạch"}`);
    } catch {
      toast.error("Không thể xóa bữa ăn");
    }
  };

  return (
    <div className="space-y-6">
      {/* ══════ TOP SECTION: CALENDAR + DAY DETAIL ══════ */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* ═══ LEFT: CALENDAR ═══ */}
        <div className="lg:w-[420px] shrink-0">
          <div className="rounded-2xl bg-white border border-stone-200/80 shadow-xs overflow-visible relative">
            {/* Month navigation */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-100">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-stone-100 transition text-stone-600">
                <ChevronLeft className="size-4" />
              </button>
              <div>
                <h2 className="text-sm font-bold text-stone-900 text-center">
                  {MONTHS[month]} {year}
                </h2>
                <p className="text-[10px] text-stone-400 text-center">Rê chuột vào ngày để xem thực đơn</p>
              </div>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-stone-100 transition text-stone-600">
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 text-center px-2.5 pt-2.5">
              {DAYS.map((d) => (
                <div key={d} className="text-[10px] font-semibold text-stone-400 uppercase py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 px-2.5 pb-3.5 relative">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const key = dateKey(year, month, day);
                const dayPlan = plans[key] || {};
                const planKeys = (["breakfast", "lunch", "dinner", "snack"] as const).filter(
                  (k) => Boolean(dayPlan[k])
                );
                const hasPlan = planKeys.length > 0;
                const isToday = isCurrentMonth && day === today.getDate();
                const isSelected = selectedDay === day;
                const isHovered = hoveredDay === day;

                const colIdx = (firstDay + i) % 7;
                const tooltipAlign =
                  colIdx >= 5 ? "right-0" : colIdx <= 1 ? "left-0" : "left-1/2 -translate-x-1/2";

                return (
                  <div
                    key={day}
                    className="relative"
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <button
                      onClick={() => setSelectedDay(day)}
                      className={`w-full aspect-square rounded-xl text-xs font-medium transition-all flex flex-col items-center justify-center relative p-1 ${
                        isSelected
                          ? "bg-[#00615f] text-white shadow-xs font-semibold z-10 scale-105"
                          : isToday
                          ? "bg-stone-100 text-[#00615f] font-bold border border-[#00615f]/30"
                          : "text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      <span>{day}</span>

                      {/* Clean Mini Indicators */}
                      {hasPlan && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {planKeys.slice(0, 3).map((slotKey) => (
                            <span
                              key={slotKey}
                              className="text-[8px] leading-none"
                              title={SLOT_META[slotKey].label}
                            >
                              {SLOT_META[slotKey].icon}
                            </span>
                          ))}
                          {planKeys.length > 3 && (
                            <span className="text-[7px] font-bold text-stone-400">
                              +{planKeys.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>

                    {/* ══════ CALM RICH HOVER TOOLTIP ══════ */}
                    {isHovered && hasPlan && (
                      <div
                        className={`absolute bottom-full mb-2 z-50 ${tooltipAlign} w-72 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95`}
                      >
                        <div className="rounded-xl bg-white p-3.5 shadow-xl border border-stone-200/90 text-left space-y-2">
                          {/* Tooltip Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                            <div>
                              <p className="text-xs font-bold text-stone-900">
                                Ngày {day} {MONTHS[month]}
                              </p>
                              <p className="text-[10px] text-stone-400">
                                {planKeys.length} bữa đã lên lịch
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-[#00615f]">
                                {formatVND(
                                  planKeys.reduce((sum, k) => sum + (dayPlan[k]?.cost || 0), 0)
                                )}
                              </span>
                              <p className="text-[10px] text-stone-500 font-medium">
                                {planKeys
                                  .reduce((sum, k) => sum + (dayPlan[k]?.calories || 0), 0)
                                  .toLocaleString()}{" "}
                                kcal
                              </p>
                            </div>
                          </div>

                          {/* Planned slots list (Only render what exists!) */}
                          <div className="space-y-1.5">
                            {planKeys.map((k) => {
                              const slotData = dayPlan[k] as MealPlanSlotDTO;
                              const meta = SLOT_META[k];
                              return (
                                <div
                                  key={k}
                                  className="flex items-center gap-2 p-1.5 rounded-lg bg-stone-50 border border-stone-100"
                                >
                                  <DishThumbnail
                                    src={slotData.image}
                                    alt={slotData.meal}
                                    size="sm"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-wide">
                                      {meta.icon} {meta.label}
                                    </p>
                                    <p className="text-xs font-semibold text-stone-900 truncate">
                                      {slotData.meal}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-[10px] font-medium text-stone-500">
                                      {slotData.calories} kcal
                                    </p>
                                    <p className="text-[10px] font-bold text-stone-900">
                                      {formatVND(slotData.cost)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unified Monthly summary */}
          <div className="mt-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-xs p-4 space-y-3">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Tổng kết tháng {month + 1}
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <p className="text-[10px] text-stone-500 font-medium">Chi phí ước tính</p>
                <p className="text-base font-bold text-[#00615f]">{formatVND(summary.totalCost)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <p className="text-[10px] text-stone-500 font-medium">Tổng calo</p>
                <p className="text-base font-bold text-stone-800">
                  {(summary.totalCalories || 0).toLocaleString()} kcal
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <p className="text-[10px] text-stone-500 font-medium">Ngày đã lên lịch</p>
                <p className="text-base font-bold text-stone-800">
                  {summary.plannedDays} / {daysInMonth} ngày
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <p className="text-[10px] text-stone-500 font-medium">Nguyên liệu cần mua</p>
                <p className="text-base font-bold text-stone-800">
                  {summary.ingredientCount} loại
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: DAY DETAIL ═══ */}
        <div className="flex-1">
          {isPlansLoading ? (
            <div className="rounded-2xl bg-white border border-stone-200/80 shadow-xs p-12 text-center">
              <Loader2 className="size-6 mx-auto animate-spin text-[#00615f] mb-2" />
              <p className="text-xs text-stone-500">Đang tải lịch ăn uống...</p>
            </div>
          ) : selectedDay && selectedPlan && Object.keys(selectedPlan).length > 0 ? (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-stone-200/80">
                <div>
                  <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Utensils className="size-4 text-[#00615f]" />
                    Thực đơn Ngày {selectedDay} {MONTHS[month]} {year}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Bấm các nút chọn ở danh sách món bên dưới để đổi món nhanh
                  </p>
                </div>
              </div>

              {/* Meal cards (Unified calm styling) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["breakfast", "lunch", "dinner", "snack"] as const).map((slotKey) => {
                  const data = selectedPlan[slotKey] as MealPlanSlotDTO | undefined;
                  if (!data) return null;
                  const meta = SLOT_META[slotKey];
                  const ings = Array.isArray(data.ingredients) ? data.ingredients : [];

                  return (
                    <div
                      key={slotKey}
                      className="rounded-xl bg-white border border-stone-200/80 shadow-xs p-3.5 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-2.5">
                        <DishThumbnail src={data.image} alt={data.meal} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                            {meta.icon} {meta.label}
                          </p>
                          <h3 className="text-xs font-bold text-stone-900 truncate mt-0.5">{data.meal}</h3>
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <span className="text-stone-500 text-[11px] font-medium">
                              {data.calories} kcal
                            </span>
                            <span className="text-stone-300">·</span>
                            <span className="font-bold text-stone-900 text-xs">
                              {formatVND(data.cost)}
                            </span>
                          </div>
                        </div>
                        {data.id && (
                          <button
                            onClick={() => handleDeleteSlot(data.id, meta.label)}
                            className="p-1 rounded-md hover:bg-stone-100 text-stone-400 hover:text-rose-500 transition shrink-0"
                            title={`Xóa ${meta.label}`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>

                      {ings.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1 pt-2 border-t border-stone-100">
                          {ings.map((ing, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px]"
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Day cost & nutrition summary */}
              <div className="rounded-xl bg-stone-50 border border-stone-200/80 p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-stone-500">Tổng chi tiêu ngày {selectedDay}</p>
                    <p className="text-lg font-bold text-[#00615f]">
                      {formatVND(
                        [selectedPlan.breakfast, selectedPlan.lunch, selectedPlan.dinner, selectedPlan.snack]
                          .filter(Boolean)
                          .reduce((sum, s) => sum + (s?.cost || 0), 0)
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-medium text-stone-500">Tổng năng lượng</p>
                    <p className="text-lg font-bold text-stone-800">
                      {[selectedPlan.breakfast, selectedPlan.lunch, selectedPlan.dinner, selectedPlan.snack]
                        .filter(Boolean)
                        .reduce((sum, s) => sum + (s?.calories || 0), 0)
                        .toLocaleString()}{" "}
                      kcal
                    </p>
                  </div>
                </div>
              </div>

              {/* Shopping list banner (Calm) */}
              <div className="rounded-xl bg-white border border-stone-200/80 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="size-5 text-[#00615f]" />
                  <div>
                    <p className="text-xs font-semibold text-stone-800">
                      Danh sách đi chợ tháng {month + 1}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      {summary.ingredientCount} nguyên liệu từ các món đã lên lịch
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsShoppingListOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-[#00615f] text-white text-xs font-medium transition-colors"
                >
                  Xem danh sách
                </button>
              </div>
            </div>
          ) : selectedDay ? (
            <div className="rounded-2xl bg-white border border-stone-200/80 shadow-xs p-8 text-center space-y-2">
              <CalendarIcon className="size-8 mx-auto text-stone-300" />
              <p className="text-sm font-semibold text-stone-800">
                Chưa có món nào cho ngày {selectedDay} {MONTHS[month]}
              </p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Chọn món từ danh sách gợi ý bên dưới để thêm nhanh vào ngày này.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-stone-200/80 shadow-xs p-8 text-center">
              <CalendarIcon className="size-8 mx-auto text-stone-300 mb-1.5" />
              <p className="text-sm font-medium text-stone-700">Chọn một ngày trên lịch</p>
              <p className="text-xs text-stone-400">để xem chi tiết hoặc thêm thực đơn</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════ BOTTOM SECTION: QUICK DISH RECOMMENDATION SHELF ══════ */}
      <section className="rounded-2xl bg-white border border-stone-200/80 shadow-xs p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Gợi ý món ăn · Chọn nhanh cho Ngày {selectedDay || today.getDate()} {MONTHS[month]}
            </h3>
            <p className="text-xs text-stone-500">
              Bấm 1-chạm vào bữa bạn muốn lên lịch cho ngày đang chọn
            </p>
          </div>

          {/* Quick search input */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-stone-400" />
            <input
              type="text"
              value={shelfSearch}
              onChange={(e) => setShelfSearch(e.target.value)}
              placeholder="Tìm món (bò, cá, xôi...)"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#00615f] focus:border-[#00615f]"
            />
          </div>
        </div>

        {/* Shelf Category Tabs (Neutral) */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { key: "all", label: "Tất cả" },
            { key: "an-sang", label: "Ăn sáng" },
            { key: "com", label: "Cơm & Mặn" },
            { key: "bun-pho", label: "Bún / Phở" },
            { key: "canh", label: "Món Canh" },
            { key: "an-vat", label: "Ăn vặt" },
            { key: "chay", label: "Món Chay" },
            { key: "salad", label: "Salad" },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setShelfCategory(cat.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                shelfCategory === cat.key
                  ? "bg-[#00615f] text-white shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Dish Cards Grid */}
        {isRecipesLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="size-6 mx-auto animate-spin text-[#00615f] mb-2" />
            <p className="text-xs text-stone-500">Đang tải món ăn gợi ý...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            Không tìm thấy món phù hợp với từ khóa này.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
            {recipes.map((dish) => {
              const photo = dish.partnerImage || dish.image;
              return (
                <div
                  key={dish.id}
                  className="group rounded-xl bg-white border border-stone-200/80 shadow-xs hover:shadow-sm transition-all duration-150 p-3 flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail & Title */}
                    <div className="flex items-start gap-2.5 mb-2">
                      <DishThumbnail src={photo} alt={dish.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-stone-900 truncate group-hover:text-[#00615f] transition-colors">
                          {dish.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px]">
                          <span className="text-stone-500 font-medium">
                            {dish.calories} kcal
                          </span>
                          <span className="text-stone-300">·</span>
                          <span className="font-bold text-stone-900">
                            ~{formatVND(dish.cost)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {dish.partnerStoreName && (
                      <p className="text-[10px] text-stone-500 bg-stone-50 px-2 py-0.5 rounded-md mb-2 truncate">
                        🏪 {dish.partnerStoreName}
                      </p>
                    )}
                  </div>

                  {/* Unified Segmented Action Bar (No rainbow buttons!) */}
                  <div className="mt-2 pt-2 border-t border-stone-100">
                    <p className="text-[9px] font-semibold text-stone-400 mb-1 text-center">
                      Thêm vào ngày {selectedDay || today.getDate()}:
                    </p>
                    <div className="grid grid-cols-4 gap-1 p-0.5 bg-stone-100 rounded-lg">
                      <button
                        onClick={() => handleQuickAddDish(dish, "breakfast")}
                        disabled={isSaving}
                        className="py-1 text-[10px] font-semibold text-stone-700 hover:bg-[#00615f] hover:text-white rounded-md transition-colors text-center"
                        title="Thêm vào Bữa Sáng"
                      >
                        + Sáng
                      </button>
                      <button
                        onClick={() => handleQuickAddDish(dish, "lunch")}
                        disabled={isSaving}
                        className="py-1 text-[10px] font-semibold text-stone-700 hover:bg-[#00615f] hover:text-white rounded-md transition-colors text-center"
                        title="Thêm vào Bữa Trưa"
                      >
                        + Trưa
                      </button>
                      <button
                        onClick={() => handleQuickAddDish(dish, "dinner")}
                        disabled={isSaving}
                        className="py-1 text-[10px] font-semibold text-stone-700 hover:bg-[#00615f] hover:text-white rounded-md transition-colors text-center"
                        title="Thêm vào Bữa Tối"
                      >
                        + Tối
                      </button>
                      <button
                        onClick={() => handleQuickAddDish(dish, "snack")}
                        disabled={isSaving}
                        className="py-1 text-[10px] font-semibold text-stone-700 hover:bg-[#00615f] hover:text-white rounded-md transition-colors text-center"
                        title="Thêm vào Bữa Ăn Vặt"
                      >
                        + Snack
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════ SHOPPING LIST MODAL ══════ */}
      {isShoppingListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl border border-stone-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-4 text-[#00615f]" />
                <h3 className="font-bold text-sm text-stone-900">
                  Danh sách nguyên liệu tháng {month + 1}
                </h3>
              </div>
              <button
                onClick={() => setIsShoppingListOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Tổng hợp {summary.shoppingList.length} nguyên liệu từ các bữa ăn bạn đã lên lịch:
            </p>

            <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
              {summary.shoppingList.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-stone-50 text-xs text-stone-700"
                >
                  <Check className="size-3 text-[#00615f]" />
                  <span>{ing}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setIsShoppingListOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-[#00615f] text-white text-xs font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
