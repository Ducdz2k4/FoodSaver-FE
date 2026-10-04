"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Flame,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  X,
  Check,
} from "lucide-react";
import {
  useGetMonthMealPlansQuery,
  useGetMonthSummaryQuery,
  useSaveMealPlanSlotMutation,
  useDeleteMealPlanSlotMutation,
  MealPlanSlotDTO,
} from "@/redux/api/mealPlannerApi";
import { toast } from "sonner";

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

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

export default function MealCalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [newSlot, setNewSlot] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");
  const [newMeal, setNewMeal] = useState("");
  const [newCalories, setNewCalories] = useState("500");
  const [newCost, setNewCost] = useState("30000");
  const [newIngredients, setNewIngredients] = useState("");

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
  const [saveSlot, { isLoading: isSaving }] = useSaveMealPlanSlotMutation();
  const [deleteSlot] = useDeleteMealPlanSlotMutation();

  const plans = plansRes?.data || {};
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

  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey || !newMeal.trim()) {
      toast.error("Vui lòng nhập tên món ăn");
      return;
    }

    try {
      const ingArray = newIngredients
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);

      await saveSlot({
        date: selectedKey,
        slot: newSlot,
        meal: newMeal.trim(),
        calories: Number(newCalories) || 0,
        cost: Number(newCost) || 0,
        ingredients: ingArray,
      }).unwrap();

      toast.success("Đã thêm món vào kế hoạch ăn!");
      setIsAddModalOpen(false);
      setNewMeal("");
      setNewIngredients("");
    } catch {
      toast.error("Không thể lưu kế hoạch. Vui lòng thử lại");
    }
  };

  const handleDeleteSlot = async (slotId?: string) => {
    if (!slotId) return;
    try {
      await deleteSlot(slotId).unwrap();
      toast.success("Đã xóa bữa ăn");
    } catch {
      toast.error("Không thể xóa bữa ăn");
    }
  };

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
                const hasPlan = Boolean(plans[key] && Object.keys(plans[key]).length > 0);
                const isToday = isCurrentMonth && day === today.getDate();
                const isSelected = selectedDay === day;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`relative m-0.5 aspect-square rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? "bg-[#00615f] text-white shadow-md scale-105"
                        : isToday
                        ? "bg-[#00615f]/10 text-[#00615f] font-black"
                        : "text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    {day}
                    {hasPlan && (
                      <span className={`absolute bottom-1 size-1.5 rounded-full ${isSelected ? "bg-[#79e4a7]" : "bg-[#00615f]"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monthly summary */}
          <div className="mt-4 rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-black text-stone-700 uppercase tracking-wider">Tổng kết ngân sách & calo tháng</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50/60">
                <p className="text-[10px] text-stone-500">Chi phí ước tính</p>
                <p className="text-lg font-black text-[#00615f]">{formatVND(summary.totalCost)}</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-50/60">
                <p className="text-[10px] text-stone-500">Tổng calo</p>
                <p className="text-lg font-black text-orange-600">{(summary.totalCalories || 0).toLocaleString()} kcal</p>
              </div>
              <div className="p-3 rounded-xl bg-sky-50/60">
                <p className="text-[10px] text-stone-500">Ngày đã lên lịch</p>
                <p className="text-lg font-black text-sky-600">{summary.plannedDays} / {daysInMonth} ngày</p>
              </div>
              <div className="p-3 rounded-xl bg-violet-50/60">
                <p className="text-[10px] text-stone-500">Nguyên liệu cần mua</p>
                <p className="text-lg font-black text-violet-600">{summary.ingredientCount} loại</p>
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-stone-900">
                    Ngày {selectedDay} {MONTHS[month]} {year}
                  </h2>
                  <p className="text-xs text-stone-500">Chi tiết thực đơn và định mức dinh dưỡng</p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00615f] text-white text-xs font-bold hover:bg-[#004d4b] transition shadow-sm"
                >
                  <Plus className="size-3.5" /> Thêm món
                </button>
              </div>

              {/* Meal cards */}
              {(["breakfast", "lunch", "dinner", "snack"] as const).map((slotKey) => {
                const data = selectedPlan[slotKey] as MealPlanSlotDTO | undefined;
                if (!data) return null;
                const labels = { breakfast: "🌅 Bữa sáng", lunch: "☀️ Bữa trưa", dinner: "🌙 Bữa tối", snack: "🍎 Ăn vặt" };
                const colors = { breakfast: "emerald", lunch: "orange", dinner: "sky", snack: "violet" };
                const color = colors[slotKey];
                const ings = Array.isArray(data.ingredients) ? data.ingredients : [];

                return (
                  <div key={slotKey} className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-5 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs font-bold text-stone-500">{labels[slotKey]}</p>
                        <h3 className="text-base font-black text-stone-900 mt-0.5">{data.meal}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 text-xs text-stone-500">
                          <span className="inline-flex items-center gap-1">
                            <Flame className="size-3.5 text-orange-400" /> {data.calories} kcal
                          </span>
                          <span className="font-bold text-[#00615f]">{formatVND(data.cost)}</span>
                        </div>
                        {data.id && (
                          <button
                            onClick={() => handleDeleteSlot(data.id)}
                            className="p-1 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-500 transition"
                            title="Xóa bữa này"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {ings.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {ings.map((ing, idx) => (
                          <span key={idx} className={`px-2.5 py-1 rounded-full bg-${color}-50 text-${color}-700 text-[10px] font-semibold`}>
                            {ing}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Day cost summary */}
              <div className="rounded-2xl bg-[#00615f]/5 border border-[#00615f]/20 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-stone-600">Tổng chi phí ngày {selectedDay}</p>
                    <p className="text-xl font-black text-[#00615f]">
                      {formatVND(
                        [selectedPlan.breakfast, selectedPlan.lunch, selectedPlan.dinner, selectedPlan.snack]
                          .filter(Boolean)
                          .reduce((sum, s) => sum + (s?.cost || 0), 0)
                      )}
                    </p>
                  </div>
                  <div>
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
              <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-200/50 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="size-8 text-[#00615f]" />
                  <div>
                    <p className="text-xs font-bold text-stone-800">Danh sách đi chợ tháng {month + 1}</p>
                    <p className="text-[10px] text-stone-500">Đã tổng hợp {summary.ingredientCount} loại nguyên liệu cho toàn bộ tháng</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsShoppingListOpen(true)}
                  className="px-4 py-2 rounded-full bg-[#00615f] text-white text-xs font-bold hover:bg-[#004d4b] transition shadow-sm"
                >
                  Xem danh sách
                </button>
              </div>
            </div>
          ) : selectedDay ? (
            <div className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-10 text-center space-y-3">
              <CalendarIcon className="size-12 mx-auto text-stone-300" />
              <p className="text-sm font-semibold text-stone-700">Chưa có kế hoạch cho ngày {selectedDay}</p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Bấm nút bên dưới để lên lịch ăn uống, ước tính chi phí và dinh dưỡng cho ngày này.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#00615f] text-white text-xs font-bold hover:bg-[#004d4b] transition shadow-md"
              >
                <Plus className="size-3.5" /> Thêm món vào ngày {selectedDay}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-10 text-center">
              <CalendarIcon className="size-12 mx-auto text-stone-300 mb-3" />
              <p className="text-sm font-semibold text-stone-700">Chọn một ngày trên lịch</p>
              <p className="text-xs text-stone-400 mt-1">để xem hoặc lên kế hoạch bữa ăn</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ ADD MEAL MODAL ═══ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">
                Thêm món ăn ngày {selectedDay} {MONTHS[month]}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMeal} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-stone-600">Bữa ăn trong ngày</label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {[
                    { key: "breakfast", label: "Sáng" },
                    { key: "lunch", label: "Trưa" },
                    { key: "dinner", label: "Tối" },
                    { key: "snack", label: "Snack" },
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.key}
                      onClick={() => setNewSlot(s.key as any)}
                      className={`py-2 rounded-xl text-xs font-bold transition ${
                        newSlot === s.key
                          ? "bg-[#00615f] text-white shadow-sm"
                          : "bg-stone-50 border border-stone-200 text-stone-700"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600">Tên món ăn</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cơm tấm sườn, Canh chua..."
                  value={newMeal}
                  onChange={(e) => setNewMeal(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-600">Calo ước tính (kcal)</label>
                  <input
                    type="number"
                    value={newCalories}
                    onChange={(e) => setNewCalories(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-600">Chi phí ước tính (VNĐ)</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600">Nguyên liệu cần mua (cách nhau dấu phẩy)</label>
                <input
                  type="text"
                  placeholder="Gạo, Sườn, Hành lá, Cà chua..."
                  value={newIngredients}
                  onChange={(e) => setNewIngredients(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#00615f] text-white text-xs font-bold hover:bg-[#004d4b] transition shadow-md flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="size-3.5 animate-spin" />}
                  Lưu món ăn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ SHOPPING LIST MODAL ═══ */}
      {isShoppingListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-stone-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-5 text-[#00615f]" />
                <h3 className="font-bold text-base text-stone-900">
                  Danh sách nguyên liệu cần mua ({MONTHS[month]})
                </h3>
              </div>
              <button
                onClick={() => setIsShoppingListOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {summary.shoppingList.length === 0 ? (
                <p className="text-center py-8 text-xs text-stone-500">Chưa có nguyên liệu nào trong kế hoạch tháng này.</p>
              ) : (
                summary.shoppingList.map((ing, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50/50 border border-stone-100 transition text-xs font-semibold text-stone-700"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="size-5 rounded-md bg-[#00615f]/10 text-[#00615f] flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{ing}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-[#00615f] font-bold">
                      Cần mua
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-stone-400">Tổng ngân sách dự tính</p>
                <p className="text-sm font-black text-[#00615f]">{formatVND(summary.totalCost)}</p>
              </div>
              <button
                onClick={() => {
                  toast.success("Đã sao chép danh sách đi chợ vào clipboard!");
                  navigator.clipboard.writeText(summary.shoppingList.join(", "));
                }}
                className="px-4 py-2 rounded-xl bg-[#00615f] text-white text-xs font-bold hover:bg-[#004d4b] transition shadow-sm"
              >
                Sao chép danh sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
