"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  PlusCircle,
  ShoppingBag,
  Store,
  ArrowLeft,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentUser = useAppSelector((state) => state.auth.user);

  const navigation = [
    { name: "Tổng quan", href: "/partner/dashboard", icon: LayoutDashboard },
    { name: "Quản lý món ăn", href: "/partner/listings", icon: UtensilsCrossed },
    { name: "Đăng món mới", href: "/partner/listings/new", icon: PlusCircle },
    { name: "Đơn hàng đến", href: "/partner/orders", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-[#00615f] text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-white text-[#00615f] flex items-center justify-center font-black text-xs">
            FS
          </div>
          <span className="font-black text-sm tracking-tight">PARTNER CENTER</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-lg hover:bg-white/10"
        >
          {sidebarOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#00615f] text-white flex flex-col justify-between p-5 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Store name */}
          <div className="flex items-center gap-3 pb-5 border-b border-white/15">
            <div className="size-10 rounded-2xl bg-[#79e4a7] text-[#00615f] flex items-center justify-center font-black text-base shadow-sm">
              <Store className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#79e4a7] uppercase tracking-wider block">
                Partner Portal
              </span>
              <h2 className="font-black text-sm text-white truncate max-w-[150px]">
                {currentUser?.fullName || "Artisan Bakery"}
              </h2>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#79e4a7] text-[#00615f] shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="pt-4 border-t border-white/15 space-y-3">
          <div className="flex items-center gap-2 text-[11px] text-[#79e4a7] bg-white/5 p-2.5 rounded-xl border border-white/10">
            <ShieldCheck className="size-4 shrink-0" />
            <span>Đối tác ATTP Verified</span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition px-2 py-1"
          >
            <ArrowLeft className="size-3.5" />
            <span>Về trang mua hàng</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
