import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Check,
  AlertCircle,
  X,
  Utensils,
  ChevronRight,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useSaveMealPlanSlotMutation,
  useGetMonthMealPlansQuery,
  RecipeDTO,
  MealPlanSlotDTO,
} from "@/redux/api/mealPlannerApi";
import { toast } from "sonner";

export interface AddToCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: RecipeDTO | null;
  initialDay?: number;
  initialSlot?: "breakfast" | "lunch" | "dinner" | "snack";
  onSuccess?: (day: number, slot: string) => void;
}

const MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const SLOTS = [
  { key: "breakfast", label: "Bữa Sáng", icon: "🌅", desc: "~400 kcal" },
  { key: "lunch", label: "Bữa Trưa", icon: "☀️", desc: "~700 kcal" },
  { key: "dinner", label: "Bữa Tối", icon: "🌙", desc: "~600 kcal" },
  { key: "snack", label: "Ăn Vặt", icon: "🍎", desc: "~300 kcal" },
] as const;

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function AddToCalendarModal({
  isOpen,
  onClose,
  recipe,
  initialDay,
  initialSlot,
  onSuccess,
}: AddToCalendarModalProps) {
  const router = useRouter();
  const today = new Date();
  const [year] = useState(today.getFullYear());
  const [month] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(initialDay || today.getDate());
  const [selectedSlot, setSelectedSlot] = useState<"breakfast" | "lunch" | "dinner" | "snack">(
    initialSlot || "lunch"
  );

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const { data: plansRes } = useGetMonthMealPlansQuery(
    { year, month: month + 1 },
    { skip: !isOpen }
  );
  const [saveSlot, { isLoading: isSaving }] = useSaveMealPlanSlotMutation();

  useEffect(() => {
    if (initialDay) setSelectedDay(initialDay);
    if (initialSlot) setSelectedSlot(initialSlot);
  }, [initialDay, initialSlot, isOpen]);

  if (!isOpen || !recipe) return null;

  const targetDateKey = dateKey(year, month, selectedDay);
  const dayPlan = plansRes?.data?.[targetDateKey];
  const existingSlot = dayPlan?.[selectedSlot] as MealPlanSlotDTO | undefined;
  const isReplacing = Boolean(existingSlot && existingSlot.meal);

  const handleConfirmAdd = async () => {
    try {
      const imageUrl = recipe.partnerImage || recipe.image;
      const ingNames = Array.isArray(recipe.ingredients)
        ? recipe.ingredients.map((i) => i.name)
        : [];

      await saveSlot({
        date: targetDateKey,
        slot: selectedSlot,
        meal: recipe.name,
        image: imageUrl,
        calories: Number(recipe.calories) || 0,
        cost: Number(recipe.cost) || 0,
        ingredients: ingNames,
      }).unwrap();

      const slotMeta = SLOTS.find((s) => s.key === selectedSlot);
      toast.success(
        `Đã lên món "${recipe.name}" cho ${slotMeta?.label || selectedSlot} ngày ${selectedDay} ${MONTHS[month]}!`,
        {
          action: {
            label: "Xem lịch ăn",
            onClick: () => router.push(`/meal-planner/calendar`),
          },
        }
      );

      onSuccess?.(selectedDay, selectedSlot);
      onClose();
    } catch {
      toast.error("Không thể lưu món ăn vào lịch. Vui lòng thử lại");
    }
  };

  const quickDays = [
    { label: "Hôm nay", day: today.getDate() },
    {
      label: "Ngày mai",
      day: today.getDate() + 1 <= daysInMonth ? today.getDate() + 1 : 1,
    },
    {
      label: "+2 ngày",
      day: today.getDate() + 2 <= daysInMonth ? today.getDate() + 2 : 2,
    },
    {
      label: "+3 ngày",
      day: today.getDate() + 3 <= daysInMonth ? today.getDate() + 3 : 3,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-2xl bg-white border border-stone-200 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 text-[#00615f]">
              <CalendarIcon className="size-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900">
                Thêm món vào lịch thực đơn
              </h3>
              <p className="text-xs text-stone-500">
                Lên kế hoạch ăn uống {MONTHS[month]} {year}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Selected Dish Card Preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/80">
          <div className="size-14 rounded-lg overflow-hidden shrink-0 bg-stone-200 border border-stone-300/80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={recipe.partnerImage || recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
              {recipe.name}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
              <span className="inline-flex items-center gap-1 font-semibold text-stone-700">
                <Flame className="size-3 text-amber-500" />
                {recipe.calories} kcal
              </span>
              <span>·</span>
              <span className="font-bold text-[#00615f]">
                ~{(recipe.cost || 0).toLocaleString()}đ
              </span>
              <span>·</span>
              <span>{recipe.cookTime} phút nấu</span>
            </div>
          </div>
        </div>

        {/* Step 1: Choose Day */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
            <span>1. Chọn ngày ăn trong {MONTHS[month]}:</span>
            <span className="text-[11px] font-medium text-[#00615f]">
              Đang chọn: Ngày {selectedDay}
            </span>
          </label>

          {/* Quick pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {quickDays.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => setSelectedDay(q.day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                  selectedDay === q.day
                    ? "bg-[#00615f] text-white shadow-xs"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {q.label} ({q.day})
              </button>
            ))}
          </div>

          {/* Month day number grid */}
          <div className="grid grid-cols-7 gap-1 pt-1 max-h-36 overflow-y-auto p-1.5 bg-stone-50 rounded-xl border border-stone-200/80">
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isSelected = selectedDay === dayNum;
              const isPast = dayNum < today.getDate() && month === today.getMonth();

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => setSelectedDay(dayNum)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition text-center cursor-pointer ${
                    isSelected
                      ? "bg-[#00615f] text-white shadow-xs font-bold"
                      : isPast
                      ? "text-stone-400 hover:bg-stone-200/60"
                      : "text-stone-800 hover:bg-stone-200/80 bg-white border border-stone-200/60"
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Choose Meal Slot */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-800">
            2. Chọn bữa ăn trong ngày:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SLOTS.map((slot) => {
              const isSelected = selectedSlot === slot.key;
              const hasExisting = Boolean(dayPlan?.[slot.key]?.meal);

              return (
                <button
                  key={slot.key}
                  type="button"
                  onClick={() => setSelectedSlot(slot.key)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50/70 border-[#00615f] text-stone-900 ring-2 ring-[#00615f]/25"
                      : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold flex items-center gap-1.5">
                      <span>{slot.icon}</span>
                      <span>{slot.label}</span>
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                      {hasExisting ? `Đã có: ${dayPlan?.[slot.key]?.meal}` : slot.desc}
                    </p>
                  </div>
                  {isSelected && <Check className="size-4 text-[#00615f] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Replacement Alert Warning */}
        {isReplacing && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                Bữa {SLOTS.find((s) => s.key === selectedSlot)?.label} Ngày {selectedDay} đang có món:
              </p>
              <p className="font-bold mt-0.5 text-stone-900 truncate">
                "{existingSlot?.meal}"
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Xác nhận sẽ thay thế bằng món "{recipe.name}".
              </p>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl px-4"
          >
            Hủy
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleConfirmAdd}
            disabled={isSaving}
            className="rounded-xl px-5 gap-1.5 font-bold"
          >
            {isSaving ? "Đang lưu..." : isReplacing ? "Xác nhận thay thế" : "Thêm vào lịch"}
          </Button>
        </div>
      </div>
    </div>
  );
}
