"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAppSelector } from "@/redux/hooks";

export function useMockRealtimeEvents() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Clear previous timers on re-mount
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Chỉ chạy simulation khi đã login
    if (!currentUser) return;

    // 1. Sau 8s: Giả lập thông báo món khẩn cấp gần vị trí
    const t1 = setTimeout(() => {
      toast.warning("⚡ Sắp hết hạn trong 1 giờ!", {
        description: "Tiệm Bánh Mì Artisan Bakery còn 2 phần bánh sừng trâu giảm 65% gần bạn.",
        action: {
          label: "Xem ngay",
          onClick: () => {
            window.location.href = "/listing/list-2";
          },
        },
      });
    }, 8000);

    // 2. Sau 25s: Giả lập trạng thái đơn hàng nếu là khách
    const t2 = setTimeout(() => {
      if (currentUser.partnerCapability === "NONE") {
        toast.success("🛍️ Cửa hàng đã chuẩn bị xong đơn của bạn!", {
          description: "Đơn hàng #FS2026092601 đã sẵn sàng tại 128 Nguyễn Trãi, Q1.",
          action: {
            label: "Mở mã QR",
            onClick: () => {
              window.location.href = "/orders/ord-101";
            },
          },
        });
      }
    }, 25000);

    // 3. Nếu là đối tác pending -> sau 15s giả lập Admin đã thẩm định
    if (currentUser.partnerCapability === "PENDING") {
      const t3 = setTimeout(() => {
        toast.info("🛡️ Cập nhật tiến trình thẩm định", {
          description: "Hồ sơ GPKD & Chứng nhận ATTP của bạn đã được Admin tiếp nhận và đang đối chiếu.",
        });
      }, 12000);
      timersRef.current.push(t3);
    }

    timersRef.current.push(t1, t2);

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [currentUser]);
}
