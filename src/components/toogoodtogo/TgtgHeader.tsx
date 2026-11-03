"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Search, Menu, X, ShieldAlert, Store, Clock, ShieldCheck, User, LogOut, Compass, ChefHat, Users } from "lucide-react";
import { UserMenuDropdown } from "@/components/common/UserMenuDropdown";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useAppSelector } from "@/redux/hooks";

export function TgtgHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const { user: authUser, logout } = useAuth();
  const rawUser = useAppSelector((state) => state.auth.user);
  const currentUser = mounted ? (authUser || rawUser) : null;
  const router = useRouter();
  const pathname = usePathname();

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
  };

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isSearchActive = pathname === "/search" || pathname.startsWith("/search/") || pathname.startsWith("/listings/");
  const isMapActive = pathname === "/map" || pathname.startsWith("/map/");
  const isCommunityActive = pathname === "/community" || pathname.startsWith("/community/");
  const isOrdersActive = pathname === "/orders" || pathname.startsWith("/orders/");
  const isMealPlannerActive = pathname === "/meal-planner" || pathname.startsWith("/meal-planner/");
  const isLoginActive = pathname === "/login";
  const isRegisterActive = pathname === "/register";
  const isAdminActive = pathname.startsWith("/admin");
  const isPartnerActive = pathname.startsWith("/partner/dashboard");
  const isPartnerApplyActive = pathname.startsWith("/partner/apply");
  const isProfileActive = pathname === "/profile" || pathname.startsWith("/profile/");

  const navItems = [
    {
      href: "/search",
      label: "Khám phá",
      isActive: isSearchActive,
    },
    {
      href: "/map",
      label: "Bản đồ",
      isActive: isMapActive,
    },
    {
      href: "/community",
      label: "Cộng đồng",
      icon: Users,
      isActive: isCommunityActive,
    },
    {
      href: "/orders",
      label: "Đơn của tôi",
      isActive: isOrdersActive,
    },
    {
      href: "/meal-planner",
      label: "Ăn gì?",
      icon: ChefHat,
      isActive: isMealPlannerActive,
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "liquid-glass-subtle py-2.5 shadow-sm"
          : "bg-[#f9f3f0]/85 backdrop-blur-lg border-b border-stone-200/50 py-3 sm:py-3.5"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer"
            aria-label="FoodSaver Homepage"
          >
            <div className="relative size-9 sm:size-10 rounded-full overflow-hidden shadow-[0_2px_8px_rgba(0,97,95,0.2)] group-hover:scale-105 transition-transform duration-200 border border-emerald-200/80 bg-white">
              <Image
                src="/images/logoFS.png"
                alt="FoodSaver Logo"
                fill
                sizes="(max-width: 640px) 36px, 40px"
                className="object-cover"
                priority
              />
            </div>
            <span className="font-black text-xl sm:text-2xl tracking-tight text-[#00615f] uppercase select-none">
              FOODSAVER
            </span>
          </Link>
        </div>

        {/* Center: Search & Navigation */}
        <div className="hidden lg:flex items-center justify-center flex-1">
          <nav className="liquid-glass flex items-center gap-2 p-1.5 rounded-full border border-stone-200/60 bg-white/70 shadow-sm">
            {/* Integrated Search Capsule */}
            <form onSubmit={handleHeaderSearch} className="relative w-44 xl:w-56">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f9f3f0]/80 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00615f]/20 border border-stone-200/50 transition-all duration-200">
                <Search className="size-3.5 text-[#00615f] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm món ngon gần bạn..."
                  className="w-full bg-transparent text-xs font-medium text-[#252d2d] placeholder:text-stone-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-stone-400 hover:text-stone-600 text-xs"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </form>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={item.isActive ? "page" : undefined}
                    className={`px-3.5 py-1.5 rounded-full text-xs xl:text-[13px] font-bold transition-all duration-200 inline-flex items-center gap-1.5 select-none ${
                      item.isActive
                        ? "bg-[#00615f] text-white shadow-[0_2px_8px_rgba(0,97,95,0.25)] font-black"
                        : "text-[#00615f] hover:text-[#089184] hover:bg-emerald-50/80"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`size-3.5 shrink-0 transition-colors ${
                          item.isActive ? "text-[#79e4a7]" : "text-[#00615f]"
                        }`}
                      />
                    )}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Right: Dynamic Capability Navigation based on user role */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">
          {currentUser ? (
            <>
              {/* 1. Admin Portal */}
              {currentUser.role === "ADMIN" && (
                <Link
                  href="/admin"
                  aria-current={isAdminActive ? "page" : undefined}
                  className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs shadow-md transition ${
                    isAdminActive
                      ? "bg-purple-900 text-white ring-2 ring-purple-400 ring-offset-1 font-black shadow-purple-900/30"
                      : "bg-purple-700 hover:bg-purple-800 text-white"
                  }`}
                >
                  <ShieldAlert className="size-3.5" />
                  <span>Admin Portal</span>
                </Link>
              )}

              {/* 2. Partner Center (Verified) */}
              {currentUser.partnerCapability === "VERIFIED" && (
                <Link
                  href="/partner/dashboard"
                  aria-current={isPartnerActive ? "page" : undefined}
                  className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs shadow-md transition ${
                    isPartnerActive
                      ? "bg-emerald-800 text-white ring-2 ring-emerald-300 ring-offset-1 font-black shadow-emerald-900/30"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  <Store className="size-3.5" />
                  <span>Partner Center</span>
                </Link>
              )}

              {/* 3. Partner Pending */}
              {currentUser.partnerCapability === "PENDING" && (
                <Link
                  href="/partner/apply/pending"
                  aria-current={isPartnerApplyActive ? "page" : undefined}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs shadow-sm transition ${
                    isPartnerApplyActive
                      ? "bg-amber-100 text-amber-900 border-2 border-amber-400 font-black"
                      : "bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100"
                  }`}
                >
                  <Clock className="size-3.5" />
                  <span>Hồ sơ đang duyệt</span>
                </Link>
              )}

              {/* 4. Partner Rejected */}
              {currentUser.partnerCapability === "REJECTED" && (
                <Link
                  href="/partner/apply"
                  aria-current={isPartnerApplyActive ? "page" : undefined}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs shadow-sm transition ${
                    isPartnerApplyActive
                      ? "bg-rose-100 text-rose-900 border-2 border-rose-400 font-black"
                      : "bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100"
                  }`}
                >
                  <span>✕ Hồ sơ từ chối (Nộp lại)</span>
                </Link>
              )}

              {/* 5. Customer -> Button to Become a Partner */}
              {currentUser.partnerCapability === "NONE" && currentUser.role !== "ADMIN" && (
                <Link
                  href="/partner/apply"
                  aria-current={isPartnerApplyActive ? "page" : undefined}
                  className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs shadow-sm transition ${
                    isPartnerApplyActive
                      ? "bg-[#00615f] text-white font-black shadow-md"
                      : "bg-white hover:bg-emerald-50 text-[#00615f] border border-[#00615f]/40"
                  }`}
                >
                  <Store className="size-3.5" />
                  <span>Trở thành Đối tác</span>
                </Link>
              )}

              {/* Profile Dropdown Menu */}
              <UserMenuDropdown />
            </>
          ) : (
            <>
              <Link
                href="/login"
                aria-current={isLoginActive ? "page" : undefined}
                className={`text-xs sm:text-[13px] font-bold px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  isLoginActive
                    ? "bg-[#00615f] text-white shadow-[0_2px_8px_rgba(0,97,95,0.25)] font-black"
                    : "text-[#00615f] hover:text-[#089184] hover:bg-white/60"
                }`}
              >
                Đăng nhập
              </Link>

              <Link
                href="/register"
                aria-current={isRegisterActive ? "page" : undefined}
                className={`inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-full font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 ${
                  isRegisterActive
                    ? "bg-[#089184] text-white ring-2 ring-[#00615f] ring-offset-2 font-black shadow-lg"
                    : "bg-[#00615f] hover:bg-[#089184] text-white"
                }`}
              >
                Đăng ký
              </Link>
            </>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-[#00615f] hover:bg-white/60 rounded-full focus:outline-none transition"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden liquid-glass mx-4 mt-2 px-6 py-6 space-y-4 rounded-3xl shadow-xl border border-stone-200 bg-white/95 backdrop-blur-md animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-1.5 text-sm font-bold text-[#00615f] pt-1">
            <Link
              href="/search"
              onClick={() => setMobileOpen(false)}
              aria-current={isSearchActive ? "page" : undefined}
              className={`px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                isSearchActive
                  ? "bg-[#00615f] text-white font-black shadow-sm"
                  : "hover:bg-emerald-50 text-[#00615f]"
              }`}
            >
              <span>Khám phá</span>
              {isSearchActive && <span className="size-2 rounded-full bg-[#79e4a7] shadow-xs" />}
            </Link>

            <Link
              href="/map"
              onClick={() => setMobileOpen(false)}
              aria-current={isMapActive ? "page" : undefined}
              className={`px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                isMapActive
                  ? "bg-[#00615f] text-white font-black shadow-sm"
                  : "hover:bg-emerald-50 text-[#00615f]"
              }`}
            >
              <span>Bản đồ</span>
              {isMapActive && <span className="size-2 rounded-full bg-[#79e4a7] shadow-xs" />}
            </Link>

            <Link
              href="/community"
              onClick={() => setMobileOpen(false)}
              aria-current={isCommunityActive ? "page" : undefined}
              className={`px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                isCommunityActive
                  ? "bg-[#00615f] text-white font-black shadow-sm"
                  : "hover:bg-emerald-50 text-[#00615f]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className={`size-4 ${isCommunityActive ? "text-[#79e4a7]" : "text-[#00615f]"}`} />
                <span>Cộng đồng chia sẻ</span>
              </div>
              {isCommunityActive && <span className="size-2 rounded-full bg-[#79e4a7] shadow-xs" />}
            </Link>

            <Link
              href="/orders"
              onClick={() => setMobileOpen(false)}
              aria-current={isOrdersActive ? "page" : undefined}
              className={`px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                isOrdersActive
                  ? "bg-[#00615f] text-white font-black shadow-sm"
                  : "hover:bg-emerald-50 text-[#00615f]"
              }`}
            >
              <span>Đơn hàng của tôi</span>
              {isOrdersActive && <span className="size-2 rounded-full bg-[#79e4a7] shadow-xs" />}
            </Link>

            <Link
              href="/meal-planner"
              onClick={() => setMobileOpen(false)}
              aria-current={isMealPlannerActive ? "page" : undefined}
              className={`px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                isMealPlannerActive
                  ? "bg-[#00615f] text-white font-black shadow-sm"
                  : "hover:bg-emerald-50 text-[#00615f]"
              }`}
            >
              <div className="flex items-center gap-2">
                <ChefHat className={`size-4 ${isMealPlannerActive ? "text-[#79e4a7]" : "text-[#00615f]"}`} />
                <span>Ăn gì? (Gợi ý & Trợ lý AI)</span>
              </div>
              {isMealPlannerActive && <span className="size-2 rounded-full bg-[#79e4a7] shadow-xs" />}
            </Link>

            {currentUser && currentUser.partnerCapability === "NONE" && currentUser.role !== "ADMIN" && (
              <Link
                href="/partner/apply"
                onClick={() => setMobileOpen(false)}
                aria-current={isPartnerApplyActive ? "page" : undefined}
                className={`px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                  isPartnerApplyActive
                    ? "bg-[#00615f] text-white font-black shadow-sm"
                    : "hover:bg-emerald-50 text-emerald-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Store className="size-4" />
                  <span>Đăng ký làm Đối tác F&B</span>
                </div>
                {isPartnerApplyActive && <span className="size-2 rounded-full bg-[#79e4a7] shadow-xs" />}
              </Link>
            )}

            {currentUser && currentUser.partnerCapability === "VERIFIED" && (
              <Link
                href="/partner/dashboard"
                onClick={() => setMobileOpen(false)}
                aria-current={isPartnerActive ? "page" : undefined}
                className={`px-3.5 py-2.5 rounded-xl text-white font-bold transition flex items-center justify-between ${
                  isPartnerActive
                    ? "bg-emerald-800 ring-2 ring-emerald-300 font-black shadow-sm"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Store className="size-4" />
                  <span>Partner Center</span>
                </div>
                {isPartnerActive && <span className="size-2 rounded-full bg-white shadow-xs" />}
              </Link>
            )}

            {currentUser && currentUser.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                aria-current={isAdminActive ? "page" : undefined}
                className={`px-3.5 py-2.5 rounded-xl text-white font-bold transition flex items-center justify-between ${
                  isAdminActive
                    ? "bg-purple-900 ring-2 ring-purple-400 font-black shadow-sm"
                    : "bg-purple-700 hover:bg-purple-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="size-4" />
                  <span>Admin Portal</span>
                </div>
                {isAdminActive && <span className="size-2 rounded-full bg-white shadow-xs" />}
              </Link>
            )}

            {currentUser ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  aria-current={isProfileActive ? "page" : undefined}
                  className={`px-3.5 py-2.5 rounded-xl font-bold transition flex items-center justify-between ${
                    isProfileActive
                      ? "bg-stone-200/90 text-stone-900 font-black"
                      : "hover:bg-stone-100 text-stone-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-[#00615f]" />
                    <span>Hồ sơ cá nhân ({currentUser.fullName || currentUser.email})</span>
                  </div>
                  {isProfileActive && <span className="size-2 rounded-full bg-[#00615f] shadow-xs" />}
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                    toast.success("Đã đăng xuất tài khoản.");
                    router.push("/login");
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-rose-50 text-rose-600 font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="size-4" />
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <div className="pt-2 border-t border-stone-200 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  aria-current={isLoginActive ? "page" : undefined}
                  className={`w-full text-center py-2.5 rounded-full font-bold text-xs transition ${
                    isLoginActive
                      ? "bg-[#00615f] text-white font-black shadow-sm"
                      : "border border-[#00615f] text-[#00615f] hover:bg-[#00615f]/10"
                  }`}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  aria-current={isRegisterActive ? "page" : undefined}
                  className={`w-full text-center py-2.5 rounded-full font-bold text-xs transition ${
                    isRegisterActive
                      ? "bg-[#089184] ring-2 ring-[#00615f] text-white font-black shadow-md"
                      : "bg-[#00615f] hover:bg-[#089184] text-white"
                  }`}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}


