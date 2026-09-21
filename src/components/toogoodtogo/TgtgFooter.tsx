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
  TgtgWordmark,
} from "./TgtgIcons";

export function TgtgFooter() {
  return (
    <footer className="bg-[#00615f] text-white overflow-hidden select-none">
      {/* Upper Footer Section */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Logo on the left */}
          <div className="hidden lg:flex items-center gap-3">
            <img
              src="/images/tgtg/asset_7.png"
              alt="Too Good To Go Logo"
              className="size-14 object-contain brightness-110"
              loading="lazy"
            />
          </div>

          {/* Center: Nav links + Socials + Store Badges */}
          <div className="flex flex-col items-center gap-8 text-center">
            {/* Upper Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-black uppercase tracking-widest text-[#f9f3f0]">
              <Link href="#careers" className="hover:text-[#79e4a7] transition-colors">
                Careers
              </Link>
              <Link href="#press" className="hover:text-[#79e4a7] transition-colors">
                Press
              </Link>
              <Link href="#support" className="hover:text-[#79e4a7] transition-colors">
                Support
              </Link>
              <Link href="/login" className="hover:text-[#79e4a7] transition-colors">
                Mystore
              </Link>
            </div>

            {/* Social Media SVG Icons */}
            <div className="flex items-center justify-center gap-5 sm:gap-7 text-[#79e4a7]">
              <a
                href="https://www.linkedin.com/company/too-good-to-go"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:scale-110 hover:text-white transition-all"
              >
                <FooterLinkedInIcon className="size-6 sm:size-7" />
              </a>
              <a
                href="https://www.instagram.com/toogoodtogo.usa/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:scale-110 hover:text-white transition-all"
              >
                <FooterInstagramIcon className="size-6 sm:size-7" />
              </a>
              <a
                href="https://www.facebook.com/toogoodtogoUSA/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:scale-110 hover:text-white transition-all"
              >
                <FooterFacebookIcon className="size-6 sm:size-7" />
              </a>
              <a
                href="https://www.tiktok.com/@toogoodtogo"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="hover:scale-110 hover:text-white transition-all"
              >
                <FooterTikTokIcon className="size-6 sm:size-7" />
              </a>
              <a
                href="https://www.youtube.com/channel/UCBonm_44z7UL0OvhHksBCAw"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="hover:scale-110 hover:text-white transition-all"
              >
                <FooterYouTubeIcon className="size-6 sm:size-7" />
              </a>
              <a
                href="https://twitter.com/toogoodtogo"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="hover:scale-110 hover:text-white transition-all"
              >
                <FooterXIcon className="size-6 sm:size-7" />
              </a>
            </div>

            {/* App Store Badges */}
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform"
              >
                <img
                  src="/images/tgtg/asset_9.png"
                  alt="Download on the Apple App Store"
                  className="h-10 w-auto object-contain"
                  loading="lazy"
                />
              </a>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform"
              >
                <img
                  src="/images/tgtg/asset_10.png"
                  alt="Get it on Google Play"
                  className="h-10 w-auto object-contain"
                  loading="lazy"
                />
              </a>
            </div>
          </div>

          {/* Right Spacer for alignment */}
          <div className="hidden lg:flex w-14" aria-hidden="true" />
        </div>
      </div>

      {/* Massive Giant SVG Wordmark spanning full width */}
      <div className="w-full bg-[#013d3c] px-4 sm:px-8 py-8 sm:py-12 border-t border-white/10">
        <div className="max-w-[1440px] mx-auto flex items-center justify-center">
          <TgtgWordmark className="w-full max-h-24 sm:max-h-32 text-white/95" />
        </div>

        {/* Legal Links & Copyright */}
        <div className="max-w-[1440px] mx-auto pt-8 sm:pt-10 flex flex-col items-center gap-4 text-center text-xs text-[#dee3e3]/75">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] sm:text-xs">
            <Link href="#legal" className="hover:underline hover:text-white">
              Legal
            </Link>
            <Link href="#privacy" className="hover:underline hover:text-white">
              Privacy Policy
            </Link>
            <Link href="#cookies" className="hover:underline hover:text-white">
              Cookie Policy
            </Link>
            <Link href="#terms" className="hover:underline hover:text-white">
              Terms &amp; Conditions
            </Link>
            <Link href="#contact" className="hover:underline hover:text-white">
              Contact us
            </Link>
            <Link href="#dsa" className="hover:underline hover:text-white">
              DSA Disclosure
            </Link>
            <Link href="#privacy-settings" className="hover:underline hover:text-white">
              Do Not Sell or Share My Data
            </Link>
            <Link href="#sources" className="hover:underline hover:text-white">
              Food Waste Sources
            </Link>
            <Link href="#status" className="hover:underline hover:text-white">
              Status
            </Link>
          </div>

          <p className="text-[11px] text-[#dee3e3]/60 pt-2">
            Copyright © Too Good To Go ApS. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
