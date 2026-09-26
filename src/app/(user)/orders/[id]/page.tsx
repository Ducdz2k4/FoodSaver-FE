"use client";

import React, { use, useState } from "react";
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
} from "lucide-react";
import { MOCK_ORDERS } from "@/mocks/mockData";
import { OrderStatus } from "@/types/contract";
import { toast } from "sonner";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const initialOrder = MOCK_ORDERS.find((o) => o.id === resolvedParams.id) || MOCK_ORDERS[0];

  const [orderStatus, setOrderStatus] = useState<OrderStatus>(initialOrder.status);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Bận đột xuất không kịp ghé lấy");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [hygieneChecked, setHygieneChecked] = useState(true);

  const handleCancelOrder = () => {
    setOrderStatus("CANCELLED");
    setCancelModalOpen(false);
    toast.info(`Đã hủy đơn hàng thành công. Lý do: "${cancelReason}"`);
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewModalOpen(false);
    toast.success("Cảm ơn bạn đã gửi đánh giá chất lượng ATTP cho cửa hàng!");
  };

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-24 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00615f] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Danh sách đơn của bạn
        </Link>

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
                ? "Đơn Hàng Đã Nhận Thành Công"
                : "Đặt Giữ Món Thành Công!"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Mã đơn hàng:{" "}
              <strong className="font-mono text-stone-900">#{initialOrder.orderNumber}</strong>
            </p>
          </div>

          {/* Khối Mã QR nhận đồ (Chỉ hiện khi chưa hủy) */}
          {orderStatus !== "CANCELLED" ? (
            <div className="bg-stone-50 border border-stone-200 p-6 rounded-3xl max-w-xs mx-auto space-y-3">
              <div className="size-44 bg-white p-3 mx-auto rounded-2xl border border-stone-300 shadow-inner flex flex-col items-center justify-center">
                <QrCode className="size-32 text-stone-800" />
                <span className="font-mono text-[10px] font-bold text-stone-500 tracking-widest mt-1">
                  {initialOrder.orderNumber}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Đưa mã QR này cho nhân viên quán khi đến lấy đồ
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 max-w-xs mx-auto">
              Đơn hàng này đã bị hủy. Suất ăn đã được hoàn trả lại cho cửa hàng.
            </div>
          )}

          {/* Chi tiết đơn */}
          <div className="text-left border-t border-stone-100 pt-5 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1">
              <span className="text-stone-500">Món ăn:</span>
              <span className="font-bold text-stone-900 text-right">
                {initialOrder.listingTitle}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-stone-500">Số lượng:</span>
              <span className="font-bold text-stone-900">{initialOrder.quantity} phần</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-stone-500">Giờ hẹn lấy:</span>
              <span className="font-bold text-[#00615f]">{initialOrder.pickupTimeWindow}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-stone-500">Địa chỉ quán:</span>
              <span className="font-bold text-stone-900 text-right">
                {initialOrder.partnerAddress}
              </span>
            </div>
            <div className="flex justify-between py-2 border-t border-stone-100 text-base font-black">
              <span>Thanh toán tại quán:</span>
              <span className="text-[#00615f]">
                {initialOrder.totalPrice.toLocaleString("vi-VN")}đ
              </span>
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
              {orderStatus !== "CANCELLED" && orderStatus !== "COMPLETED" && (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition"
                >
                  Hủy đơn này
                </button>
              )}

              {orderStatus !== "CANCELLED" && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderStatus("COMPLETED");
                    setReviewModalOpen(true);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Đã lấy món & Đánh giá</span>
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
              <span>Xác nhận hủy đơn đặt giữ</span>
            </div>

            <p className="text-xs text-stone-600">
              Vui lòng cho quán biết lý do bạn không thể đến nhận đồ:
            </p>

            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800"
            >
              <option value="Bận đột xuất không kịp ghé lấy">Bận đột xuất không kịp ghé lấy</option>
              <option value="Đặt nhầm khung giờ hẹn">Đặt nhầm khung giờ hẹn</option>
              <option value="Khoảng cách quá xa so với dự tính">Khoảng cách quá xa</option>
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
              {/* Star rating */}
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
                        star <= rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-stone-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Checkboxes */}
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
