"use client";

import React, { useState } from "react";
import {
  ChefHat,
  Flame,
  Clock,
  Users,
  Search,
  Leaf,
  Heart,
  ChevronRight,
  Star,
  ShoppingCart,
  Sparkles,
  Apple,
  Beef,
  Egg,
  Carrot,
  Fish,
  Loader2,
} from "lucide-react";
import { useGetRecipesQuery, RecipeDTO } from "@/redux/api/mealPlannerApi";

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

const DAILY_TARGET = 2000;

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function MealPlannerPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  const { data: response, isLoading, isFetching } = useGetRecipesQuery({
    category: activeCategory,
    search: searchQuery,
  });

  const recipes: RecipeDTO[] = response?.data || [];

  return (
    <div className="space-y-6">
      {/* ══════ DAILY NUTRITION SUMMARY ══════ */}
      <section className="mb-2">
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
      <section className="mb-2">
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
      <section>
        {isLoading || isFetching ? (
          <div className="text-center py-16">
            <Loader2 className="size-8 mx-auto animate-spin text-[#00615f] mb-3" />
            <p className="text-sm font-medium text-stone-500">Đang tải công thức món ăn...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-16">
            <ChefHat className="size-12 mx-auto text-stone-300 mb-3" />
            <p className="text-sm text-stone-500">Không tìm thấy món ăn phù hợp</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {recipes.map((recipe) => {
              const isExpanded = expandedRecipe === recipe.id;
              const ingredientsList = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
              const stepsList = Array.isArray(recipe.steps) ? recipe.steps : [];
              const tagsList = Array.isArray(recipe.tags) ? recipe.tags : [];
              const totalIngredientCost = ingredientsList.reduce(
                (sum, ing) => sum + (Number(ing.estimatedPrice) || 0),
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
                      {tagsList.map((tag, idx) => (
                        <span
                          key={idx}
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
                        ~{formatVND(Math.round(totalIngredientCost / (recipe.servings || 1)))}
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
                          Nguyên liệu ({ingredientsList.length} món)
                        </h4>
                        <div className="space-y-1.5">
                          {ingredientsList.map((ing, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-stone-50/80"
                            >
                              <span className="text-stone-700">{ing.name} <span className="text-stone-400">({ing.amount})</span></span>
                              <span className="font-semibold text-[#00615f]">~{formatVND(Number(ing.estimatedPrice) || 0)}</span>
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
                          {stepsList.map((step, idx) => (
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
