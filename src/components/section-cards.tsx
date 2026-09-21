"use client"

import { Badge } from "@/components/admin/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card"
import { TrendingUpIcon, TrendingDownIcon, Utensils, DollarSign, Store, ShieldCheck } from "lucide-react"

export function SectionCards() {
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
            45.280.000₫
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
            <span>Tăng trưởng mạnh tuần này</span>
            <TrendingUpIcon className="size-3.5 text-primary" />
          </div>
          <div>So với 37.700.000₫ tháng trước</div>
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
            12,480
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
            <span>+340 suất trong 24h qua</span>
            <TrendingUpIcon className="size-3.5 text-primary" />
          </div>
          <div>Tương đương 3.2 tấn rác thải giảm thiểu</div>
        </CardFooter>
      </Card>

      {/* 3. Partner Stores */}
      <Card className="@container/card border-border">
        <CardHeader>
          <CardDescription className="flex items-center justify-between text-xs font-medium">
            <span>Cửa hàng đối tác</span>
            <Store className="size-4 text-primary" />
          </CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            86
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-primary/30 text-primary font-semibold text-xs">
              <TrendingUpIcon className="size-3 text-primary" />
              +12 mới
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>Tiệm bánh, quán ăn &amp; siêu thị</span>
          </div>
          <div>Độ bao phủ 8 quận nội thành</div>
        </CardFooter>
      </Card>

      {/* 4. Clearance Rate */}
      <Card className="@container/card border-border">
        <CardHeader>
          <CardDescription className="flex items-center justify-between text-xs font-medium">
            <span>Tỷ lệ cứu thành công</span>
            <ShieldCheck className="size-4 text-primary" />
          </CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            94.8%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-primary/30 text-primary font-semibold text-xs">
              <TrendingUpIcon className="size-3 text-primary" />
              +3.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>0 đơn quá hạn xuất kho</span>
          </div>
          <div>Cam kết kiểm duyệt an toàn 100%</div>
        </CardFooter>
      </Card>
    </div>
  )
}
