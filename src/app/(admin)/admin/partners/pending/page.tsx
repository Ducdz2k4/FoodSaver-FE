"use client";

import React, { useState, useMemo } from "react";
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
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/admin/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/admin/ui/dialog";
import { Input } from "@/components/admin/ui/input";
import { PartnerProfileDTO } from "@/types/contract";
import { useGetAllPartnersQuery, useVerifyPartnerMutation } from "@/redux/api/partnerApi";
import { toast } from "sonner";
import { Loader2, ExternalLink, ShieldCheck, Clock, AlertCircle, FileText, Store } from "lucide-react";

type TabFilter = "PENDING" | "VERIFIED" | "REJECTED" | "ALL";

export default function AdminPendingPartnersPage() {
  const [activeTab, setActiveTab] = useState<TabFilter>("PENDING");
  const { data: realPartners, isLoading, isFetching, refetch } = useGetAllPartnersQuery();
  const [verifyPartnerMutation, { isLoading: isVerifying }] = useVerifyPartnerMutation();

  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const allPartners: PartnerProfileDTO[] = useMemo(() => realPartners || [], [realPartners]);

  const pendingCount = useMemo(
    () => allPartners.filter((p) => p.verificationStatus === "PENDING").length,
    [allPartners]
  );
  const verifiedCount = useMemo(
    () => allPartners.filter((p) => p.verificationStatus === "VERIFIED").length,
    [allPartners]
  );
  const rejectedCount = useMemo(
    () => allPartners.filter((p) => p.verificationStatus === "REJECTED").length,
    [allPartners]
  );

  const displayedList = useMemo(() => {
    if (activeTab === "ALL") return allPartners;
    return allPartners.filter((p) => p.verificationStatus === activeTab);
  }, [allPartners, activeTab]);

  const handleApprove = async (id: string) => {
    try {
      await verifyPartnerMutation({ id, status: "VERIFIED" }).unwrap();
      toast.success("Đã phê duyệt hồ sơ đối tác thành công! Quyền bán hàng đã được cấp.");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Phê duyệt hồ sơ thất bại");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nêu rõ lý do từ chối hồ sơ.");
      return;
    }
    try {
      if (rejectingId) {
        await verifyPartnerMutation({
          id: rejectingId,
          status: "REJECTED",
          rejectionReason: rejectionReason.trim(),
        }).unwrap();
        toast.info("Đã từ chối hồ sơ đối tác và gửi thông báo lý do.");
        setRejectingId(null);
        setRejectionReason("");
        refetch();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Từ chối hồ sơ thất bại");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Duyệt hồ sơ đối tác F&B"
        badge={
          isFetching ? (
            <div className="flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" />
              <span>Đang đồng bộ...</span>
            </div>
          ) : pendingCount > 0 ? (
            `${pendingCount} hồ sơ chờ`
          ) : undefined
        }
        description="Kiểm tra đối chiếu giấy phép kinh doanh và chứng nhận an toàn thực phẩm trước khi cấp quyền bán hàng."
      />

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("PENDING")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "PENDING"
              ? "bg-[#00615f] text-white shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-muted"
          }`}
        >
          <Clock className="size-3.5" />
          <span>Hồ sơ chờ duyệt</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {pendingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("VERIFIED")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "VERIFIED"
              ? "bg-[#00615f] text-white shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-muted"
          }`}
        >
          <ShieldCheck className="size-3.5" />
          <span>Đã phê duyệt</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {verifiedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("REJECTED")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "REJECTED"
              ? "bg-[#00615f] text-white shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-muted"
          }`}
        >
          <AlertCircle className="size-3.5" />
          <span>Bị từ chối</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {rejectedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "ALL"
              ? "bg-[#00615f] text-white shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-muted"
          }`}
        >
          Tất cả ({allPartners.length})
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span className="text-xs">Đang tải danh sách hồ sơ đối tác từ cơ sở dữ liệu...</span>
            </div>
          ) : displayedList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">Cơ sở kinh doanh</TableHead>
                  <TableHead className="w-[140px]">Mã ĐKKD</TableHead>
                  <TableHead className="w-[130px]">Loại hình</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead className="w-[110px]">Trạng thái</TableHead>
                  <TableHead className="w-[220px]">Hồ sơ đính kèm</TableHead>
                  <TableHead className="w-[180px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedList.map((partner) => (
                  <TableRow key={partner.id}>
                    {/* Cơ sở kinh doanh kèm Avatar / Thumbnail */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 rounded-xl border border-border/80 shadow-2xs shrink-0 bg-muted">
                          {partner.user?.avatar ? (
                            <AvatarImage
                              src={partner.user.avatar}
                              alt={partner.businessName}
                              className="rounded-xl object-cover"
                            />
                          ) : null}
                          <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                            {partner.businessName ? partner.businessName.substring(0, 2).toUpperCase() : <Store className="size-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <span className="block font-semibold text-foreground truncate max-w-[190px]" title={partner.businessName}>
                            {partner.businessName}
                          </span>
                          <span className="text-xs text-muted-foreground block truncate max-w-[190px]">
                            {partner.phone || partner.user?.email || "Chưa có SĐT"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs">
                      {partner.businessLicenseNo}
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="font-normal capitalize text-[11px]">
                        {partner.businessType.toLowerCase().replace("_", " ")}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {partner.address}
                    </TableCell>

                    <TableCell>
                      {partner.verificationStatus === "VERIFIED" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                          Đã duyệt
                        </Badge>
                      ) : partner.verificationStatus === "REJECTED" ? (
                        <div className="space-y-0.5">
                          <Badge variant="destructive" className="text-[10px] font-bold">
                            Từ chối
                          </Badge>
                          {partner.rejectionReason && (
                            <span className="block text-[10px] text-muted-foreground truncate max-w-[120px]" title={partner.rejectionReason}>
                              {partner.rejectionReason}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold">
                          Chờ duyệt
                        </Badge>
                      )}
                    </TableCell>

                    {/* Hồ sơ đính kèm với Thumbnail trực quan */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* GPKD Thumbnail */}
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewDoc({
                              url: partner.businessLicenseUrl,
                              title: `Giấy phép kinh doanh - ${partner.businessName}`,
                            })
                          }
                          className="group relative flex items-center gap-1.5 p-1 pr-2.5 rounded-lg border border-border/70 bg-muted/40 hover:bg-muted hover:border-primary/40 transition cursor-pointer"
                          title="Bấm để xem GPKD"
                        >
                          <div className="size-7 rounded-md overflow-hidden bg-muted border border-border/40 shrink-0 flex items-center justify-center">
                            {partner.businessLicenseUrl ? (
                              <img
                                src={partner.businessLicenseUrl}
                                alt="GPKD"
                                className="size-full object-cover group-hover:scale-110 transition-transform duration-200"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <FileText className="size-3.5 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-foreground">GPKD</span>
                        </button>

                        {/* ATTP Thumbnail */}
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewDoc({
                              url: partner.foodSafetyCertUrl,
                              title: `Chứng nhận ATTP - ${partner.businessName}`,
                            })
                          }
                          className="group relative flex items-center gap-1.5 p-1 pr-2.5 rounded-lg border border-border/70 bg-muted/40 hover:bg-muted hover:border-primary/40 transition cursor-pointer"
                          title="Bấm để xem Chứng nhận ATTP"
                        >
                          <div className="size-7 rounded-md overflow-hidden bg-muted border border-border/40 shrink-0 flex items-center justify-center">
                            {partner.foodSafetyCertUrl ? (
                              <img
                                src={partner.foodSafetyCertUrl}
                                alt="ATTP"
                                className="size-full object-cover group-hover:scale-110 transition-transform duration-200"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <FileText className="size-3.5 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-foreground">ATTP</span>
                        </button>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {partner.verificationStatus === "PENDING" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isVerifying}
                              className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                              onClick={() => setRejectingId(partner.id)}
                            >
                              Từ chối
                            </Button>
                            <Button
                              size="sm"
                              disabled={isVerifying}
                              className="h-8 text-xs bg-[#00615f] hover:bg-[#089184] text-white cursor-pointer"
                              onClick={() => handleApprove(partner.id)}
                            >
                              Phê duyệt
                            </Button>
                          </>
                        )}

                        {partner.verificationStatus === "VERIFIED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isVerifying}
                            className="h-8 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                            onClick={() => setRejectingId(partner.id)}
                          >
                            Hủy quyền bán
                          </Button>
                        )}

                        {partner.verificationStatus === "REJECTED" && (
                          <Button
                            size="sm"
                            disabled={isVerifying}
                            className="h-8 text-xs bg-[#00615f] hover:bg-[#089184] text-white cursor-pointer"
                            onClick={() => handleApprove(partner.id)}
                          >
                            Phê duyệt lại
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <AdminEmptyState
              title={
                activeTab === "PENDING"
                  ? "Không có hồ sơ nào chờ duyệt"
                  : activeTab === "VERIFIED"
                  ? "Chưa có đối tác nào được duyệt"
                  : activeTab === "REJECTED"
                  ? "Không có hồ sơ nào bị từ chối"
                  : "Chưa có hồ sơ đối tác nào trong hệ thống"
              }
              description="Toàn bộ hồ sơ đăng ký đối tác F&B trong cơ sở dữ liệu đã được xử lý hoàn tất."
            />
          )}
        </CardContent>
      </Card>

      {/* Modal Preview Document */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">{previewDoc?.title}</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border bg-stone-50 my-2 flex items-center justify-center">
            {previewDoc?.url ? (
              <img
                src={previewDoc.url}
                alt={previewDoc.title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="text-center p-6 text-muted-foreground text-xs">
                Chưa có hình ảnh giấy tờ đính kèm cho hồ sơ này.
              </div>
            )}
          </div>
          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            {previewDoc?.url ? (
              <a
                href={previewDoc.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#00615f] hover:underline flex items-center gap-1"
              >
                <span>Mở trong tab mới</span>
                <ExternalLink className="size-3" />
              </a>
            ) : <div />}
            <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Rejection Reason */}
      <Dialog open={!!rejectingId} onOpenChange={(open) => !open && setRejectingId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Từ chối / Hủy cấp quyền đối tác</DialogTitle>
            <DialogDescription className="text-xs">
              Vui lòng nêu rõ lý do để đối tác nhận được thông báo in-app và cập nhật lại giấy tờ.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ví dụ: Giấy chứng nhận ATTP đã hết hạn, vui lòng nộp bản mới..."
              className="text-xs"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setRejectingId(null)}>
              Hủy
            </Button>
            <Button variant="destructive" size="sm" disabled={isVerifying} onClick={handleReject}>
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
