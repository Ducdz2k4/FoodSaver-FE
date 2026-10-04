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
      badge: "8 món",
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
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/80 shadow-sm overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                active
                  ? "bg-[#00615f] text-white shadow-md shadow-[#00615f]/20 scale-[1.01]"
                  : "text-stone-600 hover:text-[#00615f] hover:bg-stone-50"
              }`}
            >
              <Icon className={`size-4 ${active ? "text-[#79e4a7]" : "text-stone-400"}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
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
