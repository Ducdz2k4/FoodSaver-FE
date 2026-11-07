"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AdminPageHeader, AdminEmptyState, AdminStatCard } from "@/components/admin";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/admin/ui/dialog";
import { ListingDTO, ListingStatus, FoodCategory } from "@/types/contract";
import { useGetAdminListingsQuery, useToggleListingStatusMutation } from "@/redux/api/listingApi";
import { toast } from "sonner";
import {
  UtensilsCrossed,
  Search,
  Loader2,
  Clock,
  Sparkles,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  ShieldAlert,
} from "lucide-react";

const CATEGORY_LABELS: Record<FoodCategory, string> = {
  COOKED_MEAL: "Cơm & Món nóng",
  BAKERY: "Bánh mì & Bánh ngọt",
  FRUITS: "Rau củ & Trái cây",
  GROCERIES: "Thực phẩm tạp hóa",
  DRINKS: "Đồ uống & Trà",
  OTHER: "Món khác",
};

const STATUS_LABELS: Record<ListingStatus, string> = {
  AVAILABLE: "Đang mở bán",
  EXPIRING_SOON: "Sắp hết hạn",
  SOLD_OUT: "Đã bán hết",
  EXPIRED: "Đã hết hạn",
  UNAVAILABLE: "Đã gỡ bài",
};

export default function AdminListingsPage() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ListingStatus | "ALL">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | "ALL">("ALL");

  // Dialog States
  const [detailItem, setDetailItem] = useState<ListingDTO | null>(null);
  const [takedownTarget, setTakedownTarget] = useState<ListingDTO | null>(null);
  const [takedownReason, setTakedownReason] = useState("VIOLATION_SAFETY");

  const { data: realListings, isLoading, isFetching, refetch } = useGetAdminListingsQuery({
    search: search.trim() || undefined,
    status: selectedStatus !== "ALL" ? selectedStatus : undefined,
  });

  const [toggleStatusMutation, { isLoading: isToggling }] = useToggleListingStatusMutation();

  const listings = realListings || [];

  // Filter by category in memory
  const filteredListings = listings.filter((item) => {
    if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;
    return true;
  });

  // Calculate quick stats
  const totalCount = listings.length;
  const availableCount = listings.filter((i) => i.status === "AVAILABLE").length;
  const expiringCount = listings.filter((i) => i.status === "EXPIRING_SOON").length;
  const unavailableCount = listings.filter((i) => i.status === "UNAVAILABLE").length;

  const handleConfirmTakedown = async () => {
    if (!takedownTarget) return;

    try {
      await toggleStatusMutation({ id: takedownTarget.id, status: "UNAVAILABLE" }).unwrap();
      toast.success(`Đã gỡ bài món "${takedownTarget.title}" khỏi sàn giao dịch.`);
      setTakedownTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể gỡ bài món ăn");
    }
  };

  const handleRestoreListing = async (item: ListingDTO) => {
    try {
      await toggleStatusMutation({ id: item.id, status: "AVAILABLE" }).unwrap();
      toast.success(`Đã mở lại quyền hiển thị cho món "${item.title}".`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể khôi phục trạng thái món");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Kiểm duyệt món ăn toàn sàn"
        description="Giám sát danh mục sản phẩm từ các đối tác F&B, kiểm tra thời hạn sử dụng và can thiệp gỡ bỏ kịp thời khi phát hiện sai phạm."
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Tổng số món trên hệ thống"
          value={totalCount}
          icon={<UtensilsCrossed className="size-5" />}
          iconClassName="bg-primary/10 text-primary"
          description="Bao gồm tất cả trạng thái"
        />
        <AdminStatCard
          title="Đang mở bán khả dụng"
          value={availableCount}
          icon={<CheckCircle2 className="size-5" />}
          iconClassName="bg-emerald-500/10 text-emerald-600"
          description="Đang hiển thị trên chợ cứu trợ"
        />
        <AdminStatCard
          title="Sắp hết hạn trong ngày"
          value={expiringCount}
          icon={<Clock className="size-5" />}
          iconClassName="bg-amber-500/10 text-amber-600"
          description="Cần ưu tiên đẩy mạnh cứu trợ"
        />
        <AdminStatCard
          title="Đã can thiệp gỡ bài"
          value={unavailableCount}
          icon={<ShieldAlert className="size-5" />}
          iconClassName="bg-destructive/10 text-destructive"
          description="Món vi phạm hoặc đối tác ẩn"
        />
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-3xl">
          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onValueChange={(val) => setSelectedStatus(val as ListingStatus | "ALL")}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="AVAILABLE">Đang mở bán</SelectItem>
              <SelectItem value="EXPIRING_SOON">Sắp hết hạn</SelectItem>
              <SelectItem value="SOLD_OUT">Đã bán hết</SelectItem>
              <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
              <SelectItem value="UNAVAILABLE">Đã gỡ bài</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select
            value={selectedCategory}
            onValueChange={(val) => setSelectedCategory(val as FoodCategory | "ALL")}
          >
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Lọc theo danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả danh mục</SelectItem>
              <SelectItem value="COOKED_MEAL">Cơm & Món nóng</SelectItem>
              <SelectItem value="BAKERY">Bánh mì & Bánh ngọt</SelectItem>
              <SelectItem value="FRUITS">Rau củ & Trái cây</SelectItem>
              <SelectItem value="GROCERIES">Thực phẩm tạp hóa</SelectItem>
              <SelectItem value="DRINKS">Đồ uống & Trà</SelectItem>
              <SelectItem value="OTHER">Món khác</SelectItem>
            </SelectContent>
          </Select>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên món hoặc đối tác..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="shrink-0"
        >
          {isFetching ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
          Làm mới
        </Button>
      </div>

      {/* Listings Table Card */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-sm">Đang tải danh sách món ăn...</span>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="p-8">
              <AdminEmptyState
                title="Không tìm thấy món ăn nào"
                description="Không có món ăn nào phù hợp với điều kiện tìm kiếm và bộ lọc hiện tại."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Món ăn</TableHead>
                    <TableHead>Đối tác F&B</TableHead>
                    <TableHead>Giá gốc / Cứu trợ</TableHead>
                    <TableHead>Khung giờ & Hạn dùng</TableHead>
                    <TableHead>Chỉ số AI</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredListings.map((item) => {
                    const discountPercent =
                      item.originalPrice > 0
                        ? Math.round(
                            ((item.originalPrice - item.discountPrice) / item.originalPrice) * 100
                          )
                        : 0;

                    return (
                      <TableRow key={item.id}>
                        {/* Title & Image */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="size-11 rounded-lg overflow-hidden bg-muted shrink-0 border relative">
                              {item.imageUrls?.[0] ? (
                                <Image
                                  src={item.imageUrls[0]}
                                  alt={item.title}
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                />
                              ) : (
                                <UtensilsCrossed className="size-5 text-muted-foreground m-auto" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="block font-semibold text-foreground text-sm truncate max-w-[200px]">
                                {item.title}
                              </span>
                              <span className="text-xs text-muted-foreground block">
                                {CATEGORY_LABELS[item.category] || item.category} • Còn {item.quantity}{" "}
                                {item.unit || "phần"}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Partner Info */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 font-medium text-foreground text-sm">
                            <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[170px]">{item.partnerName || "Quán đối tác"}</span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px] pl-5">
                            {item.partnerAddress || "Chưa có địa chỉ"}
                          </div>
                        </TableCell>

                        {/* Price */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div>
                              <span className="font-bold text-sm text-foreground block">
                                {item.discountPrice.toLocaleString("vi-VN")}đ
                              </span>
                              <span className="text-xs text-muted-foreground line-through block">
                                {item.originalPrice.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                            {discountPercent > 0 && (
                              <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 border-emerald-200">
                                -{discountPercent}%
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Expiry & Pickup Time */}
                        <TableCell>
                          <div className="text-xs space-y-0.5">
                            <div className="text-muted-foreground flex items-center gap-1">
                              <Clock className="size-3 text-muted-foreground" />
                              <span>{item.pickupStartTime} - {item.pickupEndTime}</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="size-3 text-muted-foreground" />
                              <span>HSD: {new Date(item.expiryAt).toLocaleDateString("vi-VN")}</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* AI Score */}
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="font-mono text-[11px] w-fit">
                              <Sparkles className="size-3 text-amber-500 mr-1" />
                              Score: {item.urgencyScore ?? "—"}
                            </Badge>
                            {item.wasteRisk && (
                              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                                {item.wasteRisk}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "AVAILABLE"
                                ? "default"
                                : item.status === "EXPIRING_SOON"
                                ? "secondary"
                                : item.status === "UNAVAILABLE"
                                ? "destructive"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {STATUS_LABELS[item.status] || item.status}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => setDetailItem(item)}
                            >
                              <Eye className="size-3.5 mr-1" />
                              Chi tiết
                            </Button>

                            {item.status === "AVAILABLE" || item.status === "EXPIRING_SOON" ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => setTakedownTarget(item)}
                              >
                                Gỡ bài
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => handleRestoreListing(item)}
                                disabled={isToggling}
                              >
                                Mở lại
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog 1: Xem chi tiết toàn diện thông tin món ăn */}
      <Dialog open={!!detailItem} onOpenChange={(open) => !open && setDetailItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="size-5 text-primary" />
                  <DialogTitle>{detailItem.title}</DialogTitle>
                </div>
                <DialogDescription>
                  Thông tin kiểm duyệt danh mục thực phẩm cứu trợ của đối tác F&B.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-xs">
                {/* Images */}
                {detailItem.imageUrls && detailItem.imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {detailItem.imageUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                        <Image
                          src={url}
                          alt={`${detailItem.title} ${idx + 1}`}
                          fill
                          sizes="200px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-muted/40 rounded-lg border">
                  <div>
                    <span className="text-muted-foreground block">Đối tác cung cấp:</span>
                    <strong className="text-foreground text-sm">{detailItem.partnerName}</strong>
                    <span className="text-muted-foreground block text-[11px] mt-0.5">{detailItem.partnerAddress}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Danh mục món:</span>
                    <Badge variant="outline" className="mt-1">
                      {CATEGORY_LABELS[detailItem.category] || detailItem.category}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Giá gốc & Giá bán:</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <strong className="text-sm font-bold text-primary">
                        {detailItem.discountPrice.toLocaleString("vi-VN")}đ
                      </strong>
                      <span className="line-through text-muted-foreground">
                        {detailItem.originalPrice.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Số lượng & Đơn vị:</span>
                    <strong className="text-foreground">
                      {detailItem.quantity} {detailItem.unit || "phần"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Khung giờ nhận món:</span>
                    <strong className="text-foreground">
                      {detailItem.pickupStartTime} — {detailItem.pickupEndTime}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Hạn sử dụng (Expiry):</span>
                    <strong className="text-foreground">
                      {new Date(detailItem.expiryAt).toLocaleString("vi-VN")}
                    </strong>
                  </div>
                </div>

                {/* Description */}
                {detailItem.description && (
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground block">Mô tả món ăn:</label>
                    <p className="p-3 bg-muted/20 border rounded-lg leading-relaxed text-muted-foreground">
                      {detailItem.description}
                    </p>
                  </div>
                )}

                {/* Safety Notes */}
                {detailItem.safetyNotes && (
                  <div className="space-y-1">
                    <label className="font-semibold text-destructive block flex items-center gap-1">
                      <AlertTriangle className="size-3.5" />
                      Lưu ý an toàn / Thành phần gây dị ứng:
                    </label>
                    <p className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg leading-relaxed">
                      {detailItem.safetyNotes}
                    </p>
                  </div>
                )}

                {/* AI Valuation & Insights */}
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-1.5">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="size-4" />
                    Chỉ số định giá & thuật toán AI
                  </span>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block">Urgency Score:</span>
                      <strong>{detailItem.urgencyScore ?? "N/A"} / 100</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Waste Risk:</span>
                      <strong className="uppercase">{detailItem.wasteRisk || "N/A"}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-2">
                <Button variant="outline" onClick={() => setDetailItem(null)}>
                  Đóng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Xác nhận gỡ bài món ăn (Safe Takedown) */}
      <Dialog open={!!takedownTarget} onOpenChange={(open) => !open && setTakedownTarget(null)}>
        <DialogContent className="max-w-md">
          {takedownTarget && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="size-5 text-destructive" />
                  <DialogTitle className="text-destructive">Gỡ bỏ món ăn khỏi chợ</DialogTitle>
                </div>
                <DialogDescription>
                  Món ăn sẽ bị ẩn ngay lập tức (UNAVAILABLE) và khách hàng không thể tiếp tục đặt giữ món này.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-muted/40 rounded-lg border space-y-1">
                  <div className="font-bold text-foreground text-sm">{takedownTarget.title}</div>
                  <div className="text-muted-foreground">Quán: {takedownTarget.partnerName}</div>
                  <div className="font-semibold text-primary">{takedownTarget.discountPrice.toLocaleString("vi-VN")}đ</div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground block">
                    Lý do can thiệp gỡ bài: <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={takedownReason}
                    onValueChange={(val) => setTakedownReason(val)}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIOLATION_SAFETY">Nghi ngờ vi phạm an toàn vệ sinh thực phẩm</SelectItem>
                      <SelectItem value="MISLEADING_INFO">Thông tin mô tả hoặc hình ảnh sai lệch thực tế</SelectItem>
                      <SelectItem value="EXPIRED_ITEM">Thực phẩm đã cận kề giờ hỏng không đảm bảo</SelectItem>
                      <SelectItem value="PRICE_IRREGULARITY">Giá bán hoặc mức giảm giá bất thường</SelectItem>
                      <SelectItem value="PARTNER_REQUEST">Đối tác F&B đề nghị hỗ trợ gỡ bài khẩn</SelectItem>
                      <SelectItem value="OTHER">Lý do điều phối kỹ thuật khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-2 mt-2">
                <Button variant="outline" onClick={() => setTakedownTarget(null)}>
                  Hủy
                </Button>
                <Button variant="destructive" onClick={handleConfirmTakedown} disabled={isToggling}>
                  {isToggling ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
                  Xác nhận gỡ bài
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
