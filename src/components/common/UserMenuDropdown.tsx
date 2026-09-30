"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  ShoppingBag,
  MapPin,
  Bell,
  Store,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Clock,
  AlertCircle,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

export function UserMenuDropdown() {
  const {
    user,
    logout,
    isAdmin,
    isPartner,
    isPendingPartner,
    isRejectedPartner,
    partnerCapability,
  } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!user) return null;

  const displayName = user.fullName || user.full_name || user.email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    toast.success("Đã đăng xuất khỏi tài khoản.");
    router.push("/login");
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pl-2.5 sm:pl-3.5 pr-2 rounded-full bg-white/90 hover:bg-white border border-stone-200/80 shadow-sm transition-all duration-200 cursor-pointer active:scale-98"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-xs font-bold text-stone-800 hidden sm:inline-block max-w-[120px] truncate">
          {displayName}
        </span>

        <div className="size-7 rounded-full bg-[#00615f] text-white flex items-center justify-center font-black text-xs shadow-inner shrink-0">
          {initial}
        </div>

        <ChevronDown
          className={`size-3.5 text-stone-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-3xl bg-white/98 backdrop-blur-xl border border-stone-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-[#00615f] text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
              {initial}
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 truncate">
                {displayName}
              </h4>
              <p className="text-[11px] text-stone-500 truncate">{user.email}</p>

              {/* Dynamic Badge */}
              <div className="pt-0.5">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-100 text-purple-800">
                    <ShieldAlert className="size-3" />
                    <span>Quản trị viên</span>
                  </span>
                ) : isPartner ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="size-3" />
                    <span>Đối tác F&B Verified</span>
                  </span>
                ) : isPendingPartner ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-800">
                    <Clock className="size-3" />
                    <span>Hồ sơ đang duyệt</span>
                  </span>
                ) : isRejectedPartner ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-800">
                    <AlertCircle className="size-3" />
                    <span>Hồ sơ bị từ chối</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-stone-200/80 text-stone-700">
                    <User className="size-3" />
                    <span>Khách hàng</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Links Section 1: General Navigation */}
          <div className="py-1.5 space-y-0.5 text-xs font-bold text-stone-700">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-stone-100 hover:text-stone-900 transition"
            >
              <User className="size-4 text-[#00615f] shrink-0" />
              <span>Hồ sơ cá nhân</span>
            </Link>

            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-stone-100 hover:text-stone-900 transition"
            >
              <ShoppingBag className="size-4 text-[#00615f] shrink-0" />
              <span>Đơn hàng của tôi</span>
            </Link>

            <Link
              href="/map"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-stone-100 hover:text-stone-900 transition"
            >
              <Compass className="size-4 text-[#00615f] shrink-0" />
              <span>Bản đồ radar cứu trợ</span>
            </Link>

            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-stone-100 hover:text-stone-900 transition"
            >
              <Bell className="size-4 text-[#00615f] shrink-0" />
              <span>Trung tâm thông báo</span>
            </Link>
          </div>

          <div className="my-1 border-t border-stone-100" />

          {/* Links Section 2: Role & Capability specific links */}
          <div className="py-1 space-y-0.5 text-xs font-bold">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 transition"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="size-4 text-purple-700 shrink-0" />
                  <span>Cổng quản trị (Admin Portal)</span>
                </div>
                <span className="text-[10px] font-black uppercase text-purple-700">Vào</span>
              </Link>
            )}

            {isPartner && (
              <>
                <Link
                  href="/partner/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="size-4 text-emerald-700 shrink-0" />
                    <span>Trung tâm đối tác (Partner Center)</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-700">Vào</span>
                </Link>

                <Link
                  href="/partner/listings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl hover:bg-stone-100 text-stone-700 transition text-[11px]"
                >
                  <span className="size-1.5 rounded-full bg-emerald-600 ml-1 mr-0.5" />
                  <span>Quản lý món ăn của quán</span>
                </Link>

                <Link
                  href="/partner/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl hover:bg-stone-100 text-stone-700 transition text-[11px]"
                >
                  <span className="size-1.5 rounded-full bg-emerald-600 ml-1 mr-0.5" />
                  <span>Đơn hàng đến của quán</span>
                </Link>
              </>
            )}

            {isPendingPartner && (
              <Link
                href="/partner/apply/pending"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="size-4 text-amber-700 shrink-0" />
                  <span>Tiến trình xét duyệt hồ sơ</span>
                </div>
                <span className="text-[10px] font-black text-amber-700">24h</span>
              </Link>
            )}

            {isRejectedPartner && (
              <Link
                href="/partner/apply"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-900 transition"
              >
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="size-4 text-rose-700 shrink-0" />
                  <span>Hồ sơ bị từ chối (Nộp lại)</span>
                </div>
                <span className="text-[10px] font-black text-rose-700">Sửa</span>
              </Link>
            )}

            {partnerCapability === "NONE" && !isAdmin && (
              <Link
                href="/partner/apply"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#00615f]/5 hover:bg-[#00615f]/10 text-[#00615f] transition"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="size-4 text-[#00615f] shrink-0" />
                  <span>Đăng ký làm Đối tác F&B</span>
                </div>
                <span className="text-[10px] font-black text-[#00615f]">Mới</span>
              </Link>
            )}
          </div>

          <div className="my-1 border-t border-stone-100" />

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="size-4 text-rose-600 shrink-0" />
              <span>Đăng xuất tài khoản</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
