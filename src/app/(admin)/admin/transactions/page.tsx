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
  useGetXGateTransactionsQuery,
  useSyncXGateTransactionsMutation,
  useGetBankConfigQuery,
  XGateTransaction,
} from "@/redux/api/admin/adminTransactionApi";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  RefreshCw,
  Search,
  Filter,
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function AdminTransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<"in" | "out" | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTx, setSelectedTx] = useState<XGateTransaction | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const {
    data: txResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetXGateTransactionsQuery({
    type: typeFilter,
    content: searchTerm.trim() || undefined,
    limit: 50,
  });

  const { data: bankConfig } = useGetBankConfigQuery();
  const [syncXGate, { isLoading: isSyncing }] = useSyncXGateTransactionsMutation();

  const transactions = txResponse?.transactions || [];
  const pagination = txResponse?.pagination;

  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      toast.success(`Đã sao chép ${label}!`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleSync = async () => {
    try {
      const res = await syncXGate().unwrap();
      if (res.matched > 0) {
        toast.success(`✓ ${res.message}`);
      } else {
        toast.info(res.message || "Hệ thống đã kiểm tra, hiện tại không có đơn nào cần đối soát.");
      }
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể đồng bộ giao dịch lúc này");
    }
  };

  // Tính toán nhanh số liệu thống kê từ giao dịch
  const totalInflow = transactions
    .filter((t) => t.type === "in")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalOutflow = transactions
    .filter((t) => t.type === "out")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const inCount = transactions.filter((t) => t.type === "in").length;
  const outCount = transactions.filter((t) => t.type === "out").length;

  return (
    <div className="admin-root max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
      {/* 1. Page Header */}
      <AdminPageHeader
        title="Sổ Quỹ & Giao Dịch Ngân Hàng"
        description="Đối soát dòng tiền 2 chiều (Thu / Chi) từ tài khoản BIDV qua cổng kết nối xGate REST API."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfigModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Landmark className="size-4" />
            <span>Tài khoản BIDV</span>
          </Button>

          <Button
            size="sm"
            disabled={isSyncing || isFetching}
            onClick={handleSync}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground shadow-sm"
          >
            <RefreshCw className={`size-4 ${isSyncing || isFetching ? "animate-spin" : ""}`} />
            <span>Đồng bộ xGate</span>
          </Button>
        </div>
      </AdminPageHeader>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Tổng Tiền Vào (Inflow)"
          value={`${totalInflow.toLocaleString("vi-VN")} đ`}
          description={`${inCount} giao dịch thu tiền từ khách`}
          icon={<ArrowDownLeft className="size-5 text-emerald-600" />}
        />

        <AdminStatCard
          title="Tổng Tiền Ra (Outflow)"
          value={`${totalOutflow.toLocaleString("vi-VN")} đ`}
          description={`${outCount} lệnh chi tiền rút/hoàn`}
          icon={<ArrowUpRight className="size-5 text-amber-600" />}
        />

        <AdminStatCard
          title="Số Dư Ròng Đối Soát"
          value={`${(totalInflow - totalOutflow).toLocaleString("vi-VN")} đ`}
          description="Chênh lệch thu chi trên tài khoản"
          icon={<CreditCard className="size-5 text-primary" />}
        />

        <AdminStatCard
          title="Cổng Kết Nối xGate"
          value="BIDV Online"
          description="STK: 6240247363 (Đang hoạt động)"
          icon={<ShieldCheck className="size-5 text-emerald-600" />}
        />
      </div>

      {/* 3. Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-1 w-full sm:w-auto items-center gap-2">
              <div className="relative flex-1">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo nội dung, mã đơn #FS..., số tài khoản..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <Select
                value={typeFilter}
                onValueChange={(val) => setTypeFilter(val as any)}
              >
                <SelectTrigger className="w-36 h-9 text-xs">
                  <SelectValue placeholder="Chiều GD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả chiều GD</SelectItem>
                  <SelectItem value="in">Tiền vào (Thu)</SelectItem>
                  <SelectItem value="out">Tiền ra (Chi)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("");
                refetch();
              }}
              className="text-xs"
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 4. Transactions Data Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-primary" />
              Đang tải danh sách giao dịch từ cổng xGate...
            </div>
          ) : transactions.length === 0 ? (
            <AdminEmptyState
              title="Chưa có giao dịch ngân hàng nào"
              description="Tài khoản BIDV 6240247363 chưa phát sinh giao dịch hoặc bộ lọc không khớp dữ liệu nào."
              icon={<Landmark className="size-10 text-muted-foreground" />}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Thời Gian</TableHead>
                    <TableHead className="w-24">Chiều GD</TableHead>
                    <TableHead className="w-32 text-right">Số Tiền</TableHead>
                    <TableHead className="w-44">Tài Khoản Liên Quan</TableHead>
                    <TableHead>Nội Dung Giao Dịch</TableHead>
                    <TableHead className="w-24 text-center">Chi Tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => {
                    const isIn = tx.type === "in";
                    const isOrderMatch = /FS[A-Z0-9]{4,20}/i.test(tx.content);

                    return (
                      <TableRow key={tx.id} className="text-xs">
                        {/* Thời gian */}
                        <TableCell className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                          {tx.transaction_date
                            ? new Date(tx.transaction_date).toLocaleString("vi-VN", {
                                dateStyle: "short",
                                timeStyle: "medium",
                              })
                            : "Vừa xong"}
                        </TableCell>

                        {/* Chiều giao dịch */}
                        <TableCell>
                          {isIn ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/30 flex items-center gap-1 w-fit font-bold">
                              <ArrowDownLeft className="size-3" />
                              Tiền vào
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/30 flex items-center gap-1 w-fit font-bold">
                              <ArrowUpRight className="size-3" />
                              Tiền ra
                            </Badge>
                          )}
                        </TableCell>

                        {/* Số tiền */}
                        <TableCell className="text-right font-mono font-bold">
                          <span className={isIn ? "text-emerald-700 font-extrabold" : "text-amber-700 font-extrabold"}>
                            {isIn ? "+" : "-"}
                            {Number(tx.amount).toLocaleString("vi-VN")} đ
                          </span>
                        </TableCell>

                        {/* Tài khoản liên quan */}
                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="font-mono font-semibold block text-foreground">
                              {isIn ? tx.sender_account || "Khách chuyển" : tx.receiver_account || "Quán nhận"}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase">
                              {isIn ? tx.sender_bank_name || "Ngân hàng gửi" : tx.receiver_bank_name || "Ngân hàng nhận"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Nội dung giao dịch */}
                        <TableCell>
                          <div className="space-y-1 max-w-md">
                            <p className="line-clamp-2 text-stone-800 leading-snug">
                              {tx.content}
                            </p>
                            {isOrderMatch && (
                              <Badge variant="outline" className="text-[10px] font-mono bg-primary/5 text-primary border-primary/20">
                                <Sparkles className="size-2.5 mr-1" />
                                Khớp mã đơn #FS
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Nút xem chi tiết */}
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTx(tx)}
                            className="h-7 px-2 text-[11px]"
                          >
                            Xem
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {pagination && pagination.total > 0 && (
            <div className="p-4 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Hiển thị trang {pagination.page}/{pagination.total_pages || 1} (Tổng {pagination.total} giao dịch)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Transaction Detail Modal */}
      {selectedTx && (
        <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm font-bold">
                <Landmark className="size-4 text-primary" />
                Chi Tiết Giao Dịch Ngân Hàng
              </DialogTitle>
              <DialogDescription className="text-xs">
                Dữ liệu gốc truy xuất từ hệ thống xGate & Ngân hàng BIDV.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 bg-muted/50 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã GD xGate:</span>
                  <span className="font-mono font-bold text-foreground">{selectedTx.id}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chiều giao dịch:</span>
                  <span className="font-bold">
                    {selectedTx.type === "in" ? "Tiền vào (Thu)" : "Tiền ra (Chi)"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số tiền:</span>
                  <span className="font-mono font-extrabold text-sm text-foreground">
                    {Number(selectedTx.amount).toLocaleString("vi-VN")} đ
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thời gian ghi nhận:</span>
                  <span>{new Date(selectedTx.transaction_date).toLocaleString("vi-VN")}</span>
                </div>
              </div>

              <div className="space-y-1.5 border p-3 rounded-xl bg-card">
                <span className="font-semibold block text-muted-foreground">Nội dung chuyển khoản đầy đủ:</span>
                <p className="bg-muted p-2 rounded-lg font-mono text-[11px] leading-relaxed break-words text-foreground">
                  {selectedTx.content}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-muted/40 rounded-lg">
                  <span className="text-muted-foreground block">Tài khoản gửi:</span>
                  <span className="font-bold block">{selectedTx.sender_account || "N/A"}</span>
                  <span className="text-[10px] text-muted-foreground">{selectedTx.sender_bank_name || ""}</span>
                </div>

                <div className="p-2.5 bg-muted/40 rounded-lg">
                  <span className="text-muted-foreground block">Tài khoản nhận:</span>
                  <span className="font-bold block">{selectedTx.receiver_account}</span>
                  <span className="text-[10px] text-muted-foreground">{selectedTx.receiver_bank_name}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" onClick={() => setSelectedTx(null)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 6. Bank Configuration Modal */}
      {configModalOpen && (
        <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm font-bold">
                <Landmark className="size-4 text-primary" />
                Thông Tin Tài Khoản BIDV Hệ Thống
              </DialogTitle>
              <DialogDescription className="text-xs">
                Cấu hình nhận thanh toán và webhook biến động số dư.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-2 p-3 bg-muted/50 rounded-xl border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ngân hàng:</span>
                  <span className="font-bold text-foreground">BIDV (Ngân hàng TMCP Đầu tư và Phát triển VN)</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Số tài khoản:</span>
                  <div className="flex items-center gap-1.5 font-mono font-extrabold text-foreground">
                    <span>{bankConfig?.accountNumber || "6240247363"}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(bankConfig?.accountNumber || "6240247363", "Số tài khoản")}
                      className="p-1 hover:bg-muted rounded text-muted-foreground"
                    >
                      {copiedField === "Số tài khoản" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Chủ tài khoản:</span>
                  <span className="font-bold text-foreground">{bankConfig?.accountName || "FOODSAVER"}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cổng kết nối:</span>
                  <span className="font-bold text-emerald-700">xGate Public REST API</span>
                </div>
              </div>

              <div className="space-y-1.5 border p-3 rounded-xl bg-card">
                <span className="font-semibold block text-muted-foreground">URL Webhook Nhận Biến Động Số Dư:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2.5 py-1.5 rounded text-[11px] flex-1 break-all font-mono">
                    https://api.foodsaver.voxelle.io.vn/api/v1/payments/webhook
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy("https://api.foodsaver.voxelle.io.vn/api/v1/payments/webhook", "URL Webhook")}
                    className="p-1.5 hover:bg-muted rounded border text-muted-foreground"
                  >
                    {copiedField === "URL Webhook" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  </button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" onClick={() => setConfigModalOpen(false)}>
                Hoàn tất
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
