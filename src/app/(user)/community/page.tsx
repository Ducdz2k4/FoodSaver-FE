"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  Apple,
  ShoppingCart,
  Leaf,
  Award,
  Plus,
  Search,
  X,
  Clock,
  Users,
  Flame,
  Coins,
  CheckCircle2,
  Calendar,
  Send,
  Trash2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Utensils,
  BookOpen,
  Check,
} from "lucide-react";
import {
  useGetCommunityPostsQuery,
  useCreateCommunityPostMutation,
  useDeleteCommunityPostMutation,
  useToggleLikePostMutation,
  useToggleBookmarkPostMutation,
  useGetPostCommentsQuery,
  useAddPostCommentMutation,
  useDeletePostCommentMutation,
  useGetTrendingTagsQuery,
  useGetTopContributorsQuery,
  useImportMealPlanMutation,
  CommunityPostDTO,
  CommunityCommentDTO,
} from "@/redux/api/communityApi";
import { useAuth } from "@/context/AuthContext";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";

const CATEGORIES = [
  { key: "all", label: "Tất cả", icon: TrendingUp },
  { key: "recipe", label: "🍳 Công thức nấu ăn", icon: Utensils },
  { key: "meal_plan", label: "📅 Kế hoạch & Thực đơn", icon: Apple },
  { key: "tips", label: "🛒 Mẹo đi chợ", icon: ShoppingCart },
  { key: "seasonal", label: "🍊 Nông sản theo mùa", icon: Leaf },
  { key: "budget", label: "💰 Tiết kiệm & Cứu trợ", icon: Award },
];

function formatVND(n: number) {
  return (n || 0).toLocaleString("vi-VN") + "đ";
}

function timeAgo(dateStr: string) {
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  } catch {
    return "gần đây";
  }
}

// Inline Comment Section Component
function PostCommentsSection({
  postId,
  onCommentAdded,
}: {
  postId: string;
  onCommentAdded?: () => void;
}) {
  const { user } = useAuth();
  const rawUser = useAppSelector((state) => state.auth.user);
  const currentUser = user || rawUser;

  const { data: commentsRes, isLoading } = useGetPostCommentsQuery(postId);
  const [addComment, { isLoading: isSubmitting }] = useAddPostCommentMutation();
  const [deleteComment] = useDeletePostCommentMutation();
  const [content, setContent] = useState("");

  const comments = commentsRes?.data || [];

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await addComment({
        postId,
        content: content.trim(),
        authorName: currentUser?.fullName || "Thành viên FoodSaver",
        authorAvatar: currentUser?.avatar || "👤",
      }).unwrap();
      setContent("");
      toast.success("Đã đăng bình luận!");
      onCommentAdded?.();
    } catch {
      toast.error("Không thể gửi bình luận. Vui lòng thử lại");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment({ postId, commentId }).unwrap();
      toast.success("Đã xóa bình luận.");
    } catch {
      toast.error("Không thể xóa bình luận này.");
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
      {/* Comment Form */}
      <form onSubmit={handleSendComment} className="flex items-center gap-2">
        <div className="size-8 rounded-full bg-emerald-100 text-[#00615f] flex items-center justify-center font-bold text-sm shrink-0">
          {currentUser?.avatar && currentUser.avatar.startsWith("http") ? (
            <img src={currentUser.avatar} alt="Avatar" className="size-8 rounded-full object-cover" />
          ) : (
            <span>{currentUser?.avatar || "👤"}</span>
          )}
        </div>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={currentUser ? "Viết bình luận của bạn..." : "Bình luận với tư cách thành viên..."}
          className="flex-1 bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-[#00615f] rounded-full px-4 py-2 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none transition"
        />
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="size-8 sm:size-9 rounded-full bg-[#00615f] hover:bg-[#089184] text-white flex items-center justify-center disabled:opacity-40 transition shrink-0 cursor-pointer"
        >
          <Send className="size-3.5 sm:size-4" />
        </button>
      </form>

      {/* Comment List */}
      {isLoading ? (
        <div className="py-2 text-center text-xs text-stone-400">Đang tải bình luận...</div>
      ) : comments.length === 0 ? (
        <div className="py-2 text-center text-xs text-stone-400">Chưa có bình luận nào. Hãy là người đầu tiên!</div>
      ) : (
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5 text-xs group">
              <div className="size-7 rounded-full bg-stone-100 flex items-center justify-center text-xs shrink-0 mt-0.5">
                {c.authorAvatar && c.authorAvatar.startsWith("http") ? (
                  <img src={c.authorAvatar} alt="Avatar" className="size-7 rounded-full object-cover" />
                ) : (
                  <span>{c.authorAvatar || "👤"}</span>
                )}
              </div>
              <div className="flex-1 bg-stone-50 rounded-2xl px-3 py-2 border border-stone-100">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-stone-800">{c.authorName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-400">{timeAgo(c.createdAt)}</span>
                    {currentUser && (currentUser.id === c.userId || currentUser.role === "ADMIN") && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-stone-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"
                        title="Xóa bình luận"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-stone-700 mt-0.5 whitespace-pre-wrap">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Single Community Post Card Component
function CommunityPostCard({
  post,
  onTagClick,
}: {
  post: CommunityPostDTO;
  onTagClick: (tag: string) => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const rawUser = useAppSelector((state) => state.auth.user);
  const currentUser = user || rawUser;

  const [showComments, setShowComments] = useState(false);
  const [showRecipeDetails, setShowRecipeDetails] = useState(false);
  const [showMealPlanDetails, setShowMealPlanDetails] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const [toggleLike, { isLoading: isLiking }] = useToggleLikePostMutation();
  const [toggleBookmark, { isLoading: isBookmarking }] = useToggleBookmarkPostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeleteCommunityPostMutation();
  const [importMealPlan, { isLoading: isImporting }] = useImportMealPlanMutation();

  const handleLike = async () => {
    try {
      await toggleLike(post.id).unwrap();
    } catch {
      toast.error("Không thể tương tác like lúc này.");
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để lưu công thức / kế hoạch vào sổ tay cá nhân.");
      return;
    }
    try {
      const res = await toggleBookmark(post.id).unwrap();
      if (res.data.bookmarked) {
        toast.success("Đã lưu vào sổ tay cá nhân của bạn!");
      } else {
        toast.info("Đã bỏ lưu khỏi sổ tay.");
      }
    } catch {
      toast.error("Không thể lưu bài viết. Vui lòng thử lại");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/community?post=${post.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Đã sao chép liên kết bài viết vào bộ nhớ tạm!");
    } else {
      toast.info(url);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
    try {
      await deletePost(post.id).unwrap();
      toast.success("Đã xóa bài viết thành công.");
    } catch {
      toast.error("Không thể xóa bài viết.");
    }
  };

  const handleImportPlan = async () => {
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để áp dụng kế hoạch ăn vào lịch của bạn.");
      router.push("/login");
      return;
    }
    try {
      const res = await importMealPlan({ postId: post.id }).unwrap();
      toast.success(res.message || "Đã áp dụng vào Lịch ăn thành công!", {
        action: {
          label: "Xem lịch ăn",
          onClick: () => router.push("/meal-planner"),
        },
      });
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể áp dụng kế hoạch vào lịch.");
    }
  };

  const handleAddIngredientsToCart = (ingredients: { name: string; amount?: string; unit?: string }[]) => {
    try {
      const existingCartStr = localStorage.getItem("foodsaver_shopping_cart");
      let cart: string[] = [];
      if (existingCartStr) {
        try {
          cart = JSON.parse(existingCartStr);
        } catch {
          cart = [];
        }
      }
      const newItems = ingredients.map((ing) => `${ing.name} ${ing.amount ? `(${ing.amount} ${ing.unit || ""})` : ""}`.trim());
      const updatedCart = Array.from(new Set([...cart, ...newItems]));
      localStorage.setItem("foodsaver_shopping_cart", JSON.stringify(updatedCart));
      toast.success(`Đã thêm ${newItems.length} nguyên liệu vào Giỏ đi chợ!`, {
        action: {
          label: "Mở Bản đồ tìm mua",
          onClick: () => router.push("/map"),
        },
      });
    } catch {
      toast.error("Không thể thêm vào giỏ đi chợ.");
    }
  };

  const isOwner = currentUser && (currentUser.id === post.userId || currentUser.role === "ADMIN");

  return (
    <article className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all duration-200 p-5 sm:p-6 space-y-4">
      {/* Post Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 sm:size-11 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg shrink-0 shadow-xs">
            {post.authorAvatar && post.authorAvatar.startsWith("http") ? (
              <img src={post.authorAvatar} alt={post.authorName} className="size-full rounded-full object-cover" />
            ) : (
              <span>{post.authorAvatar || "👤"}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-stone-900 text-sm sm:text-base">{post.authorName}</span>
              {post.authorBadge && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100/80 text-[#00615f] border border-emerald-200/50">
                  <Sparkles className="size-3" />
                  {post.authorBadge}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
              <span>{post.authorRole || "Thành viên cộng đồng"}</span>
              <span>•</span>
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 font-medium capitalize">
            {post.category === "recipe"
              ? "🍳 Công thức"
              : post.category === "meal_plan"
              ? "📅 Kế hoạch"
              : post.category === "tips"
              ? "🛒 Mẹo vặt"
              : post.category === "seasonal"
              ? "🍊 Theo mùa"
              : "💰 Tiết kiệm"}
          </span>
          {isOwner && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Xóa bài viết"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Post Title & Content */}
      <div className="space-y-2">
        <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-snug hover:text-[#00615f] transition cursor-pointer">
          {post.title}
        </h2>
        <p className="text-stone-700 text-sm sm:text-[15px] leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
      </div>

      {/* Post Main Image (if any) */}
      {post.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-stone-100 max-h-96 bg-stone-50">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-auto max-h-96 object-cover hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      {/* Special Recipe Section (if category == recipe & recipeData) */}
      {post.category === "recipe" && post.recipeData && (
        <div className="bg-[#f9f3f0]/60 rounded-xl border border-stone-200/80 p-4 space-y-3">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-stone-200/50">
              <Clock className="size-4 text-[#00615f]" />
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">Nấu trong</span>
                <span className="text-xs sm:text-sm font-bold text-stone-800">{post.recipeData.cookTime || 20} phút</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-stone-200/50">
              <Users className="size-4 text-[#00615f]" />
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">Khẩu phần</span>
                <span className="text-xs sm:text-sm font-bold text-stone-800">{post.recipeData.servings || 2} người</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-stone-200/50">
              <Flame className="size-4 text-amber-500" />
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">Năng lượng</span>
                <span className="text-xs sm:text-sm font-bold text-stone-800">{post.recipeData.calories || 350} kcal</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-stone-200/50">
              <Coins className="size-4 text-emerald-600" />
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">Ước tính</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-700">{formatVND(post.recipeData.cost || 40000)}</span>
              </div>
            </div>
          </div>

          {/* Toggle details button */}
          <button
            type="button"
            onClick={() => setShowRecipeDetails(!showRecipeDetails)}
            className="w-full py-2 px-3 rounded-lg bg-white hover:bg-stone-50 border border-stone-200 text-xs font-bold text-[#00615f] flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <BookOpen className="size-3.5" />
            <span>{showRecipeDetails ? "Thu gọn công thức" : `Xem nguyên liệu & cách làm (${post.recipeData.ingredients?.length || 0} nguyên liệu)`}</span>
            {showRecipeDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>

          {/* Expanded Recipe Details */}
          {showRecipeDetails && (
            <div className="pt-2 border-t border-stone-200 space-y-4">
              {/* Ingredients Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Utensils className="size-3.5 text-[#00615f]" />
                    <span>Danh sách nguyên liệu:</span>
                  </h4>
                  {post.recipeData.ingredients && post.recipeData.ingredients.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleAddIngredientsToCart(post.recipeData?.ingredients || [])}
                      className="text-xs font-semibold text-[#00615f] hover:text-[#089184] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ShoppingCart className="size-3" />
                      <span>Thêm vào Giỏ đi chợ</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {post.recipeData.ingredients?.map((ing, idx) => {
                    const isChecked = !!checkedIngredients[`${post.id}-${idx}`];
                    return (
                      <label
                        key={idx}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                          isChecked
                            ? "bg-emerald-50/70 border-emerald-200 text-stone-500 line-through"
                            : "bg-white border-stone-200 text-stone-800 hover:border-emerald-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setCheckedIngredients((prev) => ({
                              ...prev,
                              [`${post.id}-${idx}`]: e.target.checked,
                            }))
                          }
                          className="size-3.5 text-[#00615f] rounded border-stone-300 focus:ring-0"
                        />
                        <span className="font-medium flex-1">{ing.name}</span>
                        {ing.amount && (
                          <span className="text-stone-500 font-semibold">
                            {ing.amount} {ing.unit}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Cooking Steps */}
              {post.recipeData.steps && post.recipeData.steps.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                    Các bước thực hiện:
                  </h4>
                  <ol className="space-y-2">
                    {post.recipeData.steps.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2.5 text-xs text-stone-700">
                        <span className="size-5 rounded-full bg-[#00615f] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <p className="flex-1 leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Special Meal Plan Section (if category == meal_plan & mealPlan) */}
      {post.category === "meal_plan" && post.mealPlan && (
        <div className="bg-emerald-50/40 rounded-xl border border-emerald-200/60 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-[#00615f]" />
              <span className="text-xs sm:text-sm font-bold text-[#00615f]">
                {post.mealPlan.title || "Kế hoạch thực đơn mẫu"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleImportPlan}
              disabled={isImporting}
              className="px-3.5 py-1.5 rounded-full bg-[#00615f] hover:bg-[#089184] text-white font-bold text-xs shadow-xs hover:shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="size-3.5" />
              <span>{isImporting ? "Đang áp dụng..." : "Áp dụng vào Lịch ăn của tôi"}</span>
            </button>
          </div>

          {/* Quick Preview Slots */}
          <div className="space-y-2">
            {post.mealPlan.days &&
              post.mealPlan.days.slice(0, 3).map((dayObj, dIdx) => (
                <div key={dIdx} className="bg-white rounded-lg p-2.5 border border-emerald-100 text-xs">
                  <span className="font-bold text-stone-800 block mb-1 text-[11px] text-[#00615f]">
                    Ngày {dayObj.day}:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {dayObj.meals?.map((m, mIdx) => (
                      <div key={mIdx} className="bg-stone-50 rounded p-1.5 border border-stone-100 flex items-center justify-between gap-1">
                        <span className="text-[10px] uppercase font-bold text-stone-500">
                          {m.slot === "breakfast" ? "Sáng" : m.slot === "lunch" ? "Trưa" : "Tối"}:
                        </span>
                        <span className="font-medium text-stone-800 truncate flex-1 text-right">{m.meal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Hashtags Row */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag, tIdx) => (
            <button
              key={tIdx}
              type="button"
              onClick={() => onTagClick(tag)}
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 hover:bg-emerald-50 text-stone-600 hover:text-[#00615f] transition cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Post Footer & Interactive Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs sm:text-sm text-stone-600">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Like Button */}
          <button
            type="button"
            onClick={handleLike}
            disabled={isLiking}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition cursor-pointer select-none ${
              post.isLiked
                ? "text-rose-600 bg-rose-50 font-bold"
                : "text-stone-600 hover:text-rose-600 hover:bg-rose-50"
            }`}
          >
            <Heart className={`size-4 ${post.isLiked ? "fill-rose-600 text-rose-600 scale-110" : ""}`} />
            <span>{post.likes}</span>
          </button>

          {/* Comment Button */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition cursor-pointer select-none ${
              showComments
                ? "text-[#00615f] bg-emerald-50 font-bold"
                : "text-stone-600 hover:text-[#00615f] hover:bg-emerald-50"
            }`}
          >
            <MessageCircle className="size-4" />
            <span>{post.comments}</span>
          </button>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmark}
            disabled={isBookmarking}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition cursor-pointer select-none ${
              post.isBookmarked
                ? "text-emerald-700 bg-emerald-100 font-bold"
                : "text-stone-600 hover:text-emerald-700 hover:bg-emerald-50"
            }`}
            title={post.isBookmarked ? "Đã lưu vào sổ tay" : "Lưu vào sổ tay cá nhân"}
          >
            <Bookmark className={`size-4 ${post.isBookmarked ? "fill-emerald-700 text-emerald-700" : ""}`} />
            <span className="hidden sm:inline">
              {post.category === "recipe" ? "Lưu công thức" : post.category === "meal_plan" ? "Lưu kế hoạch" : "Lưu"}
            </span>
            <span>{post.bookmarks > 0 ? `(${post.bookmarks})` : ""}</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-stone-600 hover:text-[#00615f] hover:bg-stone-100 transition cursor-pointer"
          title="Chia sẻ liên kết"
        >
          <Share2 className="size-4" />
          <span className="hidden sm:inline">Chia sẻ</span>
        </button>
      </div>

      {/* Expanded Comments Section */}
      {showComments && <PostCommentsSection postId={post.id} />}
    </article>
  );
}

// Create Post Modal Component
function CreatePostModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const rawUser = useAppSelector((state) => state.auth.user);
  const currentUser = user || rawUser;

  const [createPost, { isLoading: isSubmitting }] = useCreateCommunityPostMutation();

  const [activeTab, setActiveTab] = useState<"tips" | "recipe" | "meal_plan">("tips");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState("");

  // Recipe fields
  const [cookTime, setCookTime] = useState<number>(20);
  const [servings, setServings] = useState<number>(2);
  const [calories, setCalories] = useState<number>(350);
  const [cost, setCost] = useState<number>(40000);
  const [ingredients, setIngredients] = useState([
    { name: "", amount: "", unit: "" },
    { name: "", amount: "", unit: "" },
  ]);
  const [steps, setSteps] = useState(["", ""]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  };

  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung bài viết");
      return;
    }

    const cleanTags = tags
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    let recipeData = null;
    if (activeTab === "recipe") {
      const validIngredients = ingredients.filter((ing) => ing.name.trim());
      const validSteps = steps.filter((s) => s.trim());
      recipeData = {
        cookTime: Number(cookTime) || 20,
        servings: Number(servings) || 2,
        calories: Number(calories) || 0,
        cost: Number(cost) || 0,
        ingredients: validIngredients,
        steps: validSteps,
      };
    }

    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        category: activeTab,
        imageUrl: imageUrl.trim() || null,
        tags: cleanTags,
        recipeData,
        authorName: currentUser?.fullName || "Thành viên FoodSaver",
        authorAvatar: currentUser?.avatar || "👤",
      }).unwrap();

      toast.success("Đã đăng bài viết thành công!");
      onClose();
      // Reset
      setTitle("");
      setContent("");
      setImageUrl("");
      setTags("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể đăng bài viết. Vui lòng thử lại");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-emerald-100 text-[#00615f] flex items-center justify-center">
              <Plus className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900">Chia sẻ với Cộng đồng</h3>
              <p className="text-xs text-stone-500">Lan tỏa công thức nấu ăn, thực đơn tiết kiệm & lối sống xanh</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Post Type Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("tips")}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "tips"
                ? "bg-white text-[#00615f] shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            🛒 Mẹo vặt & Tiết kiệm
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("recipe")}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "recipe"
                ? "bg-white text-[#00615f] shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            🍳 Công thức món ăn
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("meal_plan")}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "meal_plan"
                ? "bg-white text-[#00615f] shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            📅 Kế hoạch & Thực đơn
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Tiêu đề bài viết *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Gà áp chảo mật ong 20 phút siêu rẻ..."
              className="w-full bg-stone-50 border border-stone-200 focus:border-[#00615f] rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Nội dung chia sẻ *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ kinh nghiệm, bí quyết hoặc câu chuyện tiết kiệm của bạn..."
              className="w-full bg-stone-50 border border-stone-200 focus:border-[#00615f] rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:bg-white transition resize-none"
            />
          </div>

          {/* Conditional Recipe Fields */}
          {activeTab === "recipe" && (
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
              <h4 className="text-xs font-bold text-[#00615f] uppercase tracking-wider">
                Chi tiết công thức
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Thời gian (phút)</label>
                  <input
                    type="number"
                    value={cookTime}
                    onChange={(e) => setCookTime(Number(e.target.value))}
                    className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Khẩu phần (người)</label>
                  <input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                    className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Chi phí (VNĐ)</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-800"
                  />
                </div>
              </div>

              {/* Ingredients Builder */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-stone-600">Nguyên liệu cần chuẩn bị</label>
                {ingredients.map((ing, iIdx) => (
                  <div key={iIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Tên nguyên liệu (VD: Ức gà)"
                      value={ing.name}
                      onChange={(e) => {
                        const copy = [...ingredients];
                        copy[iIdx].name = e.target.value;
                        setIngredients(copy);
                      }}
                      className="flex-2 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Số lượng (VD: 300)"
                      value={ing.amount}
                      onChange={(e) => {
                        const copy = [...ingredients];
                        copy[iIdx].amount = e.target.value;
                        setIngredients(copy);
                      }}
                      className="flex-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Đơn vị (g, thìa, quả)"
                      value={ing.unit}
                      onChange={(e) => {
                        const copy = [...ingredients];
                        copy[iIdx].unit = e.target.value;
                        setIngredients(copy);
                      }}
                      className="flex-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="text-xs text-[#00615f] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-3" />
                  Thêm nguyên liệu
                </button>
              </div>

              {/* Steps Builder */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-stone-600">Các bước nấu</label>
                {steps.map((st, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-400 w-5">{sIdx + 1}.</span>
                    <input
                      type="text"
                      placeholder={`Bước ${sIdx + 1}...`}
                      value={st}
                      onChange={(e) => {
                        const copy = [...steps];
                        copy[sIdx] = e.target.value;
                        setSteps(copy);
                      }}
                      className="flex-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="text-xs text-[#00615f] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-3" />
                  Thêm bước nấu
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Link ảnh minh họa (tùy chọn)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-stone-50 border border-stone-200 focus:border-[#00615f] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Hashtags (cách nhau dấu phẩy)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="eat-clean, tiet-kiem, meal-prep"
                className="w-full bg-stone-50 border border-stone-200 focus:border-[#00615f] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:bg-white transition"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Đang đăng..." : "Đăng bài ngay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const rawUser = useAppSelector((state) => state.auth.user);
  const currentUser = user || rawUser;

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"hot" | "new" | "comments" | "bookmarks">("hot");
  const [isBookmarkedTab, setIsBookmarkedTab] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries
  const { data: postsRes, isLoading, isFetching } = useGetCommunityPostsQuery({
    category: isBookmarkedTab ? undefined : activeCategory,
    tag: selectedTag || undefined,
    search: searchTerm.trim() || undefined,
    sortBy,
    bookmarkedOnly: isBookmarkedTab,
  });

  const { data: trendingTagsRes } = useGetTrendingTagsQuery();
  const { data: topContributorsRes } = useGetTopContributorsQuery();

  const posts = postsRes?.data || [];
  const trendingTags = trendingTagsRes?.data || [];
  const topContributors = topContributorsRes?.data || [];

  return (
    <div className="min-h-screen bg-[#fcfaf8] pt-24 pb-16">
      {/* Standard Container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00615f] via-[#004f4d] to-[#089184] text-white p-6 sm:p-10 shadow-lg">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[#79e4a7] text-xs font-bold">
              <Sparkles className="size-3.5" />
              <span>Cộng đồng Chia sẻ Ẩm thực & Chống Lãng Phí</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Sổ tay Công thức, Thực đơn thông minh & Mẹo sống xanh
            </h1>
            <p className="text-stone-100 text-sm sm:text-base leading-relaxed opacity-90">
              Khám phá hàng ngàn công thức nấu ăn tiết kiệm, kế hoạch ăn uống khoa học và mẹo săn đồ cứu trợ thực phẩm từ cộng đồng FoodSaver. 1-click lưu vào sổ tay hoặc áp dụng trực tiếp vào Lịch ăn cá nhân!
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    toast.info("Vui lòng đăng nhập để chia sẻ bài viết cùng cộng đồng!");
                    router.push("/login");
                    return;
                  }
                  setIsModalOpen(true);
                }}
                className="px-5 py-3 rounded-full bg-[#79e4a7] hover:bg-[#68d797] text-[#004443] font-black text-xs sm:text-sm shadow-md hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="size-4" />
                <span>+ Đăng bài chia sẻ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    toast.info("Vui lòng đăng nhập để xem sổ tay đã lưu!");
                    return;
                  }
                  setIsBookmarkedTab(!isBookmarkedTab);
                }}
                className={`px-4 py-3 rounded-full text-xs sm:text-sm font-bold border transition flex items-center gap-2 cursor-pointer ${
                  isBookmarkedTab
                    ? "bg-white text-[#00615f] border-white font-black"
                    : "bg-white/10 hover:bg-white/20 border-white/30 text-white"
                }`}
              >
                <Bookmark className="size-4" />
                <span>Sổ tay đã lưu của tôi</span>
              </button>
            </div>
          </div>
          {/* Decorative background element */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 size-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        </section>

        {/* Filters & Search Control Bar */}
        <section className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="size-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm công thức, thực đơn, tác giả hoặc nguyên liệu..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100/60 focus:bg-white border border-stone-200 focus:border-[#00615f] text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-stone-500 font-medium whitespace-nowrap">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-[#00615f] cursor-pointer"
              >
                <option value="hot">🔥 Nổi bật nhất</option>
                <option value="new">✨ Mới nhất</option>
                <option value="comments">💬 Nhiều bình luận</option>
                <option value="bookmarks">🔖 Nhiều lượt lưu</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = !isBookmarkedTab && activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setIsBookmarkedTab(false);
                    setActiveCategory(cat.key);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                    isActive
                      ? "bg-[#00615f] text-white shadow-xs font-black"
                      : "bg-stone-100/80 text-stone-600 hover:bg-emerald-50 hover:text-[#00615f]"
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}

            {/* Saved Bookmarks Tab */}
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  toast.info("Vui lòng đăng nhập để xem các công thức đã lưu!");
                  return;
                }
                setIsBookmarkedTab(true);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                isBookmarkedTab
                  ? "bg-[#00615f] text-white shadow-xs font-black"
                  : "bg-stone-100/80 text-stone-600 hover:bg-emerald-50 hover:text-[#00615f]"
              }`}
            >
              <Bookmark className="size-3.5 shrink-0" />
              <span>🔖 Sổ tay đã lưu của tôi</span>
            </button>
          </div>

          {/* Active Tag Filter Pill (if selected) */}
          {selectedTag && (
            <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
              <span className="text-xs text-stone-500">Đang lọc theo hashtag:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-[#00615f] font-bold text-xs">
                #{selectedTag}
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="hover:text-rose-600 ml-1 cursor-pointer"
                  title="Xóa lọc hashtag"
                >
                  ✕
                </button>
              </span>
            </div>
          )}
        </section>

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Posts Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-stone-200 animate-pulse space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-stone-200" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4 bg-stone-200 rounded w-1/3" />
                        <div className="h-3 bg-stone-200 rounded w-1/4" />
                      </div>
                    </div>
                    <div className="h-5 bg-stone-200 rounded w-3/4" />
                    <div className="h-20 bg-stone-200 rounded" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
                <div className="size-16 rounded-full bg-emerald-50 text-[#00615f] flex items-center justify-center mx-auto text-2xl font-bold">
                  🌱
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  {isBookmarkedTab
                    ? "Bạn chưa lưu bài viết nào vào sổ tay"
                    : "Không tìm thấy bài viết phù hợp"}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                  {isBookmarkedTab
                    ? "Hãy bấm biểu tượng Lưu công thức hoặc Lưu kế hoạch ở các bài viết cộng đồng để lưu lại và xem lại bất cứ lúc nào!"
                    : "Thử xóa bộ lọc, tìm kiếm từ khóa khác hoặc là người đầu tiên chia sẻ bí quyết của mình!"}
                </p>
                {(activeCategory !== "all" || selectedTag || searchTerm || isBookmarkedTab) && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("all");
                      setSelectedTag(null);
                      setSearchTerm("");
                      setIsBookmarkedTab(false);
                    }}
                    className="mt-2 px-4 py-2 rounded-full bg-[#00615f] text-white text-xs font-bold hover:bg-[#089184] transition cursor-pointer"
                  >
                    Xem tất cả bài viết
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {posts.map((post) => (
                  <CommunityPostCard
                    key={post.id}
                    post={post}
                    onTagClick={(tag) => setSelectedTag(tag)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Sidebar Widgets (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Real Trending Hashtags Widget */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-[#00615f]" />
                <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
                  Hashtag Thịnh Hành
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingTags.length === 0 ? (
                  <span className="text-xs text-stone-400">Đang cập nhật hashtag...</span>
                ) : (
                  trendingTags.map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => setSelectedTag(item.tag)}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                        selectedTag === item.tag
                          ? "bg-[#00615f] text-white font-black shadow-xs"
                          : "bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-[#00615f]"
                      }`}
                    >
                      <span>#{item.tag}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/70 text-stone-600 font-bold">
                        {item.count}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Real Top Contributors Widget */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Award className="size-4 text-[#00615f]" />
                <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
                  Top Thành Viên Tích Cực
                </h3>
              </div>
              <div className="space-y-3">
                {topContributors.length === 0 ? (
                  <span className="text-xs text-stone-400">Đang cập nhật...</span>
                ) : (
                  topContributors.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-stone-50 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-xs text-[#00615f] w-4">{idx + 1}.</span>
                        <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm shrink-0">
                          {c.avatar && c.avatar.startsWith("http") ? (
                            <img src={c.avatar} alt={c.name} className="size-8 rounded-full object-cover" />
                          ) : (
                            <span>{c.avatar || "👤"}</span>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-stone-800 block truncate max-w-[130px]">
                            {c.name}
                          </span>
                          <span className="text-[10px] text-stone-500 block truncate max-w-[130px]">
                            {c.badge}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-rose-600 block">
                          ❤️ {c.totalLikes}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {c.postCount} bài viết
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Seasonal Highlights Widget */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/60 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-900">
                <Leaf className="size-4 text-amber-700" />
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  Nông Sản Chính Vụ Tháng 11
                </h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tháng này Cam sành Miền Tây, Bưởi da xanh và Quýt đường đang vào vụ thu hoạch rộ với giá rẻ hơn 40%. Hãy ưu tiên mua nông sản chính vụ vừa tươi ngon vừa tiết kiệm!
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsBookmarkedTab(false);
                  setActiveCategory("seasonal");
                }}
                className="text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Xem các bài viết nông sản theo mùa</span>
                <ArrowRight className="size-3" />
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Rich Create Post Modal */}
      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
