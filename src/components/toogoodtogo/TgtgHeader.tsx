"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, ShieldAlert, Store, Clock, ShieldCheck } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";

export function TgtgHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            <div className="size-9 sm:size-10 rounded-full bg-[#00615f] text-white flex items-center justify-center font-black text-sm shadow-[0_2px_8px_rgba(0,97,95,0.25)] group-hover:scale-105 transition-transform duration-200">
              <span className="text-[#79e4a7] font-black tracking-tight">FS</span>
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
            <div className="relative w-44 xl:w-56">
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
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              <Link
                href="/#listings"
                className="liquid-glass-item px-3.5 py-1.5 rounded-full text-xs xl:text-[13px] font-bold text-[#00615f] hover:text-[#089184] hover:bg-emerald-50 transition"
              >
                Khám phá
              </Link>
              <Link
                href="/search"
                className="liquid-glass-item px-3.5 py-1.5 rounded-full text-xs xl:text-[13px] font-bold text-[#00615f] hover:text-[#089184] hover:bg-emerald-50 transition"
              >
                Tìm kiếm
              </Link>
              <Link
                href="/#how-it-works"
                className="liquid-glass-item px-3.5 py-1.5 rounded-full text-xs xl:text-[13px] font-bold text-[#00615f] hover:text-[#089184] hover:bg-emerald-50 transition"
              >
                Cách hoạt động
              </Link>
              <Link
                href="/orders"
                className="liquid-glass-item px-3.5 py-1.5 rounded-full text-xs xl:text-[13px] font-bold text-[#00615f] hover:text-[#089184] hover:bg-emerald-50 transition"
              >
                Đơn của tôi
              </Link>
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
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition"
                >
                  <ShieldAlert className="size-3.5" />
                  <span>Admin Portal</span>
                </Link>
              )}

              {/* 2. Partner Center (Verified) */}
              {currentUser.partnerCapability === "VERIFIED" && (
                <Link
                  href="/partner/dashboard"
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                >
                  <Store className="size-3.5" />
                  <span>Partner Center</span>
                </Link>
              )}

              {/* 3. Partner Pending */}
              {currentUser.partnerCapability === "PENDING" && (
                <Link
                  href="/partner/apply/pending"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 font-bold text-xs shadow-sm hover:bg-amber-100 transition"
                >
                  <Clock className="size-3.5" />
                  <span>Hồ sơ đang duyệt</span>
                </Link>
              )}

              {/* 4. Partner Rejected */}
              {currentUser.partnerCapability === "REJECTED" && (
                <Link
                  href="/partner/apply"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-300 font-bold text-xs shadow-sm hover:bg-rose-100 transition"
                >
                  <span>✕ Hồ sơ từ chối (Nộp lại)</span>
                </Link>
              )}

              {/* 5. Customer -> Button to Become a Partner */}
              {currentUser.partnerCapability === "NONE" && currentUser.role !== "ADMIN" && (
                <Link
                  href="/partner/apply"
                  className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-emerald-50 text-[#00615f] border border-[#00615f]/40 font-bold text-xs shadow-sm transition"
                >
                  <Store className="size-3.5" />
                  <span>Trở thành Đối tác</span>
                </Link>
              )}

              {/* Profile Avatar / Name */}
              <Link
                href="/profile"
                className="flex items-center gap-2 p-1.5 pl-2 sm:pl-3 rounded-full bg-white/80 hover:bg-white border border-stone-200/60 shadow-sm transition"
              >
                <span className="text-xs font-bold text-stone-800 hidden sm:inline-block max-w-[120px] truncate">
                  {currentUser.fullName}
                </span>
                <div className="size-7 rounded-full bg-[#00615f] text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "U"}
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs sm:text-[13px] font-bold text-[#00615f] hover:text-[#089184] px-3.5 py-1.5 rounded-full hover:bg-white/60 transition"
              >
                Đăng nhập
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-full bg-[#00615f] hover:bg-[#089184] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
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
          <nav className="flex flex-col space-y-2 text-sm font-bold text-[#00615f] pt-1">
            <Link
              href="/#listings"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-emerald-50 transition"
            >
              Khám phá
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-emerald-50 transition"
            >
              Tìm kiếm
            </Link>
            <Link
              href="/orders"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-emerald-50 transition"
            >
              Đơn hàng của tôi
            </Link>

            {currentUser && currentUser.partnerCapability === "NONE" && (
              <Link
                href="/partner/apply"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-emerald-50 text-emerald-700 font-bold transition flex items-center gap-2"
              >
                <Store className="size-4" />
                <span>Đăng ký làm Đối tác F&B</span>
              </Link>
            )}

            {currentUser && currentUser.partnerCapability === "VERIFIED" && (
              <Link
                href="/partner/dashboard"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold transition flex items-center gap-2"
              >
                <Store className="size-4" />
                <span>Partner Center</span>
              </Link>
            )}

            {currentUser && currentUser.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-xl bg-purple-700 text-white font-bold transition flex items-center gap-2"
              >
                <ShieldAlert className="size-4" />
                <span>Admin Portal</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
