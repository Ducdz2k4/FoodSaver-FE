"use client";

import React, { use, useState, useEffect } from "react";
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
  Loader2,
  Truck,
  ShoppingBag,
  QrCode,
  DollarSign,
  Gavel,
  Lock,
  Tag,
  X,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { useGetListingByIdQuery } from "@/redux/api/listingApi";
import {
  useCreateOrderMutation,
  useEstimateShippingMutation,
  useVerifyCouponMutation,
  useVerifyOrderPaymentMutation,
} from "@/redux/api/orderApi";
import { FulfillmentType, PaymentMethod, OrderDTO } from "@/types/contract";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const currentUser = useAppSelector((state) => state.auth.user);
  const { socket } = useSocket();

  const { data: realListing, isLoading: isListingLoading } = useGetListingByIdQuery({
    id: resolvedParams.listingId,
  });
  const listing = realListing;

  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [estimateShipping] = useEstimateShippingMutation();

  const [quantity, setQuantity] = useState(1);
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("PICKUP");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

  // Delivery & Distance (Max 20km)
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || "");
  const [deliveryDistance, setDeliveryDistance] = useState<number>(3.5);
  const [defaultShippingFee, setDefaultShippingFee] = useState<number>(0);
  const [isEstimatingFee, setIsEstimatingFee] = useState(false);

  // Bargaining Shipping Fee State
  const [isBargaining, setIsBargaining] = useState(false);
  const [proposedFee, setProposedFee] = useState<number>(15000);
  const [bargainStatus, setBargainStatus] = useState<"IDLE" | "WAITING" | "ACCEPTED" | "REJECTED" | "COUNTER">("IDLE");
  const [finalAgreedFee, setFinalAgreedFee] = useState<number>(0);
  const [verifyCouponMutation, { isLoading: isCheckingCoupon }] = useVerifyCouponMutation();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; description: string } | null>(null);

  const [partnerMessage, setPartnerMessage] = useState<string>("");

  // Payment Modal State for Online Payment
  const [paymentModalOrder, setPaymentModalOrder] = useState<OrderDTO | null>(null);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [verifyOrderPayment, { isLoading: isVerifyingModalPayment }] = useVerifyOrderPaymentMutation();

  const handleCopy = (text: string, field: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`Đã sao chép ${field}!`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Dual-Engine: Socket.IO Real-time + Polling Backup (every 2.5s) for 100% instant auto-verify
  useEffect(() => {
    if (!paymentModalOrder || isPaidSuccess) return;

    // 1. Socket.IO Realtime push listener
    const handlePaymentSuccess = (data: any) => {
      if (
        data?.orderId === paymentModalOrder.id ||
        data?.orderNumber === paymentModalOrder.orderNumber
      ) {
        setIsPaidSuccess(true);
        toast.success("🎉 Đã nhận được thanh toán từ BIDV! Đang chuyển hướng...");
        setTimeout(() => {
          router.push(`/orders/${paymentModalOrder.id}`);
        }, 1500);
      }
    };

    if (socket) {
      socket.on("PAYMENT_SUCCESS", handlePaymentSuccess);
    }

    // 2. Polling Backup Engine: runs every 2.5s in background
    const pollInterval = setInterval(async () => {
      try {
        const res = await verifyOrderPayment(paymentModalOrder.id).unwrap();
        if (res.verified || res.success) {
          setIsPaidSuccess(true);
          toast.success("🎉 Đã nhận được thanh toán từ BIDV! Đang chuyển hướng...");
          clearInterval(pollInterval);
          setTimeout(() => {
            router.push(`/orders/${paymentModalOrder.id}`);
          }, 1500);
        }
      } catch {
        // Silent fallback in background polling
      }
    }, 2500);

    return () => {
      if (socket) {
        socket.off("PAYMENT_SUCCESS", handlePaymentSuccess);
      }
      clearInterval(pollInterval);
    };
  }, [socket, paymentModalOrder, isPaidSuccess, router, verifyOrderPayment]);

    const handleManualVerifyInModal = async () => {
    if (!paymentModalOrder) return;
    try {
      const res = await verifyOrderPayment(paymentModalOrder.id).unwrap();
      if (res.verified) {
        setIsPaidSuccess(true);
        toast.success("🎉 Đã nhận được thanh toán thành công!");
        setTimeout(() => {
          router.push(`/orders/${paymentModalOrder.id}`);
        }, 1500);
      } else {
        toast.info(res.message || "Chưa tìm thấy giao dịch chuyển khoản. Vui lòng thử lại sau vài giây!");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể kiểm tra giao dịch lúc này");
    }
  };

  const [pickupSlot, setPickupSlot] = useState("19:00 - 20:00");
  const [customerNotes, setCustomerNotes] = useState("");
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || "");

  useEffect(() => {
    setDeliveryAddress((previous) => previous || currentUser?.address || "");
    setCustomerPhone((previous) => previous || currentUser?.phone || "");
  }, [currentUser?.address, currentUser?.phone]);

  // Estimate default shipping fee whenever distance changes
  useEffect(() => {
    if (fulfillmentType === "DELIVERY") {
      setIsEstimatingFee(true);
      estimateShipping({ distanceKm: deliveryDistance })
        .unwrap()
        .then((res) => {
          setDefaultShippingFee(res.defaultFee);
          setFinalAgreedFee(res.defaultFee);
        })
        .catch(() => {
          setDefaultShippingFee(0);
          setFinalAgreedFee(0);
          toast.error("Không thể tính phí giao hàng. Vui lòng thử lại.");
        })
        .finally(() => setIsEstimatingFee(false));
    } else {
      setDefaultShippingFee(0);
      setFinalAgreedFee(0);
    }
  }, [deliveryDistance, fulfillmentType, estimateShipping]);

  // Socket listener for real-time bargain response from partner
  useEffect(() => {
    if (!socket) return;

    const handleBargainResponse = (data: any) => {
      if (data?.partnerId !== listing?.partnerId || !Number.isFinite(data?.finalFee) || data.finalFee < 0 || data.finalFee > 60000) return;
      if (data?.accepted) {
        setBargainStatus("ACCEPTED");
        setFinalAgreedFee(data.finalFee);
        toast.success(`🎉 Quán đã chấp nhận giá chém ${data.finalFee.toLocaleString("vi-VN")}đ!`);
      } else {
        setBargainStatus("COUNTER");
        setFinalAgreedFee(data.finalFee ?? defaultShippingFee);
        setPartnerMessage(data.message || "Quán đưa giá chốt khác");
        toast.info(`🔔 Phản hồi từ quán: ${data.message || "Giá chốt khác: " + data.finalFee.toLocaleString("vi-VN") + "đ"}`);
      }
    };

    socket.on("RECEIVE_BARGAIN_RESPONSE", handleBargainResponse);

    return () => {
      socket.off("RECEIVE_BARGAIN_RESPONSE", handleBargainResponse);
    };
  }, [socket, defaultShippingFee, listing?.partnerId]);

  if (isListingLoading && !listing) {
    return (
      <div className="min-h-screen bg-[#f9f3f0] flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#00615f] font-bold text-sm">
          <Loader2 className="size-6 animate-spin" />
          <span>Đang tải thông tin món ăn...</span>
        </div>
      </div>
    );
  }

  if (!listing) {
    return notFound();
  }

  const itemSubtotal = listing.discountPrice * quantity;
  const currentShippingFee = fulfillmentType === "DELIVERY" ? finalAgreedFee : 0;
  const finalTotalPrice = Math.max(0, itemSubtotal + currentShippingFee - (appliedCoupon?.discountAmount || 0));
  const totalPrice = finalTotalPrice;

  
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    try {
      const res = await verifyCouponMutation({
        code: couponInput.trim(),
        orderTotal: itemSubtotal,
      }).unwrap();
      setAppliedCoupon(res);
      toast.success(`Áp dụng mã ${res.code} thành công: -${res.discountAmount.toLocaleString('vi-VN')}đ`);
    } catch (err: any) {
      toast.error(err?.data?.message || `Mã giảm giá "${couponInput}" không hợp lệ hoặc đã hết hạn.`);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    toast.info('Đã gỡ bỏ mã giảm giá.');
  };

  // Send real-time bargain via Socket.IO
  const handleSendBargain = () => {
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập trước khi chém giá!");
      return;
    }
    if (proposedFee > 60000) {
      toast.error("Phí giao hàng tối đa là 60.000đ!");
      return;
    }
    setBargainStatus("WAITING");
    toast.info("Đang gửi yêu cầu chém giá tới cửa hàng qua Socket.IO...");

    if (socket) {
      socket.emit("BARGAIN_SHIPPING_REQUEST", {
        partnerId: listing.partnerId,
        customerId: currentUser.id,
        customerName: currentUser.fullName,
        defaultFee: defaultShippingFee,
        proposedFee,
        distanceKm: deliveryDistance,
      });
    }

    if (!socket) {
      setBargainStatus("REJECTED");
      toast.error("Không thể kết nối tới cửa hàng để gửi yêu cầu mặc cả.");
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Vui lòng đăng nhập trước khi đặt đơn!");
      router.push(`/login?redirect=/checkout/${listing.id}`);
      return;
    }

    try {
      const result = await createOrder({
        listingId: listing.id,
        quantity,
        fulfillmentType,
        paymentMethod,
        deliveryAddress: fulfillmentType === "DELIVERY" ? deliveryAddress : undefined,
        deliveryDistance: fulfillmentType === "DELIVERY" ? deliveryDistance : undefined,
        shippingFee: currentShippingFee,
        negotiatedShippingFee: isBargaining ? proposedFee : undefined,
        discountCode: appliedCoupon?.code || undefined,
        pickupTimeWindow: pickupSlot,
        customerNotes: customerNotes.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
      }).unwrap();

      if (paymentMethod === "SYSTEM_QR") {
        setPaymentModalOrder(result);
        toast.info("Vui lòng quét mã VietQR trên bảng thanh toán để hoàn tất!");
      } else {
        toast.success("Tạo đơn hàng thành công!");
        router.push(`/orders/${result.id}`);
      }
    } catch (error: any) {
      const errDetails = Array.isArray(error?.data?.errors)
        ? error.data.errors.map((e: any) => e.message || `${e.field}: ${e.message}`).join(", ")
        : null;
      const msg = errDetails || error?.data?.message || "Đặt món thất bại. Vui lòng thử lại.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-24 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link
          href={`/listing/${listing.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00615f] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại xem món
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
            Xác nhận đặt hàng & Giao nhận
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Lựa chọn tự đến lấy hoặc giao hàng tận nơi (bán kính tối đa 20km, chốt giá hoặc chém giá).
          </p>
        </div>

        <form onSubmit={handleConfirmOrder} className="space-y-6">
          {/* Card 1: Thông tin món ăn & Số lượng */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className="size-20 sm:size-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                <img src={listing.imageUrls[0]} alt={listing.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-1">
                <span className="text-xs font-bold text-emerald-700 block">{listing.partnerName}</span>
                <h2 className="font-extrabold text-stone-900 text-sm sm:text-base leading-snug">{listing.title}</h2>
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

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <span className="text-xs font-bold text-stone-700">Số lượng đặt:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  className="size-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-black text-sm flex items-center justify-center transition disabled:opacity-40"
                >
                  -
                </button>
                <span className="font-black text-sm text-stone-900 w-5 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(listing.quantity, prev + 1))}
                  disabled={quantity >= listing.quantity}
                  className="size-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-black text-sm flex items-center justify-center transition disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Hình thức giao nhận (2 loại: Tự đến lấy vs Ship) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-4">
            <h3 className="font-extrabold text-stone-900 text-sm">1. Chọn hình thức nhận hàng</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentType("PICKUP")}
                className={`p-4 rounded-2xl border text-left transition ${
                  fulfillmentType === "PICKUP"
                    ? "bg-[#00615f] text-white border-[#00615f] shadow-md"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm flex items-center gap-1.5">
                    <ShoppingBag className="size-4" /> Tới quán lấy (Store Pickup)
                  </span>
                  <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-md">Giữ món 30p</span>
                </div>
                <p className={`text-xs ${fulfillmentType === "PICKUP" ? "text-emerald-100" : "text-stone-500"}`}>
                  Nhận mã OTP 6 số bảo mật trên ứng dụng, đọc mã cho quán khi tới nhận đồ. 0đ phí ship.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType("DELIVERY")}
                className={`p-4 rounded-2xl border text-left transition ${
                  fulfillmentType === "DELIVERY"
                    ? "bg-[#00615f] text-white border-[#00615f] shadow-md"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm flex items-center gap-1.5">
                    <Truck className="size-4" /> Quán tự giao hàng (Partner Delivery)
                  </span>
                  <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-md">Bán kính ≤20km</span>
                </div>
                <p className={`text-xs ${fulfillmentType === "DELIVERY" ? "text-emerald-100" : "text-stone-500"}`}>
                  Đối tác tự vận chuyển. 100% phí giao hàng thuộc về quán (Nền tảng 0% hoa hồng trên ship).
                </p>
              </button>
            </div>

            {/* Chi tiết Giao hàng & Chém giá phí ship */}
            {fulfillmentType === "DELIVERY" && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4 animate-in fade-in duration-200">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Địa chỉ nhận hàng chi tiết:
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Số nhà, tên đường, phường..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                      <span>Khoảng cách ước tính:</span>
                      <span className="text-[#00615f] font-black">{deliveryDistance} km (Tối đa 20km)</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={20}
                      step={0.5}
                      value={deliveryDistance}
                      onChange={(e) => setDeliveryDistance(Number(e.target.value))}
                      className="w-full accent-[#00615f] cursor-pointer"
                    />
                  </div>

                  {/* Khối Phí Ship & Tùy chọn Chém Giá */}
                  <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-stone-500 block font-medium">
                          Phí giao hàng mặc định (theo km & giờ):
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-[#00615f]">
                            {defaultShippingFee.toLocaleString("vi-VN")}đ
                          </span>
                          {isEstimatingFee && <Loader2 className="size-3.5 animate-spin text-[#00615f]" />}
                        </div>
                      </div>

                      {/* 2 Options: Mặc định vs Chém giá */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsBargaining(false);
                            setFinalAgreedFee(defaultShippingFee);
                            setBargainStatus("IDLE");
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            !isBargaining
                              ? "bg-[#00615f] text-white shadow-sm"
                              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                          }`}
                        >
                          Dùng giá mặc định
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsBargaining(true)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                            isBargaining
                              ? "bg-amber-600 text-white shadow-sm"
                              : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                          }`}
                        >
                          <Gavel className="size-3" />
                          <span>Chém giá phí ship</span>
                        </button>
                      </div>
                    </div>

                    {/* Khung Chém Giá tương tác Realtime Socket */}
                    {isBargaining && (
                      <div className="pt-3 border-t border-stone-100 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <label className="text-[11px] font-bold text-stone-600 block mb-1">
                              Giá bạn muốn trả (Tối đa 60.000đ):
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min={5000}
                                max={60000}
                                step={5000}
                                value={proposedFee}
                                onChange={(e) => setProposedFee(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-black text-[#00615f] focus:outline-none"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">đ</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={bargainStatus === "WAITING"}
                            onClick={handleSendBargain}
                            className="mt-4 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md transition flex items-center gap-1 disabled:opacity-50"
                          >
                            {bargainStatus === "WAITING" ? (
                              <>
                                <Loader2 className="size-3.5 animate-spin" />
                                <span>Chờ quán duyệt...</span>
                              </>
                            ) : (
                              <>
                                <Gavel className="size-3.5" />
                                <span>Bắn giá sang quán</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Status badge sau khi socket phản hồi */}
                        {bargainStatus === "ACCEPTED" && (
                          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="size-4 text-emerald-600" />
                            <span>Quán đã chấp nhận giá chém {finalAgreedFee.toLocaleString("vi-VN")}đ!</span>
                          </div>
                        )}

                        {bargainStatus === "COUNTER" && (
                          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-medium space-y-1">
                            <div className="font-bold">Quán đưa ra giá chốt: {finalAgreedFee.toLocaleString("vi-VN")}đ</div>
                            {partnerMessage && <p className="italic">&quot;{partnerMessage}&quot;</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Chi tiết Tự đến lấy */}
            {fulfillmentType === "PICKUP" && (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-start gap-2 text-xs text-stone-700">
                  <MapPin className="size-4 text-[#00615f] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900">Địa chỉ quán: </span>
                    {listing.pickupAddress}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">
                    Chọn khung giờ bạn sẽ đến lấy hôm nay:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {["18:30 - 19:30", "19:30 - 20:30", "20:30 - 21:30"].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setPickupSlot(slot)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                          pickupSlot === slot
                            ? "bg-[#00615f] text-white border-[#00615f] shadow-sm"
                            : "bg-white text-stone-700 hover:bg-stone-100 border-stone-200"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Hình thức thanh toán (2 loại: COD vs QR Hệ Thống) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-4">
            <h3 className="font-extrabold text-stone-900 text-sm">2. Chọn hình thức thanh toán</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("SYSTEM_QR")}
                className={`p-4 rounded-2xl border text-left transition ${
                  paymentMethod === "SYSTEM_QR"
                    ? "bg-[#00615f] text-white border-[#00615f] shadow-md"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <QrCode className="size-4" />
                  <span className="font-extrabold text-sm">Thanh toán trực tuyến (ONLINE - Ký quỹ Escrow)</span>
                </div>
                <p className={`text-xs ${paymentMethod === "SYSTEM_QR" ? "text-emerald-100" : "text-stone-500"}`}>
                  Tiền được ký quỹ an toàn tại FoodSaver, chỉ giải ngân cho quán khi bạn đã xác nhận nhận hàng.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className={`p-4 rounded-2xl border text-left transition ${
                  paymentMethod === "COD"
                    ? "bg-[#00615f] text-white border-[#00615f] shadow-md"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="size-4" />
                  <span className="font-extrabold text-sm">Tiền mặt khi nhận (CASH / COD)</span>
                </div>
                <p className={`text-xs ${paymentMethod === "COD" ? "text-emerald-100" : "text-stone-500"}`}>
                  Thanh toán tiền mặt trực tiếp cho quán khi nhận đồ tại quầy hoặc cho người giao hàng.
                </p>
              </button>
            </div>

{/* Khung Thông Tin Thanh Toán Trực Tuyến & VietQR */}
            {paymentMethod === "SYSTEM_QR" && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-[#00615f] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <QrCode className="size-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-emerald-950">
                      Popup mã VietQR sẽ xuất hiện ngay sau khi bấm &ldquo;Xác Nhận Đặt Hàng&rdquo;
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Tự động xác nhận giao dịch & chuyển hướng tức thì khi chuyển khoản thành công.
                    </span>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-white border border-emerald-200 px-2.5 py-1 rounded-full shrink-0 shadow-2xs">
                  <ShieldCheck className="size-3 text-emerald-700" />
                  <span>Ký quỹ Escrow 100%</span>
                </span>
              </div>
            )}
          </div>

          {/* Card Mã Giảm Giá */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-3">
            <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
              <Tag className="size-4 text-[#00615f]" />
              <span>Mã giảm giá FoodSaver</span>
            </h3>

            {!appliedCoupon ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Nhập mã (VD: FOODSAVER10, SAVEGREEN)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono font-bold uppercase focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isCheckingCoupon}
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 rounded-xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    {isCheckingCoupon ? <Loader2 className="size-3.5 animate-spin" /> : 'Áp dụng'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['FOODSAVER10', 'FREESHIP', 'SAVEGREEN', 'WELCOME'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setCouponInput(code)}
                      className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200 transition cursor-pointer"
                    >
                      +{code}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-xs text-emerald-800">{appliedCoupon.code}</span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                      -{appliedCoupon.discountAmount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-600">{appliedCoupon.description}</p>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="p-1 rounded-full text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                  title="Gỡ mã"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
          </div>

          {/* Card 4: Tóm tắt hóa đơn & Chốt đơn */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-3">
            <h3 className="font-extrabold text-stone-900 text-sm">Tóm tắt thanh toán</h3>

            <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
              <div className="flex justify-between">
                <span>Tiền món ({quantity} suất):</span>
                <span>{itemSubtotal.toLocaleString("vi-VN")}đ</span>
              </div>

              <div className="flex justify-between">
                <span>
                  Phí giao hàng ({fulfillmentType === "DELIVERY" ? `${deliveryDistance}km` : "Tự lấy"}):
                </span>
                <span className="font-bold text-stone-800">
                  {currentShippingFee > 0 ? `${currentShippingFee.toLocaleString("vi-VN")}đ` : "Miễn phí"}
                </span>
              </div>

              
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Mã giảm giá ({appliedCoupon.code}):</span>
                  <span>-{appliedCoupon.discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-100">
                <span>Tổng cộng:</span>
                <span className="text-lg text-[#00615f] font-black">
                  {totalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <p className="text-[11px] text-stone-500 italic pt-1 text-center">
                * FoodSaver cam kết 0% phí nền tảng trên phí ship (100% thuộc về quán).
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <Lock className="size-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Lưu ý quan trọng:</strong> Sau khi bạn bấm chốt đặt hàng, hệ thống sẽ cho 5 giây xác nhận. Sau 5 giây, đơn hàng sẽ tự động khóa và chuyển sang chuẩn bị món (không được hủy đơn ở bước này nữa).
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreatingOrder}
            className="w-full py-4 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all active:scale-98 disabled:opacity-60"
          >
            {isCreatingOrder ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-5 animate-spin" />
                <span>Đang tạo đơn hàng...</span>
              </span>
            ) : (
              <>
                <CheckCircle2 className="size-5" />
                <span>Xác Nhận Đặt Hàng ({totalPrice.toLocaleString("vi-VN")}đ)</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Modal Popup Thanh Toán Trực Tuyến VietQR - High Visibility & Dual Engine */}
      {paymentModalOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => {}}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl sm:max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {isPaidSuccess ? (
              <div className="py-10 text-center space-y-4">
                <div className="size-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce shadow-lg">
                  <CheckCircle2 className="size-12" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-stone-900 tracking-tight">Thanh Toán Thành Công!</h3>
                  <p className="text-sm sm:text-base text-stone-600 mt-1 max-w-md mx-auto">
                    Hệ thống đã nhận được tiền từ tài khoản BIDV và tiến hành ký quỹ bảo vệ đơn hàng #{paymentModalOrder.orderNumber}.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#00615f] bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                  <Loader2 className="size-4 animate-spin text-[#00615f]" />
                  <span>Đang tự động chuyển hướng đến chi tiết đơn hàng...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Header Modal */}
                <div className="flex items-start justify-between pb-4 border-b border-stone-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="size-10 rounded-2xl bg-[#00615f] text-white flex items-center justify-center shadow-sm">
                        <QrCode className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-lg sm:text-xl text-stone-900 leading-tight">
                          Thanh toán đơn hàng VietQR
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-500 font-medium">
                          Mã đơn: <strong className="font-mono text-stone-900">#{paymentModalOrder.orderNumber}</strong> • Ký quỹ Escrow bảo đảm 100%
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      router.push(`/orders/${paymentModalOrder.id}`);
                    }}
                    className="p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
                    title="Đóng và xem đơn hàng"
                  >
                    <X className="size-6" />
                  </button>
                </div>

                {/* Body: VietQR (Lớn, rõ nét) + Thông tin tài khoản */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Cột trái: QR Code Lớn */}
                  <div className="md:col-span-5 flex flex-col items-center text-center p-4 bg-emerald-50/60 rounded-3xl border-2 border-emerald-200">
                    <div className="relative size-56 sm:size-64 bg-white p-3 rounded-2xl border border-stone-200 shadow-md flex items-center justify-center">
                      <img
                        src={`https://api.vietqr.io/image/970418-6240247363-compact2.png?amount=${paymentModalOrder.totalPrice}&addInfo=${paymentModalOrder.orderNumber}&accountName=NGUYEN%20QUANG%20DUC`}
                        alt="Mã QR thanh toán VietQR"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-black text-[#00615f] mt-3">
                      Quét bằng app mọi ngân hàng & MoMo
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium">
                      Tự động điền số tiền & nội dung chuyển khoản
                    </span>
                  </div>

                  {/* Cột phải: Chi tiết tài khoản to rõ ràng */}
                  <div className="md:col-span-7 space-y-2.5 text-xs sm:text-sm">
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] text-stone-400 font-bold block">NGÂN HÀNG THỤ HƯỞNG</span>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-stone-900 text-sm sm:text-base">BIDV (Chi nhánh Đà Nẵng)</span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">24/7 Napas</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold block">SỐ TÀI KHOẢN THỤ HƯỞNG</span>
                        <span className="font-mono font-black text-[#00615f] text-lg sm:text-2xl tracking-wider">6240247363</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("6240247363", "Số tài khoản")}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-[#00615f] hover:text-white text-stone-700 font-bold text-xs transition shadow-2xs cursor-pointer shrink-0"
                      >
                        {copiedField === "Số tài khoản" ? "Đã chép ✓" : "Sao chép"}
                      </button>
                    </div>

                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] text-stone-400 font-bold block">CHỦ TÀI KHOẢN</span>
                      <span className="font-extrabold text-stone-900 text-sm sm:text-base">NGUYEN QUANG DUC</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold block">SỐ TIỀN CẦN CHUYỂN</span>
                        <span className="font-black text-emerald-700 text-lg sm:text-2xl">
                          {paymentModalOrder.totalPrice.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(String(paymentModalOrder.totalPrice), "Số tiền")}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-[#00615f] hover:text-white text-stone-700 font-bold text-xs transition shadow-2xs cursor-pointer shrink-0"
                      >
                        {copiedField === "Số tiền" ? "Đã chép ✓" : "Sao chép"}
                      </button>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-between gap-2 shadow-xs">
                      <div>
                        <span className="text-[10px] text-amber-800 font-black block">NỘI DUNG CHUYỂN KHOẢN (BẮT BUỘC)</span>
                        <span className="font-mono font-black text-amber-950 text-base sm:text-xl tracking-wider">
                          {paymentModalOrder.orderNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(paymentModalOrder.orderNumber, "Nội dung")}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-black text-xs transition shadow-2xs cursor-pointer shrink-0"
                      >
                        {copiedField === "Nội dung" ? "Đã chép ✓" : "Sao chép"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Radar Real-time & Polling status indicator */}
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex size-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-3 bg-emerald-500"></span>
                    </span>
                    <span className="font-semibold text-stone-800 text-[11px] sm:text-xs">
                      Đang lắng nghe chuyển khoản... Khớp lệnh tức thì 100% qua <strong>Socket.IO Real-time & Polling Backup (2.5s)</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-white border border-emerald-200 px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                    Tự động chuyển trang
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isVerifyingModalPayment}
                    onClick={handleManualVerifyInModal}
                    className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white text-xs sm:text-sm font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isVerifyingModalPayment ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    <span>{isVerifyingModalPayment ? "Đang đối soát ngân hàng..." : "Tôi đã chuyển tiền - Kiểm tra ngay"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      router.push(`/orders/${paymentModalOrder.id}`);
                    }}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs sm:text-sm font-bold transition cursor-pointer"
                  >
                    Để thanh toán sau & xem đơn
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      </div>
  );
}
