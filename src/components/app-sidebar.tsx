"use client";

import * as React from "react";
import Link from "next/link";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  UsersIcon,
  Settings2Icon,
  ShieldCheckIcon,
  GlobeIcon,
  ActivityIcon,
  UtensilsCrossed,
  BarChart3,
} from "lucide-react";

const data = {
  navMain: [
    {
      title: "Bảng điều khiển",
      url: "/admin",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Duyệt đối tác F&B",
      url: "/admin/partners/pending",
      icon: <ShieldCheckIcon />,
    },
    {
      title: "Kiểm duyệt món ăn",
      url: "/admin/listings",
      icon: <UtensilsCrossed />,
    },
    {
      title: "Quản lý người dùng",
      url: "/admin/users",
      icon: <UsersIcon />,
    },
    {
      title: "Báo cáo phát triển (ESG)",
      url: "/admin/reports",
      icon: <BarChart3 />,
    },
  ],
  documents: [
    {
      name: "Trang chủ FoodSaver",
      url: "/",
      icon: <GlobeIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Cài đặt hệ thống",
      url: "/admin/settings",
      icon: <Settings2Icon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const currentUser = {
    name: user?.full_name || "Admin FoodSaver",
    email: user?.email || "admin@foodsaver.vn",
    avatar: user?.avatar_url || "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/admin">
                <div className="size-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-black text-xs">
                  FS
                </div>
                <span className="text-base font-bold tracking-tight">FoodSaver Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}

