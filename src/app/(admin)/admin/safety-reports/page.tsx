"use client";

import React, { useState } from "react";
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
import {
  useGetAdminSafetyReportsQuery,
  useUpdateAdminSafetyReportMutation,
} from "@/redux/api/admin/adminSafetyReportApi";
import {
  FoodSafetyReportDTO,
  SafetyReportIssueType,
  SafetyReportStatus,
} from "@/types/contract";
import { toast } from "sonner";
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";

const ISSUE_TYPE_LABELS: Record<SafetyReportIssueType, string> = {
  EXPIRED_FOOD: "Món hết hạn / biến chất",
  STRANGE_ODOR_MOLD: "Mùi lạ / ôi thiu / mốc",
  DAMAGED_PACKAGING: "Bao bì rách / hở niêm phong",
  FOREIGN_OBJECT: "Dị vật trong món",
  HEALTH_SYMPTOM: "Triệu chứng bất thường",
  OTHER: "Sự cố khác",
};

const STATUS_LABELS: Record<SafetyReportStatus, string> = {
  OPEN: "Chờ tiếp nhận",
  REVIEWING: "Đang thẩm định",
  RESOLVED: "Đã giải quyết",
  REJECTED: "Đã bác bỏ",
};

export default function AdminSafetyReportsPage() {
  const [selectedStatus, setSelectedStatus] = useState<SafetyReportStatus | "ALL">("ALL");
  const [selectedIssueType, setSelectedIssueType] = useState<SafetyReportIssueType | "ALL">("ALL");
  const [page, setPage] = useState(1);

  // Dialog State
  const [selectedReport, setSelectedReport] = useState<FoodSafetyReportDTO | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<SafetyReportStatus>("REVIEWING");
  const [resolutionText, setResolutionText] = useState("");
  const [adminNotesText, setAdminNotesText] = useState("");
  const [actionOnListing, setActionOnListing] = useState<"HIDE_LISTING" | "KEEP">("KEEP");

  const { data, isLoading, isFetching, refetch } = useGetAdminSafetyReportsQuery({
    status: selectedStatus,
    issueType: selectedIssueType,
    page,
    limit: 20,
  });

  const [updateSafetyReportMutation, { isLoading: isUpdating }] = useUpdateAdminSafetyReportMutation();

  const reports = data?.reports || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };

  // Calculate quick stats
  const totalCount = meta.total;
  const openCount = reports.filter((r) => r.status === "OPEN").length;
  const reviewingCount = reports.filter((r) => r.status === "REVIEWING").length;
  const resolvedCount = reports.filter((r) => r.status === "RESOLVED").length;

  const handleOpenDialog = (report: FoodSafetyReportDTO) => {
    setSelectedReport(report);
    setNewStatus(report.status === "OPEN" ? "REVIEWING" : report.status);
    setResolutionText(report.resolution || "");
    setAdminNotesText(report.adminNotes || "");
    setActionOnListing("KEEP");
    setIsDialogOpen(true);
  };

  const handleSaveResolution = async () => {
    if (!selectedReport) return;

    try {
      await updateSafetyReportMutation({
        id: selectedReport.id,
        status: newStatus,
        resolution: resolutionText.trim() || undefined,
        adminNotes: adminNotesText.trim() || undefined,
        actionOnListing: actionOnListing === "HIDE_LISTING" ? "HIDE_LISTING" : undefined,
      }).unwrap();

      toast.success(
        `Đã cập nhật sự cố #${selectedReport.reportNumber} sang trạng thái: ${STATUS_LABELS[newStatus]}`
      );
      setIsDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể cập nhật báo cáo sự cố");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Quản lý sự cố An toàn thực phẩm (ATTP)"
        description="Tiếp nhận, thẩm tra khiếu nại chất lượng món ăn từ khách hàng và xử lý vi phạm đối tác F&B."
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Tổng số sự cố ghi nhận"
          value={totalCount}
          icon={<ShieldAlert className="size-5" />}
          iconClassName="bg-destructive/10 text-destructive"
          description="Toàn bộ báo cáo ATTP trong hệ thống"
        />
        <AdminStatCard
          title="Chờ tiếp nhận xử lý"
          value={openCount}
          icon={<AlertTriangle className="size-5" />}
          iconClassName="bg-amber-500/10 text-amber-600"
          description="Cần phân công thẩm tra gấp"
        />
        <AdminStatCard
          title="Đang thẩm tra đối tác"
          value={reviewingCount}
          icon={<Clock className="size-5" />}
          iconClassName="bg-sky-500/10 text-sky-600"
          description="Đang làm việc với cửa hàng"
        />
        <AdminStatCard
          title="Đã giải quyết dứt điểm"
          value={resolvedCount}
          icon={<CheckCircle2 className="size-5" />}
          iconClassName="bg-emerald-500/10 text-emerald-600"
          description="Đã kết luận và thông báo khách"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onValueChange={(val) => {
              setSelectedStatus(val as SafetyReportStatus | "ALL");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="OPEN">Chờ tiếp nhận</SelectItem>
              <SelectItem value="REVIEWING">Đang thẩm định</SelectItem>
              <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
              <SelectItem value="REJECTED">Đã bác bỏ</SelectItem>
            </SelectContent>
          </Select>

          {/* Issue Type Filter */}
          <Select
            value={selectedIssueType}
            onValueChange={(val) => {
              setSelectedIssueType(val as SafetyReportIssueType | "ALL");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Lọc theo loại sự cố" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại sự cố</SelectItem>
              <SelectItem value="EXPIRED_FOOD">Món hết hạn / biến chất</SelectItem>
              <SelectItem value="STRANGE_ODOR_MOLD">Mùi lạ / ôi thiu / mốc</SelectItem>
              <SelectItem value="DAMAGED_PACKAGING">Bao bì rách / hở niêm phong</SelectItem>
              <SelectItem value="FOREIGN_OBJECT">Dị vật trong món</SelectItem>
              <SelectItem value="HEALTH_SYMPTOM">Triệu chứng bất thường</SelectItem>
              <SelectItem value="OTHER">Sự cố khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="shrink-0"
        >
          {isFetching ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
          Làm mới dữ liệu
        </Button>
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-sm">Đang tải danh sách sự cố...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8">
              <AdminEmptyState
                title="Không có sự cố nào"
                description="Không tìm thấy báo cáo sự cố ATTP phù hợp với bộ lọc hiện tại."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Mã sự cố</TableHead>
                    <TableHead>Món ăn / Đơn</TableHead>
                    <TableHead>Đối tác F&B</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Loại sự cố</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-mono font-bold text-xs">
                        #{report.reportNumber}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground text-sm line-clamp-1">
                          {report.listing?.title || "Món ăn"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          Đơn #{report.order?.orderNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {report.partner?.businessName || "Quán đối tác"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {report.partner?.phone || ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {report.customer?.fullName || "Khách hàng"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {report.customer?.phone || report.customer?.email || ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {ISSUE_TYPE_LABELS[report.issueType] || report.issueType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            report.status === "RESOLVED"
                              ? "default"
                              : report.status === "OPEN"
                              ? "destructive"
                              : report.status === "REVIEWING"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {STATUS_LABELS[report.status] || report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenDialog(report)}
                        >
                          Xem & Xử lý
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Trang {meta.page} / {meta.totalPages} (Tổng cộng {meta.total} báo cáo)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trang trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}

      {/* Dialog Xử Lý Chi Tiết Báo Cáo ATTP */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="size-5 text-destructive" />
                  <DialogTitle>
                    Hồ sơ sự cố #{selectedReport.reportNumber}
                  </DialogTitle>
                </div>
                <DialogDescription>
                  Xem xét chi tiết phản ánh từ khách hàng và đối tác F&B để đưa ra quyết định xử lý.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                {/* 1. Thông tin chung */}
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-muted/40 rounded-lg border text-xs">
                  <div>
                    <span className="text-muted-foreground block">Món ăn:</span>
                    <strong className="text-foreground">{selectedReport.listing?.title}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Mã đơn hàng:</span>
                    <strong className="font-mono text-foreground">#{selectedReport.order?.orderNumber}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Cửa hàng đối tác:</span>
                    <strong>{selectedReport.partner?.businessName}</strong> ({selectedReport.partner?.phone})
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Khách hàng phản ánh:</span>
                    <strong>{selectedReport.customer?.fullName}</strong> ({selectedReport.customer?.phone || selectedReport.customer?.email})
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block">Phân loại sự cố:</span>
                    <Badge variant="outline" className="mt-1">
                      {ISSUE_TYPE_LABELS[selectedReport.issueType]}
                    </Badge>
                  </div>
                </div>

                {/* 2. Mô tả chi tiết của khách hàng */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-xs text-foreground block">
                    Nội dung mô tả từ khách hàng:
                  </label>
                  <div className="p-3 bg-card border rounded-lg text-xs leading-relaxed text-foreground italic">
                    &ldquo;{selectedReport.description}&rdquo;
                  </div>
                </div>

                {/* 3. Bằng chứng đính kèm */}
                {Array.isArray(selectedReport.evidenceUrls) && selectedReport.evidenceUrls.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="font-semibold text-xs text-foreground block">
                      Bằng chứng hình ảnh / hóa đơn ({selectedReport.evidenceUrls.length}):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.evidenceUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-xs font-medium border"
                        >
                          <FileText className="size-3.5 text-muted-foreground" />
                          <span>Ảnh bằng chứng #{i + 1}</span>
                          <ExternalLink className="size-3 text-muted-foreground ml-0.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Form Quyết Định Của Admin */}
                <div className="border-t pt-4 space-y-3.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Quyết định xử lý của Ban Quản Trị
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Trạng thái cập nhật <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={newStatus}
                      onValueChange={(val) => setNewStatus(val as SafetyReportStatus)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REVIEWING">Đang thẩm định & làm việc với quán</SelectItem>
                        <SelectItem value="RESOLVED">Đã giải quyết & thông báo khách</SelectItem>
                        <SelectItem value="REJECTED">Bác bỏ khiếu nại (Không đủ căn cứ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Kết luận & Giải pháp gửi khách hàng (Thông báo in-app)
                    </label>
                    <textarea
                      rows={3}
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="Ví dụ: Đã thẩm tra đối tác, ghi nhận lỗi bảo quản và hoàn tiền 100% qua ví FoodSaver..."
                      className="w-full p-2.5 rounded-md border text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Ghi chú nội bộ Admin (Chỉ BQT xem)
                    </label>
                    <textarea
                      rows={2}
                      value={adminNotesText}
                      onChange={(e) => setAdminNotesText(e.target.value)}
                      placeholder="Ghi chú cảnh cáo đối tác, lịch sử vi phạm..."
                      className="w-full p-2.5 rounded-md border text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                    />
                  </div>

                  {/* Listing Sanction Action */}
                  <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/20 flex items-center justify-between">
                    <div>
                      <strong className="text-xs text-destructive block">
                        Can thiệp danh mục món ăn
                      </strong>
                      <span className="text-[11px] text-muted-foreground">
                        Tạm ẩn món ăn này (UNAVAILABLE) khỏi chợ cứu trợ để ngăn ngừa rủi ro tiếp tục phát sinh.
                      </span>
                    </div>
                    <Select
                      value={actionOnListing}
                      onValueChange={(val) => setActionOnListing(val as "HIDE_LISTING" | "KEEP")}
                    >
                      <SelectTrigger className="w-[140px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KEEP">Giữ nguyên</SelectItem>
                        <SelectItem value="HIDE_LISTING">Tạm ẩn món</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Đóng
                </Button>
                <Button
                  onClick={handleSaveResolution}
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
                  Lưu quyết định & Gửi thông báo
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
