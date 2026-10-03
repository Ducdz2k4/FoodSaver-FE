"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { baseApi } from "@/redux/api/baseApi";
import { toast } from "sonner";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(SOCKET_URL, {
      auth: {
        token: token || undefined,
      },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log(`[Socket.IO] Connected to ${SOCKET_URL} (${socketInstance.id})`);

      // If user has partner capability, join partner room
      if (user?.partnerProfileId) {
        socketInstance.emit("join_partner", user.partnerProfileId);
      }
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("[Socket.IO] Disconnected");
    });

    // Realtime Event Listeners
    socketInstance.on("NEW_ORDER", (data) => {
      toast.info(`🔔 Đơn hàng mới #${data?.orderNumber || ""}!`, {
        description: `Khách hàng vừa đặt ${data?.quantity || 1} phần món ăn của quán.`,
        action: {
          label: "Xem đơn",
          onClick: () => {
            window.location.href = "/partner/orders";
          },
        },
      });
      // Invalidate relevant RTK Query tags
      dispatch(baseApi.util.invalidateTags(["PartnerOrder", "PartnerListing", "Order"]));
    });

    socketInstance.on("ORDER_STATUS_CHANGED", (data) => {
      const statusMap: Record<string, string> = {
        ACCEPTED: "Quán đã xác nhận chuẩn bị đơn",
        COMPLETED: "Đơn hàng đã bàn giao thành công",
        REJECTED: "Quán đã từ chối đơn hàng (Hết đồ)",
        CANCELLED: "Đơn hàng đã được hủy",
      };
      const message = statusMap[data?.status] || `Đơn hàng #${data?.orderNumber} cập nhật: ${data?.status}`;
      toast.success(`📦 ${message}!`, {
        description: `Mã đơn #${data?.orderNumber || ""}`,
        action: {
          label: "Chi tiết",
          onClick: () => {
            window.location.href = `/orders/${data?.orderId || ""}`;
          },
        },
      });
      // Invalidate relevant RTK Query tags
      dispatch(baseApi.util.invalidateTags(["Order", "PartnerOrder"]));
    });

    socketInstance.on("LISTING_UPDATED", () => {
      dispatch(baseApi.util.invalidateTags(["Listing", "PartnerListing"]));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token, user?.partnerProfileId, dispatch]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
