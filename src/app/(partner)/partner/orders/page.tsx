"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MapPin,
  Loader2,
  Gavel,
  Truck,
  ShoppingBag,
  CreditCard,
  Lock,
  MessageSquare,
  KeyRound,
  ShieldCheck,
  PackageCheck,
  AlertCircle,
  X,
} from "lucide-react";
import { OrderDTO, FulfillmentType } from "@/types/contract";
import {
  useGetPartnerOrdersQuery,
  useUpdatePartnerOrderStatusMutation,
  useRespondBargainMutation,
  useConfirmHandoverMutation,
} from "@/redux/api/orderApi";
import { OrderChatModal } from "@/components/common/OrderChatModal";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";

type FulfillmentFilter = "ALL" | "PICKUP" | "DELIVERY";

export default function PartnerOrdersPage() {
  const { data: realOrders, isLoading, isFetching, refetch } = useGetPartnerOrdersQuery();
  const [updateStatusMutation] = useUpdatePartnerOrderStatusMutation();
  const [respondBargainMutation] = useRespondBargainMutation();
  const [confirmHandoverMutation, { isLoading: isHandingOver }] = useConfirmHandoverMutation();
  const { socket } = useSocket();

  const orders = realOrders || [];

  // Filter state
  const [fulfillmentFilter, setFulfillmentFilter] = useState<FulfillmentFilter>("ALL");

  // Handover OTP Modal State
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);
  const [handoverTargetOrder, setHandoverTargetOrder] = useState<OrderDTO | null>(null);
  const [inputOtp, setInputOtp] = useState("");

  // Chat Modal State
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatTargetOrder, setChatTargetOrder] = useState<OrderDTO | null>(null);

  // Real-time Bargain Request Dialog State
  const [bargainModalOpen, setBargainModalOpen] = useState(false);
  const [activeBargainOrder, setActiveBargainOrder] = useState<any>(null);
  const [counterFee, setCounterFee] = useState<number>(20000);
  const [partnerMessage, setPartnerMessage] = useState<string>("");

  useEffect(() => {
    if (!socket) return;

    const handleReceiveBargain = (data: any) => {
      setActiveBargainOrder(data);
      setCounterFee(data.proposedFee);
      setBargainModalOpen(true);
      toast.info(`⚡ Khách chém giá ship: ${data.proposedFee.toLocaleString("vi-VN")}đ!`, {
        description: `Đơn #${data.orderNumber} của ${data.customerName}`,
      });
    };

    socket.on("RECEIVE_BARGAIN_REQUEST", handleReceiveBargain);

    return () => {
      socket.off("RECEIVE_BARGAIN_REQUEST", handleReceiveBargain);
    };
  }, [socket]);

  const filteredOrders = useMemo(() => {
    if (fulfillmentFilter === "ALL") return orders;
    if (fulfillmentFilter === "PICKUP") {
      return orders.filter((o) => o.fulfillmentType === "PICKUP" || o.fulfillmentType === "STORE_PICKUP");
    }
    return orders.filter((o) => o.fulfillmentType === "DELIVERY" || o.fulfillmentType === "PARTNER_DELIVERY");
  }, [orders, fulfillmentFilter]);

  const handleBargainAction = async (accepted: boolean) => {
    if (!activeBargainOrder) return;
    try {
      await respondBargainMutation({
        id: activeBargainOrder.orderId,
        accepted,
        finalFee: accepted ? activeBargainOrder.proposedFee : counterFee,
        message: partnerMessage || (accepted ? "Quán đã đồng ý giá chém của bạn!" : "Quán đưa giá chốt khác"),
      }).unwrap();

      // Emit socket response back to user
      if (socket) {
        socket.emit("BARGAIN_SHIPPING_RESPONSE", {
          customerId: activeBargainOrder.customerId,
          accepted,
          finalFee: accepted ? activeBargainOrder.proposedFee : counterFee,
          message: partnerMessage || (accepted ? "Quán đã đồng ý giá chém của bạn!" : `Quán chốt giá: ${counterFee.toLocaleString("vi-VN")}đ`),
        });
      }

      toast.success(accepted ? "Đã chấp nhận giá chém của khách!" : "Đã gửi giá chốt khác cho khách.");
      setBargainModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Thao tác thất bại");
    }
  };

  const updateStatus = async (id: string, newStatus: "ACCEPTED" | "REJECTED" | "COMPLETED") => {
    try {
      await updateStatusMutation({ id, status: newStatus }).unwrap();
      const statusMap = {
        ACCEPTED: "Đã xác nhận tiếp nhận đơn và bắt đầu chuẩn bị món",
        REJECTED: "Đã từ chối đơn hàng (hoàn lại tồn kho)",
        COMPLETED: "Đã hoàn tất đơn hàng",
      };
      toast.success(statusMap[newStatus] || `Đã cập nhật đơn sang: ${newStatus}`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const handleOpenHandoverModal = (order: OrderDTO) => {
    setHandoverTargetOrder(order);
    setInputOtp("");
    setHandoverModalOpen(true);
  };

  const handleConfirmHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverTargetOrder) return;

    const isPickup = handoverTargetOrder.fulfillmentType === "PICKUP" || handoverTargetOrder.fulfillmentType === "STORE_PICKUP";
    if (isPickup && (!inputOtp.trim() || inputOtp.trim().length !== 6)) {
      toast.error("Vui lòng nhập đúng mã OTP 6 số do khách hàng cung cấp!");
      return;
    }

    try {
      await confirmHandoverMutation({
        id: handoverTargetOrder.id,
        otp: isPickup ? inputOtp.trim() : undefined,
        note: isPickup ? "Quán đã bàn giao món tại quầy với mã OTP" : "Quán đã giao hàng thành công cho khách",
      }).unwrap();

      toast.success("✓ Bàn giao món thành công! Chờ khách xác nhận hoàn tất.");
      setHandoverModalOpen(false);
      setHandoverTargetOrder(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Xác thực bàn giao thất bại. Vui lòng kiểm tra lại mã OTP!");
    }
  };

  const handleOpenChat = (order: OrderDTO) => {
    setChatTargetOrder(order);
    setChatModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
            Đơn hàng cứu trợ từ khách
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Xác nhận tiếp nhận đơn, giao hàng tận nơi (bán kính ≤20km) hoặc bàn giao tại quầy với mã OTP bảo mật.
          </p>
        </div>
        {(isLoading || isFetching) && <Loader2 className="size-5 animate-spin text-[#00615f]" />}
      </div>

      {/* Tabs Filter theo hình thức nhận hàng */}
      <div className="flex gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setFulfillmentFilter("ALL")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
            fulfillmentFilter === "ALL"
              ? "bg-[#00615f] text-white shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          Tất cả đơn ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setFulfillmentFilter("PICKUP")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
            fulfillmentFilter === "PICKUP"
              ? "bg-[#00615f] text-white shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <ShoppingBag className="size-3.5" />
          <span>Tới quán lấy ({orders.filter((o) => o.fulfillmentType === "PICKUP" || o.fulfillmentType === "STORE_PICKUP").length})</span>
        </button>

        <button
          type="button"
          onClick={() => setFulfillmentFilter("DELIVERY")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
            fulfillmentFilter === "DELIVERY"
              ? "bg-[#00615f] text-white shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <Truck className="size-3.5" />
          <span>Quán tự giao ({orders.filter((o) => o.fulfillmentType === "DELIVERY" || o.fulfillmentType === "PARTNER_DELIVERY").length})</span>
        </button>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-stone-400 border border-stone-200/90 space-y-2">
            <ShoppingBag className="size-10 text-stone-300 mx-auto stroke-[1.5]" />
            <p className="font-bold text-sm text-stone-600">Chưa có đơn hàng nào trong mục này</p>
            <p className="text-xs">Khi có khách đặt món hoặc thương lượng phí ship, đơn sẽ hiển thị tại đây.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isPickup = order.fulfillmentType === "PICKUP" || order.fulfillmentType === "STORE_PICKUP";
            const isOnline = order.paymentMethod === "ONLINE" || order.paymentMethod === "SYSTEM_QR";

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-4 hover:border-emerald-200 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs sm:text-sm text-[#00615f]">
                      #{order.orderNumber}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-xs text-stone-500">
                      {new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} - {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    {order.isLocked && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-900 text-emerald-400">
                        <Lock className="size-3" /> Đã chốt sau 5s
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-bold w-fit ${
                        order.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : order.status === "ACCEPTED" || order.status === "PREPARING"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.status === "READY"
                          ? "bg-teal-100 text-teal-800"
                          : order.status === "HANDED_OVER"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "COMPLETED"
                          ? "bg-emerald-600 text-white"
                          : order.status === "REJECTED" || order.status === "CANCELLED" || order.status === "EXPIRED"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {order.status === "PENDING" && "Chờ xác nhận"}
                      {(order.status === "ACCEPTED" || order.status === "PREPARING") && "Đang chuẩn bị"}
                      {order.status === "READY" && "Món đã sẵn sàng"}
                      {order.status === "HANDED_OVER" && "✓ Đã bàn giao (Chờ khách chốt)"}
                      {order.status === "COMPLETED" && "✓ Hoàn tất thành công"}
                      {order.status === "REJECTED" && "✕ Đã từ chối"}
                      {order.status === "CANCELLED" && "✕ Khách đã hủy"}
                      {order.status === "EXPIRED" && "✕ Quá hạn (No-Show)"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                      {order.listingTitle} ({order.quantity} suất)
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
                      <span className="inline-flex items-center gap-1 font-bold text-[#00615f] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                        {isPickup ? (
                          <>
                            <ShoppingBag className="size-3.5" /> Khách tự đến lấy (Pickup)
                          </>
                        ) : (
                          <>
                            <Truck className="size-3.5" /> Quán tự giao hàng (Delivery)
                          </>
                        )}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <CreditCard className="size-3.5 text-stone-400" />
                        Thanh toán:{" "}
                        <strong>{isOnline ? "Trực tuyến (Ký quỹ Escrow)" : "Tiền mặt khi nhận (COD)"}</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1">
                      <span>
                        Khách hàng: <strong className="text-stone-800">{order.customerName}</strong>
                      </span>
                      <span>
                        SĐT: <strong className="text-stone-800">{order.customerPhone}</strong>
                      </span>
                      <span className="flex items-center gap-1 text-[#00615f] font-bold">
                        <Clock className="size-3.5" /> Hẹn: {order.pickupTimeWindow}
                      </span>
                    </div>

                    {!isPickup && order.deliveryAddress && (
                      <p className="text-xs text-stone-600 flex items-center gap-1 pt-0.5">
                        <MapPin className="size-3.5 text-[#00615f] shrink-0" />
                        <span>Địa chỉ giao: <strong>{order.deliveryAddress}</strong></span>
                      </p>
                    )}

                    {order.customerNotes && (
                      <p className="text-xs text-amber-700 italic bg-amber-50 p-2 rounded-xl border border-amber-100 mt-1">
                        Ghi chú: "{order.customerNotes}"
                      </p>
                    )}
                  </div>

                  <div className="text-right sm:shrink-0 space-y-0.5 bg-stone-50 p-3 rounded-2xl border border-stone-200 min-w-[160px]">
                    <div className="text-xs text-stone-500">
                      Tiền món: <strong>{(order.merchandiseTotal || (order.unitPrice * order.quantity)).toLocaleString("vi-VN")}đ</strong>
                    </div>
                    {!isPickup && (
                      <div className="text-xs text-emerald-700">
                        Phí ship (100% quán): <strong>{order.shippingFee.toLocaleString("vi-VN")}đ</strong>
                      </div>
                    )}
                    <div className="text-base sm:text-lg font-black text-[#00615f] pt-1 border-t border-stone-200">
                      {order.totalPrice.toLocaleString("vi-VN")}đ
                    </div>
                    <span className="text-[10px] text-stone-400 block font-medium">
                      {isOnline ? "Ký quỹ hệ thống" : "Thu tiền mặt"}
                    </span>
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenChat(order)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 transition flex items-center gap-1.5"
                    >
                      <MessageSquare className="size-3.5 text-[#00615f]" />
                      <span>Nhắn tin với khách</span>
                    </button>

                    {order.customerPhone && (
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 transition flex items-center gap-1.5"
                      >
                        <Phone className="size-3.5 text-[#00615f]" />
                        <span>Gọi khách</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          onClick={() => updateStatus(order.id, "REJECTED")}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
                        >
                          Từ chối
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(order.id, "ACCEPTED")}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00615f] hover:bg-[#089184] text-white shadow-sm transition"
                        >
                          ✓ Chấp nhận chuẩn bị
                        </button>
                      </>
                    )}

                    {(order.status === "ACCEPTED" || order.status === "PREPARING" || order.status === "READY") && (
                      <button
                        type="button"
                        onClick={() => handleOpenHandoverModal(order)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center gap-1.5"
                      >
                        {isPickup ? (
                          <>
                            <KeyRound className="size-3.5" />
                            <span>Bàn giao món (Xác thực OTP)</span>
                          </>
                        ) : (
                          <>
                            <Truck className="size-3.5" />
                            <span>Xác nhận đã giao hàng</span>
                          </>
                        )}
                      </button>
                    )}

                    {order.status === "HANDED_OVER" && (
                      <span className="text-xs font-bold text-stone-500 italic flex items-center gap-1">
                        <PackageCheck className="size-4 text-blue-600" />
                        <span>Đã bàn giao. Đang chờ khách xác nhận...</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Bàn Giao Món (Xác Thực OTP Khách Cung Cấp) */}
      {handoverModalOpen && handoverTargetOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setHandoverModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm sm:text-base">
                <ShieldCheck className="size-5 text-emerald-600" />
                <span>
                  {(handoverTargetOrder.fulfillmentType === "PICKUP" || handoverTargetOrder.fulfillmentType === "STORE_PICKUP")
                    ? "Xác thực OTP nhận món tại quầy"
                    : "Xác nhận đã giao hàng tận nơi"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHandoverModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:bg-stone-100 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-1 text-xs text-stone-600">
              <div>
                Đơn hàng: <strong className="font-mono text-stone-900">#{handoverTargetOrder.orderNumber}</strong>
              </div>
              <div>
                Món ăn: <strong className="text-stone-900">{handoverTargetOrder.listingTitle} ({handoverTargetOrder.quantity} suất)</strong>
              </div>
              <div>
                Khách nhận: <strong className="text-stone-900">{handoverTargetOrder.customerName}</strong> ({handoverTargetOrder.customerPhone})
              </div>
            </div>

            {(handoverTargetOrder.fulfillmentType === "PICKUP" || handoverTargetOrder.fulfillmentType === "STORE_PICKUP") ? (
              <form onSubmit={handleConfirmHandover} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Nhập mã OTP 6 số khách hàng cung cấp:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value.replace(/D/g, ""))}
                    placeholder="VD: 123456"
                    className="w-full text-center tracking-widest text-2xl font-mono font-black py-3 px-4 rounded-2xl bg-stone-50 border-2 border-emerald-300 text-[#00615f] focus:outline-none focus:border-[#00615f]"
                  />
                  <p className="text-[11px] text-stone-500 mt-1 text-center">
                    Mã này hiển thị trên màn hình chi tiết đơn hàng của khách.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setHandoverModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isHandingOver || inputOtp.length !== 6}
                    className="px-5 py-2.5 text-xs font-bold bg-[#00615f] hover:bg-[#089184] text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isHandingOver ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-3.5" />
                    )}
                    <span>Xác nhận giao món</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-stone-600">
                  Bạn xác nhận rằng đối tác đã giao món ăn thành công đến địa chỉ của khách hàng <strong>{handoverTargetOrder.deliveryAddress}</strong>.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setHandoverModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                  >
                    Chưa giao
                  </button>
                  <button
                    type="button"
                    disabled={isHandingOver}
                    onClick={handleConfirmHandover}
                    className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isHandingOver ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-3.5" />
                    )}
                    <span>Xác nhận đã giao hàng</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Thương Lượng Phí Ship (Socket) */}
      {bargainModalOpen && activeBargainOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in-95 duration-200"
          onClick={() => setBargainModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-amber-600 font-extrabold text-base">
              <Gavel className="size-5" />
              <span>Yêu cầu chém giá ship từ khách hàng!</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
              <div>
                Khách hàng: <strong>{activeBargainOrder.customerName}</strong>
              </div>
              <div>
                Khoảng cách: <strong>{activeBargainOrder.distanceKm} km</strong>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-amber-200">
                <span className="text-stone-500">Phí mặc định theo km:</span>
                <span className="line-through text-stone-400">
                  {activeBargainOrder.defaultFee.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-black text-amber-900">
                <span>Khách chém giá còn:</span>
                <span className="text-emerald-700 font-black text-base">
                  {activeBargainOrder.proposedFee.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">
                Hoặc quán đưa ra mức giá chốt khác (VNĐ):
              </label>
              <input
                type="number"
                min={5000}
                max={60000}
                step={5000}
                value={counterFee}
                onChange={(e) => setCounterFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-black text-[#00615f] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleBargainAction(false)}
                className="px-4 py-2 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl"
              >
                Chốt giá {counterFee.toLocaleString("vi-VN")}đ
              </button>
              <button
                type="button"
                onClick={() => handleBargainAction(true)}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
              >
                ✓ Đồng ý giá khách chém
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Chat Modal */}
      {chatTargetOrder && (
        <OrderChatModal
          orderId={chatTargetOrder.id}
          orderNumber={chatTargetOrder.orderNumber}
          partnerName={chatTargetOrder.partnerName}
          customerName={chatTargetOrder.customerName}
          targetPhone={chatTargetOrder.customerPhone}
          currentUserRole="PARTNER"
          isOpen={chatModalOpen}
          onClose={() => {
            setChatModalOpen(false);
            setChatTargetOrder(null);
          }}
        />
      )}
    </div>
  );
}
