"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, Globe, ChevronDown } from "lucide-react";

export function TgtgHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en-us");

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

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-5 text-[13px] font-bold text-[#00615f]">
            <Link
              href="#about"
              className="hover:text-[#089184] transition-colors flex items-center gap-1"
            >
              <span>About</span>
            </Link>
            <Link
              href="#business"
              className="hover:text-[#089184] transition-colors flex items-center gap-1"
            >
              <span>Business</span>
            </Link>
          </nav>
        </div>

        {/* Center: Brand Logo */}
        <div className="flex justify-center shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 group cursor-pointer"
            aria-label="Too Good To Go Homepage"
          >
            <img
              src="/images/tgtg/asset_7.png"
              alt="Too Good To Go"
              className="size-8 sm:size-9 object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <span className="font-black text-lg sm:text-xl tracking-tight text-[#00615f] uppercase leading-none select-none">
              TOO GOOD TO GO
            </span>
          </Link>
        </div>

        {/* Right: Actions & CTAs */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 flex-1">
          {/* Business links */}
          <div className="hidden xl:flex items-center gap-2 text-[13px] font-bold text-[#00615f]">
            <Link
              href="/register"
              className="hover:text-[#089184] transition-colors"
            >
              Sign up as Business
            </Link>
            <span className="text-stone-400" aria-hidden="true">
              |
            </span>
            <Link
              href="/login"
              className="hover:text-[#089184] transition-colors"
            >
              MyStore login
            </Link>
          </div>

          {/* Download app primary CTA button */}
          <Link
            href="#download"
            className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#00615f] hover:bg-[#089184] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm active:scale-98"
          >
            Download app
          </Link>

          {/* Language selector */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-stone-300 text-xs font-bold text-[#00615f] hover:bg-stone-100 transition"
              aria-label="Language selector"
            >
              <Globe className="size-3.5 text-[#00615f]" />
              <span className="uppercase">{selectedLang}</span>
              <ChevronDown className="size-3 text-stone-500" />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-stone-200 rounded-xl shadow-lg py-1 z-50 text-xs">
                {["en-us", "vi-vn", "fr-fr", "de-de"].map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setSelectedLang(l);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 uppercase hover:bg-stone-100 transition ${
                      selectedLang === l ? "text-[#00615f] font-bold bg-[#f9f3f0]" : "text-stone-700"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

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
              href="#about"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#089184]"
            >
              About
            </Link>
            <Link
              href="#why-us"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#089184]"
            >
              Why use Too Good To Go
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#089184]"
            >
              How to use the app
            </Link>
            <Link
              href="#business"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#089184]"
            >
              Business solutions
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#089184]"
            >
              Sign up as Business
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#089184]"
            >
              MyStore login
            </Link>
          </nav>

          <div className="pt-4 border-t border-stone-300 flex flex-col gap-3">
            <Link
              href="#download"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-3 rounded-full bg-[#00615f] text-white font-bold text-sm shadow-md"
            >
              Download app
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
