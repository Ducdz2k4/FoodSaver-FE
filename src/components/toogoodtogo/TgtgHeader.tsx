"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Globe,
  Store,
  Smartphone,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export function TgtgHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("US / EN");
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#18181B]/95 backdrop-blur-md shadow-lg py-3 border-b border-yellow-500/20"
          : "bg-gradient-to-b from-[#18181B]/90 via-[#18181B]/60 to-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="size-9 sm:size-10 rounded-full bg-yellow-400 text-stone-950 flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="size-5 fill-stone-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg sm:text-xl tracking-tighter text-white uppercase flex items-center gap-1">
              Food<span className="text-yellow-400">Saver</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-yellow-300/80 font-bold -mt-1 hidden sm:block">
              Save Good Food
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link
            href="#why-us"
            className="text-xs lg:text-sm font-semibold text-stone-200 hover:text-yellow-400 transition-colors"
          >
            Tại sao chọn FoodSaver
          </Link>
          <Link
            href="#how-it-works"
            className="text-xs lg:text-sm font-semibold text-stone-200 hover:text-yellow-400 transition-colors"
          >
            Cách hoạt động
          </Link>
          <Link
            href="#business"
            className="text-xs lg:text-sm font-semibold text-stone-200 hover:text-yellow-400 transition-colors flex items-center gap-1.5"
          >
            <Store className="size-3.5 text-yellow-400" />
            <span>Dành cho doanh nghiệp</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-xs lg:text-sm font-semibold text-stone-200 hover:text-yellow-400 transition-colors"
          >
            Dashboard
          </Link>
        </nav>

        {/* Right CTAs */}
        <div className="hidden sm:flex items-center gap-3 lg:gap-4">
          {/* Language Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 text-xs font-semibold text-stone-300 hover:text-white px-2.5 py-1.5 rounded-full hover:bg-white/10 transition"
            >
              <Globe className="size-3.5 text-yellow-400" />
              <span>{selectedLang}</span>
              <ChevronDown className="size-3 text-stone-400" />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-[#27272A] border border-stone-700 rounded-xl shadow-xl py-1 z-50 text-xs">
                {["US / EN", "VN / VI", "FR / FR", "DE / DE"].map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setSelectedLang(l);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-yellow-400/10 hover:text-yellow-400 transition ${
                      selectedLang === l ? "text-yellow-400 font-bold" : "text-stone-300"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Business Login Link */}
          <Link
            href="/login"
            className="text-xs font-bold text-stone-300 hover:text-white px-3 py-1.5 rounded-full transition hidden lg:inline-block"
          >
            Đăng nhập
          </Link>

          {/* Download App Primary Yellow Button */}
          <Link
            href="#download"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-extrabold text-xs sm:text-sm shadow-md hover:shadow-yellow-400/20 hover:scale-102 active:scale-98 transition-all duration-200"
          >
            <Smartphone className="size-4" />
            <span>Tải ứng dụng</span>
          </Link>
        </div>

        {/* Mobile menu hamburger button */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="#download"
            className="px-3 py-1.5 rounded-full bg-yellow-400 text-stone-950 font-extrabold text-xs"
          >
            Tải App
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-stone-300 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-6 text-yellow-400" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="sm:hidden bg-[#18181B] border-b border-stone-800 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3 text-sm font-semibold text-stone-200">
            <Link
              href="#why-us"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-yellow-400"
            >
              Tại sao chọn FoodSaver
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-yellow-400"
            >
              Cách hoạt động
            </Link>
            <Link
              href="#business"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-yellow-400 flex items-center gap-2"
            >
              <Store className="size-4 text-yellow-400" />
              <span>Dành cho doanh nghiệp</span>
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-yellow-400"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-yellow-400"
            >
              Đăng nhập tài khoản
            </Link>
          </nav>

          <div className="pt-4 border-t border-stone-800 flex flex-col gap-3">
            <Link
              href="#download"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-3 rounded-full bg-yellow-400 text-stone-950 font-bold text-sm shadow-md"
            >
              Tải ứng dụng ngay
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
