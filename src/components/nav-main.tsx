"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/admin/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/admin/ui/sidebar"
import { ExternalLinkIcon } from "lucide-react"
import { UserTooltip } from "@/components/user-component/common"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between gap-2 px-2 py-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quản trị
            </span>
            <UserTooltip content="Xem trang người dùng" side="right">
              <Button
                asChild
                size="icon"
                className="size-7 group-data-[collapsible=icon]:opacity-0"
                variant="ghost"
              >
                <Link href="/" target="_blank">
                  <ExternalLinkIcon className="size-3.5" />
                  <span className="sr-only">Trang chủ</span>
                </Link>
              </Button>
            </UserTooltip>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              item.url === "/admin"
                ? pathname === "/admin"
                : pathname === item.url || pathname.startsWith(item.url + "/")

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                  <Link href={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
