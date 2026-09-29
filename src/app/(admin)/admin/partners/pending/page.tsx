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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/admin/ui/dialog";
import { Input } from "@/components/admin/ui/input";
import { MOCK_PARTNER_PROFILES } from "@/mocks/mockData";
import { PartnerProfileDTO } from "@/types/contract";
import { useGetPendingPartnersQuery, useVerifyPartnerMutation } from "@/redux/api/partnerApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminPendingPartnersPage() {
  const { data: realPartners, isLoading, isFetching } = useGetPendingPartnersQuery();
  const [verifyPartnerMutation] = useVerifyPartnerMutation();

  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const pendingList =
    realPartners !== undefined ? realPartners : MOCK_PARTNER_PROFILES.filter((p) => p.verificationStatus === "PENDING");

  const handleApprove = async (id: string) => {
    try {
      await verifyPartnerMutation({ id, status: "VERIFIED" }).unwrap();
      toast.success("Đã phê duyệt hồ sơ đối tác thành công.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Phê duyệt thất bại");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối hồ sơ.");
      return;
    }
    try {
      if (rejectingId) {
        await verifyPartnerMutation({
          id: rejectingId,
          status: "REJECTED",
          rejectionReason: rejectionReason.trim(),
        }).unwrap();
        toast.info("Đã từ chối hồ sơ đối tác.");
        setRejectingId(null);
        setRejectionReason("");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Từ chối hồ sơ thất bại");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Duyệt hồ sơ đối tác F&B"
        badge={
          isFetching ? (
            <Loader2 className="size-3 animate-spin" />
          ) : pendingList.length > 0 ? (
            `${pendingList.length} hồ sơ chờ`
          ) : undefined
        }
        description="Kiểm tra đối chiếu giấy phép kinh doanh và chứng nhận an toàn thực phẩm trước khi cấp quyền bán hàng."
      />

      <Card>
        <CardContent className="p-0">
          {isLoading && !realPartners ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-xs">Đang tải danh sách hồ sơ...</span>
            </div>
          ) : pendingList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">Cơ sở kinh doanh</TableHead>
                  <TableHead className="w-[140px]">Mã ĐKKD</TableHead>
                  <TableHead className="w-[130px]">Loại hình</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead className="w-[200px]">Hồ sơ đính kèm</TableHead>
                  <TableHead className="w-[180px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingList.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">
                      <div>
                        <span className="block font-semibold text-foreground">
                          {partner.businessName}
                        </span>
                        <span className="text-xs text-muted-foreground">{partner.phone}</span>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs">
                      {partner.businessLicenseNo}
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="font-normal capitalize">
                        {partner.businessType.toLowerCase().replace("_", " ")}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {partner.address}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() =>
                            setPreviewDoc({
                              url: partner.businessLicenseUrl,
                              title: `Giấy phép kinh doanh - ${partner.businessName}`,
                            })
                          }
                        >
                          GPKD
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() =>
                            setPreviewDoc({
                              url: partner.foodSafetyCertUrl,
                              title: `Chứng nhận ATTP - ${partner.businessName}`,
                            })
                          }
                        >
                          ATTP
                        </Button>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setRejectingId(partner.id)}
                        >
                          Từ chối
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleApprove(partner.id)}
                        >
                          Phê duyệt
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <AdminEmptyState
              title="Không có hồ sơ nào chờ duyệt"
              description="Toàn bộ hồ sơ đăng ký đối tác F&B đã được xử lý hoàn tất."
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
          <div className="relative aspect-[4/3] w-full rounded-md overflow-hidden border bg-muted my-2">
            {previewDoc && (
              <img
                src={previewDoc.url}
                alt={previewDoc.title}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <DialogFooter>
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
            <DialogTitle className="text-base">Từ chối hồ sơ đối tác</DialogTitle>
            <DialogDescription className="text-xs">
              Vui lòng nêu rõ lý do để đối tác nhận được thông báo và bổ sung hồ sơ.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ví dụ: Giấy chứng nhận ATTP đã hết hiệu lực..."
              className="text-xs"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setRejectingId(null)}>
              Hủy
            </Button>
            <Button variant="destructive" size="sm" onClick={handleReject}>
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
