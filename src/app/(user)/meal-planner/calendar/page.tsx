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
  breakfast: { label: "Sáng", icon: "🌅", color: "emerald" },
  lunch: { label: "Trưa", icon: "☀️", color: "orange" },
  dinner: { label: "Tối", icon: "🌙", color: "sky" },
  snack: { label: "Snack", icon: "🍎", color: "violet" },
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
    md: "size-11 rounded-xl text-lg",
    lg: "size-16 rounded-xl text-2xl",
  }[size];

  if (!isUrl || hasError) {
    return (
      <div className={`${sizeClasses} bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200 select-none`}>
        {src && !isUrl ? src : "🍲"}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} overflow-hidden shrink-0 border border-stone-200 relative bg-stone-100`}>
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
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ═══ LEFT: CALENDAR ═══ */}
        <div className="lg:w-[440px] shrink-0">
          <div className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm overflow-visible relative">
            {/* Month navigation */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-stone-100 transition">
                <ChevronLeft className="size-4 text-stone-600" />
              </button>
              <div>
                <h2 className="text-sm font-black text-stone-900 text-center">
                  {MONTHS[month]} {year}
                </h2>
                <p className="text-[10px] text-stone-400 text-center">Rê chuột vào ngày để xem thực đơn</p>
              </div>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-stone-100 transition">
                <ChevronRight className="size-4 text-stone-600" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 text-center px-3 pt-3">
              {DAYS.map((d) => (
                <div key={d} className="text-[10px] font-bold text-stone-400 uppercase py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 px-3 pb-4 relative">
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

                // Column position for smart tooltip placement (0 to 6)
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
                      className={`w-full aspect-square rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center relative p-1 ${
                        isSelected
                          ? "bg-[#00615f] text-white shadow-md scale-105 z-10"
                          : isToday
                          ? "bg-[#00615f]/10 text-[#00615f] font-black border border-[#00615f]/30"
                          : "text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      <span>{day}</span>

                      {/* Mini Slot Badges */}
                      {hasPlan && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {planKeys.slice(0, 3).map((slotKey) => (
                            <span
                              key={slotKey}
                              className="text-[9px] leading-none"
                              title={SLOT_META[slotKey].label}
                            >
                              {SLOT_META[slotKey].icon}
                            </span>
                          ))}
                          {planKeys.length > 3 && (
                            <span className="text-[8px] font-bold text-stone-500">
                              +{planKeys.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>

                    {/* ══════ RICH HOVER TOOLTIP ══════ */}
                    {isHovered && hasPlan && (
                      <div
                        className={`absolute bottom-full mb-2 z-50 ${tooltipAlign} w-72 pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95`}
                      >
                        <div className="rounded-2xl bg-white/95 backdrop-blur-md p-3.5 shadow-2xl border border-stone-200/90 text-left space-y-2.5">
                          {/* Tooltip Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                            <div>
                              <p className="text-xs font-black text-stone-900">
                                Thực đơn ngày {day} {MONTHS[month]}
                              </p>
                              <p className="text-[10px] text-stone-500">
                                {planKeys.length} bữa đã lên lịch
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black text-[#00615f]">
                                {formatVND(
                                  planKeys.reduce((sum, k) => sum + (dayPlan[k]?.cost || 0), 0)
                                )}
                              </span>
                              <p className="text-[10px] font-semibold text-orange-600">
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
                                  className="flex items-center gap-2 p-1.5 rounded-xl bg-stone-50 border border-stone-100"
                                >
                                  <DishThumbnail
                                    src={slotData.image}
                                    alt={slotData.meal}
                                    size="sm"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-stone-400">
                                      {meta.icon} {meta.label}
                                    </p>
                                    <p className="text-xs font-bold text-stone-800 truncate">
                                      {slotData.meal}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-[10px] font-bold text-orange-600">
                                      {slotData.calories} kcal
                                    </p>
                                    <p className="text-[10px] font-black text-[#00615f]">
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

          {/* Monthly summary */}
          <div className="mt-4 rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-black text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-[#00615f]" />
              Tổng kết ngân sách & calo tháng
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100/60">
                <p className="text-[10px] text-stone-500">Chi phí ước tính</p>
                <p className="text-base font-black text-[#00615f]">{formatVND(summary.totalCost)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-orange-50/60 border border-orange-100/60">
                <p className="text-[10px] text-stone-500">Tổng calo</p>
                <p className="text-base font-black text-orange-600">
                  {(summary.totalCalories || 0).toLocaleString()} kcal
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100/60">
                <p className="text-[10px] text-stone-500">Ngày đã lên lịch</p>
                <p className="text-base font-black text-sky-600">
                  {summary.plannedDays} / {daysInMonth} ngày
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-violet-50/60 border border-violet-100/60">
                <p className="text-[10px] text-stone-500">Nguyên liệu cần mua</p>
                <p className="text-base font-black text-violet-600">
                  {summary.ingredientCount} loại
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: DAY DETAIL ═══ */}
        <div className="flex-1">
          {isPlansLoading ? (
            <div className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-12 text-center">
              <Loader2 className="size-8 mx-auto animate-spin text-[#00615f] mb-3" />
              <p className="text-xs text-stone-500">Đang tải lịch ăn uống...</p>
            </div>
          ) : selectedDay && selectedPlan && Object.keys(selectedPlan).length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-stone-200/80">
                <div>
                  <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                    <Utensils className="size-5 text-[#00615f]" />
                    Thực đơn Ngày {selectedDay} {MONTHS[month]} {year}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Bấm các nút "+ Sáng / Trưa / Tối / Snack" ở danh sách bên dưới để đổi món nhanh
                  </p>
                </div>
              </div>

              {/* Meal cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(["breakfast", "lunch", "dinner", "snack"] as const).map((slotKey) => {
                  const data = selectedPlan[slotKey] as MealPlanSlotDTO | undefined;
                  if (!data) return null;
                  const meta = SLOT_META[slotKey];
                  const ings = Array.isArray(data.ingredients) ? data.ingredients : [];

                  return (
                    <div
                      key={slotKey}
                      className="rounded-2xl bg-white/90 backdrop-blur border border-stone-200/80 shadow-sm p-4 transition-all hover:shadow-md flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <DishThumbnail src={data.image} alt={data.meal} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            {meta.icon} {meta.label}
                          </p>
                          <h3 className="text-sm font-black text-stone-900 truncate">{data.meal}</h3>
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <span className="font-semibold text-orange-600">
                              🔥 {data.calories} kcal
                            </span>
                            <span className="font-bold text-[#00615f]">
                              {formatVND(data.cost)}
                            </span>
                          </div>
                        </div>
                        {data.id && (
                          <button
                            onClick={() => handleDeleteSlot(data.id, meta.label)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-500 transition shrink-0"
                            title={`Xóa ${meta.label}`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>

                      {ings.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1 pt-2 border-t border-stone-100">
                          {ings.map((ing, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-medium"
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
              <div className="rounded-2xl bg-[#00615f]/5 border border-[#00615f]/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-stone-600">Tổng chi tiêu ngày {selectedDay}</p>
                    <p className="text-xl font-black text-[#00615f]">
                      {formatVND(
                        [selectedPlan.breakfast, selectedPlan.lunch, selectedPlan.dinner, selectedPlan.snack]
                          .filter(Boolean)
                          .reduce((sum, s) => sum + (s?.cost || 0), 0)
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-stone-600">Tổng năng lượng</p>
                    <p className="text-xl font-black text-orange-600">
                      {[selectedPlan.breakfast, selectedPlan.lunch, selectedPlan.dinner, selectedPlan.snack]
                        .filter(Boolean)
                        .reduce((sum, s) => sum + (s?.calories || 0), 0)
                        .toLocaleString()}{" "}
                      kcal
                    </p>
                  </div>
                </div>
              </div>

              {/* Shopping list banner */}
              <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-200/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="size-6 text-[#00615f]" />
                  <div>
                    <p className="text-xs font-bold text-stone-800">
                      Danh sách đi chợ tháng {month + 1}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      Tổng hợp {summary.ingredientCount} nguyên liệu từ thực đơn đã chọn
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsShoppingListOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-[#00615f] text-white text-xs font-bold hover:bg-[#004d4b] transition shadow-sm"
                >
                  Xem danh sách
                </button>
              </div>
            </div>
          ) : selectedDay ? (
            <div className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-8 text-center space-y-3">
              <CalendarIcon className="size-10 mx-auto text-[#00615f]/40" />
              <p className="text-sm font-bold text-stone-800">
                Chưa có món nào cho ngày {selectedDay} {MONTHS[month]}
              </p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Chọn ngay từ danh sách món gợi ý phong phú phía dưới: bấm "+ Sáng", "+ Trưa", "+ Tối" hoặc "+ Snack" để xếp lịch 1-chạm mà không cần nhập tay!
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-8 text-center">
              <CalendarIcon className="size-10 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-bold text-stone-700">Chọn một ngày trên lịch</p>
              <p className="text-xs text-stone-400 mt-1">để xem chi tiết hoặc thêm thực đơn</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════ BOTTOM SECTION: QUICK DISH RECOMMENDATION SHELF ══════ */}
      <section className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" />
              Thực đơn gợi ý - Chọn nhanh cho Ngày {selectedDay || today.getDate()} {MONTHS[month]}
            </h3>
            <p className="text-xs text-stone-500">
              Chọn nhanh các món ngon đầy đủ calo & giá tiền. Bấm 1-chạm để thêm vào bữa ăn mong muốn!
            </p>
          </div>

          {/* Quick search input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-stone-400" />
            <input
              type="text"
              value={shelfSearch}
              onChange={(e) => setShelfSearch(e.target.value)}
              placeholder="Tìm nhanh món (bò, cá, xôi...)"
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f]"
            />
          </div>
        </div>

        {/* Shelf Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { key: "all", label: "Tất cả" },
            { key: "an-sang", label: "Ăn sáng" },
            { key: "com", label: "Cơm & Mặn" },
            { key: "bun-pho", label: "Bún / Phở" },
            { key: "canh", label: "Món Canh" },
            { key: "an-vat", label: "Ăn vặt / Tráng miệng" },
            { key: "chay", label: "Món Chay" },
            { key: "salad", label: "Salad Healthy" },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setShelfCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                shelfCategory === cat.key
                  ? "bg-[#00615f] text-white shadow-sm"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-1">
            {recipes.map((dish) => {
              const photo = dish.partnerImage || dish.image;
              return (
                <div
                  key={dish.id}
                  className="group rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:shadow-lg transition-all duration-300 p-3.5 flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail & Title */}
                    <div className="flex items-start gap-3 mb-2.5">
                      <DishThumbnail src={photo} alt={dish.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-stone-900 truncate group-hover:text-[#00615f] transition-colors">
                          {dish.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px]">
                          <span className="font-bold text-orange-600">
                            🔥 {dish.calories} kcal
                          </span>
                          <span className="font-extrabold text-[#00615f]">
                            ~{formatVND(dish.cost)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {dish.partnerStoreName && (
                      <p className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mb-2 truncate">
                        🏪 {dish.partnerStoreName}
                      </p>
                    )}
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="mt-2 pt-2 border-t border-stone-100">
                    <p className="text-[10px] font-semibold text-stone-400 mb-1.5 text-center">
                      Thêm vào ngày {selectedDay || today.getDate()}:
                    </p>
                    <div className="grid grid-cols-4 gap-1">
                      <button
                        onClick={() => handleQuickAddDish(dish, "breakfast")}
                        disabled={isSaving}
                        className="py-1 px-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-[10px] font-bold transition text-center shadow-xs"
                        title="Thêm vào Bữa Sáng"
                      >
                        + Sáng
                      </button>
                      <button
                        onClick={() => handleQuickAddDish(dish, "lunch")}
                        disabled={isSaving}
                        className="py-1 px-1.5 rounded-lg bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white text-[10px] font-bold transition text-center shadow-xs"
                        title="Thêm vào Bữa Trưa"
                      >
                        + Trưa
                      </button>
                      <button
                        onClick={() => handleQuickAddDish(dish, "dinner")}
                        disabled={isSaving}
                        className="py-1 px-1.5 rounded-lg bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white text-[10px] font-bold transition text-center shadow-xs"
                        title="Thêm vào Bữa Tối"
                      >
                        + Tối
                      </button>
                      <button
                        onClick={() => handleQuickAddDish(dish, "snack")}
                        disabled={isSaving}
                        className="py-1 px-1.5 rounded-lg bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white text-[10px] font-bold transition text-center shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-5 text-[#00615f]" />
                <h3 className="font-bold text-base text-stone-900">
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
              Tổng hợp {summary.shoppingList.length} nguyên liệu cho các bữa ăn bạn đã lên lịch trong tháng:
            </p>

            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {summary.shoppingList.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-stone-50 text-xs text-stone-700"
                >
                  <Check className="size-3.5 text-[#00615f]" />
                  <span>{ing}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setIsShoppingListOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#00615f] text-white text-xs font-bold hover:bg-[#004d4b] transition"
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
