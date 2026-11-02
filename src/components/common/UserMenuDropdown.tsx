"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();

  const isProfileActive = pathname === "/profile" || pathname.startsWith("/profile/");
  const isOrdersActive = pathname === "/orders" || pathname.startsWith("/orders/");
  const isMapActive = pathname === "/map" || pathname.startsWith("/map/");
  const isNotificationsActive = pathname === "/notifications" || pathname.startsWith("/notifications/");
  const isAdminActive = pathname.startsWith("/admin");
  const isPartnerCenterActive = pathname === "/partner/dashboard";
  const isPartnerListingsActive = pathname.startsWith("/partner/listings");
  const isPartnerOrdersActive = pathname.startsWith("/partner/orders");
  const isPartnerPendingActive = pathname.startsWith("/partner/apply/pending");
  const isPartnerApplyActive = pathname.startsWith("/partner/apply") && !pathname.startsWith("/partner/apply/pending");

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
              aria-current={isProfileActive ? "page" : undefined}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition ${
                isProfileActive
                  ? "bg-emerald-50 text-[#00615f] font-black"
                  : "hover:bg-stone-100 hover:text-stone-900 text-stone-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="size-4 text-[#00615f] shrink-0" />
                <span>Hồ sơ cá nhân</span>
              </div>
              {isProfileActive && <span className="size-1.5 rounded-full bg-[#00615f]" />}
            </Link>

            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              aria-current={isOrdersActive ? "page" : undefined}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition ${
                isOrdersActive
                  ? "bg-emerald-50 text-[#00615f] font-black"
                  : "hover:bg-stone-100 hover:text-stone-900 text-stone-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="size-4 text-[#00615f] shrink-0" />
                <span>Đơn hàng của tôi</span>
              </div>
              {isOrdersActive && <span className="size-1.5 rounded-full bg-[#00615f]" />}
            </Link>

            <Link
              href="/map"
              onClick={() => setIsOpen(false)}
              aria-current={isMapActive ? "page" : undefined}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition ${
                isMapActive
                  ? "bg-emerald-50 text-[#00615f] font-black"
                  : "hover:bg-stone-100 hover:text-stone-900 text-stone-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="size-4 text-[#00615f] shrink-0" />
                <span>Bản đồ radar cứu trợ</span>
              </div>
              {isMapActive && <span className="size-1.5 rounded-full bg-[#00615f]" />}
            </Link>

            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              aria-current={isNotificationsActive ? "page" : undefined}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition ${
                isNotificationsActive
                  ? "bg-emerald-50 text-[#00615f] font-black"
                  : "hover:bg-stone-100 hover:text-stone-900 text-stone-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="size-4 text-[#00615f] shrink-0" />
                <span>Trung tâm thông báo</span>
              </div>
              {isNotificationsActive && <span className="size-1.5 rounded-full bg-[#00615f]" />}
            </Link>
          </div>

          <div className="my-1 border-t border-stone-100" />

          {/* Links Section 2: Role & Capability specific links */}
          <div className="py-1 space-y-0.5 text-xs font-bold">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                aria-current={isAdminActive ? "page" : undefined}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition ${
                  isAdminActive
                    ? "bg-purple-100 text-purple-900 ring-1 ring-purple-300 font-black"
                    : "bg-purple-50 hover:bg-purple-100 text-purple-900"
                }`}
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
                  aria-current={isPartnerCenterActive ? "page" : undefined}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition ${
                    isPartnerCenterActive
                      ? "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-300 font-black"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900"
                  }`}
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
                  aria-current={isPartnerListingsActive ? "page" : undefined}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl transition text-[11px] ${
                    isPartnerListingsActive
                      ? "bg-emerald-50 text-emerald-900 font-black"
                      : "hover:bg-stone-100 text-stone-700"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-emerald-600 ml-1 mr-0.5" />
                  <span>Quản lý món ăn của quán</span>
                </Link>

                <Link
                  href="/partner/orders"
                  onClick={() => setIsOpen(false)}
                  aria-current={isPartnerOrdersActive ? "page" : undefined}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl transition text-[11px] ${
                    isPartnerOrdersActive
                      ? "bg-emerald-50 text-emerald-900 font-black"
                      : "hover:bg-stone-100 text-stone-700"
                  }`}
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
                aria-current={isPartnerPendingActive ? "page" : undefined}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition ${
                  isPartnerPendingActive
                    ? "bg-amber-100 text-amber-900 ring-1 ring-amber-300 font-black"
                    : "bg-amber-50 hover:bg-amber-100 text-amber-900"
                }`}
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
                aria-current={isPartnerApplyActive ? "page" : undefined}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition ${
                  isPartnerApplyActive
                    ? "bg-rose-100 text-rose-900 ring-1 ring-rose-300 font-black"
                    : "bg-rose-50 hover:bg-rose-100 text-rose-900"
                }`}
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
                aria-current={isPartnerApplyActive ? "page" : undefined}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition ${
                  isPartnerApplyActive
                    ? "bg-[#00615f]/15 text-[#00615f] ring-1 ring-[#00615f]/30 font-black"
                    : "bg-[#00615f]/5 hover:bg-[#00615f]/10 text-[#00615f]"
                }`}
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
