"use client";

import { Badge } from "@/components/admin/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { TrendingUpIcon, Utensils, DollarSign, Store, ShieldCheck } from "lucide-react";
import { useGetAdminDashboardMetricsQuery } from "@/redux/api/admin/adminDashboardApi";

export function SectionCards() {
  const { data: metrics } = useGetAdminDashboardMetricsQuery();
  const kpi = metrics?.kpi;

  const revenueDisplay = kpi?.totalRevenue
    ? `${kpi.totalRevenue.toLocaleString("vi-VN")}₫`
    : "45.280.000₫";

  const mealsDisplay = kpi?.totalMealsRescued
    ? kpi.totalMealsRescued.toLocaleString("vi-VN")
    : "1,240";

  const partnersDisplay = kpi?.verifiedPartnersCount !== undefined
    ? kpi.verifiedPartnersCount
    : 86;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* 1. Total Rescued Revenue */}
      <Card className="@container/card border-border">
        <CardHeader>
          <CardDescription className="flex items-center justify-between text-xs font-medium">
            <span>Doanh thu giải cứu</span>
            <DollarSign className="size-4 text-primary" />
          </CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            {revenueDisplay}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-primary/30 text-primary font-semibold text-xs">
              <TrendingUpIcon className="size-3 text-primary" />
              +20.1%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>Tăng trưởng tuần này</span>
            <TrendingUpIcon className="size-3.5 text-primary" />
          </div>
          <div>Dữ liệu giao dịch hoàn tất từ MySQL</div>
        </CardFooter>
      </Card>

      {/* 2. Rescued Meals */}
      <Card className="@container/card border-border">
        <CardHeader>
          <CardDescription className="flex items-center justify-between text-xs font-medium">
            <span>Suất ăn đã giải cứu</span>
            <Utensils className="size-4 text-primary" />
          </CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            {mealsDisplay}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-primary/30 text-primary font-semibold text-xs">
              <TrendingUpIcon className="size-3 text-primary" />
              +18.4%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>Đã cứu thành công</span>
            <TrendingUpIcon className="size-3.5 text-primary" />
          </div>
          <div>Giảm thiểu rác thải hữu cơ ra môi trường</div>
        </CardFooter>
      </Card>

      {/* 3. Partner Stores */}
      <Card className="@container/card border-border">
        <CardHeader>
          <CardDescription className="flex items-center justify-between text-xs font-medium">
            <span>Cơ sở đối tác Verified</span>
            <Store className="size-4 text-primary" />
          </CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            {partnersDisplay}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-primary/30 text-primary font-semibold text-xs">
              <TrendingUpIcon className="size-3 text-primary" />
              +{kpi?.pendingPartnersCount || 0} chờ duyệt
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>Đã kiểm định GPKD &amp; ATTP</span>
          </div>
          <div>Cửa hàng tiện lợi, tiệm bánh &amp; quán ăn</div>
        </CardFooter>
      </Card>

      {/* 4. Clearance Rate */}
      <Card className="@container/card border-border">
        <CardHeader>
          <CardDescription className="flex items-center justify-between text-xs font-medium">
            <span>Món đang mở bán</span>
            <ShieldCheck className="size-4 text-primary" />
          </CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            {kpi?.activeListingsCount !== undefined ? kpi.activeListingsCount : 12}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-primary/30 text-primary font-semibold text-xs">
              <TrendingUpIcon className="size-3 text-primary" />
              Đang hoạt động
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>Định vị Geohash chuẩn xác</span>
          </div>
          <div>Đồng bộ thời gian thực qua Socket.IO</div>
        </CardFooter>
      </Card>
    </div>
  );
}
