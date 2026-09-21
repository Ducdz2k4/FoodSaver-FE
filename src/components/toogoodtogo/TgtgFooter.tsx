"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Instagram, Facebook, Linkedin, Youtube, ShieldCheck } from "lucide-react";

export function TgtgFooter() {
  return (
    <footer className="bg-[#111113] text-stone-400 text-xs border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-stone-800">
          {/* Brand info */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="size-8 rounded-full bg-yellow-400 text-stone-950 flex items-center justify-center font-black text-base shadow-sm">
                <Sparkles className="size-4 fill-stone-950" />
              </div>
              <span className="font-black text-xl tracking-tight text-white uppercase">
                Food<span className="text-yellow-400">Saver</span>
              </span>
            </Link>

            <p className="text-stone-400 max-w-sm leading-relaxed text-xs">
              Sứ mệnh của chúng tôi là truyền cảm hứng và trao quyền cho mọi người cùng nhau chống lại lãng phí thực phẩm mỗi ngày.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="size-8 rounded-full bg-stone-900 hover:bg-yellow-400 hover:text-stone-950 flex items-center justify-center text-stone-300 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="size-8 rounded-full bg-stone-900 hover:bg-yellow-400 hover:text-stone-950 flex items-center justify-center text-stone-300 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="size-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="size-8 rounded-full bg-stone-900 hover:bg-yellow-400 hover:text-stone-950 flex items-center justify-center text-stone-300 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="size-8 rounded-full bg-stone-900 hover:bg-yellow-400 hover:text-stone-950 flex items-center justify-center text-stone-300 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="size-4" />
              </a>
            </div>
          </div>

          {/* Column 1: Người dùng */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Khám Phá
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="#how-it-works" className="hover:text-yellow-400 transition-colors">
                  Cách dùng app
                </Link>
              </li>
              <li>
                <Link href="#why-us" className="hover:text-yellow-400 transition-colors">
                  Túi Bất Ngờ
                </Link>
              </li>
              <li>
                <Link href="#download" className="hover:text-yellow-400 transition-colors">
                  Tải ứng dụng
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-yellow-400 transition-colors">
                  Dashboard tài khoản
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Doanh nghiệp */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Doanh Nghiệp
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="#business" className="hover:text-yellow-400 transition-colors">
                  Giải pháp cho cửa hàng
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-yellow-400 transition-colors">
                  Đăng ký đối tác
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-yellow-400 transition-colors">
                  Cổng MyStore
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-yellow-400 transition-colors">
                  Quản trị viên
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Thông tin */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Thông Tin & Pháp Lý
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="hover:text-yellow-400 transition-colors">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-yellow-400 transition-colors">
                  Cơ hội nghề nghiệp
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-yellow-400 transition-colors">
                  Điều khoản dịch vụ
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-yellow-400 transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-yellow-400 transition-colors">
                  Liên hệ hỗ trợ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <p>© 2026 FoodSaver ApS. Bản quyền thuộc về FoodSaver. Phong cách cảm hứng từ Too Good To Go.</p>
          <div className="flex items-center gap-4">
            <span>Tiêu chuẩn B-Corp Certified</span>
            <span>•</span>
            <span>Giảm rác thải thực phẩm toàn cầu</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
