"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChefHat,
  Flame,
  Clock,
  Users,
  Heart,
  Star,
  ShoppingCart,
  Sparkles,
  ArrowLeft,
  Calendar as CalendarIcon,
  Store,
  Tag,
  Check,
  CheckCircle2,
  Share2,
  AlertCircle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetRecipeByIdQuery,
  useGetRecipesQuery,
  RecipeDTO,
} from "@/redux/api/mealPlannerApi";
import { AddToCalendarModal } from "@/components/meal-planner/AddToCalendarModal";
import { toast } from "sonner";

function formatVND(n: number) {
  return (n || 0).toLocaleString("vi-VN") + "đ";
}

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [isFav, setIsFav] = useState(false);

  const { data: recipeRes, isLoading, error } = useGetRecipeByIdQuery(id, {
    skip: !id,
  });
  const recipe = recipeRes?.data;

  // Related recipes in same category
  const { data: allRecipesRes } = useGetRecipesQuery(
    { category: recipe?.category },
    { skip: !recipe?.category }
  );
  const relatedRecipes = (allRecipesRes?.data || [])
    .filter((r) => r.id !== id)
    .slice(0, 3);

  const toggleStep = (stepIdx: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepIdx)) next.delete(stepIdx);
      else next.add(stepIdx);
      return next;
    });
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết công thức món ăn!");
    }
  };

  const handleSyncToGroceryCart = () => {
    if (!recipe || !Array.isArray(recipe.ingredients)) return;
    const cartData = {
      daysCount: 1,
      dateRangeStr: "Món: " + recipe.name,
      totalItems: recipe.ingredients.length,
      neededItems: recipe.ingredients.map((ing) => ({
        name: ing.name,
        category: "Nguyên liệu nấu",
        estimatedPrice: Number(ing.estimatedPrice) || 15000,
        amount: ing.amount,
        checked: false,
      })),
      savedMoney: 25000,
      neededCost: recipe.ingredients.reduce(
        (sum, i) => sum + (Number(i.estimatedPrice) || 0),
        0
      ),
      createdAt: Date.now(),
    };

    try {
      localStorage.setItem("foodsaver_shopping_cart", JSON.stringify(cartData));
      toast.success("Đã đồng bộ toàn bộ nguyên liệu vào Radar bản đồ đi chợ!", {
        action: {
          label: "Mở bản đồ",
          onClick: () => router.push("/map?fromPlanner=true"),
        },
      });
    } catch {
      toast.error("Không thể lưu giỏ đi chợ");
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="size-8 mx-auto animate-spin text-[#00615f]" />
        <p className="text-sm font-medium text-stone-600">
          Đang tải chi tiết công thức nấu ăn...
        </p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-stone-200 p-8 max-w-lg mx-auto shadow-xs">
        <ChefHat className="size-12 mx-auto text-stone-300" />
        <h2 className="text-lg font-bold text-stone-900">
          Không tìm thấy công thức món ăn
        </h2>
        <p className="text-xs text-stone-500">
          Món ăn này có thể đã được cập nhật hoặc không còn tồn tại.
        </p>
        <Button
          variant="default"
          onClick={() => router.push("/meal-planner")}
          className="gap-2 rounded-xl"
        >
          <ArrowLeft className="size-4" />
          <span>Về danh sách thực đơn</span>
        </Button>
      </div>
    );
  }

  const ingredientsList = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const stepsList = Array.isArray(recipe.steps) ? recipe.steps : [];
  const tagsList = Array.isArray(recipe.tags) ? recipe.tags : [];
  const totalCost = ingredientsList.reduce(
    (sum, i) => sum + (Number(i.estimatedPrice) || 0),
    0
  );
  const costPerPerson = Math.round(totalCost / (recipe.servings || 1));
  const hasPartnerDeal = Boolean(recipe.partnerListingTitle && recipe.partnerPrice);
  const imageUrl = recipe.partnerImage || recipe.image;

  // Nutrition estimations
  const proteinGrams = Math.round((recipe.calories * 0.22) / 4);
  const carbsGrams = Math.round((recipe.calories * 0.55) / 4);
  const fatGrams = Math.round((recipe.calories * 0.23) / 9);

  return (
    <div className="space-y-6">
      {/* ══════ TOP NAVIGATION & BREADCRUMBS ══════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Link
            href="/meal-planner"
            className="hover:text-[#00615f] font-medium transition flex items-center gap-1"
          >
            <ArrowLeft className="size-3.5" />
            <span>Thực đơn &amp; Công thức</span>
          </Link>
          <span>/</span>
          <span className="text-stone-900 font-semibold truncate max-w-[200px] sm:max-w-none">
            {recipe.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFav(!isFav)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              isFav
                ? "bg-rose-50 border-rose-200 text-rose-600"
                : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
            }`}
          >
            <Heart className={`size-3.5 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{isFav ? "Đã lưu" : "Lưu món"}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="size-3.5 text-stone-500" />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* ══════ RECIPE HERO SECTION ══════ */}
      <div className="rounded-3xl bg-white border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Hero Image */}
          <div className="lg:col-span-5 relative h-72 sm:h-96 lg:h-auto min-h-[300px] bg-stone-100 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* Partner Borrowed Photo Credit */}
            {recipe.partnerStoreName && (
              <div className="absolute bottom-3 left-3 right-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-900/80 backdrop-blur-md text-white text-xs font-medium">
                  <Store className="size-3.5 text-emerald-400" />
                  <span>Ảnh &amp; Món từ đối tác: {recipe.partnerStoreName}</span>
                </span>
              </div>
            )}
          </div>

          {/* Hero Details */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-[#00615f] border border-emerald-200/80">
                  {recipe.category ? recipe.category.toUpperCase() : "MÓN VIỆT"}
                </span>

                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/60 text-[11px] font-bold">
                  <Star className="size-3 text-amber-500 fill-amber-500" />
                  <span>{recipe.rating || 4.9}</span>
                  <span className="text-stone-400 font-normal">
                    ({recipe.reviews || 120} đánh giá)
                  </span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                {recipe.name}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tagsList.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Key Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <p className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                    <Clock className="size-3.5 text-stone-400" />
                    <span>Nấu</span>
                  </p>
                  <p className="text-base font-bold text-stone-900 mt-0.5">
                    {recipe.cookTime} phút
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <p className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                    <Flame className="size-3.5 text-amber-500" />
                    <span>Calo</span>
                  </p>
                  <p className="text-base font-bold text-stone-900 mt-0.5">
                    {recipe.calories} kcal
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <p className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                    <Users className="size-3.5 text-stone-400" />
                    <span>Khẩu phần</span>
                  </p>
                  <p className="text-base font-bold text-stone-900 mt-0.5">
                    {recipe.servings} người
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                  <p className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                    <Tag className="size-3.5 text-[#00615f]" />
                    <span>Chi phí / người</span>
                  </p>
                  <p className="text-base font-bold text-[#00615f] mt-0.5">
                    ~{formatVND(costPerPerson)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                type="button"
                variant="default"
                size="lg"
                onClick={() => setIsCalendarModalOpen(true)}
                className="flex-1 rounded-2xl gap-2 font-bold shadow-md cursor-pointer"
              >
                <CalendarIcon className="size-4" />
                <span>Thêm vào lịch thực đơn</span>
              </Button>

              {hasPartnerDeal && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  asChild
                  className="rounded-2xl border-[#00615f] text-[#00615f] hover:bg-emerald-50/50 font-bold"
                >
                  <Link href="/map">
                    <Store className="size-4 text-[#00615f]" />
                    <span>Cứu món đối tác ({formatVND(recipe.partnerPrice!)})</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════ MAIN CONTENT: 2-COLUMN GRID ══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══ LEFT: INGREDIENTS & STEP-BY-STEP COOKING (7 COLS) ═══ */}
        <div className="lg:col-span-7 space-y-6">
          {/* Ingredients Box */}
          <div className="rounded-2xl bg-white border border-stone-200/90 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <ShoppingCart className="size-4 text-[#00615f]" />
                  <span>Nguyên liệu cần chuẩn bị ({ingredientsList.length} loại)</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Dành cho {recipe.servings} người ăn · Chi phí dự kiến:{" "}
                  <strong className="text-[#00615f]">{formatVND(totalCost)}</strong>
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleSyncToGroceryCart}
                className="rounded-lg text-xs gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <ShoppingCart className="size-3 text-[#00615f]" />
                <span>Lên đồ đi chợ bản đồ</span>
              </Button>
            </div>

            {/* Ingredients List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ingredientsList.map((ing, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="size-2 rounded-full bg-[#00615f] shrink-0" />
                    <span className="text-xs font-semibold text-stone-900 truncate">
                      {ing.name}
                    </span>
                    <span className="text-[11px] text-stone-500 shrink-0">
                      ({ing.amount})
                    </span>
                  </div>
                  <span className="text-xs font-bold text-stone-700 shrink-0">
                    ~{formatVND(Number(ing.estimatedPrice) || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Steps Box */}
          <div className="rounded-2xl bg-white border border-stone-200/90 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <ChefHat className="size-4 text-[#00615f]" />
                  <span>Cách làm chi tiết ({stepsList.length} bước)</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Tích chọn từng bước khi bạn hoàn thành nấu
                </p>
              </div>

              {checkedSteps.size > 0 && (
                <span className="text-xs font-semibold text-[#00615f] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  Đã làm {checkedSteps.size}/{stepsList.length} bước
                </span>
              )}
            </div>

            {/* Steps interactive list */}
            <div className="space-y-3">
              {stepsList.map((step, idx) => {
                const isChecked = checkedSteps.has(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isChecked
                        ? "bg-emerald-50/50 border-emerald-200 text-stone-500"
                        : "bg-white border-stone-200 hover:border-[#00615f]/40 hover:bg-stone-50/40 text-stone-800"
                    }`}
                  >
                    <div
                      className={`size-6 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs transition ${
                        isChecked
                          ? "bg-[#00615f] text-white"
                          : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {isChecked ? <Check className="size-3.5" /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs sm:text-sm leading-relaxed ${
                          isChecked ? "line-through text-stone-400" : "font-medium"
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FoodSaver Zero-Waste Tips */}
          <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/80 p-5 space-y-3">
            <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide">
              <Lightbulb className="size-4 text-[#00615f]" />
              <span>Mẹo chọn đồ ngon &amp; Tiết kiệm từ FoodSaver</span>
            </h4>
            <ul className="space-y-2 text-xs text-stone-700 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#00615f] font-bold">✓</span>
                <span>
                  <strong>Chọn nguyên liệu theo mùa:</strong> Các nguyên liệu tươi tại chợ truyền thống đầu giờ chiều thường có mức giá tốt hơn đến 30%.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00615f] font-bold">✓</span>
                <span>
                  <strong>Tận dụng phần dư:</strong> Nước hầm xương hoặc cuống rau có thể cấp đông để nấu canh cho ngày hôm sau, giữ trọn vị ngọt tự nhiên.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00615f] font-bold">✓</span>
                <span>
                  <strong>Nếu không có thời gian tự nấu:</strong> Bạn có thể kiểm tra danh sách suất ăn cứu trợ bên cạnh để giữ ngay món nóng từ đối tác FoodSaver.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* ═══ RIGHT: NUTRITION, RESCUE INTEGRATION & RELATED DISHES (5 COLS) ═══ */}
        <div className="lg:col-span-5 space-y-6">
          {/* Nutrition Facts */}
          <div className="rounded-2xl bg-white border border-stone-200/90 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Flame className="size-4 text-amber-500" />
              <span>Giá trị dinh dưỡng ước tính / phần</span>
            </h3>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-center">
              <p className="text-[11px] text-stone-500 font-medium">Tổng năng lượng</p>
              <p className="text-2xl font-black text-[#00615f] mt-0.5">
                {recipe.calories} <span className="text-xs font-medium text-stone-500">kcal</span>
              </p>
              <p className="text-[10px] text-stone-400 mt-1">
                Chiếm ~{Math.round((recipe.calories / 2000) * 100)}% tiêu chuẩn 2.000 kcal/ngày
              </p>
            </div>

            {/* Macro bars */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-stone-700 mb-1">
                  <span>Chất đạm (Protein)</span>
                  <span className="font-bold">{proteinGrams}g</span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${Math.min(100, (proteinGrams / 60) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-stone-700 mb-1">
                  <span>Tinh bột (Carbs)</span>
                  <span className="font-bold">{carbsGrams}g</span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, (carbsGrams / 130) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-stone-700 mb-1">
                  <span>Chất béo (Fat)</span>
                  <span className="font-bold">{fatGrams}g</span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${Math.min(100, (fatGrams / 50) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Partner Rescue Deal Callout */}
          {hasPartnerDeal && (
            <div className="rounded-2xl bg-white border border-stone-200/90 shadow-xs p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1">
                  <Sparkles className="size-3 text-amber-600" />
                  <span>SUẤT GIẢI CỨU LÂN CẬN</span>
                </span>
                <span className="text-[11px] text-rose-600 font-bold">Giờ vàng</span>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-stone-900 leading-snug">
                  {recipe.partnerListingTitle}
                </h4>
                <p className="text-[11px] text-stone-500 flex items-center gap-1">
                  <Store className="size-3 text-stone-400" />
                  <span>{recipe.partnerStoreName}</span>
                </p>
              </div>

              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-base font-black text-[#00615f]">
                  {formatVND(recipe.partnerPrice!)}
                </span>
                {recipe.partnerOriginalPrice && (
                  <span className="text-xs text-stone-400 line-through">
                    {formatVND(recipe.partnerOriginalPrice)}
                  </span>
                )}
              </div>

              <Button
                asChild
                variant="default"
                size="sm"
                className="w-full rounded-xl font-bold gap-1.5"
              >
                <Link href="/map">
                  <Store className="size-3.5" />
                  <span>Xem trên bản đồ &amp; Đặt ngay</span>
                </Link>
              </Button>
            </div>
          )}

          {/* Related dishes shelf */}
          {relatedRecipes.length > 0 && (
            <div className="rounded-2xl bg-white border border-stone-200/90 shadow-xs p-5 space-y-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                Món ăn gợi ý cùng thể loại
              </h3>
              <div className="space-y-2.5">
                {relatedRecipes.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/meal-planner/${rel.id}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition border border-transparent hover:border-stone-200/80 group"
                  >
                    <div className="size-12 rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rel.partnerImage || rel.image}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate group-hover:text-[#00615f]">
                        {rel.name}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {rel.calories} kcal · ~{(rel.cost || 0).toLocaleString()}đ
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-stone-300 group-hover:text-[#00615f] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add To Calendar Modal */}
      <AddToCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        recipe={recipe}
      />
    </div>
  );
}
