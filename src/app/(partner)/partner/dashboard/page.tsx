"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  DollarSign,
  Leaf,
  ShoppingBag,
  PlusCircle,
  ArrowRight,
  Clock,
  Loader2,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Building,
  CreditCard,
  ShieldAlert,
  X,
} from "lucide-react";
import { ExpiryCountdown } from "@/components/common/ExpiryCountdown";
import { useGetPartnerListingsQuery } from "@/redux/api/listingApi";
import {
  useGetPartnerOrdersQuery,
  useGetPartnerFinanceSummaryQuery,
  useRequestPayoutMutation,
} from "@/redux/api/orderApi";
import { toast } from "sonner";

export default function PartnerDashboardPage() {
  const { data: realListings, isLoading: isListingsLoading } = useGetPartnerListingsQuery();
  const { data: realOrders, isLoading: isOrdersLoading } = useGetPartnerOrdersQuery();
  const { data: financeSummary, isLoading: isFinanceLoading, refetch: refetchFinance } = useGetPartnerFinanceSummaryQuery();
  const [requestPayoutMutation, { isLoading: isRequestingPayout }] = useRequestPayoutMutation();

  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(100000);
  const [bankName, setBankName] = useState("Vietcombank");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");

  const listings = realListings || [];
  const orders = realOrders || [];

  const completedOrders = orders.filter((order) => order.status === "COMPLETED");
  const totalSavedCount = completedOrders.reduce((total, order) => total + order.quantity, 0);
  const totalRevenue = completedOrders.reduce((total, order) => total + order.totalPrice, 0);
  const totalCo2Avoided = Math.round(totalSavedCount * 2.5);
  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING").length;
  const completedOrdersDescription = completedOrders.length > 0
    ? `Từ ${completedOrders.length} đơn hoàn tất`
    : "Chưa có đơn hoàn tất";

  const stats = [
    {
      title: "Suất ăn đã cứu",
      value: `${totalSavedCount} suất`,
      change: completedOrdersDescription,
      icon: UtensilsCrossed,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "Doanh thu hoàn tất",
      value: `${totalRevenue.toLocaleString("vi-VN")}đ`,
      change: completedOrdersDescription,
      icon: DollarSign,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: "CO2 giảm phát thải",
      value: `${totalCo2Avoided.toLocaleString("vi-VN")} kg`,
      change: completedOrders.length > 0 ? "Ước tính từ đơn hoàn tất" : "Chưa có dữ liệu ước tính",
      icon: Leaf,
      color: "bg-[#79e4a7]/20 text-[#00615f] border-[#79e4a7]/40",
    },
    {
      title: "Đơn mới cần duyệt",
      value: `${pendingOrdersCount} đơn`,
      change: pendingOrdersCount > 0 ? "Cần xác nhận chuẩn bị" : "Đã xử lý hết",
      icon: ShoppingBag,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  const availableBalance = financeSummary?.availableBalance || 0;
  const pendingBalance = financeSummary?.pendingBalance || 0;
  const cashDebtBalance = financeSummary?.cashDebtBalance || 0;
  const debtLimit = financeSummary?.debtLimit || 500000;
  const debtPercent = Math.min(100, Math.round((cashDebtBalance / debtLimit) * 100));

  const handleOpenPayout = () => {
    if (availableBalance < 50000) {
      toast.error("Số dư khả dụng tối thiểu để rút tiền là 50.000đ!");
      return;
    }
    setPayoutAmount(Math.min(availableBalance, 100000));
    setPayoutModalOpen(true);
  };

  const handleSubmitPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmount < 50000) {
      toast.error("Số tiền rút tối thiểu là 50.000đ!");
      return;
    }
    if (payoutAmount > availableBalance) {
      toast.error("Số tiền rút không được vượt quá số dư khả dụng!");
      return;
    }
    if (!bankAccountNo.trim() || !bankAccountName.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin tài khoản ngân hàng!");
      return;
    }

    try {
      await requestPayoutMutation({
        amount: payoutAmount,
        bankName,
        bankAccountNo: bankAccountNo.trim(),
        bankAccountName: bankAccountName.trim().toUpperCase(),
      }).unwrap();

      toast.success("✓ Đã gửi yêu cầu rút tiền thành công! Hệ thống đang xử lý đối soát.");
      setPayoutModalOpen(false);
      refetchFinance();
    } catch (err: any) {
      toast.error(err?.data?.message || "Yêu cầu rút tiền thất bại");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
            Tổng quan đối tác
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Theo dõi hiệu quả giải cứu thực phẩm, đơn hàng và quản lý tài chính kế toán kép minh bạch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenPayout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-[#00615f] hover:bg-stone-50 text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Wallet className="size-4" />
            <span>Rút tiền (Payout)</span>
          </button>

          <Link
            href="/partner/listings/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all shrink-0 active:scale-95"
          >
            <PlusCircle className="size-4" />
            <span>Đăng món giải cứu mới</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500">{stat.title}</span>
                <div className={`p-2 rounded-xl border ${stat.color}`}>
                  <Icon className="size-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-stone-900 tracking-tight">
                  {stat.value}
                </span>
                <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Overview (Double-Entry Ledger & Cash Debt) */}
      <div className="bg-gradient-to-br from-[#004e4c] to-[#00615f] rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Wallet className="size-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                Tài Chính & Ký Quỹ Đối Tác (Double-Entry Ledger)
              </h2>
              <p className="text-xs text-emerald-100">
                Minh bạch dòng tiền: Escrow giữ hộ từ đơn Online & Ghi nợ phí dịch vụ từ đơn Tiền mặt.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenPayout}
            className="px-5 py-2.5 rounded-2xl bg-white text-[#00615f] hover:bg-emerald-50 text-xs font-black shadow-md transition active:scale-95 flex items-center gap-2 self-start sm:self-auto"
          >
            <ArrowUpRight className="size-4" />
            <span>Yêu cầu rút tiền về ngân hàng</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Số dư khả dụng */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-1">
            <span className="text-xs text-emerald-200 font-bold block">
              Số dư khả dụng (Có thể rút ngay)
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              {availableBalance.toLocaleString("vi-VN")}đ
            </div>
            <p className="text-[11px] text-emerald-200/80">
              Tiền từ đơn online đã hoàn tất đối soát sau khi trừ 10% phí dịch vụ.
            </p>
          </div>

          {/* Card 2: Ký quỹ chờ đối soát */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-1">
            <span className="text-xs text-emerald-200 font-bold block">
              Ký quỹ chờ đối soát (Pending Escrow)
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-300">
              {pendingBalance.toLocaleString("vi-VN")}đ
            </div>
            <p className="text-[11px] text-emerald-200/80">
              Đang giữ trong Escrow. Tự động chuyển vào số dư khả dụng khi khách bấm nhận hàng.
            </p>
          </div>

          {/* Card 3: Nợ phí dịch vụ tiền mặt */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-200 font-bold">
                Nợ phí dịch vụ đơn tiền mặt (Receivable)
              </span>
              {debtPercent >= 80 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-900/50 px-2 py-0.5 rounded-md">
                  <AlertTriangle className="size-3" /> Cảnh báo
                </span>
              )}
            </div>

            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              {cashDebtBalance.toLocaleString("vi-VN")}đ
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    debtPercent >= 80 ? "bg-amber-400" : "bg-emerald-300"
                  }`}
                  style={{ width: `${debtPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-emerald-200/80">
                <span>Đã nợ: {debtPercent}%</span>
                <span>Hạn mức tối đa: {debtLimit.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="text-[11px] text-emerald-200/70 italic">
          * Ghi chú quy chuẩn tài chính: Với đơn tiền mặt (COD), quán thu 100% tiền từ khách và được hệ thống ghi nhận nợ 10% phí dịch vụ. Quán có thể thanh toán bù trừ tự động bằng số dư khả dụng.
        </p>
      </div>

      {/* 2 Blocks: Món cận date cần lưu ý & Đơn hàng mới */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Món đang bán & sắp hết hạn (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-stone-900">
              Món ăn đang mở bán hôm nay
            </h2>
            <Link
              href="/partner/listings"
              className="text-xs font-bold text-[#00615f] hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {listings.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/60 gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                    <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-stone-900 line-clamp-1">
                      {item.title}
                    </h3>
                    <span className="text-[11px] text-stone-500">
                      Còn {item.quantity} {item.unit} • {item.discountPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <ExpiryCountdown expiryAt={item.expiryAt} compact />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Đơn hàng mới (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-stone-900">
              Đơn hàng cần chuẩn bị
            </h2>
            <Link
              href="/partner/orders"
              className="text-xs font-bold text-[#00615f] hover:underline flex items-center gap-1"
            >
              <span>Xem đơn</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-800">
                    #{order.orderNumber}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    {order.status}
                  </span>
                </div>
                <p className="font-bold text-xs text-stone-800 line-clamp-1">
                  {order.listingTitle} ({order.quantity} suất)
                </p>
                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-emerald-100/60">
                  <span>Khách: {order.customerName}</span>
                  <span className="font-black text-[#00615f]">
                    {order.totalPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Yêu Cầu Rút Tiền (Payout Request) */}
      {payoutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPayoutModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2 text-[#00615f] font-extrabold text-base">
                <Building className="size-5" />
                <span>Rút tiền về tài khoản ngân hàng</span>
              </div>
              <button
                type="button"
                onClick={() => setPayoutModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:bg-stone-100 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 space-y-1 text-xs text-emerald-900">
              <div className="flex justify-between font-bold">
                <span>Số dư khả dụng hiện có:</span>
                <span className="text-[#00615f] font-mono text-sm">{availableBalance.toLocaleString("vi-VN")}đ</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Mức rút tối thiểu: 50.000đ. Hệ thống đối soát tự động qua NAPAS 247.
              </p>
            </div>

            <form onSubmit={handleSubmitPayout} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Số tiền muốn rút (VNĐ):
                </label>
                <input
                  type="number"
                  required
                  min={50000}
                  max={availableBalance}
                  step={10000}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-black text-[#00615f] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Ngân hàng thụ hưởng:
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800"
                >
                  <option value="Vietcombank">Vietcombank - TMCP Ngoại Thương</option>
                  <option value="MBBank">MBBank - Quân Đội</option>
                  <option value="Techcombank">Techcombank - Kỹ Thương</option>
                  <option value="ACB">ACB - Á Châu</option>
                  <option value="VPBank">VPBank - Việt Nam Thịnh Vượng</option>
                  <option value="Vietinbank">Vietinbank - Công Thương</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Số tài khoản ngân hàng:
                </label>
                <input
                  type="text"
                  required
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  placeholder="Nhập số tài khoản ngân hàng"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Tên chủ tài khoản (Không dấu):
                </label>
                <input
                  type="text"
                  required
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                  placeholder="VD: NGUYEN VAN A"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono font-bold uppercase text-stone-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isRequestingPayout || availableBalance < 50000}
                  className="px-5 py-2.5 text-xs font-bold bg-[#00615f] hover:bg-[#089184] text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isRequestingPayout ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-3.5" />
                  )}
                  <span>Xác nhận rút {payoutAmount.toLocaleString("vi-VN")}đ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
