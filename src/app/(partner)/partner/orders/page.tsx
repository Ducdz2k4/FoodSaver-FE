"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { MOCK_ORDERS } from "@/mocks/mockData";
import { OrderDTO } from "@/types/contract";
import {
  useGetPartnerOrdersQuery,
  useUpdatePartnerOrderStatusMutation,
  useRespondBargainMutation,
} from "@/redux/api/orderApi";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";

export default function PartnerOrdersPage() {
  const { data: realOrders, isLoading, isFetching } = useGetPartnerOrdersQuery();
  const [updateStatusMutation] = useUpdatePartnerOrderStatusMutation();
  const [respondBargainMutation] = useRespondBargainMutation();
  const { socket } = useSocket();

  const orders = realOrders && realOrders.length > 0 ? realOrders : MOCK_ORDERS;

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
    } catch (err: any) {
      toast.error(err?.data?.message || "Thao tác thất bại");
    }
  };

  const updateStatus = async (id: string, newStatus: "ACCEPTED" | "REJECTED" | "COMPLETED") => {
    try {
      await updateStatusMutation({ id, status: newStatus }).unwrap();
      const statusMap = {
        ACCEPTED: "Đã xác nhận chuẩn bị món",
        REJECTED: "Đã từ chối đơn hàng",
        COMPLETED: "Đã bàn giao đơn hàng thành công",
      };
      toast.success(statusMap[newStatus] || `Đã cập nhật đơn sang: ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
            Đơn hàng cứu trợ từ khách
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Xác nhận tiếp nhận đơn, giao hàng tận nơi (tối đa 20km) hoặc bàn giao tại quầy.
          </p>
        </div>
        {(isLoading || isFetching) && <Loader2 className="size-5 animate-spin text-[#00615f]" />}
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs sm:text-sm text-[#00615f]">
                  #{order.orderNumber}
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-xs text-stone-500">
                  {new Date(order.createdAt).toLocaleTimeString("vi-VN")}
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
                      : order.status === "ACCEPTED"
                      ? "bg-emerald-100 text-emerald-800"
                      : order.status === "COMPLETED"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {order.status === "PENDING" && "Chờ xác nhận"}
                  {order.status === "ACCEPTED" && "Đã nhận chuẩn bị"}
                  {order.status === "COMPLETED" && "Đã giao thành công"}
                  {order.status === "REJECTED" && "Đã từ chối"}
                  {order.status === "CANCELLED" && "Khách đã hủy"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                  {order.listingTitle} ({order.quantity} suất)
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
                  <span className="inline-flex items-center gap-1 font-bold text-[#00615f]">
                    {order.fulfillmentType === "DELIVERY" ? (
                      <>
                        <Truck className="size-3.5" /> Giao hàng (Ship)
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="size-3.5" /> Khách tự lấy
                      </>
                    )}
                  </span>
                  <span>•</span>
                  <span>
                    Thanh toán:{" "}
                    <strong>{order.paymentMethod === "SYSTEM_QR" ? "QR Hệ thống" : "Tiền mặt (COD)"}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  <span>
                    Khách: <strong className="text-stone-700">{order.customerName}</strong>
                  </span>
                  <span>
                    SĐT: <strong className="text-stone-700">{order.customerPhone}</strong>
                  </span>
                  <span className="flex items-center gap-1 text-[#00615f] font-bold">
                    <Clock className="size-3.5" /> Hẹn: {order.pickupTimeWindow}
                  </span>
                </div>

                {order.fulfillmentType === "DELIVERY" && order.deliveryAddress && (
                  <p className="text-xs text-stone-600 flex items-center gap-1">
                    <MapPin className="size-3.5 text-stone-400" />
                    <span>Địa chỉ giao: <strong>{order.deliveryAddress}</strong></span>
                  </p>
                )}

                {order.customerNotes && (
                  <p className="text-xs text-amber-700 italic bg-amber-50 p-2 rounded-xl border border-amber-100 mt-1">
                    Ghi chú: "{order.customerNotes}"
                  </p>
                )}
              </div>

              <div className="text-right sm:shrink-0 space-y-0.5">
                <div className="text-xs text-stone-400">
                  Phí ship: <strong className="text-stone-700">{order.shippingFee.toLocaleString("vi-VN")}đ</strong>
                </div>
                <span className="text-base sm:text-lg font-black text-[#00615f] block">
                  {order.totalPrice.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-[11px] text-stone-400 block">
                  {order.paymentMethod === "SYSTEM_QR" ? "Khách trả qua QR" : "Thu tiền mặt khi nhận"}
                </span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              {order.status === "PENDING" && (
                <>
                  <button
                    type="button"
                    onClick={() => updateStatus(order.id, "REJECTED")}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
                  >
                    Từ chối (Hết hàng)
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

              {order.status === "ACCEPTED" && (
                <button
                  type="button"
                  onClick={() => updateStatus(order.id, "COMPLETED")}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Đã giao đồ cho khách / shipper</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Xử lý Chém Giá Phí Ship (Socket.IO Realtime) */}
      {bargainModalOpen && activeBargainOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-amber-700 font-extrabold text-base">
              <Gavel className="size-5" />
              <span>Khách yêu cầu chém giá phí ship</span>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5">
              <p>
                <span className="text-stone-500">Khách hàng:</span>{" "}
                <strong>{activeBargainOrder.customerName}</strong> (Khoảng cách {activeBargainOrder.distanceKm}km)
              </p>
              <p>
                <span className="text-stone-500">Phí ship mặc định:</span>{" "}
                <span className="line-through">{activeBargainOrder.defaultFee?.toLocaleString("vi-VN")}đ</span>
              </p>
              <p className="text-sm font-black text-amber-700">
                Giá khách muốn trả: {activeBargainOrder.proposedFee?.toLocaleString("vi-VN")}đ
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">
                Nếu không đồng ý, đưa ra giá chốt khác (Tối đa 60k):
              </label>
              <input
                type="number"
                min={5000}
                max={60000}
                step={5000}
                value={counterFee}
                onChange={(e) => setCounterFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">Lời nhắn gửi khách:</label>
              <input
                type="text"
                value={partnerMessage}
                onChange={(e) => setPartnerMessage(e.target.value)}
                placeholder="Ví dụ: Giờ này trời mưa nên quán chốt giá 20k nhé"
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleBargainAction(false)}
                className="px-4 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl"
              >
                Chốt giá khác ({counterFee.toLocaleString("vi-VN")}đ)
              </button>

              <button
                type="button"
                onClick={() => handleBargainAction(true)}
                className="px-4 py-2 text-xs font-bold bg-[#00615f] hover:bg-[#089184] text-white rounded-xl shadow-sm"
              >
                Đồng ý giá khách ({activeBargainOrder.proposedFee?.toLocaleString("vi-VN")}đ)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
