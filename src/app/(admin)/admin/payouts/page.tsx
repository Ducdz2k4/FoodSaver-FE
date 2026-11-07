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
  useGetAdminPayoutsQuery,
  useProcessPayoutMutation,
  useCompletePayoutMutation,
  useRejectPayoutMutation,
  AdminPayoutItem,
  PayoutStatus,
} from "@/redux/api/admin/adminPayoutApi";
import { toast } from "sonner";
import {
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRightCircle,
  Loader2,
  Search,
  Building2,
  CreditCard,
  AlertTriangle,
  FileCheck2,
  QrCode,
} from "lucide-react";

const STATUS_LABELS: Record<PayoutStatus, string> = {
  REQUESTED: "Chờ xử lý",
  PROCESSING: "Đang chuyển khoản",
  COMPLETED: "Đã hoàn tất",
  REJECTED: "Đã từ chối",
};

export default function AdminPayoutsPage() {
  const [selectedStatus, setSelectedStatus] = useState<PayoutStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Dialog States
  const [completeTarget, setCompleteTarget] = useState<AdminPayoutItem | null>(null);
  const [bankRefCode, setBankRefCode] = useState("");
  const [showPayoutQr, setShowPayoutQr] = useState(true);

  const [rejectTarget, setRejectTarget] = useState<AdminPayoutItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [detailTarget, setDetailTarget] = useState<AdminPayoutItem | null>(null);

  // Queries & Mutations
  const { data, isLoading, isFetching, refetch } = useGetAdminPayoutsQuery({
    status: selectedStatus,
    search: searchQuery,
    page,
    limit: 15,
  });

  const [processPayout, { isLoading: isProcessing }] = useProcessPayoutMutation();
  const [completePayout, { isLoading: isCompleting }] = useCompletePayoutMutation();
  const [rejectPayout, { isLoading: isRejecting }] = useRejectPayoutMutation();

  const payouts = data?.payouts || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 15, totalPages: 1 };

  // Calculate quick stats
  const totalCount = meta.total;
  const requestedCount = payouts.filter((p) => p.status === "REQUESTED").length;
  const processingCount = payouts.filter((p) => p.status === "PROCESSING").length;
  const completedCount = payouts.filter((p) => p.status === "COMPLETED").length;

  const handleProcess = async (payout: AdminPayoutItem) => {
    try {
      await processPayout(payout.id).unwrap();
      toast.success(`Yêu cầu #${payout.payoutNumber} đã chuyển sang trạng thái Đang xử lý`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleOpenCompleteDialog = (payout: AdminPayoutItem) => {
    setCompleteTarget(payout);
    setBankRefCode("");
    setShowPayoutQr(true);
  };

  const handleConfirmComplete = async () => {
    if (!completeTarget) return;
    if (!bankRefCode.trim()) {
      toast.error("Vui lòng nhập mã giao dịch ngân hàng / ủy nhiệm chi");
      return;
    }

    try {
      await completePayout({
        id: completeTarget.id,
        bankReferenceCode: bankRefCode.trim(),
      }).unwrap();

      toast.success(
        `Hoàn tất chi trả ${completeTarget.amount.toLocaleString("vi-VN")}đ cho quán ${completeTarget.partner?.businessName || ""}`
      );
      setCompleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Thao tác hoàn tất rút tiền thất bại");
    }
  };

  const handleOpenRejectDialog = (payout: AdminPayoutItem) => {
    setRejectTarget(payout);
    setRejectionReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nêu rõ lý do từ chối yêu cầu rút tiền");
      return;
    }

    try {
      await rejectPayout({
        id: rejectTarget.id,
        rejectionReason: rejectionReason.trim(),
      }).unwrap();

      toast.success(
        `Đã từ chối yêu cầu #${rejectTarget.payoutNumber}. Toàn bộ số tiền ${rejectTarget.amount.toLocaleString("vi-VN")}đ đã được hoàn trả về ví đối tác.`
      );
      setRejectTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể từ chối yêu cầu rút tiền");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Quản lý đối soát & Duyệt rút tiền F&B"
        description="Thẩm định yêu cầu rút tiền của đối tác, đối soát số dư khả dụng và chi trả chuyển khoản ngân hàng minh bạch."
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Tổng yêu cầu rút tiền"
          value={totalCount}
          icon={<Banknote className="size-5" />}
          iconClassName="bg-primary/10 text-primary"
          description="Toàn bộ yêu cầu rút tiền của đối tác"
        />
        <AdminStatCard
          title="Chờ tiếp nhận xử lý"
          value={requestedCount}
          icon={<Clock className="size-5" />}
          iconClassName="bg-amber-500/10 text-amber-600"
          description="Cần kiểm tra và chuyển khoản"
        />
        <AdminStatCard
          title="Đang chuyển khoản"
          value={processingCount}
          icon={<ArrowRightCircle className="size-5" />}
          iconClassName="bg-sky-500/10 text-sky-600"
          description="Đang thực hiện lệnh ngân hàng"
        />
        <AdminStatCard
          title="Đã chi trả thành công"
          value={completedCount}
          icon={<CheckCircle2 className="size-5" />}
          iconClassName="bg-emerald-500/10 text-emerald-600"
          description="Đã hạch toán và ghi nhận mã GD"
        />
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-2xl">
          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onValueChange={(val) => {
              setSelectedStatus(val as PayoutStatus | "ALL");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="REQUESTED">Chờ xử lý</SelectItem>
              <SelectItem value="PROCESSING">Đang chuyển khoản</SelectItem>
              <SelectItem value="COMPLETED">Đã hoàn tất</SelectItem>
              <SelectItem value="REJECTED">Đã từ chối</SelectItem>
            </SelectContent>
          </Select>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm theo mã GD, tên quán, số TK..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
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
          Làm mới dữ liệu
        </Button>
      </div>

      {/* Payouts Table Card */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-sm">Đang tải danh sách yêu cầu rút tiền...</span>
            </div>
          ) : payouts.length === 0 ? (
            <div className="p-8">
              <AdminEmptyState
                title="Không có yêu cầu rút tiền nào"
                description="Không tìm thấy yêu cầu rút tiền nào phù hợp với bộ lọc hiện tại."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Mã yêu cầu</TableHead>
                    <TableHead>Đối tác F&B</TableHead>
                    <TableHead>Số tiền rút</TableHead>
                    <TableHead>Tài khoản nhận tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Mã GD Ngân hàng</TableHead>
                    <TableHead>Thời gian gửi</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-mono font-bold text-xs">
                        #{payout.payoutNumber}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground text-sm flex items-center gap-1.5">
                          <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                          <span>{payout.partner?.businessName || "Đối tác F&B"}</span>
                        </div>
                        <div className="text-xs text-muted-foreground pl-5">
                          {payout.partner?.phone || payout.partner?.user?.email || ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-sm text-foreground">
                          {payout.amount.toLocaleString("vi-VN")}đ
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium text-foreground">
                          {payout.bankName || "Ngân hàng"}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground">
                          {payout.bankAccountNo} • {payout.bankAccountName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payout.status === "COMPLETED"
                              ? "default"
                              : payout.status === "REQUESTED"
                              ? "secondary"
                              : payout.status === "PROCESSING"
                              ? "outline"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {STATUS_LABELS[payout.status] || payout.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payout.bankReferenceCode ? (
                          <span className="font-mono text-xs font-semibold text-foreground bg-muted px-2 py-0.5 rounded">
                            {payout.bankReferenceCode}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(payout.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {payout.status === "REQUESTED" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleProcess(payout)}
                                disabled={isProcessing}
                                className="text-xs h-8"
                              >
                                Tiếp nhận
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleOpenCompleteDialog(payout)}
                                className="text-xs h-8"
                              >
                                Hoàn tất
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleOpenRejectDialog(payout)}
                                className="text-xs h-8"
                              >
                                Từ chối
                              </Button>
                            </>
                          )}

                          {payout.status === "PROCESSING" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleOpenCompleteDialog(payout)}
                                className="text-xs h-8"
                              >
                                Xác nhận chuyển tiền
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleOpenRejectDialog(payout)}
                                className="text-xs h-8"
                              >
                                Từ chối
                              </Button>
                            </>
                          )}

                          {(payout.status === "COMPLETED" || payout.status === "REJECTED") && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setDetailTarget(payout)}
                              className="text-xs h-8"
                            >
                              Chi tiết
                            </Button>
                          )}
                        </div>
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
            Trang {meta.page} / {meta.totalPages} (Tổng cộng {meta.total} yêu cầu)
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

      {/* Dialog 1: Xác nhận hoàn tất chuyển khoản (Complete Payout) */}
      <Dialog open={!!completeTarget} onOpenChange={(open) => !open && setCompleteTarget(null)}>
        <DialogContent className="max-w-md">
          {completeTarget && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <FileCheck2 className="size-5 text-primary" />
                  <DialogTitle>Xác nhận chuyển khoản ngân hàng</DialogTitle>
                </div>
                <DialogDescription>
                  Nhập mã tham chiếu ủy nhiệm chi / giao dịch ngân hàng để hoàn tất quyết toán.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-xs">
                {/* Beneficiary Info */}
                <div className="p-3.5 bg-muted/50 rounded-lg border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Đối tác thụ hưởng:</span>
                    <strong className="text-foreground">{completeTarget.partner?.businessName}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Số tiền chi trả:</span>
                    <strong className="text-sm font-bold text-primary">
                      {completeTarget.amount.toLocaleString("vi-VN")}đ
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Ngân hàng:</span>
                    <span className="font-medium text-foreground">{completeTarget.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Số tài khoản:</span>
                    <span className="font-mono font-bold text-foreground">{completeTarget.bankAccountNo}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Chủ tài khoản:</span>
                    <span className="font-semibold text-foreground">{completeTarget.bankAccountName}</span>
                  </div>
                </div>
                  {/* VietQR Quick Transfer for Admin */}
                  <div className="p-3 bg-muted/40 rounded-xl border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <QrCode className="size-4 text-primary" />
                        Mã VietQR chuyển tiền cho quán
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPayoutQr((prev) => !prev)}
                        className="h-6 px-2 text-[10px]"
                      >
                        {showPayoutQr ? "Ẩn mã QR" : "Hiện mã QR"}
                      </Button>
                    </div>

                    {showPayoutQr && (
                      <div className="pt-2 text-center space-y-1.5 bg-white p-3 rounded-xl border border-dashed border-primary/30">
                        <img
                          src={`https://img.vietqr.io/image/${(completeTarget.bankName || "bidv").toLowerCase().replace(/[^a-z0-9]/g, "")}-${completeTarget.bankAccountNo}-compact2.png?amount=${completeTarget.amount}&addInfo=RUT%20TIEN%20FS%20${completeTarget.id.slice(0, 8).toUpperCase()}&accountName=${encodeURIComponent(completeTarget.bankAccountName || "")}`}
                          alt="VietQR Chuyển Tiền"
                          className="size-44 mx-auto object-contain rounded-lg border p-1"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Mở App BIDV quét mã trên để chuyển tiền tự động đúng số tiền và nội dung.
                        </p>
                      </div>
                    )}
                  </div>



                {/* Bank Reference Code Input */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground block">
                    Mã giao dịch ngân hàng / Ủy nhiệm chi <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Ví dụ: FT2403982847291 hoặc VCB1827463"
                    value={bankRefCode}
                    onChange={(e) => setBankRefCode(e.target.value)}
                    className="font-mono text-xs uppercase"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Hệ thống sẽ ghi bút toán hoàn tất từ tài khoản trung gian Payout và gửi thông báo xác nhận đến đối tác.
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2 mt-2">
                <Button variant="outline" onClick={() => setCompleteTarget(null)}>
                  Hủy
                </Button>
                <Button onClick={handleConfirmComplete} disabled={isCompleting}>
                  {isCompleting ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
                  Xác nhận hoàn tất
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Từ chối yêu cầu rút tiền & Bút toán đảo (Reject Payout) */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="max-w-md">
          {rejectTarget && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-destructive" />
                  <DialogTitle className="text-destructive">Từ chối yêu cầu rút tiền</DialogTitle>
                </div>
                <DialogDescription>
                  Yêu cầu rút tiền sẽ bị hủy. Số tiền sẽ được hoàn trả tự động về ví khả dụng của đối tác.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-xs">
                {/* Warning Card */}
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg space-y-1">
                  <div className="font-bold text-destructive flex items-center gap-1.5">
                    <CreditCard className="size-4" />
                    Bút toán đảo (Reversal Ledger) tự động
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Số tiền <strong className="text-foreground">{rejectTarget.amount.toLocaleString("vi-VN")}đ</strong>{" "}
                    sẽ được cộng ngược lại vào số dư khả dụng (Available Balance) của quán{" "}
                    <strong>{rejectTarget.partner?.businessName}</strong>.
                  </p>
                </div>

                {/* Reason Input */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground block">
                    Lý do từ chối gửi đối tác <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ví dụ: Thông tin số tài khoản và tên chủ thẻ ngân hàng không khớp nhau..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2.5 rounded-md border text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 mt-2">
                <Button variant="outline" onClick={() => setRejectTarget(null)}>
                  Đóng
                </Button>
                <Button variant="destructive" onClick={handleConfirmReject} disabled={isRejecting}>
                  {isRejecting ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
                  Từ chối & Hoàn tiền vào ví
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog 3: Chi tiết yêu cầu rút tiền đã xong / từ chối */}
      <Dialog open={!!detailTarget} onOpenChange={(open) => !open && setDetailTarget(null)}>
        <DialogContent className="max-w-md">
          {detailTarget && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Banknote className="size-5 text-primary" />
                  <DialogTitle>Chi tiết yêu cầu #{detailTarget.payoutNumber}</DialogTitle>
                </div>
                <DialogDescription>
                  Thông tin lịch sử xử lý quyết toán chi trả cho đối tác.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 p-3.5 bg-muted/40 rounded-lg border text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cửa hàng đối tác:</span>
                  <strong className="text-foreground">{detailTarget.partner?.businessName}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Số tiền rút:</span>
                  <strong className="text-base font-bold text-foreground">
                    {detailTarget.amount.toLocaleString("vi-VN")}đ
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <Badge
                    variant={detailTarget.status === "COMPLETED" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {STATUS_LABELS[detailTarget.status]}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ngân hàng thụ hưởng:</span>
                  <span className="font-medium text-foreground">{detailTarget.bankName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Số tài khoản:</span>
                  <span className="font-mono font-bold text-foreground">{detailTarget.bankAccountNo}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Chủ tài khoản:</span>
                  <span className="font-semibold text-foreground">{detailTarget.bankAccountName}</span>
                </div>

                {detailTarget.bankReferenceCode && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-muted-foreground">Mã GD Ngân hàng:</span>
                    <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded">
                      {detailTarget.bankReferenceCode}
                    </span>
                  </div>
                )}

                {detailTarget.rejectionReason && (
                  <div className="pt-2 border-t space-y-1">
                    <span className="text-destructive font-semibold block">Lý do từ chối:</span>
                    <div className="p-2 bg-destructive/10 text-destructive rounded text-xs italic">
                      &ldquo;{detailTarget.rejectionReason}&rdquo;
                    </div>
                  </div>
                )}

                {detailTarget.processedAt && (
                  <div className="flex justify-between items-center pt-2 border-t text-[11px] text-muted-foreground">
                    <span>Thời gian hoàn tất xử lý:</span>
                    <span>{new Date(detailTarget.processedAt).toLocaleString("vi-VN")}</span>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-2">
                <Button variant="outline" onClick={() => setDetailTarget(null)}>
                  Đóng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
