"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChefHat,
  Flame,
  Clock,
  Users,
  Search,
  Leaf,
  Heart,
  Calendar,
  MessageCircle,
  ChevronRight,
  Star,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  Apple,
  Beef,
  Egg,
  Carrot,
  Fish,
} from "lucide-react";

/* ─── static recipe data (will connect to API later) ─── */
interface Recipe {
  id: string;
  name: string;
  image: string;
  calories: number;
  cookTime: number;
  servings: number;
  cost: number;
  category: string;
  tags: string[];
  ingredients: { name: string; amount: string; estimatedPrice: number }[];
  steps: string[];
  rating: number;
  reviews: number;
}

const CATEGORIES = [
  { key: "all", label: "Tất cả", icon: Sparkles },
  { key: "com", label: "Cơm", icon: Beef },
  { key: "bun-pho", label: "Bún / Phở", icon: ChefHat },
  { key: "chay", label: "Món chay", icon: Leaf },
  { key: "an-sang", label: "Ăn sáng", icon: Egg },
  { key: "an-vat", label: "Ăn vặt", icon: Apple },
  { key: "canh", label: "Canh / Soup", icon: Fish },
  { key: "salad", label: "Salad", icon: Carrot },
];

const RECIPES: Recipe[] = [
  {
    id: "1",
    name: "Cơm tấm sườn bì chả",
    image: "🍚",
    calories: 650,
    cookTime: 35,
    servings: 2,
    cost: 35000,
    category: "com",
    tags: ["protein cao", "no lâu"],
    ingredients: [
      { name: "Sườn heo", amount: "300g", estimatedPrice: 25000 },
      { name: "Gạo tấm", amount: "200g", estimatedPrice: 5000 },
      { name: "Bì heo", amount: "100g", estimatedPrice: 8000 },
      { name: "Trứng", amount: "2 quả", estimatedPrice: 6000 },
      { name: "Đồ chua", amount: "1 chén", estimatedPrice: 3000 },
      { name: "Nước mắm pha", amount: "50ml", estimatedPrice: 2000 },
    ],
    steps: [
      "Ướp sườn với sả, tỏi, nước mắm, đường 30 phút",
      "Nấu cơm tấm bằng gạo tấm",
      "Nướng / chiên sườn đến vàng đều",
      "Chiên trứng ốp la, trộn bì",
      "Bày cơm ra đĩa, xếp sườn, bì, chả, trứng lên trên",
    ],
    rating: 4.8,
    reviews: 124,
  },
  {
    id: "2",
    name: "Bún bò Huế",
    image: "🍜",
    calories: 520,
    cookTime: 60,
    servings: 4,
    cost: 30000,
    category: "bun-pho",
    tags: ["đậm đà", "truyền thống"],
    ingredients: [
      { name: "Bắp bò", amount: "500g", estimatedPrice: 40000 },
      { name: "Giò heo", amount: "300g", estimatedPrice: 20000 },
      { name: "Bún tươi", amount: "500g", estimatedPrice: 10000 },
      { name: "Sả", amount: "5 cây", estimatedPrice: 3000 },
      { name: "Mắm ruốc", amount: "2 muỗng", estimatedPrice: 5000 },
      { name: "Rau sống", amount: "1 bó", estimatedPrice: 5000 },
    ],
    steps: [
      "Ninh xương bò, giò heo 2 tiếng lấy nước dùng",
      "Phi sả băm, thêm mắm ruốc tạo màu",
      "Nêm nếm vừa ăn, thêm ớt sa tế",
      "Trụng bún, xếp thịt bò, giò heo lên trên",
      "Chan nước dùng nóng, ăn kèm rau sống",
    ],
    rating: 4.9,
    reviews: 256,
  },
  {
    id: "3",
    name: "Cơm rang dưa bò",
    image: "🍳",
    calories: 480,
    cookTime: 15,
    servings: 1,
    cost: 25000,
    category: "com",
    tags: ["nhanh", "tiết kiệm"],
    ingredients: [
      { name: "Cơm nguội", amount: "1 bát to", estimatedPrice: 3000 },
      { name: "Thịt bò", amount: "100g", estimatedPrice: 15000 },
      { name: "Dưa chua", amount: "50g", estimatedPrice: 3000 },
      { name: "Hành lá", amount: "2 cây", estimatedPrice: 1000 },
      { name: "Trứng", amount: "1 quả", estimatedPrice: 3000 },
      { name: "Gia vị", amount: "ít", estimatedPrice: 2000 },
    ],
    steps: [
      "Xào thịt bò tái với tỏi, dầu hào",
      "Cho dưa chua vào xào nhanh",
      "Thêm cơm nguội, đảo đều lửa lớn",
      "Nêm nước mắm, tiêu vừa ăn",
      "Rắc hành lá, ăn kèm trứng ốp la",
    ],
    rating: 4.6,
    reviews: 89,
  },
  {
    id: "4",
    name: "Phở bò tái nạm",
    image: "🍲",
    calories: 450,
    cookTime: 90,
    servings: 4,
    cost: 28000,
    category: "bun-pho",
    tags: ["truyền thống", "ấm bụng"],
    ingredients: [
      { name: "Xương bò", amount: "1kg", estimatedPrice: 35000 },
      { name: "Thịt bò tái", amount: "200g", estimatedPrice: 25000 },
      { name: "Nạm bò", amount: "200g", estimatedPrice: 20000 },
      { name: "Bánh phở", amount: "400g", estimatedPrice: 10000 },
      { name: "Hành tây", amount: "1 củ", estimatedPrice: 3000 },
      { name: "Gừng, quế, hồi", amount: "ít", estimatedPrice: 5000 },
    ],
    steps: [
      "Ninh xương bò 3-4 tiếng, vớt bọt",
      "Nướng hành tây, gừng rồi cho vào nồi",
      "Thêm quế, hồi, nêm nước mắm",
      "Trụng bánh phở, xếp thịt tái, nạm",
      "Chan nước dùng sôi, ăn kèm giá, rau thơm",
    ],
    rating: 4.9,
    reviews: 312,
  },
  {
    id: "5",
    name: "Canh chua cá lóc",
    image: "🐟",
    calories: 280,
    cookTime: 25,
    servings: 3,
    cost: 32000,
    category: "canh",
    tags: ["nhẹ bụng", "vitamin"],
    ingredients: [
      { name: "Cá lóc", amount: "400g", estimatedPrice: 25000 },
      { name: "Thơm (dứa)", amount: "1/2 trái", estimatedPrice: 5000 },
      { name: "Cà chua", amount: "2 trái", estimatedPrice: 4000 },
      { name: "Đậu bắp", amount: "100g", estimatedPrice: 3000 },
      { name: "Me", amount: "30g", estimatedPrice: 3000 },
      { name: "Rau ngò om", amount: "1 bó", estimatedPrice: 2000 },
    ],
    steps: [
      "Nấu nước dùng với me, thơm, cà chua",
      "Cho cá lóc vào nấu chín",
      "Thêm đậu bắp, giá đỗ",
      "Nêm nước mắm, đường vừa ăn",
      "Rắc ngò om, ăn kèm cơm trắng",
    ],
    rating: 4.7,
    reviews: 78,
  },
  {
    id: "6",
    name: "Bánh mì ốp la",
    image: "🥖",
    calories: 380,
    cookTime: 10,
    servings: 1,
    cost: 15000,
    category: "an-sang",
    tags: ["nhanh", "rẻ", "tiện"],
    ingredients: [
      { name: "Bánh mì", amount: "1 ổ", estimatedPrice: 3000 },
      { name: "Trứng", amount: "2 quả", estimatedPrice: 6000 },
      { name: "Pate", amount: "1 muỗng", estimatedPrice: 3000 },
      { name: "Rau, dưa leo", amount: "ít", estimatedPrice: 2000 },
      { name: "Nước tương, ớt", amount: "ít", estimatedPrice: 1000 },
    ],
    steps: [
      "Chiên trứng ốp la 2 quả",
      "Nướng giòn bánh mì",
      "Phết pate vào ruột bánh",
      "Kẹp trứng, rau, dưa leo",
      "Rưới nước tương, ớt tùy khẩu vị",
    ],
    rating: 4.5,
    reviews: 203,
  },
  {
    id: "7",
    name: "Gỏi cuốn tôm thịt",
    image: "🥬",
    calories: 220,
    cookTime: 20,
    servings: 2,
    cost: 22000,
    category: "chay",
    tags: ["healthy", "ít calo"],
    ingredients: [
      { name: "Bánh tráng", amount: "10 cái", estimatedPrice: 5000 },
      { name: "Tôm", amount: "200g", estimatedPrice: 15000 },
      { name: "Thịt ba chỉ luộc", amount: "100g", estimatedPrice: 10000 },
      { name: "Bún tươi", amount: "100g", estimatedPrice: 3000 },
      { name: "Rau sống các loại", amount: "1 bó", estimatedPrice: 5000 },
      { name: "Tương đậu phộng", amount: "50ml", estimatedPrice: 4000 },
    ],
    steps: [
      "Luộc tôm, thịt ba chỉ, để nguội thái lát",
      "Chuẩn bị rau sống, bún",
      "Nhúng bánh tráng nước ấm, trải ra",
      "Xếp rau, bún, thịt, tôm rồi cuốn chặt",
      "Chấm tương đậu phộng",
    ],
    rating: 4.7,
    reviews: 91,
  },
  {
    id: "8",
    name: "Xôi xéo",
    image: "🫘",
    calories: 420,
    cookTime: 40,
    servings: 2,
    cost: 18000,
    category: "an-sang",
    tags: ["truyền thống", "no lâu"],
    ingredients: [
      { name: "Gạo nếp", amount: "300g", estimatedPrice: 8000 },
      { name: "Đậu xanh", amount: "100g", estimatedPrice: 5000 },
      { name: "Hành phi", amount: "50g", estimatedPrice: 5000 },
      { name: "Mỡ hành", amount: "2 muỗng", estimatedPrice: 3000 },
      { name: "Nghệ", amount: "ít", estimatedPrice: 2000 },
    ],
    steps: [
      "Ngâm nếp 4 tiếng, trộn nghệ, hấp chín",
      "Nấu nhuyễn đậu xanh, tán mịn",
      "Phi hành khô giòn vàng",
      "Xới xôi ra, phủ đậu xanh, rưới mỡ hành",
      "Rắc hành phi lên trên",
    ],
    rating: 4.6,
    reviews: 67,
  },
];

const DAILY_TARGET = 2000;

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function MealPlannerPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = RECIPES;
    if (activeCategory !== "all") {
      list = list.filter((r) => r.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f3f0] to-[#fef9f6]">
      {/* ══════ HERO ══════ */}
      <section className="relative pt-24 pb-10 sm:pt-28 sm:pb-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00615f]/5 via-transparent to-[#79e4a7]/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00615f]/10 text-[#00615f] text-xs font-bold">
              <ChefHat className="size-4" />
              <span>Thực đơn thông minh cho sinh viên</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
              Hôm nay ăn gì<span className="text-[#00615f]">?</span>
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-lg mx-auto">
              Khám phá công thức nấu ăn tiết kiệm, đầy đủ dinh dưỡng. Lên kế
              hoạch bữa ăn hàng tháng, chia sẻ kinh nghiệm cùng cộng đồng.
            </p>
          </div>

          {/* ── Quick nav cards ── */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <Link
              href="/meal-planner"
              className="group p-4 rounded-2xl bg-white/80 backdrop-blur border border-[#00615f]/20 shadow-sm hover:shadow-md hover:border-[#00615f]/40 transition-all text-center"
            >
              <ChefHat className="size-7 mx-auto text-[#00615f] group-hover:scale-110 transition-transform" />
              <p className="mt-2 text-xs font-bold text-stone-800">Thực đơn</p>
              <p className="text-[10px] text-stone-500">Công thức & nguyên liệu</p>
            </Link>
            <Link
              href="/meal-planner/calendar"
              className="group p-4 rounded-2xl bg-white/80 backdrop-blur border border-orange-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all text-center"
            >
              <Calendar className="size-7 mx-auto text-orange-500 group-hover:scale-110 transition-transform" />
              <p className="mt-2 text-xs font-bold text-stone-800">Lịch ăn tháng</p>
              <p className="text-[10px] text-stone-500">Kế hoạch & chi phí</p>
            </Link>
            <Link
              href="/meal-planner/community"
              className="group p-4 rounded-2xl bg-white/80 backdrop-blur border border-violet-200 shadow-sm hover:shadow-md hover:border-violet-300 transition-all text-center"
            >
              <Users className="size-7 mx-auto text-violet-500 group-hover:scale-110 transition-transform" />
              <p className="mt-2 text-xs font-bold text-stone-800">Cộng đồng</p>
              <p className="text-[10px] text-stone-500">Chia sẻ từ SV đi trước</p>
            </Link>
            <Link
              href="/meal-planner/chat"
              className="group p-4 rounded-2xl bg-white/80 backdrop-blur border border-sky-200 shadow-sm hover:shadow-md hover:border-sky-300 transition-all text-center"
            >
              <MessageCircle className="size-7 mx-auto text-sky-500 group-hover:scale-110 transition-transform" />
              <p className="mt-2 text-xs font-bold text-stone-800">Trợ lý AI</p>
              <p className="text-[10px] text-stone-500">Hỏi đáp tài chính</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════ DAILY NUTRITION SUMMARY ══════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="p-5 rounded-2xl bg-white/70 backdrop-blur border border-stone-200/80 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Mục tiêu calo hàng ngày</p>
              <p className="text-2xl font-black text-stone-900">{DAILY_TARGET.toLocaleString()} kcal</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="size-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Flame className="size-5" />
                </div>
                <p className="mt-1 text-[10px] font-semibold text-stone-500">Sáng</p>
                <p className="text-sm font-bold text-stone-800">~400 kcal</p>
              </div>
              <div className="text-center">
                <div className="size-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
                  <Flame className="size-5" />
                </div>
                <p className="mt-1 text-[10px] font-semibold text-stone-500">Trưa</p>
                <p className="text-sm font-bold text-stone-800">~700 kcal</p>
              </div>
              <div className="text-center">
                <div className="size-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                  <Flame className="size-5" />
                </div>
                <p className="mt-1 text-[10px] font-semibold text-stone-500">Tối</p>
                <p className="text-sm font-bold text-stone-800">~600 kcal</p>
              </div>
              <div className="text-center">
                <div className="size-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
                  <Apple className="size-5" />
                </div>
                <p className="mt-1 text-[10px] font-semibold text-stone-500">Snack</p>
                <p className="text-sm font-bold text-stone-800">~300 kcal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ SEARCH & FILTER ══════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm món ăn, nguyên liệu..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 backdrop-blur border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f]/40 transition"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#00615f] text-white shadow-md"
                    : "bg-white/80 text-stone-600 border border-stone-200 hover:border-[#00615f]/30 hover:text-[#00615f]"
                }`}
              >
                <Icon className="size-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ══════ RECIPE GRID ══════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <ChefHat className="size-12 mx-auto text-stone-300 mb-3" />
            <p className="text-sm text-stone-500">Không tìm thấy món ăn phù hợp</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((recipe) => {
              const isExpanded = expandedRecipe === recipe.id;
              const totalIngredientCost = recipe.ingredients.reduce(
                (sum, ing) => sum + ing.estimatedPrice,
                0
              );
              return (
                <div
                  key={recipe.id}
                  className="group rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm hover:shadow-lg transition-all overflow-hidden"
                >
                  {/* Card header */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl">{recipe.image}</div>
                      <button className="p-1.5 rounded-full hover:bg-rose-50 text-stone-300 hover:text-rose-500 transition">
                        <Heart className="size-4" />
                      </button>
                    </div>
                    <h3 className="mt-2 font-bold text-stone-900 text-sm leading-snug">{recipe.name}</h3>
                    <div className="mt-1.5 flex items-center gap-1">
                      <Star className="size-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-stone-600">{recipe.rating}</span>
                      <span className="text-[10px] text-stone-400">({recipe.reviews})</span>
                    </div>

                    {/* Quick stats */}
                    <div className="mt-3 flex items-center gap-3 text-[10px] text-stone-500">
                      <span className="inline-flex items-center gap-1">
                        <Flame className="size-3 text-orange-400" />
                        {recipe.calories} kcal
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3 text-sky-400" />
                        {recipe.cookTime} phút
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3 text-violet-400" />
                        {recipe.servings} người
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {recipe.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-[#00615f]/8 text-[#00615f] text-[10px] font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cost bar */}
                  <div className="px-5 py-2.5 bg-emerald-50/50 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-stone-500">Chi phí ước tính / người</p>
                      <p className="text-sm font-black text-[#00615f]">
                        ~{formatVND(Math.round(totalIngredientCost / recipe.servings))}
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedRecipe(isExpanded ? null : recipe.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#00615f] text-white text-[10px] font-bold hover:bg-[#004d4b] transition"
                    >
                      {isExpanded ? "Thu gọn" : "Xem chi tiết"}
                      <ChevronRight className={`size-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </button>
                  </div>

                  {/* Expandable detail */}
                  {isExpanded && (
                    <div className="px-5 py-4 border-t border-stone-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      {/* Ingredients */}
                      <div>
                        <h4 className="text-xs font-bold text-stone-700 mb-2 flex items-center gap-1.5">
                          <ShoppingCart className="size-3.5 text-[#00615f]" />
                          Nguyên liệu ({recipe.ingredients.length} món)
                        </h4>
                        <div className="space-y-1.5">
                          {recipe.ingredients.map((ing, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-stone-50/80"
                            >
                              <span className="text-stone-700">{ing.name} <span className="text-stone-400">({ing.amount})</span></span>
                              <span className="font-semibold text-[#00615f]">~{formatVND(ing.estimatedPrice)}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between text-xs py-2 px-2.5 rounded-lg bg-[#00615f]/5 font-bold">
                            <span className="text-stone-700">Tổng nguyên liệu</span>
                            <span className="text-[#00615f]">~{formatVND(totalIngredientCost)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Steps */}
                      <div>
                        <h4 className="text-xs font-bold text-stone-700 mb-2">Cách làm</h4>
                        <ol className="space-y-2">
                          {recipe.steps.map((step, idx) => (
                            <li key={idx} className="flex gap-2.5 text-xs text-stone-600">
                              <span className="shrink-0 size-5 rounded-full bg-[#00615f] text-white text-[10px] font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
