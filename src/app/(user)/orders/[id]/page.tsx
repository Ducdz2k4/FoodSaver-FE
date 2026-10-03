"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import {
  useGetOrderByIdQuery,
  useCancelOrderMutation,
  useLockOrderMutation,
} from "@/redux/api/orderApi";
import { toast } from "sonner";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  // Fetch real order from backend
  const { data: realOrder, isLoading } = useGetOrderByIdQuery(resolvedParams.id);
  const order = realOrder;

  const [cancelOrderMutation, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [lockOrderMutation] = useLockOrderMutation();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Bận đột xuất không kịp ghé lấy");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [hygieneChecked, setHygieneChecked] = useState(true);

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
    toast.info("Đơn hàng đã chốt sau 5 giây! Trạng thái đã được khóa (Không được hủy đơn nữa).");
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
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể hủy đơn hàng");
    }
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewModalOpen(false);
    toast.success("Cảm ơn bạn đã gửi đánh giá chất lượng ATTP cho cửa hàng!");
  };

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-24 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00615f] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Danh sách đơn của bạn
        </Link>

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

        {/* Card chính */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm text-center space-y-4">
          <div
            className={`size-14 rounded-full flex items-center justify-center mx-auto ${
              orderStatus === "CANCELLED"
                ? "bg-rose-100 text-rose-700"
                : orderStatus === "COMPLETED"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {orderStatus === "CANCELLED" ? (
              <XCircle className="size-8" />
            ) : (
              <CheckCircle2 className="size-8" />
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#00615f]">
              {orderStatus === "CANCELLED"
                ? "Đơn Hàng Đã Bị Hủy"
                : orderStatus === "COMPLETED"
                ? "Đơn Hàng Đã Hoàn Tất"
                : "Đặt Hàng Thành Công!"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Mã đơn hàng:{" "}
              <strong className="font-mono text-stone-900">#{order.orderNumber}</strong>
            </p>
          </div>

          {/* QR Code / Thanh toán QR hệ thống */}
          {orderStatus !== "CANCELLED" && (
            <div className="bg-stone-50 border border-stone-200 p-6 rounded-3xl max-w-xs mx-auto space-y-3">
              <div className="size-44 bg-white p-3 mx-auto rounded-2xl border border-stone-300 shadow-inner flex flex-col items-center justify-center">
                <QrCode className="size-32 text-stone-800" />
                <span className="font-mono text-[10px] font-bold text-stone-500 tracking-widest mt-1">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                {order.paymentMethod === "SYSTEM_QR"
                  ? "Quét mã QR VietQR hệ thống để thanh toán đơn"
                  : order.fulfillmentType === "DELIVERY"
                  ? "Mã nhận hàng đối soát với shipper"
                  : "Đưa mã QR cho quán khi đến nhận đồ"}
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
              <span className="text-stone-500">Hình thức nhận:</span>
              <span className="font-bold text-[#00615f] flex items-center gap-1">
                {order.fulfillmentType === "DELIVERY" ? (
                  <>
                    <Truck className="size-3.5" /> Giao hàng tận nơi
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-3.5" /> Tự đến quán lấy
                  </>
                )}
              </span>
            </div>

            {order.fulfillmentType === "DELIVERY" && order.deliveryAddress && (
              <div className="flex justify-between py-1">
                <span className="text-stone-500">Địa chỉ giao:</span>
                <span className="font-bold text-stone-900 text-right max-w-xs truncate">
                  {order.deliveryAddress}
                </span>
              </div>
            )}

            <div className="flex justify-between py-1">
              <span className="text-stone-500">Phương thức thanh toán:</span>
              <span className="font-bold text-stone-900">
                {order.paymentMethod === "SYSTEM_QR" ? "QR Hệ Thống FoodSaver" : "Tiền mặt khi nhận (COD)"}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-stone-500">Số lượng:</span>
              <span className="font-bold text-stone-900">{order.quantity} phần</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-stone-500">Tiền món:</span>
              <span>{(order.unitPrice * order.quantity).toLocaleString("vi-VN")}đ</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-stone-500">Phí giao hàng:</span>
              <span className="font-bold text-stone-900">
                {order.shippingFee > 0 ? `${order.shippingFee.toLocaleString("vi-VN")}đ` : "0đ (Tự lấy)"}
              </span>
            </div>

            <div className="flex justify-between py-2 border-t border-stone-100 text-base font-black">
              <span>Tổng thanh toán:</span>
              <span className="text-[#00615f]">{order.totalPrice.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <a
              href="tel:02838383838"
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Phone className="size-3.5 text-[#00615f]" />
              <span>Gọi hotline quán</span>
            </a>

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

              {orderStatus !== "CANCELLED" && (
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(true)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Đã nhận & Đánh giá</span>
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
                  Để sau
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#00615f] hover:bg-[#089184] text-white rounded-xl shadow-md"
                >
                  Gửi đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
