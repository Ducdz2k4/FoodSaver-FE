"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";

export function TgtgHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "liquid-glass-subtle py-2.5 shadow-sm"
          : "bg-[#f9f3f0]/75 backdrop-blur-lg border-b border-white/40 py-3 sm:py-3.5"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Logo (anchored to the left) */}
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

        {/* Center: Liquid Glass Nav Menu with integrated search capsule */}
        <div className="hidden lg:flex items-center justify-center flex-1">
          <nav className="liquid-glass flex items-center gap-2 p-1.5 rounded-full">
            {/* Integrated Search Capsule */}
            <div className="relative w-44 xl:w-52">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f9f3f0]/80 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00615f]/20 border border-stone-200/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200">
                <Search className="size-3.5 text-[#00615f] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Food nearby"
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

            {/* Liquid Glass Nav Links */}
            <div className="flex items-center gap-1">
              <Link
                href="#listings"
                className="liquid-glass-item px-3.5 py-1.5 rounded-full text-xs xl:text-[13px] font-bold text-[#00615f] hover:text-[#089184] active:scale-95"
              >
                Discover
              </Link>
              <Link
                href="#how-it-works"
                className="liquid-glass-item px-3.5 py-1.5 rounded-full text-xs xl:text-[13px] font-bold text-[#00615f] hover:text-[#089184] active:scale-95"
              >
                How it works
              </Link>
              <Link
                href="#for-sellers"
                className="liquid-glass-item px-3.5 py-1.5 rounded-full text-xs xl:text-[13px] font-bold text-[#00615f] hover:text-[#089184] active:scale-95"
              >
                For sellers
              </Link>
              <Link
                href="#impact"
                className="liquid-glass-item px-3.5 py-1.5 rounded-full text-xs xl:text-[13px] font-bold text-[#00615f] hover:text-[#089184] active:scale-95"
              >
                Impact
              </Link>
            </div>
          </nav>
        </div>

        {/* Right: Actions (Sign in, Get started - anchored to the right) */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 shrink-0">
          <Link
            href="/login"
            className="hidden sm:inline-block text-xs sm:text-[13px] font-bold text-[#00615f] hover:text-[#089184] px-3.5 py-1.5 rounded-full hover:bg-white/60 transition"
          >
            Sign in
          </Link>

          <span className="hidden sm:inline-block text-stone-300" aria-hidden="true">
            |
          </span>

          <Link
            href="/register"
            className="inline-flex items-center justify-center px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#00615f] hover:bg-[#089184] text-white font-bold text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,97,95,0.25)] hover:shadow-[0_4px_14px_rgba(0,97,95,0.35)] transition-all duration-200 active:scale-98"
          >
            Get started
          </Link>

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

      {/* Mobile Liquid Glass Drawer */}
      {mobileOpen && (
        <div className="lg:hidden liquid-glass mx-4 mt-2 px-6 py-6 space-y-4 rounded-3xl shadow-xl animate-in slide-in-from-top duration-200">
          {/* Mobile Search */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#f9f3f0] border border-stone-200">
            <Search className="size-4 text-[#00615f] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Food nearby"
              className="w-full bg-transparent text-sm text-[#252d2d] placeholder:text-stone-500 focus:outline-none"
            />
          </div>

          <nav className="flex flex-col space-y-2 text-sm font-bold text-[#00615f] pt-1">
            <Link
              href="#listings"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-white transition"
            >
              Discover
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-white transition"
            >
              How it works
            </Link>
            <Link
              href="#for-sellers"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-white transition"
            >
              For sellers
            </Link>
            <Link
              href="#impact"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-white transition"
            >
              Impact
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-white transition"
            >
              Sign in
            </Link>
          </nav>

          <div className="pt-3 border-t border-stone-200/60 flex flex-col gap-3">
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-3 rounded-full bg-[#00615f] text-white font-bold text-sm shadow-md"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
