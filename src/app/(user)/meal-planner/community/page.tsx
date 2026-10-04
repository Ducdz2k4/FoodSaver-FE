"use client";

import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  Award,
  Lightbulb,
  Apple,
  ShoppingCart,
  Leaf,
  Eye,
  Loader2,
  X,
  Plus,
} from "lucide-react";
import {
  useGetCommunityPostsQuery,
  useCreateCommunityPostMutation,
  useToggleLikePostMutation,
  CommunityPostDTO,
} from "@/redux/api/mealPlannerApi";
import { toast } from "sonner";

const CATEGORIES_FILTER = [
  { key: "all", label: "Tất cả", icon: TrendingUp },
  { key: "meal-plan", label: "Kế hoạch ăn", icon: Apple },
  { key: "tips", label: "Mẹo đi chợ", icon: ShoppingCart },
  { key: "seasonal", label: "Trái cây theo mùa", icon: Leaf },
  { key: "budget", label: "Tiết kiệm", icon: Award },
];

const TIPS = [
  { icon: "🍎", title: "Mua trái cây theo mùa", desc: "Rẻ hơn 30-50% và luôn tươi ngon nhất" },
  { icon: "🧊", title: "Meal prep cuối tuần", desc: "Sơ chế & nấu trước 2-3 ngày, tiết kiệm gas và thời gian" },
  { icon: "🛒", title: "Đi chợ sáng sớm", desc: "Rau củ mới về tươi xanh, nhiều lựa chọn ngon" },
  { icon: "📝", title: "Lên danh sách trước khi đi", desc: "Tránh mua tùy hứng, tiết kiệm 20-30% chi phí" },
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

export default function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"hot" | "new">("hot");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("tips");
  const [newTags, setNewTags] = useState("");
  const [newAuthorName, setNewAuthorName] = useState("");

  // API Hooks
  const { data: postsRes, isLoading, isFetching } = useGetCommunityPostsQuery({
    category: activeFilter,
    sortBy,
  });
  const [createPost, { isLoading: isCreating }] = useCreateCommunityPostMutation();
  const [toggleLike] = useToggleLikePostMutation();

  const posts: CommunityPostDTO[] = postsRes?.data || [];

  const handleLike = async (postId: string) => {
    try {
      const res = await toggleLike(postId).unwrap();
      toast.success(res.data.liked ? "Đã thích bài viết!" : "Đã bỏ thích");
    } catch {
      toast.error("Không thể thao tác. Vui lòng thử lại");
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung bài viết");
      return;
    }

    try {
      const tagsArray = newTags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      await createPost({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        authorName: newAuthorName.trim() || undefined,
        tags: tagsArray,
      }).unwrap();

      toast.success("Chia sẻ bài viết thành công!");
      setIsCreateModalOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewTags("");
      setNewAuthorName("");
    } catch {
      toast.error("Không thể đăng bài viết");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Cộng đồng <span className="text-[#00615f]">Chia sẻ Món ngon & Tiết kiệm</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Không gian kết nối kinh nghiệm nấu ăn, mẹo đi chợ và bí quyết chi tiêu từ mọi người
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#00615f] text-white text-xs font-bold hover:bg-[#004d4b] transition shadow-md"
        >
          <Lightbulb className="size-3.5" /> Chia sẻ kinh nghiệm
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ═══ MAIN FEED ═══ */}
        <div className="flex-1 space-y-4">
          {/* Filter & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES_FILTER.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveFilter(cat.key)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold transition-all ${
                      activeFilter === cat.key
                        ? "bg-[#00615f] text-white shadow"
                        : "bg-white/80 text-stone-600 border border-stone-200 hover:border-[#00615f]/30"
                    }`}
                  >
                    <Icon className="size-3.5" /> {cat.label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1 bg-white/80 border border-stone-200 rounded-full p-0.5">
              <button
                onClick={() => setSortBy("hot")}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${
                  sortBy === "hot" ? "bg-[#00615f] text-white shadow-sm" : "text-stone-500"
                }`}
              >
                🔥 Nổi bật
              </button>
              <button
                onClick={() => setSortBy("new")}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${
                  sortBy === "new" ? "bg-[#00615f] text-white shadow-sm" : "text-stone-500"
                }`}
              >
                🕐 Mới nhất
              </button>
            </div>
          </div>

          {/* Posts */}
          {isLoading || isFetching ? (
            <div className="rounded-2xl bg-white/80 border border-stone-200 p-12 text-center">
              <Loader2 className="size-8 mx-auto animate-spin text-[#00615f] mb-3" />
              <p className="text-xs text-stone-500">Đang tải bài viết cộng đồng...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl bg-white/80 border border-stone-200 p-12 text-center space-y-2">
              <p className="text-sm font-semibold text-stone-700">Chưa có bài viết nào trong chủ đề này</p>
              <p className="text-xs text-stone-400">Hãy là người đầu tiên chia sẻ bí quyết của bạn!</p>
            </div>
          ) : (
            posts.map((post) => {
              const tagsList = Array.isArray(post.tags) ? post.tags : [];
              return (
                <article
                  key={post.id}
                  className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-5">
                    {/* Author */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{post.authorAvatar || "👤"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-800">{post.authorName}</span>
                          {post.authorBadge && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[9px] font-bold">
                              ⭐ {post.authorBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400">{post.authorRole || "Thành viên"} · {timeAgo(post.createdAt)}</p>
                      </div>
                      <button className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-[#00615f] transition">
                        <Bookmark className="size-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <h3 className="text-sm font-bold text-stone-900 leading-snug mb-1.5">{post.title}</h3>
                    <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                    {/* Meal plan badge */}
                    {post.mealPlan && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/80 border border-emerald-200/50">
                        <Apple className="size-4 text-[#00615f]" />
                        <div>
                          <p className="text-[10px] font-bold text-[#00615f]">Kế hoạch {post.mealPlan.days} ngày</p>
                          <p className="text-[10px] text-stone-500">~{formatVND(post.mealPlan.avgCost)}/ngày</p>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {tagsList.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tagsList.map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[10px] font-semibold">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-rose-500 transition group"
                      >
                        <Heart className="size-3.5 group-hover:scale-110 transition-transform text-rose-500 fill-rose-50" />
                        <span className="font-semibold text-stone-700">{post.likes}</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-sky-500 transition">
                        <MessageCircle className="size-3.5" />
                        <span className="font-semibold text-stone-700">{post.comments}</span>
                      </button>
                      <span className="inline-flex items-center gap-1 text-[10px] text-stone-400">
                        <Eye className="size-3" /> {post.views}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        toast.success("Đã sao chép liên kết bài viết!");
                        navigator.clipboard.writeText(window.location.href);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-[#00615f] transition"
                    >
                      <Share2 className="size-3.5" /> Chia sẻ
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* ═══ SIDEBAR ═══ */}
        <aside className="lg:w-80 shrink-0 space-y-4">
          {/* Quick tips */}
          <div className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-5">
            <h3 className="text-xs font-black text-stone-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Lightbulb className="size-4 text-amber-500" /> Mẹo vặt đi chợ & nấu nướng
            </h3>
            <div className="space-y-3">
              {TIPS.map((tip, idx) => (
                <div key={idx} className="flex gap-3 p-2.5 rounded-xl hover:bg-stone-50 transition cursor-pointer">
                  <span className="text-xl shrink-0">{tip.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-stone-800">{tip.title}</p>
                    <p className="text-[10px] text-stone-500">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top contributors */}
          <div className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-5">
            <h3 className="text-xs font-black text-stone-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="size-4 text-[#00615f]" /> Top thành viên tích cực
            </h3>
            <div className="space-y-2.5">
              {[
                { name: "Minh Tuấn", avatar: "👨‍🍳", posts: 23, likes: 1234 },
                { name: "Cô Thanh Mai", avatar: "👵", posts: 21, likes: 1102 },
                { name: "Thu Hương", avatar: "👩‍🍳", posts: 18, likes: 987 },
                { name: "Anh Đức Anh", avatar: "👨‍💻", posts: 15, likes: 876 },
              ].map((user, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition cursor-pointer">
                  <span className="text-lg shrink-0 font-bold text-stone-300 w-5 text-center">{idx + 1}</span>
                  <span className="text-xl">{user.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-800 truncate">{user.name}</p>
                    <p className="text-[10px] text-stone-400">{user.posts} bài · {user.likes} likes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seasonal calendar */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-200/50 p-5">
            <h3 className="text-xs font-black text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Leaf className="size-4 text-emerald-500" /> Nông sản & Trái cây mùa này (Tháng 10)
            </h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {["🍊 Cam sành", "🍐 Lê", "🍇 Nho Ninh Thuận", "🥭 Hồng giòn Đà Lạt", "🍈 Bưởi da xanh", "🍎 Táo"].map((fruit) => (
                <span key={fruit} className="px-2.5 py-1 rounded-full bg-white/80 text-xs font-semibold text-stone-700 shadow-sm">
                  {fruit}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-stone-500">Mua trái cây đúng mùa vụ giúp tiết kiệm 30-50% chi phí và an toàn hơn cho sức khỏe</p>
          </div>
        </aside>
      </div>

      {/* ═══ CREATE POST MODAL ═══ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Lightbulb className="size-5 text-[#00615f]" />
                <h3 className="font-bold text-base text-stone-900">Chia sẻ kinh nghiệm với cộng đồng</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-stone-600">Họ tên / Biệt danh của bạn</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Anh Quân, Mẹ Bắp..."
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600">Chủ đề bài viết</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f]"
                >
                  <option value="tips">Mẹo đi chợ & nấu nướng</option>
                  <option value="meal-plan">Kế hoạch ăn uống & Thực đơn</option>
                  <option value="seasonal">Trái cây & Nông sản theo mùa</option>
                  <option value="budget">Tiết kiệm ngân sách</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600">Tiêu đề bài viết</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kinh nghiệm đi chợ đầu mối gom mua cho cả tuần..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600">Nội dung chia sẻ</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Chia sẻ chi tiết các bước, mẹo vặt hoặc kinh nghiệm thực tế của bạn..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600">Tags (cách nhau dấu phẩy)</label>
                <input
                  type="text"
                  placeholder="di-cho, tiet-kiem, gia-dinh..."
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-[#00615f] text-white text-xs font-bold hover:bg-[#004d4b] transition shadow-md flex items-center gap-1.5"
                >
                  {isCreating && <Loader2 className="size-3.5 animate-spin" />}
                  Đăng bài viết
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
