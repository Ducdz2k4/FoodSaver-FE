"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  Clock,
  Users,
  Star,
  Award,
  Lightbulb,
  Apple,
  ShoppingCart,
  Leaf,
  ChevronRight,
  ThumbsUp,
  Eye,
} from "lucide-react";

/* ─── types ─── */
interface CommunityPost {
  id: string;
  author: { name: string; avatar: string; badge?: string; year?: string };
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  views: number;
  timeAgo: string;
  tags: string[];
  mealPlan?: { days: number; avgCost: number };
}

const CATEGORIES_FILTER = [
  { key: "all", label: "Tất cả", icon: TrendingUp },
  { key: "meal-plan", label: "Kế hoạch ăn", icon: Apple },
  { key: "tips", label: "Mẹo đi chợ", icon: ShoppingCart },
  { key: "seasonal", label: "Trái cây mùa", icon: Leaf },
  { key: "budget", label: "Tiết kiệm", icon: Award },
];

const POSTS: CommunityPost[] = [
  {
    id: "1",
    author: { name: "Minh Tuấn", avatar: "🧑‍🎓", badge: "Top Contributor", year: "Năm 4 - ĐH Bách Khoa" },
    title: "Kế hoạch ăn 1 tuần chỉ với 350K cho sinh viên",
    content: "Mình chia sẻ thực đơn 7 ngày đầy đủ dinh dưỡng, chi phí chỉ 50K/ngày. Bí quyết là mua nguyên liệu theo mùa và nấu trước cho 2-3 ngày...",
    category: "meal-plan",
    likes: 234,
    comments: 45,
    views: 1289,
    timeAgo: "2 giờ trước",
    tags: ["50K/ngày", "meal-prep", "sinh viên"],
    mealPlan: { days: 7, avgCost: 50000 },
  },
  {
    id: "2",
    author: { name: "Hà My", avatar: "👩‍🎓", year: "Năm 3 - ĐH Kinh Tế" },
    title: "5 loại trái cây mùa thu siêu rẻ tại Sài Gòn",
    content: "Mùa thu là lúc bưởi, cam sành, hồng giòn vào mùa với giá cực tốt. Mình thường mua ở chợ đầu mối để được giá sỉ, rẻ hơn siêu thị 30-40%...",
    category: "seasonal",
    likes: 167,
    comments: 28,
    views: 876,
    timeAgo: "5 giờ trước",
    tags: ["trái cây", "mùa thu", "giá rẻ"],
  },
  {
    id: "3",
    author: { name: "Đức Anh", avatar: "🧑‍💻", badge: "Budget Master", year: "Năm 2 - ĐH FPT" },
    title: "Cách chọn thịt tươi ngon khi đi siêu thị",
    content: "Nhiều bạn mới tự nấu ăn không biết phân biệt thịt tươi. Chia sẻ vài mẹo: thịt heo tươi có màu hồng nhạt, ấn tay vào đàn hồi nhanh, không có mùi lạ...",
    category: "tips",
    likes: 198,
    comments: 32,
    views: 1034,
    timeAgo: "1 ngày trước",
    tags: ["đi chợ", "thịt tươi", "mẹo hay"],
  },
  {
    id: "4",
    author: { name: "Thu Hương", avatar: "👩‍🍳", year: "Năm 3 - ĐH Nông Lâm" },
    title: "Thực đơn eat-clean 30 ngày, dưới 60K/ngày",
    content: "Mình đã thử ăn clean 1 tháng và giảm được 3kg. Chi phí trung bình chỉ 55K/ngày vì mình tận dụng rau củ theo mùa. Đây là lịch ăn chi tiết...",
    category: "meal-plan",
    likes: 312,
    comments: 67,
    views: 2341,
    timeAgo: "2 ngày trước",
    tags: ["eat-clean", "giảm cân", "tiết kiệm"],
    mealPlan: { days: 30, avgCost: 55000 },
  },
  {
    id: "5",
    author: { name: "Quốc Bảo", avatar: "🧑‍🎓", year: "Năm 1 - ĐH Sư Phạm" },
    title: "Lần đầu tự nấu ăn: những sai lầm mình mắc phải",
    content: "Bài viết dành cho các bạn sinh viên năm nhất mới bắt đầu tự nấu. Mình đã từng mua quá nhiều đồ rồi để hư, không biết bảo quản đúng cách...",
    category: "tips",
    likes: 145,
    comments: 52,
    views: 789,
    timeAgo: "3 ngày trước",
    tags: ["năm nhất", "kinh nghiệm", "sai lầm"],
  },
  {
    id: "6",
    author: { name: "Lan Phương", avatar: "👩‍🌾", badge: "Seasonal Expert", year: "Năm 4 - ĐH Cần Thơ" },
    title: "Bảng giá rau củ theo mùa 2026 – mua gì tháng nào rẻ nhất",
    content: "Tổng hợp bảng giá rau củ quả theo 4 mùa giúp các bạn lên kế hoạch mua sắm tiết kiệm nhất. Ví dụ tháng 10-12 là mùa su hào, bắp cải giá chỉ 8-10K/kg...",
    category: "seasonal",
    likes: 267,
    comments: 41,
    views: 1567,
    timeAgo: "4 ngày trước",
    tags: ["bảng giá", "rau theo mùa", "2026"],
  },
];

const TIPS = [
  { icon: "🍎", title: "Mua trái cây theo mùa", desc: "Rẻ hơn 30-50% và tươi ngon hơn" },
  { icon: "🧊", title: "Meal prep cuối tuần", desc: "Nấu trước 3-4 ngày, tiết kiệm thời gian" },
  { icon: "🛒", title: "Đi chợ sáng sớm", desc: "Rau củ tươi, giá tốt, nhiều lựa chọn" },
  { icon: "📝", title: "Viết danh sách trước", desc: "Tránh mua impulsive, tiết kiệm 20-30%" },
];

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"hot" | "new">("hot");

  const filtered = activeFilter === "all" ? POSTS : POSTS.filter((p) => p.category === activeFilter);
  const sorted = [...filtered].sort((a, b) => (sortBy === "hot" ? b.likes - a.likes : 0));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f3f0] to-[#fef9f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* breadcrumb */}
        <Link href="/meal-planner" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#00615f] mb-4 transition">
          <ArrowLeft className="size-3.5" /> Hôm nay ăn gì?
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Cộng đồng <span className="text-[#00615f]">Sinh viên</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">Chia sẻ kinh nghiệm ăn uống tiết kiệm từ các anh chị đi trước</p>
          </div>
          <button className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#00615f] text-white text-xs font-bold hover:bg-[#004d4b] transition shadow-md">
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
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${sortBy === "hot" ? "bg-[#00615f] text-white" : "text-stone-500"}`}
                >
                  🔥 Nổi bật
                </button>
                <button
                  onClick={() => setSortBy("new")}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${sortBy === "new" ? "bg-[#00615f] text-white" : "text-stone-500"}`}
                >
                  🕐 Mới nhất
                </button>
              </div>
            </div>

            {/* Posts */}
            {sorted.map((post) => (
              <article key={post.id} className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-5">
                  {/* Author */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{post.author.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-800">{post.author.name}</span>
                        {post.author.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[9px] font-bold">
                            ⭐ {post.author.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400">{post.author.year} · {post.timeAgo}</p>
                    </div>
                    <button className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-[#00615f] transition">
                      <Bookmark className="size-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <h3 className="text-sm font-bold text-stone-900 leading-snug mb-1.5">{post.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">{post.content}</p>

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
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[10px] font-semibold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-rose-500 transition">
                      <Heart className="size-3.5" /> {post.likes}
                    </button>
                    <button className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-sky-500 transition">
                      <MessageCircle className="size-3.5" /> {post.comments}
                    </button>
                    <span className="inline-flex items-center gap-1 text-[10px] text-stone-400">
                      <Eye className="size-3" /> {post.views}
                    </span>
                  </div>
                  <button className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-[#00615f] transition">
                    <Share2 className="size-3.5" /> Chia sẻ
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* ═══ SIDEBAR ═══ */}
          <aside className="lg:w-80 shrink-0 space-y-4">
            {/* Quick tips */}
            <div className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-5">
              <h3 className="text-xs font-black text-stone-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Lightbulb className="size-4 text-amber-500" /> Mẹo vặt nhanh
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
                <Award className="size-4 text-[#00615f]" /> Top đóng góp
              </h3>
              <div className="space-y-2.5">
                {[
                  { name: "Minh Tuấn", avatar: "🧑‍🎓", posts: 23, likes: 1234 },
                  { name: "Thu Hương", avatar: "👩‍🍳", posts: 18, likes: 987 },
                  { name: "Đức Anh", avatar: "🧑‍💻", posts: 15, likes: 876 },
                  { name: "Lan Phương", avatar: "👩‍🌾", posts: 12, likes: 654 },
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
                <Leaf className="size-4 text-emerald-500" /> Trái cây tháng 10
              </h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {["🍊 Cam sành", "🥝 Kiwi", "🍐 Lê", "🍇 Nho", "🥭 Hồng giòn", "🍎 Táo"].map((fruit) => (
                  <span key={fruit} className="px-2.5 py-1 rounded-full bg-white/80 text-xs font-semibold text-stone-700 shadow-sm">
                    {fruit}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-stone-500">Mua trái cây đúng mùa giúp tiết kiệm 30-50% chi phí</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
