"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Store,
  Tag,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetRecipesQuery, RecipeDTO } from "@/redux/api/mealPlannerApi";
import { AddToCalendarModal } from "@/components/meal-planner/AddToCalendarModal";

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
  return (n || 0).toLocaleString("vi-VN") + "đ";
}

function RecipeImage({ recipe }: { recipe: RecipeDTO }) {
  const [hasError, setHasError] = useState(false);
  const imageUrl = recipe.partnerImage || recipe.image;
  const isUrl = imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("/"));

  if (!isUrl || hasError) {
    return (
      <div className="w-full h-44 bg-stone-100 border-b border-stone-200/60 flex items-center justify-center text-4xl select-none text-stone-400">
        {recipe.image && !isUrl ? recipe.image : "🍲"}
      </div>
    );
  }

  return (
    <div className="w-full h-44 overflow-hidden relative bg-stone-100 border-b border-stone-200/60">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={recipe.name}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
    </div>
  );
}

export default function MealPlannerPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [calendarModalRecipe, setCalendarModalRecipe] = useState<RecipeDTO | null>(null);

  const { data: response, isLoading, isFetching } = useGetRecipesQuery({
    category: activeCategory,
    search: searchQuery,
  });

  const recipes: RecipeDTO[] = response?.data || [];

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* ══════ CALM NUTRITION TARGET BANNER ══════ */}
      <section>
        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Mục tiêu dinh dưỡng hàng ngày
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-stone-900 tracking-tight">
                  {DAILY_TARGET.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-stone-500">kcal / ngày</span>
              </div>
            </div>

            {/* Subdued Meal Target Breakdown */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 divide-x divide-stone-100 sm:divide-x-0">
              {[
                { label: "Sáng", kcal: "~400" },
                { label: "Trưa", kcal: "~700" },
                { label: "Tối", kcal: "~600" },
                { label: "Snack", kcal: "~300" },
              ].map((m) => (
                <div key={m.label} className="text-center sm:px-3">
                  <p className="text-[11px] font-medium text-stone-500">{m.label}</p>
                  <p className="text-sm font-bold text-stone-800 mt-0.5">{m.kcal} kcal</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ SEARCH & FILTER ══════ */}
      <section className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm món ăn, nguyên liệu, đồ cứu trợ đối tác..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] transition"
          />
        </div>

        {/* Minimal Categories Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#00615f] text-white shadow-xs"
                    : "bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50 hover:text-stone-900"
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
            <Loader2 className="size-6 mx-auto animate-spin text-[#00615f] mb-2" />
            <p className="text-xs font-medium text-stone-500">Đang tải công thức món ăn...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200/80">
            <ChefHat className="size-10 mx-auto text-stone-300 mb-2" />
            <p className="text-xs font-medium text-stone-500">Không tìm thấy món ăn phù hợp</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recipes.map((recipe) => {
              const isExpanded = expandedRecipe === recipe.id;
              const isFav = Boolean(favorites[recipe.id]);
              const ingredientsList = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
              const stepsList = Array.isArray(recipe.steps) ? recipe.steps : [];
              const tagsList = Array.isArray(recipe.tags) ? recipe.tags : [];
              const totalIngredientCost = ingredientsList.reduce(
                (sum, ing) => sum + (Number(ing.estimatedPrice) || 0),
                0
              );
              const hasPartnerPhoto = Boolean(recipe.partnerImage);

              return (
                <div
                  key={recipe.id}
                  className="group rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Photo Header */}
                    <div className="relative">
                      <Link href={`/meal-planner/${recipe.id}`} className="block">
                        <RecipeImage recipe={recipe} />
                      </Link>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(recipe.id, e)}
                        className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition shadow-xs ${
                          isFav
                            ? "bg-rose-500 text-white"
                            : "bg-white/80 text-stone-500 hover:text-rose-500 hover:bg-white"
                        }`}
                        title={isFav ? "Bỏ yêu thích" : "Yêu thích món này"}
                      >
                        <Heart className={`size-3.5 ${isFav ? "fill-white" : ""}`} />
                      </button>

                      {/* Subdued Partner Badge */}
                      {hasPartnerPhoto && recipe.partnerStoreName ? (
                        <div className="absolute bottom-2 left-2 right-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-md text-stone-200 text-[10px] font-medium">
                            <Store className="size-3 text-stone-300" />
                            Ảnh đối tác: {recipe.partnerStoreName}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Card Info */}
                    <div className="p-4 pb-3">
                      <Link href={`/meal-planner/${recipe.id}`} className="block group/title">
                        <h3 className="font-bold text-stone-900 text-sm leading-snug group-hover/title:text-[#00615f] transition-colors">
                          {recipe.name}
                        </h3>
                      </Link>

                      <div className="mt-1 flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          <Star className="size-3 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-semibold text-stone-700">{recipe.rating}</span>
                        </div>
                        <span className="text-[10px] text-stone-400">({recipe.reviews})</span>
                      </div>

                      {/* Clean unified stats row */}
                      <div className="mt-2 flex items-center gap-3 text-xs text-stone-500 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <Flame className="size-3 text-stone-400" />
                          {recipe.calories} kcal
                        </span>
                        <span className="text-stone-300">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3 text-stone-400" />
                          {recipe.cookTime}p
                        </span>
                        <span className="text-stone-300">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="size-3 text-stone-400" />
                          {recipe.servings} người
                        </span>
                      </div>

                      {/* Clean neutral tags */}
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {tagsList.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Partner Match Callout (Calm neutral) */}
                      {hasPartnerPhoto && (
                        <div className="mt-3 p-2 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-stone-700 font-medium truncate pr-2">
                            <Tag className="size-3 text-stone-400 shrink-0" />
                            <span className="truncate">{recipe.partnerListingTitle}</span>
                          </div>
                          {recipe.partnerPrice && (
                            <span className="font-bold text-[#00615f] shrink-0 text-xs">
                              {formatVND(recipe.partnerPrice)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Cost Footer */}
                  <div>
                    <div className="px-3.5 py-2.5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] text-stone-500">Ước tính / người</p>
                        <p className="text-xs sm:text-sm font-bold text-stone-900">
                          ~{formatVND(Math.round(totalIngredientCost / (recipe.servings || 1)))}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="default"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCalendarModalRecipe(recipe);
                          }}
                          className="rounded-lg text-[11px] gap-1 font-bold shadow-2xs cursor-pointer"
                          title="Thêm món này vào lịch thực đơn tháng"
                        >
                          <CalendarIcon className="size-3" />
                          <span>+ Lịch</span>
                        </Button>

                        <Link
                          href={`/meal-planner/${recipe.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 hover:text-stone-900 text-[11px] font-semibold transition cursor-pointer"
                        >
                          <span>Chi tiết</span>
                          <ChevronRight className="size-3 text-stone-400" />
                        </Link>
                      </div>
                    </div>

                    {/* Expandable Recipe Detail */}
                    {isExpanded && (
                      <div className="px-4 py-3.5 border-t border-stone-100 space-y-3 bg-stone-50/60 animate-in slide-in-from-top-1 duration-150">
                        {/* Ingredients */}
                        <div>
                          <h4 className="text-xs font-semibold text-stone-700 mb-2 flex items-center gap-1.5">
                            <ShoppingCart className="size-3.5 text-[#00615f]" />
                            Nguyên liệu ({ingredientsList.length} món)
                          </h4>
                          <div className="space-y-1">
                            {ingredientsList.map((ing, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white border border-stone-200/60"
                              >
                                <span className="text-stone-700">
                                  {ing.name} <span className="text-stone-400 text-[10px]">({ing.amount})</span>
                                </span>
                                <span className="font-medium text-stone-900">~{formatVND(Number(ing.estimatedPrice) || 0)}</span>
                              </div>
                            ))}
                            <div className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-stone-100 font-semibold text-stone-800">
                              <span>Tổng nguyên liệu</span>
                              <span className="text-[#00615f]">~{formatVND(totalIngredientCost)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Partner store note */}
                        {recipe.partnerStoreName && (
                          <div className="p-2.5 rounded-xl bg-white border border-stone-200/80 text-xs space-y-1">
                            <p className="font-semibold text-stone-800 flex items-center gap-1.5">
                              <Store className="size-3.5 text-[#00615f]" />
                              Gợi ý mua từ đối tác FoodSaver
                            </p>
                            <p className="text-[11px] text-stone-600 leading-relaxed">
                              Gian hàng <span className="font-semibold text-stone-800">{recipe.partnerStoreName}</span> có suất bán tương tự với giá giảm còn{" "}
                              <span className="font-bold text-[#00615f]">{formatVND(recipe.partnerPrice || 0)}</span>.
                            </p>
                            <Link
                              href="/search"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00615f] hover:underline"
                            >
                              Xem gian hàng đối tác &rarr;
                            </Link>
                          </div>
                        )}

                        {/* Steps */}
                        <div>
                          <h4 className="text-xs font-semibold text-stone-700 mb-2">Cách chế biến</h4>
                          <ol className="space-y-1.5">
                            {stepsList.map((step, idx) => (
                              <li key={idx} className="flex gap-2 text-xs text-stone-600 leading-relaxed">
                                <span className="shrink-0 size-4 rounded-full bg-stone-200 text-stone-700 text-[9px] font-bold flex items-center justify-center">
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
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add To Calendar Modal */}
      <AddToCalendarModal
        isOpen={Boolean(calendarModalRecipe)}
        onClose={() => setCalendarModalRecipe(null)}
        recipe={calendarModalRecipe}
      />
    </div>
  );
}
