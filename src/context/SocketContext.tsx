"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { baseApi } from "@/redux/api/baseApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  playOrderChime: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  soundEnabled: true,
  toggleSound: () => {},
  playOrderChime: () => {},
});

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000";

let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
};

export const playDualToneChime = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tone 1: 880Hz (A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Tone 2: 1320Hz (E6 - Fifth above A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1320, now + 0.1);
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);
  } catch (err) {
    console.warn("[Sound] Unable to synthesize chime:", err);
  }
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Load sound setting from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("foodsaver_sound_enabled");
      if (saved !== null) {
        setSoundEnabled(saved === "true");
      }
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("foodsaver_sound_enabled", String(next));
      }
      if (next) {
        playDualToneChime();
        toast.info("🔊 Đã bật âm thanh thông báo đơn mới");
      } else {
        toast.info("🔇 Đã tắt âm thanh thông báo");
      }
      return next;
    });
  }, []);

  // Unlock AudioContext on first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      getAudioContext();
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });
    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

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
      // Play audio alert if sound is enabled
      if (soundEnabled) {
        playDualToneChime();
      }

      toast.info(`🔔 Đơn hàng mới #${data?.orderNumber || ""}!`, {
        description: `Khách hàng vừa đặt ${data?.quantity || 1} phần món ăn của quán.`,
        duration: 8000,
        action: {
          label: "Xem đơn",
          onClick: () => {
            router.push("/partner/orders");
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
            router.push(`/orders/${data?.orderId || ""}`);
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
  }, [token, user?.partnerProfileId, dispatch, router, soundEnabled]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        soundEnabled,
        toggleSound,
        playOrderChime: playDualToneChime,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
