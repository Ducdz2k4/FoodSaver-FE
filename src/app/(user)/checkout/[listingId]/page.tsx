"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { MOCK_LISTINGS } from "@/mocks/mockData";
import { useAppSelector } from "@/redux/hooks";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const currentUser = useAppSelector((state) => state.auth.user);
  const listing = MOCK_LISTINGS.find((item) => item.id === resolvedParams.listingId);

  const [quantity, setQuantity] = useState(1);
  const [pickupSlot, setPickupSlot] = useState("19:00 - 20:00");
  const [customerNotes, setCustomerNotes] = useState("");
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || "0901234567");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!listing) {
    return notFound();
  }

  const totalPrice = listing.discountPrice * quantity;
  const originalTotalPrice = listing.originalPrice * quantity;
  const savedAmount = originalTotalPrice - totalPrice;

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Giả lập tạo đơn thành công và chuyển sang màn hình đơn hàng
      router.push("/orders/ord-101");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-24 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href={`/listing/${listing.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00615f] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại xem món
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
            Xác nhận đặt giữ món ăn
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Giữ suất ăn giải cứu thành công — Bạn sẽ thanh toán trực tiếp tại quán khi đến lấy.
          </p>
        </div>

        <form onSubmit={handleConfirmOrder} className="space-y-6">
          {/* Card 1: Thông tin món ăn */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm flex items-start gap-4">
            <div className="size-20 sm:size-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
              <img
                src={listing.imageUrls[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-1">
              <span className="text-xs font-bold text-emerald-700 block">
                {listing.partnerName}
              </span>
              <h2 className="font-extrabold text-stone-900 text-sm sm:text-base leading-snug">
                {listing.title}
              </h2>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-base font-black text-[#00615f]">
                  {listing.discountPrice.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-xs text-stone-400 line-through">
                  {listing.originalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Chọn số lượng */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm">Số lượng đặt</h3>
              <p className="text-xs text-stone-500">
                Tối đa có thể đặt: {listing.quantity} {listing.unit}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
                className="size-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-black text-sm flex items-center justify-center transition disabled:opacity-40"
              >
                -
              </button>
              <span className="font-black text-base text-stone-900 w-6 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.min(listing.quantity, prev + 1))}
                disabled={quantity >= listing.quantity}
                className="size-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-black text-sm flex items-center justify-center transition disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* Card 3: Khung giờ hẹn & Địa chỉ nhận */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-4">
            <h3 className="font-extrabold text-stone-900 text-sm">Thời gian & Địa điểm lấy món</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1.5">
                  Chọn khung giờ bạn sẽ đến lấy hôm nay:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["18:30 - 19:30", "19:30 - 20:30", "20:30 - 21:30"].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setPickupSlot(slot)}
                      className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition border ${
                        pickupSlot === slot
                          ? "bg-[#00615f] text-white border-[#00615f] shadow-sm"
                          : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 flex items-start gap-2 text-xs text-stone-700">
                <MapPin className="size-4 text-[#00615f] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900">Địa chỉ quán: </span>
                  {listing.pickupAddress}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">
                  Số điện thoại người nhận:
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Nhập số điện thoại của bạn"
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">
                  Ghi chú cho cửa hàng (tùy chọn):
                </label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Ví dụ: Tôi sẽ tự mang hộp cá nhân..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Tóm tắt hóa đơn */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-3">
            <h3 className="font-extrabold text-stone-900 text-sm">Tóm tắt đơn hàng</h3>

            <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
              <div className="flex justify-between">
                <span>Giá gốc ({quantity} suất):</span>
                <span className="line-through">{originalTotalPrice.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Tiết kiệm giải cứu:</span>
                <span>-{savedAmount.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-100">
                <span>Tổng thanh toán tại quán:</span>
                <span className="text-base text-[#00615f] font-black">
                  {totalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          </div>

          {/* Nút Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all active:scale-98 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span>Đang gửi đơn...</span>
            ) : (
              <>
                <CheckCircle2 className="size-5" />
                <span>Hoàn Tất Đặt Giữ ({totalPrice.toLocaleString("vi-VN")}đ)</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
