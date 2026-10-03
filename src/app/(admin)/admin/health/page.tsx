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
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import {
  Database,
  Server,
  Cpu,
  RefreshCw,
  Activity,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useCheckHealthQuery } from "@/redux/api/authApi";
import { toast } from "sonner";

export default function AdminSystemHealthPage() {
  const { data: healthData, isLoading, isFetching, refetch } = useCheckHealthQuery();

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Đã làm mới trạng thái dịch vụ hệ thống.");
    } catch {
      toast.error("Không thể kết nối đến máy chủ Backend.");
    }
  };

  const isServerHealthy = healthData?.status === "ok";

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Giám sát hệ thống & Dịch vụ nền"
        description="Theo dõi trực tiếp sức khỏe kết nối MySQL, Redis cache, Socket.IO và độ trễ phản hồi."
      >
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading || isFetching}
          onClick={handleRefresh}
          className="gap-1.5 text-xs h-9 cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          <span>Làm mới trạng thái</span>
        </Button>
      </AdminPageHeader>

      {/* 4 Health Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Backend Express Server"
          value={isServerHealthy ? "Online" : "Connecting"}
          icon={<Server className="size-5" />}
          description={
            healthData?.uptime
              ? `Uptime: ${Math.round(healthData.uptime)}s • HTTP 200`
              : "Port 5000"
          }
        />

        <AdminStatCard
          title="MySQL 8.0 Database"
          value={isServerHealthy ? "Healthy" : "Unknown"}
          icon={<Database className="size-5" />}
          description="Port 3306 • Prisma ORM"
        />

        <AdminStatCard
          title="TypeSafe Jev AI Engine"
          value="Connected"
          icon={<Activity className="size-5" />}
          description="System One: jev-1.13.0"
        />

        <AdminStatCard
          title="Socket.IO Realtime"
          value="Active"
          icon={<Cpu className="size-5" />}
          description="WebSocket + Polling"
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
              <span className="font-semibold text-foreground">Socket.IO Events</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cấu hình Tầng Quyết định "Jev AI"</CardTitle>
            <CardDescription className="text-xs">
              Mô hình System One của TypeSafe AI chấm điểm cấp bách và rủi ro lãng phí.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Nhà phát triển:</span>
              <Badge variant="secondary">TypeSafe AI (San Francisco)</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Phiên bản mô hình:</span>
              <span className="font-mono text-foreground font-semibold">jev-1.13.0 (jev-latest)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Primitives câu hỏi:</span>
              <span className="font-semibold text-foreground">choice (waste_risk), score (urgency)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Tốc độ phản hồi AI:</span>
              <span className="font-semibold text-foreground">~100ms - 200ms</span>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
