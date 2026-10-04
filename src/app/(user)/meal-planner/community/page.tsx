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
} from "lucide-react";

/* ─── types ─── */
interface CommunityPost {
  id: string;
  author: { name: string; avatar: string; badge?: string; role?: string };
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
  { key: "seasonal", label: "Trái cây theo mùa", icon: Leaf },
  { key: "budget", label: "Tiết kiệm", icon: Award },
];

const POSTS: CommunityPost[] = [
  {
    id: "1",
    author: { name: "Minh Tuấn", avatar: "👨‍🍳", badge: "Top Contributor", role: "Đam mê nấu ăn · 4 năm tự nấu" },
    title: "Kế hoạch ăn 1 tuần chỉ 350K đủ chất cho 1 người",
    content: "Mình chia sẻ thực đơn 7 ngày đầy đủ dinh dưỡng, chi phí bình quân 50K/ngày. Bí quyết là mua nguyên liệu theo mùa, chia nhỏ khẩu phần và nấu trước cho 2-3 ngày...",
    category: "meal-plan",
    likes: 234,
    comments: 45,
    views: 1289,
    timeAgo: "2 giờ trước",
    tags: ["50K/ngày", "meal-prep", "tiết kiệm"],
    mealPlan: { days: 7, avgCost: 50000 },
  },
  {
    id: "2",
    author: { name: "Cô Thanh Mai", avatar: "👵", badge: "Nội Trợ Thông Thái", role: "20 năm kinh nghiệm nội trợ" },
    title: "5 loại trái cây mùa thu vừa ngon vừa rẻ ở chợ",
    content: "Vào mùa thu, bưởi da xanh, cam sành, hồng giòn và ổi đang rộ với giá cực kỳ tốt. Mẹo của cô là đi chợ vào tầm 6h - 7h sáng, vừa tươi ngon mà giá mềm hơn siêu thị đáng kể...",
    category: "seasonal",
    likes: 167,
    comments: 28,
    views: 876,
    timeAgo: "5 giờ trước",
    tags: ["trái cây", "theo mùa", "mẹo nội trợ"],
  },
  {
    id: "3",
    author: { name: "Anh Đức Anh", avatar: "👨‍💻", badge: "Dân Văn Phòng", role: "Nhân viên IT · Meal-prep cuối tuần" },
    title: "Cách chọn thịt, cá tươi ngon khi đi siêu thị & chợ truyền thống",
    content: "Nhiều người bận rộn ít đi chợ thường lúng túng khi chọn thực phẩm. Chia sẻ vài mẹo đơn giản: thịt heo tươi có màu hồng nhạt, thớ thịt săn chắc, ấn tay đàn hồi ngay, bề mặt khô ráo không nhờn rít...",
    category: "tips",
    likes: 198,
    comments: 32,
    views: 1034,
    timeAgo: "1 ngày trước",
    tags: ["chọn thực phẩm", "đi chợ", "kinh nghiệm"],
  },
  {
    id: "4",
    author: { name: "Thu Hương", avatar: "👩‍🍳", badge: "Eat-clean Master", role: "HLV Dinh dưỡng cá nhân" },
    title: "Thực đơn eat-clean 30 ngày lành mạnh, dưới 60K/người/ngày",
    content: "Ăn healthy không hề đắt đỏ nếu biết phối hợp nguyên liệu địa phương. Mình tận dụng ức gà, trứng, đậu hũ và rau củ theo mùa. Vừa giữ dáng, tốt cho sức khỏe mà không lo 'viêm màng túi'...",
    category: "meal-plan",
    likes: 312,
    comments: 67,
    views: 2341,
    timeAgo: "2 ngày trước",
    tags: ["eat-clean", "healthy", "dinh dưỡng"],
    mealPlan: { days: 30, avgCost: 55000 },
  },
  {
    id: "5",
    author: { name: "Bác Quốc Bảo", avatar: "👨‍🌾", role: "Tiểu thương chợ đầu mối" },
    title: "Những điều cần biết khi đi chợ đầu mối mua đồ ăn cho cả tuần",
    content: "Đi chợ đầu mối hoặc gom mua theo nhóm gia đình, bạn bè giúp tiết kiệm 30-40%. Nên chuẩn bị hộp bảo quản sạch, phân chia thịt cá cấp đông theo từng bữa để không bị mất chất...",
    category: "tips",
    likes: 145,
    comments: 52,
    views: 789,
    timeAgo: "3 ngày trước",
    tags: ["chợ đầu mối", "bảo quản", "tiết kiệm"],
  },
  {
    id: "6",
    author: { name: "Chị Lan Phương", avatar: "👩‍👧‍👦", badge: "Mẹ Thông Thái", role: "Mẹ bỉm 2 con · Quản lý chi tiêu gia đình" },
    title: "Bảng mùa vụ nông sản 2026 – Mua rau củ quả tháng nào rẻ và an toàn nhất",
    content: "Rau củ đúng mùa vụ thường ít tồn dư thuốc bảo vệ thực vật và giá mềm nhất. Từ tháng 10 trở đi là mùa bắp cải, su hào, súp lơ giá chỉ bằng 1/2 so với trái vụ...",
    category: "seasonal",
    likes: 267,
    comments: 41,
    views: 1567,
    timeAgo: "4 ngày trước",
    tags: ["nông sản", "mùa vụ", "gia đình"],
  },
];

const TIPS = [
  { icon: "🍎", title: "Mua trái cây theo mùa", desc: "Rẻ hơn 30-50% và luôn tươi ngon nhất" },
  { icon: "🧊", title: "Meal prep cuối tuần", desc: "Sơ chế & nấu trước 2-3 ngày, tiết kiệm gas và thời gian" },
  { icon: "🛒", title: "Đi chợ sáng sớm", desc: "Rau củ mới về tươi xanh, nhiều lựa chọn ngon" },
  { icon: "📝", title: "Lên danh sách trước khi đi", desc: "Tránh mua tùy hứng, tiết kiệm 20-30% chi phí" },
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
                    <p className="text-[10px] text-stone-400">{post.author.role} · {post.timeAgo}</p>
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
    </div>
  );
}
