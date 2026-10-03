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
} from "@/redux/api/orderApi";
import { FulfillmentType, PaymentMethod } from "@/types/contract";
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
      if (data?.accepted) {
        setBargainStatus("ACCEPTED");
        setFinalAgreedFee(data.finalFee);
        toast.success(`🎉 Quán đã chấp nhận giá chém ${data.finalFee.toLocaleString("vi-VN")}đ!`);
      } else {
        setBargainStatus("COUNTER");
        setFinalAgreedFee(data.finalFee || defaultShippingFee);
        setPartnerMessage(data.message || "Quán đưa giá chốt khác");
        toast.info(`🔔 Phản hồi từ quán: ${data.message || "Giá chốt khác: " + data.finalFee.toLocaleString("vi-VN") + "đ"}`);
      }
    };

    socket.on("RECEIVE_BARGAIN_RESPONSE", handleBargainResponse);

    return () => {
      socket.off("RECEIVE_BARGAIN_RESPONSE", handleBargainResponse);
    };
  }, [socket, defaultShippingFee]);

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
  const totalPrice = itemSubtotal + currentShippingFee;

  
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

      toast.success("Tạo đơn hàng thành công!");
      router.push(`/orders/${result.id}`);
    } catch (error: any) {
      const msg = error?.data?.message || "Đặt món thất bại. Vui lòng thử lại.";
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
                    <ShoppingBag className="size-4" /> Tự đến quán lấy
                  </span>
                  <span className="text-xs font-bold">0đ phí ship</span>
                </div>
                <p className={`text-xs ${fulfillmentType === "PICKUP" ? "text-emerald-100" : "text-stone-500"}`}>
                  Bạn đến trực tiếp cửa hàng theo khung giờ hẹn để nhận đồ.
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
                    <Truck className="size-4" /> Giao hàng tận nơi
                  </span>
                  <span className="text-xs font-bold">Phí ship tối đa 60k</span>
                </div>
                <p className={`text-xs ${fulfillmentType === "DELIVERY" ? "text-emerald-100" : "text-stone-500"}`}>
                  Quán gửi shipper giao tới tận tay bạn (Bán kính tối đa 20km).
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
                            {partnerMessage && <p className="italic">"{partnerMessage}"</p>}
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
                onClick={() => setPaymentMethod("COD")}
                className={`p-4 rounded-2xl border text-left transition ${
                  paymentMethod === "COD"
                    ? "bg-[#00615f] text-white border-[#00615f] shadow-md"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="size-4" />
                  <span className="font-extrabold text-sm">Thanh toán khi nhận hàng (COD)</span>
                </div>
                <p className={`text-xs ${paymentMethod === "COD" ? "text-emerald-100" : "text-stone-500"}`}>
                  Thanh toán tiền mặt hoặc chuyển khoản trực tiếp cho shipper/quầy khi nhận đồ.
                </p>
              </button>

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
                  <span className="font-extrabold text-sm">Quét mã QR hệ thống FoodSaver</span>
                </div>
                <p className={`text-xs ${paymentMethod === "SYSTEM_QR" ? "text-emerald-100" : "text-stone-500"}`}>
                  Quét mã QR VietQR tự động khớp nội dung đơn hàng ngay sau khi chốt giá.
                </p>
              </button>
            </div>
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
    </div>
  );
}
