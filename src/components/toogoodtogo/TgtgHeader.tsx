"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, Sparkles, ChevronDown } from "lucide-react";

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
          ? "bg-[#f9f3f0]/95 backdrop-blur-md shadow-sm border-b border-stone-300/40 py-2.5"
          : "bg-[#f9f3f0]/90 backdrop-blur-md py-3.5"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Search input + Navigation links */}
        <div className="flex items-center gap-4 lg:gap-6 flex-1 max-w-md">
          {/* Autocomplete Search */}
          <div className="relative hidden md:block w-44 lg:w-52">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-200/70 hover:bg-stone-200/90 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00615f] transition">
              <Search className="size-4 text-[#00615f] shrink-0" />
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
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Desktop Nav Links: Discover, How it works, For sellers, Impact */}
          <nav className="hidden lg:flex items-center gap-5 text-[13px] font-bold text-[#00615f]">
            <Link
              href="#listings"
              className="hover:text-[#089184] transition-colors"
            >
              Discover
            </Link>
            <Link
              href="#how-it-works"
              className="hover:text-[#089184] transition-colors"
            >
              How it works
            </Link>
            <Link
              href="#for-sellers"
              className="hover:text-[#089184] transition-colors"
            >
              For sellers
            </Link>
            <Link
              href="#impact"
              className="hover:text-[#089184] transition-colors"
            >
              Impact
            </Link>
          </nav>
        </div>

        {/* Center: Brand Logo - FoodSaver */}
        <div className="flex justify-center shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 group cursor-pointer"
            aria-label="FoodSaver Homepage"
          >
            <div className="size-8 sm:size-9 rounded-full bg-[#00615f] text-white flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-sm">
              <span className="font-black text-sm text-[#79e4a7]">FS</span>
            </div>
            <span className="font-black text-lg sm:text-xl tracking-tight text-[#00615f] uppercase leading-none select-none">
              FOODSAVER
            </span>
          </Link>
        </div>

        {/* Right: Actions (Sign in, Get started) */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 flex-1">
          {/* Sign in text link */}
          <Link
            href="/login"
            className="hidden sm:inline-block text-[13px] font-bold text-[#00615f] hover:text-[#089184] transition-colors"
          >
            Sign in
          </Link>

          <span className="hidden sm:inline-block text-stone-300" aria-hidden="true">
            |
          </span>

          {/* Get started primary CTA button */}
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#00615f] hover:bg-[#089184] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm active:scale-98"
          >
            Get started
          </Link>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-[#00615f] hover:bg-stone-200/50 rounded-lg focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#f9f3f0] border-b border-stone-300 px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          {/* Mobile Search */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-stone-200/80">
            <Search className="size-4 text-[#00615f] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Food nearby"
              className="w-full bg-transparent text-sm text-[#252d2d] placeholder:text-stone-500 focus:outline-none"
            />
          </div>

          <nav className="flex flex-col space-y-3 text-sm font-bold text-[#00615f] pt-2">
            <Link
              href="#listings"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#089184]"
            >
              Discover
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#089184]"
            >
              How it works
            </Link>
            <Link
              href="#for-sellers"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#089184]"
            >
              For sellers
            </Link>
            <Link
              href="#impact"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#089184]"
            >
              Impact
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#089184]"
            >
              Sign in
            </Link>
          </nav>

          <div className="pt-4 border-t border-stone-300 flex flex-col gap-3">
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
