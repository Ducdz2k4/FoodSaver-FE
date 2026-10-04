"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Calendar, Users, MessageCircle } from "lucide-react";

export function MealPlannerTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/meal-planner",
      label: "Thực đơn & Công thức",
      icon: ChefHat,
      badge: "16 món",
      isActive: pathname === "/meal-planner",
    },
    {
      href: "/meal-planner/calendar",
      label: "Lịch ăn tháng",
      icon: Calendar,
      badge: "Chi tiêu",
      isActive: pathname.startsWith("/meal-planner/calendar"),
    },
    {
      href: "/meal-planner/community",
      label: "Cộng đồng chia sẻ",
      icon: Users,
      badge: "Mọi người",
      isActive: pathname.startsWith("/meal-planner/community"),
    },
    {
      href: "/meal-planner/chat",
      label: "Trợ lý AI tài chính",
      icon: MessageCircle,
      badge: "Tư vấn 24/7",
      isActive: pathname.startsWith("/meal-planner/chat"),
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-stone-200/80 shadow-xs overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors duration-150 ${
                active
                  ? "bg-[#00615f] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              <Icon className={`size-4 ${active ? "text-white" : "text-stone-400"}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {tab.badge}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
