"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { useGetAdminESGReportsQuery } from "@/redux/api/admin/adminDashboardApi"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"

const chartConfig = {
  rescued: {
    label: "Suất ăn giải cứu",
    color: "var(--primary)",
  },
  co2: {
    label: "CO₂ tránh phát thải",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const { data: report, isLoading } = useGetAdminESGReportsQuery()

  const chartData = React.useMemo(
    () =>
      (report?.monthlyBreakdown || []).map((item) => ({
        date: item.month,
        rescued: item.kg,
        co2: item.co2,
      })),
    [report]
  )

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(`${item.date}-01`)
    const referenceDate = chartData.length
      ? new Date(`${chartData[chartData.length - 1].date}-01`)
      : new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
      <CardTitle>Hiệu quả giải cứu thực phẩm</CardTitle>
      <CardDescription>
        <span className="hidden @[540px]/card:block">
            Dữ liệu theo tháng từ các đơn hoàn tất
        </span>
          <span className="@[540px]/card:hidden">Dữ liệu theo tháng</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
               <SelectValue placeholder="3 tháng gần nhất" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                 3 tháng gần nhất
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                 30 ngày gần nhất
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                 7 ngày gần nhất
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Đang tải dữ liệu báo cáo...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Chưa có dữ liệu đơn hoàn tất.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillRescued" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-rescued)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-rescued)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillCo2" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-co2)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-co2)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("vi-VN", {
                  month: "short",
                  year: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(`${value}-01`).toLocaleDateString("vi-VN", {
                      month: "short",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="co2"
              type="natural"
              fill="url(#fillCo2)"
              stroke="var(--color-co2)"
              stackId="a"
            />
            <Area
              dataKey="rescued"
              type="natural"
              fill="url(#fillRescued)"
              stroke="var(--color-rescued)"
              stackId="a"
            />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
