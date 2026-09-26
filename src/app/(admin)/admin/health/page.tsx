"use client";

import React, { useState } from "react";
import { AdminPageHeader, AdminStatCard } from "@/components/admin";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/admin/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/admin/ui/table";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import {
  Database,
  Server,
  Cpu,
  RefreshCw,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSystemHealthPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const backgroundJobs = [
    {
      id: "job-101",
      name: "Expiry Sweep Cron (Quét quá hạn 5m)",
      status: "COMPLETED",
      duration: "45ms",
      processed: "12 listings checked, 1 expired",
      executedAt: "2 phút trước",
    },
    {
      id: "job-102",
      name: "Jev Urgency & Waste-Risk Classifier",
      status: "COMPLETED",
      duration: "112ms",
      processed: "Listing #list-1 scored: 0.85 (HIGH)",
      executedAt: "5 phút trước",
    },
    {
      id: "job-103",
      name: "Geohash Radius Index Precomputation",
      status: "COMPLETED",
      duration: "28ms",
      processed: "Cached 4 nearby clusters",
      executedAt: "10 phút trước",
    },
    {
      id: "job-104",
      name: "SSE Heartbeat Ping Stream",
      status: "ACTIVE",
      duration: "Streaming",
      processed: "3 connected subscribers",
      executedAt: "Đang duy trì",
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Đã làm mới trạng thái dịch vụ hệ thống.");
    }, 500);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Giám sát hệ thống & Dịch vụ nền"
        description="Theo dõi trực tiếp sức khỏe kết nối MySQL, Redis cache, BullMQ worker và độ trễ phản hồi."
      >
        <Button
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          onClick={handleRefresh}
          className="gap-1.5 text-xs h-9"
        >
          <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Làm mới trạng thái</span>
        </Button>
      </AdminPageHeader>

      {/* 4 Health Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="MySQL 8.0 Database"
          value="Healthy"
          icon={<Database className="size-5" />}
          description="Port 3306 • Ping 2ms"
        />

        <AdminStatCard
          title="Redis 7 Cache & Queue"
          value="Connected"
          icon={<Server className="size-5" />}
          description="Sorted Set Expiry: O(log n)"
        />

        <AdminStatCard
          title="BullMQ Background Worker"
          value="Running"
          icon={<Activity className="size-5" />}
          description="Tách biệt critical path"
        />

        <AdminStatCard
          title="Tài nguyên hệ thống"
          value="Normal"
          icon={<Cpu className="size-5" />}
          description="CPU 8% • RAM 310MB"
        />
      </div>

      {/* Service Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Thông số kiến trúc tối ưu Latency</CardTitle>
            <CardDescription className="text-xs">
              Các giải pháp giảm tải Backend và phản hồi tức thì cho người dùng.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Next.js Edge Caching (ISR):</span>
              <Badge variant="outline">Revalidate 30s</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Countdown Timer:</span>
              <span className="font-semibold text-foreground">Client-side JS (0ms API)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Nearby Search Index:</span>
              <span className="font-mono text-foreground font-semibold">Geohash (ngeohash)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Realtime Stream:</span>
              <span className="font-semibold text-foreground">Server-Sent Events (SSE)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cấu hình Tầng Quyết định "Jev"</CardTitle>
            <CardDescription className="text-xs">
              Cơ chế chấm điểm độ cấp bách và rủi ro lãng phí chạy nền qua hàng đợi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Chế độ thực thi:</span>
              <Badge variant="secondary">Asynchronous (BullMQ)</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Hàng đợi xử lý:</span>
              <span className="font-mono text-foreground font-semibold">jev-scoring</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Mức độ rủi ro lãng phí:</span>
              <span className="font-semibold text-foreground">LOW • MEDIUM • HIGH • CRITICAL</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Tác động đến Latency:</span>
              <span className="font-semibold text-foreground">0ms vào User Request Path</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Background Jobs Execution Log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nhật ký tác vụ nền gần nhất</CardTitle>
          <CardDescription className="text-xs">
            Lịch sử thực thi các tác vụ dọn dẹp hết hạn tự động và phân loại rủi ro.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px]">Tên tác vụ worker</TableHead>
                <TableHead className="w-[120px]">Trạng thái</TableHead>
                <TableHead className="w-[100px]">Thời gian chạy</TableHead>
                <TableHead>Kết quả xử lý</TableHead>
                <TableHead className="w-[140px] text-right">Khởi chạy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backgroundJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-semibold text-xs text-foreground">
                    {job.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={job.status === "ACTIVE" ? "default" : "outline"}
                      className="text-[11px]"
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {job.duration}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {job.processed}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {job.executedAt}
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
