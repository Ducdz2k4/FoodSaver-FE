"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  ArrowRightLeft,
  AlertCircle,
  X,
  MapPin,
  Navigation,
  Store,
  Info,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Zap,
  Tag,
} from "lucide-react";
import {
  useGetMonthMealPlansQuery,
  useGetMonthSummaryQuery,
  useGetRecipesQuery,
  useSaveMealPlanSlotMutation,
  useDeleteMealPlanSlotMutation,
  MealPlanSlotDTO,
  DayPlanDTO,
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

function getDayNutritionEvaluation(calories: number, mealCount: number, dayPlan?: DayPlanDTO) {
  if (mealCount === 0) {
    return {
      status: "EMPTY",
      badge: "Chưa có món",
      score: "--",
      percentage: 0,
      badgeColor: "bg-stone-100 text-stone-600",
      progressColor: "bg-stone-300",
      review: "Chưa có bữa ăn nào được xếp cho ngày này. Hãy chọn món từ danh sách gợi ý bên dưới.",
    };
  }

  const percentage = Math.round((calories / 2000) * 100);

  if (calories >= 1800 && calories <= 2200 && mealCount >= 3) {
    return {
      status: "PERFECT",
      badge: "Rất tốt · Đạt chuẩn",
      score: "9.5 / 10",
      percentage,
      badgeColor: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
      progressColor: "bg-emerald-600",
      review: `Lượng calo đạt ${percentage}% chuẩn khoa học (2,000 kcal), đủ ${mealCount} bữa giúp duy trì thể lực tốt và dinh dưỡng cân đối cả ngày.`,
    };
  }

  if (calories >= 1600 && calories < 1800) {
    return {
      status: "GOOD",
      badge: "Khá tốt · Hơi nhẹ",
      score: "8.0 / 10",
      percentage,
      badgeColor: "bg-teal-50 text-teal-800 border border-teal-200/80",
      progressColor: "bg-teal-600",
      review: `Lượng calo đạt ${percentage}% mức chuẩn. Mức năng lượng vừa vặn, phù hợp cho người làm việc văn phòng hoặc muốn giữ dáng nhẹ nhàng.`,
    };
  }

  if (calories < 1600) {
    const missingSlot = dayPlan && !dayPlan.lunch ? "Trưa" : dayPlan && !dayPlan.dinner ? "Tối" : "Sáng";
    return {
      status: "LOW",
      badge: "Chưa đạt · Thiếu calo",
      score: "5.5 / 10",
      percentage,
      badgeColor: "bg-amber-50 text-amber-800 border border-amber-200/80",
      progressColor: "bg-amber-500",
      review: `Mới đạt ${calories} kcal (${percentage}% chuẩn). Bạn nên bổ sung thêm bữa ${missingSlot} để đủ năng lượng làm việc và học tập.`,
    };
  }

  if (calories > 2200 && calories <= 2500) {
    return {
      status: "SLIGHTLY_HIGH",
      badge: "Hơi dư calo nhẹ",
      score: "7.5 / 10",
      percentage,
      badgeColor: "bg-sky-50 text-sky-800 border border-sky-200/80",
      progressColor: "bg-sky-600",
      review: `Đạt ${calories} kcal (${percentage}% chuẩn). Lượng năng lượng dồi dào, phù hợp nếu ngày này bạn có tập gym hoặc vận động thể chất nhiều.`,
    };
  }

  return {
    status: "EXCESS",
    badge: "Vượt mức calo",
    score: "6.0 / 10",
    percentage,
    badgeColor: "bg-rose-50 text-rose-800 border border-rose-200/80",
    progressColor: "bg-rose-500",
    review: `Đạt ${calories} kcal (${percentage}% chuẩn). Mức năng lượng hơi cao, bạn có thể cân nhắc đổi bữa tối sang món canh thanh đạm hơn.`,
  };
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

interface ReplaceModalData {
  targetDay: number;
  slot: "breakfast" | "lunch" | "dinner" | "snack";
  newDish: RecipeDTO;
  oldMeal: MealPlanSlotDTO;
}

const DEFAULT_STAPLE_INGREDIENTS = [
  { name: "Trứng gà tươi", category: "Trứng & Sữa", estimatedPrice: 16000, meals: ["Bữa sáng dinh dưỡng"] },
  { name: "Rau cải thìa / cải ngọt", category: "Rau củ & Quả", estimatedPrice: 12000, meals: ["Món canh & xào thanh đạm"] },
  { name: "Ức gà phi lê sạch", category: "Thịt & Thủy sản", estimatedPrice: 38000, meals: ["Bữa trưa / tối giàu đạm"] },
  { name: "Cà chua bi & Xà lách", category: "Rau củ & Quả", estimatedPrice: 15000, meals: ["Salad tươi bổ sung chất xơ"] },
  { name: "Gia vị cơ bản (Dầu mè, Tiêu, Nước mắm)", category: "Gia vị & Đồ khô", estimatedPrice: 10000, meals: ["Gia vị nấu nướng"] },
];

function inferCategory(name: string): string {
  const lower = name.toLowerCase();
  if (
    lower.includes("thịt") ||
    lower.includes("bò") ||
    lower.includes("gà") ||
    lower.includes("heo") ||
    lower.includes("cá") ||
    lower.includes("tôm") ||
    lower.includes("sườn") ||
    lower.includes("chả") ||
    lower.includes("hải sản")
  ) {
    return "Thịt & Thủy sản";
  }
  if (
    lower.includes("rau") ||
    lower.includes("cà chua") ||
    lower.includes("cà rốt") ||
    lower.includes("dưa") ||
    lower.includes("hành") ||
    lower.includes("tỏi") ||
    lower.includes("ớt") ||
    lower.includes("nấm") ||
    lower.includes("ngò") ||
    lower.includes("giá") ||
    lower.includes("cải") ||
    lower.includes("khoai") ||
    lower.includes("bắp") ||
    lower.includes("chuối") ||
    lower.includes("táo")
  ) {
    return "Rau củ & Quả";
  }
  if (
    lower.includes("trứng") ||
    lower.includes("sữa") ||
    lower.includes("bơ") ||
    lower.includes("phô mai")
  ) {
    return "Trứng & Sữa";
  }
  if (
    lower.includes("mắm") ||
    lower.includes("muối") ||
    lower.includes("đường") ||
    lower.includes("tiêu") ||
    lower.includes("dầu") ||
    lower.includes("tương") ||
    lower.includes("gạo") ||
    lower.includes("mì") ||
    lower.includes("bún") ||
    lower.includes("bột") ||
    lower.includes("sốt") ||
    lower.includes("giấm")
  ) {
    return "Gia vị & Đồ khô";
  }
  return "Thực phẩm tươi";
}

function inferPrice(name: string, category: string): number {
  const lower = name.toLowerCase();
  if (category === "Thịt & Thủy sản") return 35000;
  if (category === "Trứng & Sữa") return 16000;
  if (category === "Gia vị & Đồ khô") {
    if (lower.includes("gạo") || lower.includes("dầu")) return 22000;
    return 9000;
  }
  if (category === "Rau củ & Quả") return 14000;
  return 18000;
}

const NEARBY_STORES = [
  {
    id: "greenmart",
    name: "GreenMart - Siêu Thị Nông Sản Sạch",
    distanceKm: 0.6,
    address: "45 Lê Duẩn, P. Bến Nghé, Quận 1",
    matchPercentage: 92,
    badge: "Đối tác chiến lược · Giảm đến 40%",
    lat: 10.7769,
    lng: 106.695,
  },
  {
    id: "coopfood",
    name: "Co.op Food Mini Đa Kao",
    distanceKm: 1.2,
    address: "18 Đinh Tiên Hoàng, P. Đa Kao, Quận 1",
    matchPercentage: 85,
    badge: "Thực phẩm tươi trong ngày",
    lat: 10.785,
    lng: 106.698,
  },
];

export default function MealCalendarPage() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Summary display tab: 'day' | 'month'
  const [summaryView, setSummaryView] = useState<"day" | "month">("day");

  // Suggested Shelf Filter state
  const [shelfCategory, setShelfCategory] = useState("all");
  const [shelfSearch, setShelfSearch] = useState("");

  // Smart Grocery Planning Wizard & Urgency Popup
  const [isGroceryWizardOpen, setIsGroceryWizardOpen] = useState(false);
  const [groceryStep, setGroceryStep] = useState<1 | 2 | 3>(1);
  const [groceryDaysMode, setGroceryDaysMode] = useState<"today" | "3days" | "7days" | "custom">("3days");
  const [customDays, setCustomDays] = useState<number>(3);
  const [haveAtHome, setHaveAtHome] = useState<Set<string>>(new Set());
  const [isUrgentGoShoppingOpen, setIsUrgentGoShoppingOpen] = useState(false);

  // Replacement confirmation modal
  const [replaceModal, setReplaceModal] = useState<ReplaceModalData | null>(null);

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

  // Grocery Wizard calculations
  const effectiveDaysCount =
    groceryDaysMode === "today"
      ? 1
      : groceryDaysMode === "3days"
      ? 3
      : groceryDaysMode === "7days"
      ? 7
      : Math.min(Math.max(Number(customDays) || 1, 1), 7);

  const startDay = selectedDay || today.getDate();
  const groceryDates = Array.from({ length: effectiveDaysCount }).map((_, i) => {
    const d = new Date(year, month, startDay + i);
    const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
    const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    const dayName = DAYS[d.getDay()];
    return { date: d, key, label, dayName, dayNum: d.getDate() };
  });

  const groceryRangeLabel =
    effectiveDaysCount === 1
      ? `${groceryDates[0].dayName} (${groceryDates[0].label})`
      : `Từ ${groceryDates[0].dayName} (${groceryDates[0].label}) đến ${groceryDates[groceryDates.length - 1].dayName} (${groceryDates[groceryDates.length - 1].label}) · ${effectiveDaysCount} ngày`;

  // Aggregate ingredients for selected dates
  const aggregatedIngredientsMap = new Map<
    string,
    {
      name: string;
      category: string;
      estimatedPrice: number;
      meals: Set<string>;
      dates: Set<string>;
    }
  >();

  let plannedMealsCountInWindow = 0;

  groceryDates.forEach((gd) => {
    const plan = plans[gd.key];
    if (!plan) return;
    (["breakfast", "lunch", "dinner", "snack"] as const).forEach((slotKey) => {
      const slot = plan[slotKey];
      if (!slot) return;
      plannedMealsCountInWindow++;
      const slotIngredients = Array.isArray(slot.ingredients) ? slot.ingredients : [];
      slotIngredients.forEach((ingName) => {
        const cleanName = String(ingName).trim();
        if (!cleanName) return;
        if (!aggregatedIngredientsMap.has(cleanName)) {
          const cat = inferCategory(cleanName);
          const price = inferPrice(cleanName, cat);
          aggregatedIngredientsMap.set(cleanName, {
            name: cleanName,
            category: cat,
            estimatedPrice: price,
            meals: new Set([slot.meal]),
            dates: new Set([gd.label]),
          });
        } else {
          const existing = aggregatedIngredientsMap.get(cleanName)!;
          existing.meals.add(slot.meal);
          existing.dates.add(gd.label);
        }
      });
    });
  });

  // Fallback staples if user has planned few or no meals yet:
  if (aggregatedIngredientsMap.size < 4) {
    DEFAULT_STAPLE_INGREDIENTS.forEach((item) => {
      if (!aggregatedIngredientsMap.has(item.name)) {
        aggregatedIngredientsMap.set(item.name, {
          name: item.name,
          category: item.category,
          estimatedPrice: item.estimatedPrice,
          meals: new Set(item.meals),
          dates: new Set([groceryDates[0].label]),
        });
      }
    });
  }

  const aggregatedList = Array.from(aggregatedIngredientsMap.values()).map((item) => ({
    name: item.name,
    category: item.category,
    estimatedPrice: item.estimatedPrice,
    meals: Array.from(item.meals),
    dates: Array.from(item.dates),
  }));

  const neededIngredients = aggregatedList.filter((item) => !haveAtHome.has(item.name));
  const savedAmount = Array.from(haveAtHome).reduce((sum, name) => {
    const found = aggregatedList.find((x) => x.name === name);
    return sum + (found ? found.estimatedPrice : 15000);
  }, 0);
  const neededCost = neededIngredients.reduce((sum, item) => sum + item.estimatedPrice, 0);

  const handleOpenGroceryModal = () => {
    setIsGroceryWizardOpen(true);
    setGroceryStep(1);
  };

  const handleToggleHaveAtHome = (name: string) => {
    const next = new Set(haveAtHome);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    setHaveAtHome(next);
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

  // Selected Day Nutrition Data
  const selectedDayMeals = (["breakfast", "lunch", "dinner", "snack"] as const).filter(
    (k) => Boolean(selectedPlan?.[k])
  );
  const selectedDayCalories = selectedDayMeals.reduce(
    (sum, k) => sum + (selectedPlan?.[k]?.calories || 0),
    0
  );
  const selectedDayCost = selectedDayMeals.reduce(
    (sum, k) => sum + (selectedPlan?.[k]?.cost || 0),
    0
  );
  const selectedDayEval = getDayNutritionEvaluation(
    selectedDayCalories,
    selectedDayMeals.length,
    selectedPlan || undefined
  );

  // Core function to save slot
  const executeSaveSlot = async (
    targetKey: string,
    slot: "breakfast" | "lunch" | "dinner" | "snack",
    dish: RecipeDTO,
    targetDay: number
  ) => {
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
        `Đã lên món "${dish.name}" cho ${slotNames[slot]} ngày ${targetDay}/${month + 1}!`
      );
      if (!selectedDay) {
        setSelectedDay(targetDay);
      }
    } catch {
      toast.error("Không thể lưu món ăn. Vui lòng thử lại");
    }
  };

  // Quick Add handler with replacement check
  const handleQuickAddDish = async (
    dish: RecipeDTO,
    slot: "breakfast" | "lunch" | "dinner" | "snack"
  ) => {
    const targetDay = selectedDay || today.getDate();
    const targetKey = dateKey(year, month, targetDay);
    const existingSlot = plans[targetKey]?.[slot];

    // Check if slot already has a dish
    if (existingSlot && existingSlot.meal) {
      setReplaceModal({
        targetDay,
        slot,
        newDish: dish,
        oldMeal: existingSlot,
      });
      return;
    }

    await executeSaveSlot(targetKey, slot, dish, targetDay);
  };

  // Confirm replacement
  const handleConfirmReplace = async () => {
    if (!replaceModal) return;
    const targetKey = dateKey(year, month, replaceModal.targetDay);
    await executeSaveSlot(
      targetKey,
      replaceModal.slot,
      replaceModal.newDish,
      replaceModal.targetDay
    );
    setReplaceModal(null);
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
        {/* ═══ LEFT: CALENDAR & DYNAMIC NUTRITION CARD ═══ */}
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
                <p className="text-[10px] text-stone-400 text-center">Bấm vào ngày để xem calo & đánh giá</p>
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
                      onClick={() => {
                        setSelectedDay(day);
                        setSummaryView("day");
                      }}
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

          {/* ══════ DYNAMIC SUMMARY CARD (CLICK VÀO NGÀY HIỂN THỊ CALO & ĐÁNH GIÁ) ══════ */}
          <div className="mt-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-xs p-4 space-y-3.5">
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex p-0.5 rounded-lg bg-stone-100 text-xs font-semibold">
                <button
                  onClick={() => setSummaryView("day")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    summaryView === "day"
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  Ngày {selectedDay || today.getDate()}
                </button>
                <button
                  onClick={() => setSummaryView("month")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    summaryView === "month"
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  Cả tháng {month + 1}
                </button>
              </div>

              {summaryView === "day" && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${selectedDayEval.badgeColor}`}>
                  {selectedDayEval.badge}
                </span>
              )}
            </div>

            {summaryView === "day" ? (
              /* ─── DAY VIEW: CALORIES & NUTRITION ASSESSMENT ─── */
              <div className="space-y-3">
                {/* Progress bar vs 2,000 kcal target */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-stone-700">Mục tiêu calo ngày {selectedDay}:</span>
                    <span className="font-bold text-stone-900">
                      {selectedDayCalories.toLocaleString()} / 2,000 kcal{" "}
                      <span className="text-stone-400 font-normal">({selectedDayEval.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${selectedDayEval.progressColor}`}
                      style={{ width: `${Math.min(100, selectedDayEval.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* 4 Stat Boxes for Selected Day */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                    <p className="text-[10px] text-stone-500 font-medium">Năng lượng ngày</p>
                    <p className="text-base font-bold text-stone-900">{selectedDayCalories} kcal</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                    <p className="text-[10px] text-stone-500 font-medium">Đánh giá dinh dưỡng</p>
                    <p className="text-base font-bold text-[#00615f]">{selectedDayEval.score}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                    <p className="text-[10px] text-stone-500 font-medium">Chi phí ngày {selectedDay}</p>
                    <p className="text-base font-bold text-stone-900">{formatVND(selectedDayCost)}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                    <p className="text-[10px] text-stone-500 font-medium">Bữa đã lên lịch</p>
                    <p className="text-base font-bold text-stone-900">{selectedDayMeals.length} / 4 bữa</p>
                  </div>
                </div>

                {/* Detailed Nutritional Review */}
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                  <p className="font-semibold text-stone-800 flex items-center gap-1.5 mb-1 text-[11px]">
                    <Sparkles className="size-3 text-[#00615f]" />
                    Đánh giá &amp; Lời khuyên dinh dưỡng:
                  </p>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    {selectedDayEval.review}
                  </p>
                </div>
              </div>
            ) : (
              /* ─── MONTH VIEW: MONTH SUMMARY ─── */
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <p className="text-[10px] text-stone-500 font-medium">Chi phí ước tính</p>
                  <p className="text-base font-bold text-[#00615f]">{formatVND(summary.totalCost)}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <p className="text-[10px] text-stone-500 font-medium">Tổng calo tháng</p>
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
            )}
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
                    Bấm các nút chọn ở danh sách bên dưới để thêm hoặc thay thế món nhanh
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
                      {formatVND(selectedDayCost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-medium text-stone-500">Tổng năng lượng ngày</p>
                    <p className="text-lg font-bold text-stone-800">
                      {selectedDayCalories.toLocaleString()} kcal
                    </p>
                  </div>
                </div>
              </div>

              {/* Smart Grocery Start Banner */}
              <div className="rounded-2xl bg-white border border-stone-200/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="size-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 text-[#00615f]">
                    <ShoppingCart className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-stone-900">
                        Bắt đầu đi chợ
                      </h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                        Khuyên dùng 1 - 7 ngày
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Lên danh sách nguyên liệu theo ngày, trừ đồ có sẵn & gợi ý điểm mua gần nhất trên bản đồ.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenGroceryModal}
                  className="px-4 py-2 rounded-xl bg-[#00615f] hover:bg-[#004e4c] text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
                >
                  <ShoppingCart className="size-3.5" />
                  <span>Bắt đầu đi chợ</span>
                </button>
              </div>
            </div>
          ) : selectedDay ? (
            <div className="space-y-3">
              <div className="rounded-2xl bg-white border border-stone-200/80 shadow-xs p-8 text-center space-y-2">
                <CalendarIcon className="size-8 mx-auto text-stone-300" />
                <p className="text-sm font-semibold text-stone-800">
                  Chưa có món nào cho ngày {selectedDay} {MONTHS[month]}
                </p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Chọn món từ danh sách gợi ý bên dưới để thêm nhanh vào ngày này, hoặc bắt đầu lên kế hoạch đi chợ thông minh.
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-stone-200/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="size-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 text-[#00615f]">
                    <ShoppingCart className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Bắt đầu đi chợ</h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Lập danh sách mua sắm thực phẩm tươi 1 - 7 ngày & chuyển sang Radar bản đồ.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenGroceryModal}
                  className="px-4 py-2 rounded-xl bg-[#00615f] hover:bg-[#004e4c] text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
                >
                  <ShoppingCart className="size-3.5" />
                  <span>Bắt đầu đi chợ</span>
                </button>
              </div>
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
              Bấm 1-chạm vào bữa bạn muốn lên lịch (nếu bữa đó đã có món, hệ thống sẽ hỏi bạn có muốn thay thế không)
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

                  {/* Unified Segmented Action Bar */}
                  <div className="mt-2 pt-2 border-t border-stone-100">
                    <p className="text-[9px] font-semibold text-stone-400 mb-1 text-center">
                      Thêm vào ngày {selectedDay || today.getDate()}:
                    </p>
                    <div className="grid grid-cols-4 gap-0.5 p-0.5 bg-stone-100 rounded-lg">
                      <button
                        onClick={() => handleQuickAddDish(dish, "breakfast")}
                        disabled={isSaving}
                        className="py-1 px-0.5 text-[9px] font-medium text-stone-700 hover:bg-[#00615f] hover:text-white rounded-md transition-colors text-center whitespace-nowrap"
                        title="Thêm vào Bữa Sáng"
                      >
                        + Sáng
                      </button>
                      <button
                        onClick={() => handleQuickAddDish(dish, "lunch")}
                        disabled={isSaving}
                        className="py-1 px-0.5 text-[9px] font-medium text-stone-700 hover:bg-[#00615f] hover:text-white rounded-md transition-colors text-center whitespace-nowrap"
                        title="Thêm vào Bữa Trưa"
                      >
                        + Trưa
                      </button>
                      <button
                        onClick={() => handleQuickAddDish(dish, "dinner")}
                        disabled={isSaving}
                        className="py-1 px-0.5 text-[9px] font-medium text-stone-700 hover:bg-[#00615f] hover:text-white rounded-md transition-colors text-center whitespace-nowrap"
                        title="Thêm vào Bữa Tối"
                      >
                        + Tối
                      </button>
                      <button
                        onClick={() => handleQuickAddDish(dish, "snack")}
                        disabled={isSaving}
                        className="py-1 px-0.5 text-[9px] font-medium text-stone-700 hover:bg-[#00615f] hover:text-white rounded-md transition-colors text-center whitespace-nowrap"
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

      {/* ══════ POPUP: CONFIRM REPLACE DISH MODAL ══════ */}
      {replaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <ArrowRightLeft className="size-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">
                    Thay thế món trong thực đơn?
                  </h3>
                  <p className="text-[10px] text-stone-500">
                    Bữa {SLOT_META[replaceModal.slot].label} ngày {replaceModal.targetDay}/{month + 1}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReplaceModal(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Bữa này hiện đã có món ăn. Bạn có muốn thay thế bằng món mới chọn không?
            </p>

            {/* Comparison Cards */}
            <div className="space-y-2">
              {/* Old dish */}
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center gap-2.5">
                <DishThumbnail src={replaceModal.oldMeal.image} alt={replaceModal.oldMeal.meal} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-semibold text-stone-400 uppercase">Món hiện tại</p>
                  <p className="text-xs font-bold text-stone-800 truncate">{replaceModal.oldMeal.meal}</p>
                  <p className="text-[10px] text-stone-500">{replaceModal.oldMeal.calories} kcal · {formatVND(replaceModal.oldMeal.cost)}</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="text-center text-stone-400">
                <span className="text-xs font-bold">↓ thay bằng</span>
              </div>

              {/* New dish */}
              <div className="p-2.5 rounded-xl bg-[#00615f]/5 border border-[#00615f]/20 flex items-center gap-2.5">
                <DishThumbnail src={replaceModal.newDish.partnerImage || replaceModal.newDish.image} alt={replaceModal.newDish.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-semibold text-[#00615f] uppercase">Món mới chọn</p>
                  <p className="text-xs font-bold text-stone-900 truncate">{replaceModal.newDish.name}</p>
                  <p className="text-[10px] text-stone-600 font-medium">{replaceModal.newDish.calories} kcal · {formatVND(replaceModal.newDish.cost)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setReplaceModal(null)}
                className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
              >
                Giữ món cũ
              </button>
              <button
                type="button"
                onClick={handleConfirmReplace}
                disabled={isSaving}
                className="flex-1 py-2 px-3 rounded-xl bg-[#00615f] hover:bg-[#004d4b] text-white text-xs font-semibold transition shadow-xs"
              >
                Thay thế món
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ SHOPPING LIST MODAL ══════ */}
      {isGroceryWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 space-y-5 max-h-[90vh] flex flex-col">
            {/* Wizard Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-emerald-50 text-[#00615f] border border-emerald-200/80 flex items-center justify-center">
                  <ShoppingCart className="size-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">
                    Lên kế hoạch đi chợ thông minh
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Bước {groceryStep}/3: {groceryStep === 1 ? "Chọn thời gian" : groceryStep === 2 ? "Lọc đồ có sẵn" : "Gợi ý điểm mua"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGroceryWizardOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Step by Step */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {groceryStep === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  {/* System Recommendation Advice Callout */}
                  <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-3.5 flex items-start gap-3 text-xs">
                    <Info className="size-4 text-[#00615f] shrink-0 mt-0.5" />
                    <div className="space-y-1 text-emerald-950">
                      <p className="font-bold">
                        Lời khuyên dinh dưỡng từ FoodSaver:
                      </p>
                      <p className="text-[11px] leading-relaxed text-stone-600">
                        Hệ thống khuyên bạn chỉ nên đi chợ cho <strong>tối đa 7 ngày</strong> (lý tưởng nhất là 3 ngày). Mua thực phẩm quá 7 ngày rau củ dễ mất vitamin, giảm độ tươi ngon và tăng nguy cơ lãng phí.
                      </p>
                    </div>
                  </div>

                  {/* Preset Options */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-700 block">
                      Chọn khoảng thời gian đi chợ:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setGroceryDaysMode("today")}
                        className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                          groceryDaysMode === "today"
                            ? "bg-emerald-50/60 border-[#00615f] text-stone-900 ring-2 ring-[#00615f]/20"
                            : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">⚡ Hôm nay (1 ngày)</p>
                          <p className="text-[11px] text-stone-500">Chỉ mua cho các bữa trong ngày</p>
                        </div>
                        {groceryDaysMode === "today" && <Check className="size-4 text-[#00615f]" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setGroceryDaysMode("3days")}
                        className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                          groceryDaysMode === "3days"
                            ? "bg-emerald-50/60 border-[#00615f] text-stone-900 ring-2 ring-[#00615f]/20"
                            : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold">🗓️ 3 ngày tới</p>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00615f] text-white">
                              Khuyên dùng ⭐
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">Độ tươi & dinh dưỡng tốt nhất</p>
                        </div>
                        {groceryDaysMode === "3days" && <Check className="size-4 text-[#00615f]" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setGroceryDaysMode("7days")}
                        className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                          groceryDaysMode === "7days"
                            ? "bg-emerald-50/60 border-[#00615f] text-stone-900 ring-2 ring-[#00615f]/20"
                            : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold">📅 7 ngày tới</p>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-200 text-stone-700">
                              Tối đa
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">Chuẩn bảo quản lạnh 1 tuần</p>
                        </div>
                        {groceryDaysMode === "7days" && <Check className="size-4 text-[#00615f]" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setGroceryDaysMode("custom")}
                        className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                          groceryDaysMode === "custom"
                            ? "bg-emerald-50/60 border-[#00615f] text-stone-900 ring-2 ring-[#00615f]/20"
                            : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">✏️ Tự nhập số ngày</p>
                          <p className="text-[11px] text-stone-500">Nhập từ 1 đến 7 ngày</p>
                        </div>
                        {groceryDaysMode === "custom" && <Check className="size-4 text-[#00615f]" />}
                      </button>
                    </div>
                  </div>

                  {/* Custom Days Input Stepper */}
                  {groceryDaysMode === "custom" && (
                    <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-stone-800">Số ngày muốn đi chợ:</p>
                        <p className="text-[11px] text-stone-500">Giới hạn từ 1 đến tối đa 7 ngày</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCustomDays(Math.max(1, customDays - 1))}
                          disabled={customDays <= 1}
                          className="size-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-40 transition"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="font-bold text-base text-stone-900 min-w-8 text-center">
                          {customDays} ngày
                        </span>
                        <button
                          type="button"
                          onClick={() => setCustomDays(Math.min(7, customDays + 1))}
                          disabled={customDays >= 7}
                          className="size-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-40 transition"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Period & Meals Preview Card */}
                  <div className="rounded-2xl bg-stone-50 border border-stone-200/80 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 font-medium">Khoảng thời gian:</span>
                      <span className="font-bold text-stone-800">{groceryRangeLabel}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 font-medium">Bữa ăn đã lên lịch:</span>
                      <span className="font-bold text-[#00615f]">{plannedMealsCountInWindow} bữa ăn</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 font-medium">Tổng nguyên liệu ước tính:</span>
                      <span className="font-bold text-stone-800">{aggregatedList.length} nguyên liệu</span>
                    </div>
                  </div>
                </div>
              )}

              {groceryStep === 2 && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">
                        Nguyên liệu đã có sẵn ở nhà:
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Tích chọn món đã có để hệ thống trừ ra, giúp bạn không mua dư thừa.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const next = new Set(haveAtHome);
                          aggregatedList.forEach((item) => {
                            if (item.category === "Gia vị & Đồ khô") next.add(item.name);
                          });
                          setHaveAtHome(next);
                          toast.success("Đã tích nhanh gia vị có sẵn!");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition"
                      >
                        🧂 Tích gia vị bếp
                      </button>
                      <button
                        type="button"
                        onClick={() => setHaveAtHome(new Set())}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-[11px] font-medium transition"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>

                  {/* Live Budget KPI Bar */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-center">
                    <div>
                      <p className="text-[10px] text-stone-500">Đã có ở nhà</p>
                      <p className="text-xs font-bold text-emerald-700">{haveAtHome.size} món</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-500">Thực sự cần mua</p>
                      <p className="text-xs font-bold text-[#00615f]">{neededIngredients.length} món</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-500">Chi phí dự kiến</p>
                      <p className="text-xs font-bold text-stone-900">{formatVND(neededCost)}</p>
                    </div>
                  </div>

                  {/* Interactive Ingredients List */}
                  <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                    {aggregatedList.map((item, idx) => {
                      const isHave = haveAtHome.has(item.name);
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleHaveAtHome(item.name)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-2.5 ${
                            isHave
                              ? "bg-stone-50 border-stone-200 text-stone-400"
                              : "bg-white border-stone-200/90 hover:border-[#00615f] text-stone-800 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`size-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                              isHave ? "bg-emerald-600 border-emerald-600 text-white" : "border-stone-300 bg-white"
                            }`}>
                              {isHave && <Check className="size-3.5 stroke-[3]" />}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-medium truncate ${isHave ? "line-through text-stone-400" : "text-stone-900"}`}>
                                {item.name}
                              </p>
                              <p className="text-[10px] text-stone-400 truncate">
                                {item.category} • Từ: {item.meals.slice(0, 2).join(", ")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-[11px] font-semibold ${isHave ? "line-through text-stone-400" : "text-[#00615f]"}`}>
                              ~{formatVND(item.estimatedPrice)}
                            </span>
                            <span className="block text-[9px] text-stone-400">
                              {isHave ? "Có sẵn" : "Cần mua"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {groceryStep === 3 && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      Gợi ý điểm mua nguyên liệu gần nhất:
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Hệ thống tự động quét các đối tác lân cận có nguyên liệu sạch đạt chuẩn ATTP.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {NEARBY_STORES.map((store) => (
                      <div
                        key={store.id}
                        className="p-3.5 rounded-2xl bg-white border border-stone-200 hover:border-[#00615f] shadow-xs transition space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Store className="size-4 text-[#00615f]" />
                            <span className="text-xs font-bold text-stone-900">{store.name}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Cách {store.distanceKm} km
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">{store.address}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
                          <span className="text-stone-600 font-medium">
                            Khớp {store.matchPercentage}% danh sách nguyên liệu
                          </span>
                          <span className="text-[#00615f] font-semibold">{store.badge}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Footer Controls */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (groceryStep > 1) setGroceryStep((groceryStep - 1) as any);
                  else setIsGroceryWizardOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition"
              >
                {groceryStep === 1 ? "Đóng" : "Quay lại"}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (groceryStep < 3) {
                    setGroceryStep((groceryStep + 1) as any);
                  } else {
                    setIsGroceryWizardOpen(false);
                    setIsUrgentGoShoppingOpen(true);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-[#00615f] hover:bg-[#004e4c] text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <span>{groceryStep === 3 ? "Xem tóm tắt & Đi chợ" : "Tiếp tục"}</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ POPUP "ĐI CHỢ NGAY" (URGENT PULSE ANIMATION) ══════ */}
      {isUrgentGoShoppingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-stone-200/90 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#00615f] border border-emerald-200/80 text-xs font-bold">
                <Sparkles className="size-3.5 text-[#00615f]" />
                <span>RADAR ĐI CHỢ ĐÃ SẴN SÀNG</span>
              </div>
              <button
                onClick={() => setIsUrgentGoShoppingOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-900">
                Sẵn sàng xuất phát đi chợ! 🛒
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Đã tổng hợp <strong>{neededIngredients.length} nguyên liệu</strong> cho <strong>{effectiveDaysCount} ngày</strong> ({groceryRangeLabel}). Hệ thống đã chuẩn bị radar bản đồ để dẫn đường đến đối tác gần nhất.
              </p>
            </div>

            {/* Highlights Card */}
            <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Nguyên liệu cần mua:</span>
                <span className="font-bold text-[#00615f]">{neededIngredients.length} món</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Chi phí ước tính:</span>
                <span className="font-bold text-stone-900">~{formatVND(neededCost)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Đã tiết kiệm (đồ có sẵn):</span>
                <span className="font-bold text-emerald-700">~{formatVND(savedAmount)}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-stone-200/80">
                <span className="text-stone-500">Điểm đến tối ưu:</span>
                <span className="font-bold text-stone-800">GreenMart (Cách 0.6 km)</span>
              </div>
            </div>

            {/* Ingredients Preview Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {neededIngredients.slice(0, 5).map((ing, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-medium"
                >
                  {ing.name}
                </span>
              ))}
              {neededIngredients.length > 5 && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                  +{neededIngredients.length - 5} món khác
                </span>
              )}
            </div>

            {/* ═══ THE PULSING CTA BUTTON: "ĐI CHỢ NGAY TRÊN BẢN ĐỒ" ═══ */}
            <button
              type="button"
              onClick={() => {
                const cartData = {
                  daysCount: effectiveDaysCount,
                  dateRangeStr: groceryRangeLabel,
                  totalItems: aggregatedList.length,
                  neededItems: neededIngredients.map((item) => ({
                    name: item.name,
                    category: item.category,
                    estimatedPrice: item.estimatedPrice,
                    checked: false,
                  })),
                  haveAtHome: Array.from(haveAtHome),
                  savedMoney: savedAmount,
                  neededCost: neededCost,
                  nearestStore: NEARBY_STORES[0],
                  createdAt: Date.now(),
                };
                try {
                  localStorage.setItem("foodsaver_shopping_cart", JSON.stringify(cartData));
                } catch (e) {
                  console.error("Failed to save shopping cart:", e);
                }
                setIsUrgentGoShoppingOpen(false);
                toast.success("Đã đồng bộ danh sách đi chợ vào Radar bản đồ!");
                router.push("/map?fromPlanner=true");
              }}
              className="group relative w-full py-3.5 px-6 rounded-2xl bg-[#00615f] hover:bg-[#004e4c] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-[#00615f]/25 transition-all active:scale-[0.98] animate-pulse ring-4 ring-[#00615f]/30 hover:ring-[#00615f]/60 flex items-center justify-center gap-2 overflow-hidden cursor-pointer"
            >
              <Navigation className="size-4 animate-bounce shrink-0" />
              <span>ĐI CHỢ NGAY TRÊN BẢN ĐỒ</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform shrink-0" />
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsUrgentGoShoppingOpen(false);
                  setIsGroceryWizardOpen(true);
                  setGroceryStep(2);
                }}
                className="text-[11px] text-stone-500 hover:text-stone-800 transition"
              >
                ◀ Xem lại danh sách nguyên liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
