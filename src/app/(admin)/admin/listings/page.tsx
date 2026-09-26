"use client";

import React, { useState } from "react";
import { AdminPageHeader, AdminEmptyState } from "@/components/admin";
import { Card, CardContent } from "@/components/admin/ui/card";
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
import { Input } from "@/components/admin/ui/input";
import { MOCK_LISTINGS } from "@/mocks/mockData";
import { ListingStatus } from "@/types/contract";
import { toast } from "sonner";

export default function AdminListingsPage() {
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [search, setSearch] = useState("");

  const toggleStatus = (id: string) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus: ListingStatus =
            item.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
          toast.info(
            `Đã chuyển trạng thái món sang: ${
              nextStatus === "AVAILABLE" ? "Khả dụng" : "Đã gỡ bỏ"
            }`
          );
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const filtered = listings.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.partnerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Kiểm duyệt món ăn toàn hệ thống"
        description="Giám sát danh mục sản phẩm từ các đối tác F&B, kiểm tra thời hạn và can thiệp khi có vi phạm."
      />

      <div className="flex items-center gap-3">
        <Input
          placeholder="Tìm theo tên món hoặc đơn vị đối tác..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm h-9 text-xs"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">Món ăn</TableHead>
                  <TableHead className="w-[180px]">Đối tác cung cấp</TableHead>
                  <TableHead className="w-[150px]">Giá gốc / Cứu trợ</TableHead>
                  <TableHead className="w-[120px]">Chỉ số Jev</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[130px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className="size-10 rounded-md overflow-hidden bg-muted shrink-0 border">
                          <img
                            src={item.imageUrls[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="block font-semibold text-foreground truncate max-w-[200px]">
                            {item.title}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {item.category.toLowerCase().replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground block">
                        {item.partnerName}
                      </span>
                      <span>{item.partnerAddress}</span>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        <span className="font-semibold text-foreground block">
                          {item.discountPrice.toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-muted-foreground line-through">
                          {item.originalPrice.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[11px]">
                        {item.urgencyScore || 0.75} • {item.wasteRisk || "MEDIUM"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={item.status === "AVAILABLE" ? "secondary" : "outline"}
                        className="text-[11px]"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant={item.status === "AVAILABLE" ? "destructive" : "outline"}
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => toggleStatus(item.id)}
                      >
                        {item.status === "AVAILABLE" ? "Gỡ bài" : "Mở lại"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <AdminEmptyState
              title="Không tìm thấy món ăn"
              description="Thử tìm kiếm với từ khóa khác."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
