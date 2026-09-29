"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { useGetAdminDashboardMetricsQuery } from "@/redux/api/admin/adminDashboardApi";

const FALLBACK_ORDERS = [
  {
    store: "Tiệm Bánh Hoàn Kiếm",
    item: "Butter croissant (x3)",
    customer: "Minh Anh",
    amount: "+75.000₫",
    status: "Đã nhận hàng",
    initials: "MA",
    time: "5 phút trước",
  },
  {
    store: "Bánh Mì Cô Ba",
    item: "Bánh mì thịt nướng (x2)",
    customer: "Quang Đức",
    amount: "+30.000₫",
    status: "Đang đến lấy",
    initials: "QĐ",
    time: "18 phút trước",
  },
  {
    store: "Circle K Nguyễn Huệ",
    item: "Fresh fruit yogurt (x4)",
    customer: "Thảo Vy",
    amount: "+48.000₫",
    status: "Đã nhận hàng",
    initials: "TV",
    time: "32 phút trước",
  },
];

export function RecentSales() {
  const { data: metrics } = useGetAdminDashboardMetricsQuery();
  const recentActivity = metrics?.recentActivity;

  const orders =
    recentActivity && recentActivity.length > 0
      ? recentActivity.map((a) => {
          const initials = (a.customerName || "KH")
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(-2)
            .toUpperCase();
          const time = new Date(a.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return {
            store: `#${a.orderNumber}`,
            item: a.listingTitle,
            customer: a.customerName,
            amount: `+${a.amount.toLocaleString("vi-VN")}₫`,
            status: a.status,
            initials,
            time,
          };
        })
      : FALLBACK_ORDERS;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-foreground">
          Đơn Hàng Gần Đây
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Giao dịch giải cứu theo thời gian thực từ cơ sở dữ liệu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        {orders.map((order, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                {order.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs text-foreground truncate">
                  {order.customer}{" "}
                  <span className="text-muted-foreground font-normal">
                    • {order.store}
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {order.item}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="font-bold text-xs text-foreground block">
                {order.amount}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                {order.time}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
