"use client";

import React from "react";
import { AdminPageHeader, AdminStatCard } from "@/components/admin";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/admin/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/admin/ui/table";
import { Button } from "@/components/admin/ui/button";
import { UtensilsCrossed, Leaf, DollarSign, Download } from "lucide-react";
import { toast } from "sonner";

export default function AdminReportsPage() {
  const monthlyData = [
    { month: "T5/2026", kg: 320, co2: 800, saved: "24.500.000₫" },
    { month: "T6/2026", kg: 480, co2: 1200, saved: "38.200.000₫" },
    { month: "T7/2026", kg: 650, co2: 1625, saved: "52.000.000₫" },
    { month: "T8/2026", kg: 890, co2: 2225, saved: "71.400.000₫" },
    { month: "T9/2026", kg: 1250, co2: 3125, saved: "98.800.000₫" },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Báo cáo phát triển & Tác động ESG"
        description="Thống kê lượng thực phẩm đã giải cứu, giảm thiểu phát thải CO2 và giá trị kinh tế thu hồi."
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs h-9"
          onClick={() => toast.info("Đang kết xuất báo cáo ESG định dạng CSV/PDF...")}
        >
          <Download className="size-3.5" />
          <span>Xuất báo cáo</span>
        </Button>
      </AdminPageHeader>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title="Tổng thực phẩm giải cứu"
          value="3.590 kg"
          icon={<UtensilsCrossed className="size-5" />}
          description="Tăng 40.4% so với tháng trước"
        />

        <AdminStatCard
          title="CO2 giảm phát thải tương đương"
          value="8.975 kg CO2"
          icon={<Leaf className="size-5" />}
          description="Tương đương ~900 cây xanh hấp thụ"
        />

        <AdminStatCard
          title="Giá trị tiết kiệm cho người dùng"
          value="284.900.000₫"
          icon={<DollarSign className="size-5" />}
          description="Giảm chi tiêu lãng phí thực phẩm"
        />
      </div>

      {/* Monthly Breakdown Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tiến độ giải cứu qua các tháng năm 2026</CardTitle>
          <CardDescription className="text-xs">
            Dữ liệu tổng hợp từ các giao dịch hoàn tất tại các đơn vị đối tác.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Kỳ báo cáo</TableHead>
                <TableHead>Khối lượng cứu (kg)</TableHead>
                <TableHead>CO2 giảm thiểu (kg CO2e)</TableHead>
                <TableHead className="text-right">Giá trị kinh tế thu hồi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-semibold">{row.month}</TableCell>
                  <TableCell className="font-mono text-xs">{row.kg} kg</TableCell>
                  <TableCell className="font-mono text-xs">{row.co2} kg</TableCell>
                  <TableCell className="text-right font-semibold text-xs">
                    {row.saved}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
