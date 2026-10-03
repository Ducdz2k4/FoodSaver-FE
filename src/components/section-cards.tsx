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
import { Utensils, DollarSign, Store, ShieldCheck } from "lucide-react";
import { useGetAdminDashboardMetricsQuery } from "@/redux/api/admin/adminDashboardApi";

export function SectionCards() {
  const { data: metrics } = useGetAdminDashboardMetricsQuery();
  const kpi = metrics?.kpi;

  const revenueDisplay = kpi ? `${kpi.totalRevenue.toLocaleString("vi-VN")}₫` : "—";
  const mealsDisplay = kpi ? kpi.totalMealsRescued.toLocaleString("vi-VN") : "—";
  const partnersDisplay = kpi?.verifiedPartnersCount ?? "—";

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
              Hoàn tất
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">Tổng tiền từ đơn hoàn tất</div>
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
              Đã hoàn tất
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">Đã cứu thành công</div>
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
