"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  QrCode,
  XCircle,
  Star,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Lock,
  Truck,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  KeyRound,
  Check,
  PackageCheck,
  ShieldAlert,
} from "lucide-react";
import {
  useGetOrderByIdQuery,
  useCancelOrderMutation,
  useLockOrderMutation,
  useCustomerConfirmReceiptMutation,
  useGetOrderReviewQuery,
  useCreateOrderReviewMutation,
  useCreateSafetyReportMutation,
  useGetOrderSafetyReportQuery,
  useVerifyOrderPaymentMutation,
} from "@/redux/api/orderApi";
import { SafetyReportIssueType } from "@/types/contract";
import { OrderChatModal } from "@/components/common/OrderChatModal";
import { toast } from "sonner";
import { useSocket } from "@/context/SocketContext";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  // Fetch real order from backend
  const { data: realOrder, isLoading, refetch } = useGetOrderByIdQuery(resolvedParams.id);
  const order = realOrder;

  const [cancelOrderMutation, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [lockOrderMutation] = useLockOrderMutation();
  const [confirmReceiptMutation, { isLoading: isConfirmingReceipt }] = useCustomerConfirmReceiptMutation();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Bận đột xuất không kịp ghé lấy");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [hygieneChecked, setHygieneChecked] = useState(true);

  // Safety report modal states
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [safetyIssueType, setSafetyIssueType] = useState<SafetyReportIssueType>("EXPIRED_FOOD");
  const [safetyDescription, setSafetyDescription] = useState("");
  const [safetyEvidenceUrl, setSafetyEvidenceUrl] = useState("");

  const [verifyOrderPayment, { isLoading: isVerifyingPayment }] = useVerifyOrderPaymentMutation();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handlePaymentSuccess = (data: any) => {
      if (data?.orderId === order?.id || data?.orderNumber === order?.orderNumber) {
        toast.success("🎉 Đã nhận được thanh toán chuyển khoản thành công!");
        refetch();
      }
    };
    socket.on("PAYMENT_SUCCESS", handlePaymentSuccess);
    return () => {
      socket.off("PAYMENT_SUCCESS", handlePaymentSuccess);
    };
  }, [socket, order?.id, order?.orderNumber, refetch]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`Đã sao chép ${field}!`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleManualVerify = async () => {
    if (!order) return;
    try {
      const res = await verifyOrderPayment(order.id).unwrap();
      if (res.verified) {
        toast.success("✓ Đã xác nhận thanh toán thành công từ ngân hàng BIDV!");
        refetch();
      } else {
        toast.info(res.message || "Chưa tìm thấy giao dịch ngân hàng. Vui lòng kiểm tra lại sau vài giây.");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể kiểm tra giao dịch lúc này");
    }
  };

  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [isLockedState, setIsLockedState] = useState(false);

  useEffect(() => {
    if (!order || isLockedState) return;

    if (countdownSeconds > 0) {
      const timer = setTimeout(() => {
        setCountdownSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    setIsLockedState(true);
    lockOrderMutation(order.id).unwrap().catch(() => {});
  }, [countdownSeconds, isLockedState, order, lockOrderMutation]);

  useEffect(() => {
    if (!order) return;
    setIsLockedState(order.isLocked);
    if (order.isLocked) {
      setCountdownSeconds(0);
      return;
    }
    const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
    setCountdownSeconds(Math.max(0, 5 - elapsed));
  }, [order]);


  
  // Real review queries and mutations (top-level hook)
  const { data: reviewData, refetch: refetchReview } = useGetOrderReviewQuery(resolvedParams.id || "", {
    skip: !resolvedParams.id || order?.status !== "COMPLETED",
  });
  const [createOrderReviewMutation, { isLoading: isSubmittingReview }] = useCreateOrderReviewMutation();

  // Real food safety report query & mutation (top-level hook)
  const { data: safetyReport, refetch: refetchSafetyReport } = useGetOrderSafetyReportQuery(resolvedParams.id || "", {
    skip: !resolvedParams.id,
  });
  const [createSafetyReportMutation, { isLoading: isSubmittingSafetyReport }] = useCreateSafetyReportMutation();

  if (isLoading && !order) {
    return (
      <div className="min-h-screen bg-[#f9f3f0] flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#00615f] font-bold text-sm">
          <Loader2 className="size-6 animate-spin" />
          <span>Đang tải thông tin đơn hàng...</span>
        </div>
      </div>
    );
  }

  if (!order) return notFound();

  const orderStatus = order.status;
  const isPickup = order.fulfillmentType === "PICKUP" || order.fulfillmentType === "STORE_PICKUP";

  const handleCancelOrder = async () => {
    if (isLockedState || order.isLocked) {
      toast.error("Đơn hàng đã khóa sau 5s chốt giá, bạn không được hủy đơn ở bước này nữa!");
      return;
    }
    try {
      await cancelOrderMutation({
        id: order.id,
        reason: cancelReason,
      }).unwrap();
      setCancelModalOpen(false);
      toast.info("Đã hủy đơn hàng thành công.");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể hủy đơn hàng");
    }
  };

  const handleCustomerConfirmReceipt = async () => {
    try {
      await confirmReceiptMutation({
        id: order.id,
        note: "Khách hàng xác nhận đã nhận đủ món",
      }).unwrap();
      toast.success("✓ Xác nhận nhận hàng thành công! Đơn hàng đã hoàn tất.");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Xác nhận nhận hàng thất bại");
    }
  };

  // Real review queries and mutations
  

  const currentReview = order?.review || reviewData?.review;

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    try {
      await createOrderReviewMutation({
        orderId: order.id,
        rating,
        comment: reviewText.trim() || undefined,
        packagingClean: hygieneChecked,
      }).unwrap();
      setReviewModalOpen(false);
      toast.success("✓ Đã gửi đánh giá thành công! Cảm ơn ý kiến của bạn.");
      refetch();
      refetchReview();
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể gửi đánh giá. Vui lòng thử lại");
    }
  };

  // Real food safety report query & mutation
  

  const handleSafetyReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    if (safetyDescription.trim().length < 10) {
      toast.error("Vui lòng mô tả chi tiết sự cố gặp phải (ít nhất 10 ký tự)");
      return;
    }
    try {
      await createSafetyReportMutation({
        orderId: order.id,
        issueType: safetyIssueType,
        description: safetyDescription.trim(),
        evidenceUrls: safetyEvidenceUrl.trim() ? [safetyEvidenceUrl.trim()] : [],
      }).unwrap();
      setSafetyModalOpen(false);
      setSafetyDescription("");
      setSafetyEvidenceUrl("");
      toast.success("✓ Đã gửi báo cáo sự cố ATTP tới Ban Quản Trị để thẩm định");
      refetch();
      refetchSafetyReport();
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể gửi báo cáo sự cố");
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-24 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00615f] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Danh sách đơn của bạn
          </Link>

          <button
            type="button"
            onClick={() => setChatModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#00615f] shadow-sm hover:bg-stone-50 transition"
          >
            <MessageSquare className="size-3.5 text-[#00615f]" />
            <span>Nhắn tin với quán</span>
          </button>
        </div>

        {/* 5-second countdown lock banner */}
        {!isLockedState && countdownSeconds > 0 && (
          <div className="bg-amber-500 text-white p-4 rounded-3xl shadow-lg flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Clock className="size-5 shrink-0" />
              <span>Thời gian xác nhận chốt đơn: Bạn còn <strong>{countdownSeconds} giây</strong> để thay đổi</span>
            </div>
            <span className="font-mono font-black text-lg bg-white/20 px-3 py-1 rounded-xl">0{countdownSeconds}s</span>
          </div>
        )}

        {isLockedState && orderStatus !== "CANCELLED" && (
          <div className="bg-stone-900 text-white p-3.5 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-md">
            <Lock className="size-4 text-emerald-400 shrink-0" />
            <span>Đơn hàng đã được khóa tự động sau 5s chốt giá (Không được hủy ở bước này nữa).</span>
          </div>
        )}

        {/* Notification banner when Partner has handed over */}
        {orderStatus === "HANDED_OVER" && (
          <div className="bg-emerald-600 text-white p-4 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <PackageCheck className="size-8 shrink-0 text-emerald-200" />
              <div>
                <h3 className="font-extrabold text-sm sm:text-base">Quán đã bàn giao món ăn!</h3>
                <p className="text-xs text-emerald-100">
                  Vui lòng kiểm tra kỹ món ăn và bấm nút xác nhận dưới đây để hoàn tất đơn hàng.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isConfirmingReceipt}
              onClick={handleCustomerConfirmReceipt}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-black shadow-md transition flex items-center justify-center gap-2 shrink-0"
            >
              {isConfirmingReceipt ? (
                <Loader2 className="size-4 animate-spin text-emerald-700" />
              ) : (
                <Check className="size-4 text-emerald-700" />
              )}
              <span>✓ Tôi đã nhận đủ món (Xác nhận hoàn tất)</span>
            </button>
          </div>
        )}

        {/* Safety Report Status Banner */}
        {safetyReport && (
          <div
            className={`p-5 rounded-3xl border shadow-sm space-y-3 ${
              safetyReport.status === "RESOLVED"
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                : safetyReport.status === "REJECTED"
                ? "bg-stone-100 border-stone-200 text-stone-800"
                : "bg-amber-50/90 border-amber-200 text-amber-950"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert
                  className={`size-5 shrink-0 ${
                    safetyReport.status === "RESOLVED"
                      ? "text-emerald-700"
                      : safetyReport.status === "REJECTED"
                      ? "text-stone-600"
                      : "text-amber-700"
                  }`}
                />
                <span className="font-extrabold text-xs sm:text-sm">
                  🛡️ Báo cáo sự cố ATTP #{safetyReport.reportNumber}
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-3 py-1 rounded-full inline-block w-fit ${
                  safetyReport.status === "RESOLVED"
                    ? "bg-emerald-200 text-emerald-900"
                    : safetyReport.status === "REJECTED"
                    ? "bg-stone-200 text-stone-800"
                    : safetyReport.status === "REVIEWING"
                    ? "bg-sky-200 text-sky-900"
                    : "bg-amber-200 text-amber-900"
                }`}
              >
                {safetyReport.status === "OPEN" && "Đang tiếp nhận xử lý"}
                {safetyReport.status === "REVIEWING" && "Đang thẩm định & làm việc với quán"}
                {safetyReport.status === "RESOLVED" && "Đã xử lý & kết luận"}
                {safetyReport.status === "REJECTED" && "Đã bác bỏ khiếu nại"}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-700 italic">
              &ldquo;Lý do: {safetyReport.description}&rdquo;
            </p>

            {safetyReport.resolution && (
              <div className="p-3.5 bg-white/90 rounded-2xl border border-stone-200 text-xs sm:text-sm text-stone-800 space-y-1">
                <strong className="text-emerald-800 font-bold block">Kết luận từ Ban Quản Trị FoodSaver:</strong>
                <p className="leading-relaxed">{safetyReport.resolution}</p>
              </div>
            )}
          </div>
        )}

        {/* Card chính */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm text-center space-y-4">
          <div
            className={`size-14 rounded-full flex items-center justify-center mx-auto ${
              orderStatus === "CANCELLED" || orderStatus === "REJECTED" || orderStatus === "EXPIRED"
                ? "bg-rose-100 text-rose-700"
                : orderStatus === "COMPLETED"
                ? "bg-emerald-100 text-emerald-700"
                : orderStatus === "HANDED_OVER"
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {orderStatus === "CANCELLED" || orderStatus === "REJECTED" || orderStatus === "EXPIRED" ? (
              <XCircle className="size-8" />
            ) : (
              <CheckCircle2 className="size-8" />
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#00615f]">
              {orderStatus === "CANCELLED"
                ? "Đơn Hàng Đã Bị Hủy"
                : orderStatus === "REJECTED"
                ? "Quán Đã Từ Chối Đơn"
                : orderStatus === "EXPIRED"
                ? "Đơn Hàng Đã Quá Hạn (No-Show)"
                : orderStatus === "HANDED_OVER"
                ? "Quán Đã Bàn Giao Món"
                : orderStatus === "COMPLETED"
                ? "Đơn Hàng Đã Hoàn Tất!"
                : orderStatus === "READY"
                ? "Món Đã Sẵn Sàng - Hãy Đến Lấy!"
                : orderStatus === "ACCEPTED" || orderStatus === "PREPARING"
                ? "Quán Đang Chuẩn Bị Món"
                : "Đặt Giữ Món Thành Công!"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Mã đơn hàng:{" "}
              <strong className="font-mono text-stone-900">#{order.orderNumber}</strong>
            </p>
          </div>

          {/* OTP Code Box for Store Pickup */}
          {isPickup && order.pickupOtp && orderStatus !== "CANCELLED" && orderStatus !== "REJECTED" && orderStatus !== "EXPIRED" && (
            <div className="bg-emerald-50 border-2 border-emerald-200 p-5 rounded-3xl max-w-sm mx-auto text-center space-y-2 shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
                <KeyRound className="size-4 text-emerald-600" />
                <span>MÃ OTP LẤY MÓN TẠI QUẦY</span>
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-black text-[#00615f] tracking-widest bg-white py-2 px-4 rounded-2xl border border-emerald-100 shadow-inner">
                {order.pickupOtp}
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">
                Đọc mã 6 số này cho nhân viên quán để xác thực bàn giao món ăn.
              </p>
            </div>
          )}

          {/* Online Payment Card (VietQR + Bank Info + Manual Verify Button) */}
          {(order.paymentMethod === "SYSTEM_QR" || order.paymentMethod === "ONLINE") &&
            orderStatus !== "CANCELLED" &&
            orderStatus !== "REJECTED" &&
            orderStatus !== "EXPIRED" && (
              <div className="rounded-3xl border p-5 sm:p-6 space-y-4 max-w-xl mx-auto text-left shadow-sm transition-all bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 border-emerald-200">
                {order.paymentStatus === "PAID" || order.paymentStatus === "ESCROW_HELD" || order.paymentStatus === "SETTLED" ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-100/80 border border-emerald-300 text-emerald-900">
                    <CheckCircle2 className="size-6 text-emerald-700 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-emerald-900">
                        ✓ ĐÃ THANH TOÁN THÀNH CÔNG (KÝ QUỸ ESCROW)
                      </h4>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Số tiền {order.totalPrice.toLocaleString("vi-VN")}đ đã được thanh toán và bảo vệ bởi FoodSaver Escrow. Tiền chỉ được giải ngân cho quán sau khi bạn nhận món thành công.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="size-2.5 rounded-full bg-amber-500 animate-pulse" />
                          <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
                            Thanh toán VietQR Ký Quỹ Escrow
                          </h3>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Quét mã bằng app ngân hàng (BIDV, VCB, TCB...) hoặc ví MoMo, ZaloPay
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full w-fit">
                        <Clock className="size-3 text-amber-700" />
                        <span>Chờ thanh toán</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      {/* Cột trái: QR Code Image */}
                      <div className="sm:col-span-5 flex flex-col items-center text-center p-3 bg-white rounded-2xl border border-emerald-200 shadow-xs">
                        <div className="relative size-44 bg-white p-2 rounded-xl border border-stone-200 flex items-center justify-center">
                          <img
                            src={`https://api.vietqr.io/image/970418-6240247363-compact2.png?amount=${order.totalPrice}&addInfo=${order.orderNumber}&accountName=NGUYEN%20QUANG%20DUC`}
                            alt="Mã QR thanh toán VietQR"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-stone-500 mt-2">
                          Tự động điền số tiền & nội dung
                        </span>
                      </div>

                      {/* Cột phải: Thông tin tài khoản & nút copy */}
                      <div className="sm:col-span-7 space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                          <span className="text-[10px] text-stone-400 font-bold block">NGÂN HÀNG THỤ HƯỞNG</span>
                          <span className="font-black text-stone-900 text-xs sm:text-sm">BIDV (Chi nhánh Đà Nẵng)</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-stone-400 font-bold block">SỐ TÀI KHOẢN</span>
                            <span className="font-mono font-black text-[#00615f] text-xs sm:text-sm">6240247363</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy("6240247363", "Số tài khoản")}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[10px] transition cursor-pointer"
                          >
                            {copiedField === "Số tài khoản" ? "Đã chép ✓" : "Sao chép"}
                          </button>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                          <span className="text-[10px] text-stone-400 font-bold block">CHỦ TÀI KHOẢN</span>
                          <span className="font-bold text-stone-900 text-xs">NGUYEN QUANG DUC</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-stone-400 font-bold block">SỐ TIỀN CẦN CHUYỂN</span>
                            <span className="font-black text-emerald-700 text-xs sm:text-sm">
                              {order.totalPrice.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(String(order.totalPrice), "Số tiền")}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[10px] transition cursor-pointer"
                          >
                            {copiedField === "Số tiền" ? "Đã chép ✓" : "Sao chép"}
                          </button>
                        </div>

                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-amber-700 font-bold block">NỘI DUNG CHUYỂN KHOẢN (BẮT BUỘC)</span>
                            <span className="font-mono font-black text-amber-900 text-xs sm:text-sm">
                              {order.orderNumber}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(order.orderNumber, "Nội dung chuyển khoản")}
                            className="px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold text-[10px] transition cursor-pointer"
                          >
                            {copiedField === "Nội dung chuyển khoản" ? "Đã chép ✓" : "Sao chép"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                      <button
                        type="button"
                        disabled={isVerifyingPayment}
                        onClick={handleManualVerify}
                        className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {isVerifyingPayment ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="size-4" />
                        )}
                        <span>{isVerifyingPayment ? "Đang kiểm tra từ ngân hàng..." : "Tôi đã chuyển tiền - Kiểm tra ngay"}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500 italic text-center">
                      * Hệ thống tự động xác nhận sau 2-5 giây khi xGate nhận thông báo từ ngân hàng.
                    </p>
                  </>
                )}
              </div>
            )}

          {/* COD QR Code */}
          {order.paymentMethod === "COD" &&
            orderStatus !== "CANCELLED" &&
            orderStatus !== "REJECTED" &&
            orderStatus !== "EXPIRED" && (
              <div className="bg-stone-50 border border-stone-200 p-6 rounded-3xl max-w-xs mx-auto space-y-3">
                <div className="size-44 bg-white p-3 mx-auto rounded-2xl border border-stone-300 shadow-inner flex flex-col items-center justify-center">
                  <QrCode className="size-32 text-stone-800" />
                  <span className="font-mono text-[10px] font-bold text-stone-500 tracking-widest mt-1">
                    {order.pickupQrCode || order.orderNumber}
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium">
                  {isPickup
                    ? "Đưa mã QR cho nhân viên quét khi nhận đồ"
                    : "Mã nhận hàng đối soát với quán khi giao (COD)"}
                </p>
              </div>
            )}

          {/* Chi tiết đơn */}
          <div className="text-left border-t border-stone-100 pt-5 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between py-1">
              <span className="text-stone-500">Món ăn:</span>
              <span className="font-bold text-stone-900 text-right">{order.listingTitle}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-stone-500">Cửa hàng:</span>
              <span className="font-bold text-stone-900 text-right">{order.partnerName}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-stone-500">Hình thức nhận:</span>
              <span className="font-bold text-[#00615f] flex items-center gap-1">
                {isPickup ? (
                  <>
                    <ShoppingBag className="size-3.5" /> Tới quán lấy (Store Pickup)
                  </>
                ) : (
                  <>
                    <Truck className="size-3.5" /> Quán tự giao hàng (Partner Delivery)
                  </>
                )}
              </span>
            </div>

            {isPickup ? (
              <div className="flex justify-between py-1">
                <span className="text-stone-500">Địa chỉ lấy đồ:</span>
                <span className="font-bold text-stone-900 text-right max-w-xs">
                  {order.partnerAddress || "Địa chỉ quán"}
                </span>
              </div>
            ) : (
              order.deliveryAddress && (
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Địa chỉ giao:</span>
                  <span className="font-bold text-stone-900 text-right max-w-xs truncate">
                    {order.deliveryAddress}
                  </span>
                </div>
              )
            )}

            <div className="flex justify-between py-1">
              <span className="text-stone-500">Khung giờ hẹn:</span>
              <span className="font-bold text-stone-900">{order.pickupTimeWindow}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-stone-500">Phương thức thanh toán:</span>
              <span className="font-bold text-stone-900">
                {order.paymentMethod === "SYSTEM_QR" || order.paymentMethod === "ONLINE"
                  ? "Trực tuyến (ONLINE - Ký quỹ Escrow)"
                  : "Tiền mặt khi nhận (CASH / COD)"}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-stone-500">Số lượng:</span>
              <span className="font-bold text-stone-900">{order.quantity} phần</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-stone-500">Tiền món ăn:</span>
              <span>{(order.merchandiseTotal || (order.unitPrice * order.quantity)).toLocaleString("vi-VN")}đ</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-stone-500">Phí giao hàng (100% thuộc quán):</span>
              <span className="font-bold text-stone-900">
                {order.shippingFee > 0 ? `${order.shippingFee.toLocaleString("vi-VN")}đ` : "0đ (Tự lấy)"}
              </span>
            </div>

            {order.discountAmount ? (
              <div className="flex justify-between py-1 text-emerald-700">
                <span>Mã giảm giá ({order.discountCode || "Khuyến mãi"}):</span>
                <span>-{order.discountAmount.toLocaleString("vi-VN")}đ</span>
              </div>
            ) : null}

            <div className="flex justify-between py-2 border-t border-stone-100 text-base font-black">
              <span>Tổng thanh toán:</span>
              <span className="text-[#00615f]">{order.totalPrice.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>

          {/* Hiển thị đánh giá đã lưu nếu có */}
          {currentReview && (
            <div className="p-5 rounded-3xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-white shadow-xs border border-emerald-100 text-[#00615f] flex items-center justify-center">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900">Đánh giá của bạn về đơn hàng</h4>
                    <span className="text-[11px] text-stone-400">
                      {new Date(currentReview.createdAt).toLocaleDateString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`size-4 ${
                        s <= currentReview.rating ? "text-amber-400 fill-amber-400" : "text-stone-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {currentReview.packagingClean && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#00615f] text-xs font-semibold border border-emerald-100 shadow-2xs">
                  <Check className="size-3.5 text-emerald-600" />
                  <span>Bao bì đóng gói sạch sẽ, đảm bảo vệ sinh ATTP</span>
                </div>
              )}
              {currentReview.comment && (
                <p className="text-xs sm:text-sm text-stone-700 bg-white rounded-2xl p-3.5 border border-stone-100 italic leading-relaxed">
                  &ldquo;{currentReview.comment}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setChatModalOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="size-3.5 text-[#00615f]" />
                <span>Nhắn tin với quán</span>
              </button>

              <a
                href="tel:02838383838"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Phone className="size-3.5 text-[#00615f]" />
                <span>Hotline</span>
              </a>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {orderStatus === "PENDING" && !isLockedState && (
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setCancelModalOpen(true)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition"
                >
                  {isCancelling ? "Đang hủy..." : "Hủy đơn này"}
                </button>
              )}

              {orderStatus === "HANDED_OVER" && (
                <button
                  type="button"
                  disabled={isConfirmingReceipt}
                  onClick={handleCustomerConfirmReceipt}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Xác nhận đã nhận món</span>
                </button>
              )}

              {orderStatus === "COMPLETED" && !currentReview && (
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(true)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Star className="size-3.5" />
                  <span>Đánh giá món ăn</span>
                </button>
              )}

              {["HANDED_OVER", "COMPLETED", "DISPUTED"].includes(orderStatus) && !safetyReport && (
                <button
                  type="button"
                  onClick={() => setSafetyModalOpen(true)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="size-3.5 text-amber-700" />
                  <span>Báo sự cố ATTP</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Hủy Đơn */}
      {cancelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setCancelModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-rose-700 font-extrabold text-sm">
              <AlertCircle className="size-5" />
              <span>Xác nhận hủy đơn</span>
            </div>

            <p className="text-xs text-stone-600">
              Vui lòng cho quán biết lý do bạn muốn hủy đơn:
            </p>

            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800"
            >
              <option value="Bận đột xuất không kịp nhận">Bận đột xuất không kịp nhận</option>
              <option value="Phí ship thương lượng chưa phù hợp">Phí ship thương lượng chưa phù hợp</option>
              <option value="Đặt nhầm món hoặc số lượng">Đặt nhầm món hoặc số lượng</option>
              <option value="Lý do khác">Lý do khác</option>
            </select>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Giữ lại đơn
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đánh giá chất lượng ATTP */}
      {reviewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setReviewModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="size-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="font-extrabold text-stone-900 text-base">
                Đánh giá chất lượng vệ sinh ATTP
              </h3>
              <p className="text-xs text-stone-500">
                Ý kiến của bạn giúp cộng đồng yên tâm giải cứu thực phẩm an toàn.
              </p>
            </div>

            <form onSubmit={handleReview} className="space-y-4">
              <div className="flex items-center justify-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`size-7 ${
                        star <= rating ? "text-amber-400 fill-amber-400" : "text-stone-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                  <input
                    type="checkbox"
                    checked={hygieneChecked}
                    onChange={(e) => setHygieneChecked(e.target.checked)}
                    className="size-4 accent-[#00615f]"
                  />
                  <span>Bao bì đóng gói sạch sẽ, đảm bảo vệ sinh</span>
                </label>
              </div>

              <div>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Chia sẻ cảm nhận về độ tươi ngon của món ăn..."
                  className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-500 hover:bg-stone-100 rounded-xl"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-4 py-2 text-xs font-bold bg-[#00615f] hover:bg-[#089184] text-white rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingReview && <Loader2 className="size-3.5 animate-spin" />}
                  <span>{isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Báo Cáo Sự Cố An Toàn Thực Phẩm */}
      {safetyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSafetyModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-amber-700 font-extrabold text-sm sm:text-base">
              <ShieldAlert className="size-5 shrink-0" />
              <span>Báo Cáo Sự Cố An Toàn Thực Phẩm</span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              FoodSaver ưu tiên sức khỏe và an toàn của bạn trên hết. Vui lòng cung cấp chi tiết sự cố để Ban Quản Trị thẩm tra ngay lập tức.
            </p>

            <form onSubmit={handleSafetyReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Phân loại sự cố <span className="text-rose-500">*</span>
                </label>
                <select
                  value={safetyIssueType}
                  onChange={(e) => setSafetyIssueType(e.target.value as SafetyReportIssueType)}
                  className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="EXPIRED_FOOD">Món ăn đã hết hạn / biến chất</option>
                  <option value="STRANGE_ODOR_MOLD">Có mùi lạ, dấu hiệu ôi thiu hoặc mốc</option>
                  <option value="DAMAGED_PACKAGING">Hộp / bao bì rách, hở niêm phong</option>
                  <option value="FOREIGN_OBJECT">Có dị vật bất thường trong món ăn</option>
                  <option value="HEALTH_SYMPTOM">Xuất hiện triệu chứng bất thường sau khi dùng</option>
                  <option value="OTHER">Sự cố an toàn thực phẩm khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Mô tả chi tiết sự cố <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={safetyDescription}
                  onChange={(e) => setSafetyDescription(e.target.value)}
                  placeholder="Mô tả cụ thể tình trạng món ăn khi nhận được, mùi vị, dấu hiệu bất thường..."
                  className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                />
                <span className="text-[11px] text-stone-400">Tối thiểu 10 ký tự ({safetyDescription.length}/10)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Link ảnh bằng chứng (URL ảnh chụp món hoặc bao bì)
                </label>
                <input
                  type="url"
                  value={safetyEvidenceUrl}
                  onChange={(e) => setSafetyEvidenceUrl(e.target.value)}
                  placeholder="https://example.com/anh-bang-chung.jpg"
                  className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                🛡️ <strong>Chính sách bảo vệ:</strong> Khi gửi báo cáo, đơn hàng sẽ chuyển sang diện <strong>Khiếu nại (DISPUTED)</strong>. Hệ thống tạm giữ đối soát thanh toán với quán và liên hệ hỗ trợ bạn trong vòng 24 giờ.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSafetyModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-stone-500 hover:bg-stone-100 rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSafetyReport || safetyDescription.trim().length < 10}
                  className="px-5 py-2.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingSafetyReport && <Loader2 className="size-3.5 animate-spin" />}
                  <span>{isSubmittingSafetyReport ? "Đang gửi báo cáo..." : "Gửi Báo Cáo Sự Cố"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Chat Modal */}
      <OrderChatModal
        orderId={order.id}
        orderNumber={order.orderNumber}
        partnerName={order.partnerName}
        customerName={order.customerName}
        currentUserRole="CUSTOMER"
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
      />
    </div>
  );
}
