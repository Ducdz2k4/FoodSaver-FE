"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/admin/ui/separator";
import { SidebarTrigger } from "@/components/admin/ui/sidebar";

const ROUTE_TITLES: Record<string, string> = {
  "/admin": "Bảng Điều Khiển FoodSaver",
  "/admin/users": "Quản Lý Người Dùng & Đối Tác",
  "/admin/settings": "Cài Đặt Hệ Thống",
};

export function SiteHeader({ title }: { title?: string }) {
  const pathname = usePathname();

  let displayTitle = title;
  if (!displayTitle) {
    if (ROUTE_TITLES[pathname]) {
      displayTitle = ROUTE_TITLES[pathname];
    } else if (pathname.startsWith("/admin/users/")) {
      const id = pathname.replace("/admin/users/", "");
      displayTitle = `Hồ Sơ Người Dùng #${id}`;
    } else {
      displayTitle = "Cổng Quản Trị FoodSaver";
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) bg-background/95 backdrop-blur-xs sticky top-0 z-20">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-sm font-semibold tracking-tight text-foreground">{displayTitle}</h1>
      </div>
    </header>
  );
}
