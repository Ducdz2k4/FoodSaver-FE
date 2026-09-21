"use client";

import React from "react";
import Link from "next/link";
import {
  FooterLinkedInIcon,
  FooterInstagramIcon,
  FooterFacebookIcon,
  FooterTikTokIcon,
  FooterYouTubeIcon,
  FooterXIcon,
  FoodSaverWordmark,
} from "./TgtgIcons";

export function TgtgFooter() {
  return (
    <footer className="bg-[#00615f] text-white overflow-hidden select-none">
      {/* Upper Footer Section */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Brand Emblem on the left */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="size-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <span className="font-black text-lg text-[#79e4a7]">FS</span>
            </div>
            <span className="font-black text-xl tracking-tight text-white uppercase">
              FOODSAVER
            </span>
          </div>

          {/* Center: Nav links + Socials */}
          <div className="flex flex-col items-center gap-8 text-center">
            {/* Primary Navigation Links: About, For sellers, Food safety, Contact */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-black uppercase tracking-widest text-[#f9f3f0]">
              <Link href="#impact" className="hover:text-[#79e4a7] transition-colors">
                About
              </Link>
              <Link href="#for-sellers" className="hover:text-[#79e4a7] transition-colors">
                For sellers
              </Link>
              <Link href="#impact" className="hover:text-[#79e4a7] transition-colors">
                Food safety
              </Link>
              <Link href="#how-it-works" className="hover:text-[#79e4a7] transition-colors">
                How it works
              </Link>
              <Link href="#contact" className="hover:text-[#79e4a7] transition-colors">
                Contact
              </Link>
            </div>

            {/* Social Media SVG Icons */}
            <div className="flex items-center justify-center gap-5 sm:gap-7 text-[#79e4a7]">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FoodSaver LinkedIn"
                className="hover:scale-110 hover:text-white transition-all"
              >
                <FooterLinkedInIcon className="size-6 sm:size-7" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FoodSaver Instagram"
                className="hover:scale-110 hover:text-white transition-all"
              >
                <FooterInstagramIcon className="size-6 sm:size-7" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FoodSaver Facebook"
                className="hover:scale-110 hover:text-white transition-all"
              >
                <FooterFacebookIcon className="size-6 sm:size-7" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FoodSaver TikTok"
                className="hover:scale-110 hover:text-white transition-all"
              >
                <FooterTikTokIcon className="size-6 sm:size-7" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FoodSaver YouTube"
                className="hover:scale-110 hover:text-white transition-all"
              >
                <FooterYouTubeIcon className="size-6 sm:size-7" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FoodSaver X (Twitter)"
                className="hover:scale-110 hover:text-white transition-all"
              >
                <FooterXIcon className="size-6 sm:size-7" />
              </a>
            </div>
          </div>

          {/* Right Spacer for visual balance */}
          <div className="hidden lg:flex w-24" aria-hidden="true" />
        </div>
      </div>

      {/* Massive Vector Wordmark: FOODSAVER */}
      <div className="w-full bg-[#013d3c] px-4 sm:px-8 py-8 sm:py-12 border-t border-white/10">
        <div className="max-w-[1440px] mx-auto flex items-center justify-center">
          <FoodSaverWordmark className="w-full max-h-24 sm:max-h-32 text-white/95" />
        </div>

        {/* Legal Links & Exact Student Project Line */}
        <div className="max-w-[1440px] mx-auto pt-8 sm:pt-10 flex flex-col items-center gap-4 text-center text-xs text-[#dee3e3]/80">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] sm:text-xs font-semibold">
            <Link href="#impact" className="hover:underline hover:text-white">
              About
            </Link>
            <Link href="#for-sellers" className="hover:underline hover:text-white">
              For sellers
            </Link>
            <Link href="#impact" className="hover:underline hover:text-white">
              Food safety
            </Link>
            <Link href="#privacy" className="hover:underline hover:text-white">
              Privacy
            </Link>
            <Link href="#terms" className="hover:underline hover:text-white">
              Terms
            </Link>
            <Link href="#contact" className="hover:underline hover:text-white">
              Contact
            </Link>
          </div>

          {/* Exact required legal line */}
          <p className="text-xs text-[#dee3e3]/75 pt-2">
            © 2026 FoodSaver. A student project, International School, Duy Tan University.
          </p>
        </div>
      </div>
    </footer>
  );
}
