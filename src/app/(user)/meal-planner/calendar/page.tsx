"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  ChefHat,
  Flame,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Info,
} from "lucide-react";

/* ─── helpers ─── */
const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

interface MealSlot {
  meal: string;
  calories: number;
  cost: number;
  ingredients: string[];
}

interface DayPlan {
  breakfast: MealSlot;
  lunch: MealSlot;
  dinner: MealSlot;
  snack?: MealSlot;
}

/* sample auto-generated plan data */
const SAMPLE_PLANS: Record<string, DayPlan> = {
  "2026-10-05": {
    breakfast: { meal: "Xôi xéo", calories: 420, cost: 15000, ingredients: ["Nếp", "Đậu xanh", "Hành phi"] },
    lunch: { meal: "Cơm rang dưa bò", calories: 480, cost: 25000, ingredients: ["Cơm nguội", "Thịt bò", "Dưa chua"] },
    dinner: { meal: "Canh chua cá lóc", calories: 280, cost: 20000, ingredients: ["Cá lóc", "Thơm", "Cà chua"] },
    snack: { meal: "Chuối + sữa chua", calories: 150, cost: 10000, ingredients: ["Chuối", "Sữa chua"] },
  },
  "2026-10-06": {
    breakfast: { meal: "Bánh mì ốp la", calories: 380, cost: 15000, ingredients: ["Bánh mì", "Trứng", "Pate"] },
    lunch: { meal: "Bún bò Huế", calories: 520, cost: 30000, ingredients: ["Bún", "Bò", "Sả", "Mắm ruốc"] },
    dinner: { meal: "Gỏi cuốn tôm thịt", calories: 220, cost: 22000, ingredients: ["Bánh tráng", "Tôm", "Thịt"] },
  },
  "2026-10-07": {
    breakfast: { meal: "Phở bò", calories: 450, cost: 28000, ingredients: ["Bánh phở", "Bò", "Hành"] },
    lunch: { meal: "Cơm tấm sườn", calories: 650, cost: 35000, ingredients: ["Gạo tấm", "Sườn", "Đồ chua"] },
    dinner: { meal: "Rau xào thập cẩm", calories: 200, cost: 15000, ingredients: ["Cải ngọt", "Nấm", "Cà rốt"] },
  },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function MealCalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

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
  const selectedPlan = selectedKey ? SAMPLE_PLANS[selectedKey] : null;

  /* monthly summary */
  const monthlySummary = useMemo(() => {
    let totalCost = 0;
    let totalCalories = 0;
    let plannedDays = 0;
    const allIngredients = new Set<string>();
    Object.entries(SAMPLE_PLANS).forEach(([key, plan]) => {
      const [y, m] = key.split("-").map(Number);
      if (y === year && m === month + 1) {
        plannedDays++;
        const slots = [plan.breakfast, plan.lunch, plan.dinner, plan.snack].filter(Boolean) as MealSlot[];
        slots.forEach((s) => {
          totalCost += s.cost;
          totalCalories += s.calories;
          s.ingredients.forEach((i) => allIngredients.add(i));
        });
      }
    });
    return { totalCost, totalCalories, plannedDays, ingredientCount: allIngredients.size };
  }, [year, month]);

  return (
    <div className="space-y-6">

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ═══ LEFT: CALENDAR ═══ */}
          <div className="lg:w-[420px] shrink-0">
            <div className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm overflow-hidden">
              {/* Month navigation */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-stone-100 transition">
                  <ChevronLeft className="size-4 text-stone-600" />
                </button>
                <h2 className="text-sm font-black text-stone-900">
                  {MONTHS[month]} {year}
                </h2>
                <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-stone-100 transition">
                  <ChevronRight className="size-4 text-stone-600" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 text-center px-3 pt-3">
                {DAYS.map((d) => (
                  <div key={d} className="text-[10px] font-bold text-stone-400 uppercase py-1">{d}</div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 px-3 pb-4">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const key = dateKey(year, month, day);
                  const hasPlan = !!SAMPLE_PLANS[key];
                  const isToday = isCurrentMonth && day === today.getDate();
                  const isSelected = selectedDay === day;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`relative m-0.5 aspect-square rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? "bg-[#00615f] text-white shadow-md"
                          : isToday
                          ? "bg-[#00615f]/10 text-[#00615f] font-black"
                          : "text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {day}
                      {hasPlan && (
                        <span className={`absolute bottom-1 size-1.5 rounded-full ${isSelected ? "bg-white" : "bg-[#00615f]"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Monthly summary */}
            <div className="mt-4 rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-black text-stone-700 uppercase tracking-wider">Tổng kết tháng</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50/60">
                  <p className="text-[10px] text-stone-500">Chi phí ước tính</p>
                  <p className="text-lg font-black text-[#00615f]">{formatVND(monthlySummary.totalCost)}</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-50/60">
                  <p className="text-[10px] text-stone-500">Tổng calo</p>
                  <p className="text-lg font-black text-orange-600">{monthlySummary.totalCalories.toLocaleString()} kcal</p>
                </div>
                <div className="p-3 rounded-xl bg-sky-50/60">
                  <p className="text-[10px] text-stone-500">Ngày đã lên lịch</p>
                  <p className="text-lg font-black text-sky-600">{monthlySummary.plannedDays} / {daysInMonth}</p>
                </div>
                <div className="p-3 rounded-xl bg-violet-50/60">
                  <p className="text-[10px] text-stone-500">Nguyên liệu cần mua</p>
                  <p className="text-lg font-black text-violet-600">{monthlySummary.ingredientCount} loại</p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT: DAY DETAIL ═══ */}
          <div className="flex-1">
            {selectedDay && selectedPlan ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-stone-900">
                    Ngày {selectedDay} {MONTHS[month]}
                  </h2>
                  <div className="flex gap-2">
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#00615f] text-white text-[10px] font-bold hover:bg-[#004d4b] transition">
                      <Pencil className="size-3" /> Chỉnh sửa
                    </button>
                  </div>
                </div>

                {/* Meal cards */}
                {(["breakfast", "lunch", "dinner", "snack"] as const).map((slot) => {
                  const data = selectedPlan[slot];
                  if (!data) return null;
                  const labels = { breakfast: "🌅 Bữa sáng", lunch: "☀️ Bữa trưa", dinner: "🌙 Bữa tối", snack: "🍎 Ăn vặt" };
                  const colors = { breakfast: "emerald", lunch: "orange", dinner: "sky", snack: "violet" };
                  const color = colors[slot];
                  return (
                    <div key={slot} className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xs font-bold text-stone-500">{labels[slot]}</p>
                          <h3 className="text-base font-black text-stone-900 mt-0.5">{data.meal}</h3>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-stone-500">
                          <span className="inline-flex items-center gap-1">
                            <Flame className="size-3 text-orange-400" /> {data.calories} kcal
                          </span>
                          <span className="font-bold text-[#00615f]">{formatVND(data.cost)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {data.ingredients.map((ing) => (
                          <span key={ing} className={`px-2.5 py-1 rounded-full bg-${color}-50 text-${color}-700 text-[10px] font-semibold`}>
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Day cost summary */}
                <div className="rounded-2xl bg-[#00615f]/5 border border-[#00615f]/20 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-stone-600">Chi phí ngày {selectedDay}</p>
                      <p className="text-xl font-black text-[#00615f]">
                        {formatVND(
                          [selectedPlan.breakfast, selectedPlan.lunch, selectedPlan.dinner, selectedPlan.snack]
                            .filter(Boolean)
                            .reduce((sum, s) => sum + (s as MealSlot).cost, 0)
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-600">Tổng calo</p>
                      <p className="text-xl font-black text-orange-600">
                        {[selectedPlan.breakfast, selectedPlan.lunch, selectedPlan.dinner, selectedPlan.snack]
                          .filter(Boolean)
                          .reduce((sum, s) => sum + (s as MealSlot).calories, 0)
                          .toLocaleString()}{" "}
                        kcal
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedDay ? (
              <div className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-10 text-center">
                <CalendarIcon className="size-12 mx-auto text-stone-300 mb-3" />
                <p className="text-sm font-semibold text-stone-500">Chưa có kế hoạch cho ngày {selectedDay}</p>
                <p className="text-xs text-stone-400 mt-1">Bấm để thêm thực đơn cho ngày này</p>
                <button className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#00615f] text-white text-xs font-bold hover:bg-[#004d4b] transition">
                  <Plus className="size-3.5" /> Thêm thực đơn
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-10 text-center">
                <CalendarIcon className="size-12 mx-auto text-stone-300 mb-3" />
                <p className="text-sm font-semibold text-stone-500">Chọn một ngày trên lịch</p>
                <p className="text-xs text-stone-400 mt-1">để xem hoặc lên kế hoạch bữa ăn</p>
              </div>
            )}

            {/* Shopping list prompt */}
            {selectedPlan && (
              <div className="mt-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-200/50 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="size-8 text-[#00615f]" />
                  <div>
                    <p className="text-xs font-bold text-stone-800">Danh sách đi chợ</p>
                    <p className="text-[10px] text-stone-500">Tổng hợp nguyên liệu cần mua cho ngày {selectedDay}</p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-full bg-[#00615f] text-white text-[10px] font-bold hover:bg-[#004d4b] transition">
                  Xem danh sách
                </button>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
