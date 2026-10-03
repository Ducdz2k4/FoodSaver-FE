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
import { UtensilsCrossed, Leaf, DollarSign, Download, Loader2 } from "lucide-react";
import { useGetAdminESGReportsQuery } from "@/redux/api/admin/adminDashboardApi";
import { toast } from "sonner";

export default function AdminReportsPage() {
  const { data: esgData, isLoading, isFetching } = useGetAdminESGReportsQuery();

  const summary = esgData?.summary;
  const monthlyData = esgData?.monthlyBreakdown || [];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Báo cáo phát triển & Tác động ESG"
        description="Thống kê lượng thực phẩm đã giải cứu, giảm thiểu phát thải CO2 và giá trị kinh tế thu hồi."
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs h-9 cursor-pointer"
          onClick={() => toast.info("Đang kết xuất báo cáo ESG định dạng CSV/PDF...")}
        >
          {isFetching ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
          <span>Xuất báo cáo</span>
        </Button>
      </AdminPageHeader>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title="Tổng thực phẩm giải cứu"
          value={summary ? `${summary.totalKgRescued.toLocaleString("vi-VN")} kg` : "—"}
          icon={<UtensilsCrossed className="size-5" />}
          description="Tính từ các đơn hoàn tất"
        />

        <AdminStatCard
          title="CO2 giảm phát thải tương đương"
          value={summary ? `${summary.totalCo2Avoided.toLocaleString("vi-VN")} kg CO2` : "—"}
          icon={<Leaf className="size-5" />}
          description={summary ? `Tương đương ~${summary.treesEquivalent} cây xanh hấp thụ` : "Đang tải dữ liệu"}
        />

        <AdminStatCard
          title="Giá trị tiết kiệm cho người dùng"
          value={summary ? `${summary.totalSavedMoney.toLocaleString("vi-VN")}₫` : "—"}
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
              {monthlyData.length > 0 ? monthlyData.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-semibold">{row.month}</TableCell>
                  <TableCell className="font-mono text-xs">{row.kg} kg</TableCell>
                  <TableCell className="font-mono text-xs">{row.co2} kg</TableCell>
                  <TableCell className="text-right font-semibold text-xs">
                    {row.saved.toLocaleString("vi-VN")}₫
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                    Chưa có dữ liệu từ đơn hoàn tất.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
