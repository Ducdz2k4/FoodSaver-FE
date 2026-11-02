"use client";

import React, { useState } from "react";
import { MapPin, Locate, ChevronDown, Home, Navigation, Loader2 } from "lucide-react";
import { useDeliveryLocation } from "@/context/DeliveryLocationContext";
import { LocationPickerDialog } from "./LocationPickerDialog";
import { reverseGeocode } from "@/services/mapboxService";
import { toast } from "sonner";

export function DeliveryHeaderPill() {
  const { location, setSessionLocation } = useDeliveryLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"search" | "map" | "gps">("search");
  const [isQuickLocating, setIsQuickLocating] = useState(false);

  const handleOpenDialog = (mode: "search" | "map" = "search") => {
    setDialogMode(mode);
    setIsDialogOpen(true);
  };

  /**
   * Quick GPS detection directly from pill button:
   * Requests geolocation -> Reverse geocodes -> Opens confirmation dialog for user approval
   * Never silently overwrites home address!
   */
  const handleQuickGPS = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị GPS.");
      return;
    }

    setIsQuickLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const rev = await reverseGeocode(longitude, latitude);
          const fullAddress =
            rev?.fullAddress ||
            rev?.name ||
            "Vị trí GPS hiện tại";

          setIsQuickLocating(false);
          // Open dialog in GPS mode with the detected coordinates and address for confirmation
          setDialogMode("gps");
          setIsDialogOpen(true);
        } catch {
          setIsQuickLocating(false);
          setDialogMode("gps");
          setIsDialogOpen(true);
        }
      },
      (err) => {
        setIsQuickLocating(false);
        console.warn("[DeliveryHeaderPill] GPS error:", err);
        if (err.code === 1) {
          toast.error("Quyền truy cập GPS bị từ chối. Vui lòng cấp quyền hoặc gõ địa chỉ.");
        } else {
          toast.error("Không thể lấy GPS lúc này. Vui lòng chọn địa chỉ thủ công.");
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <>
      <div
        onClick={() => handleOpenDialog("search")}
        className="group flex items-center gap-2 text-xs font-bold text-stone-800 bg-[#f9f3f0] hover:bg-stone-100/90 px-3.5 py-2 rounded-2xl border border-stone-200/80 min-w-0 transition cursor-pointer select-none shadow-xs"
        title={`Điểm giao hàng hiện tại: ${location.address}. Bấm để thay đổi.`}
      >
        <span className="uppercase tracking-wider text-[10px] text-stone-500 font-black shrink-0">
          GIAO TỚI:
        </span>

        {/* Source Icon */}
        {location.source === "profile" && location.isSavedHome ? (
          <Home className="size-3.5 text-[#00615f] shrink-0" />
        ) : location.source === "gps" ? (
          <Navigation className="size-3.5 text-[#00615f] shrink-0" />
        ) : (
          <MapPin className="size-3.5 text-[#00615f] shrink-0" />
        )}

        {/* Display Text Address (NEVER coordinates) */}
        <span className="truncate text-stone-900 font-semibold max-w-[200px] sm:max-w-[280px] md:max-w-[340px]">
          {location.address || "Chọn địa chỉ giao hàng"}
        </span>

        {/* Source Badge if applicable */}
        {location.isSavedHome && (
          <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded shrink-0">
            Nhà
          </span>
        )}

        <ChevronDown className="size-3 text-stone-400 group-hover:text-stone-600 transition shrink-0 ml-0.5" />

        {/* Quick GPS button */}
        <button
          type="button"
          onClick={handleQuickGPS}
          disabled={isQuickLocating}
          className="inline-flex items-center gap-1 text-[11px] text-[#00615f] hover:text-[#089184] hover:underline font-bold shrink-0 ml-1.5 pl-2 border-l border-stone-300 cursor-pointer disabled:opacity-50"
          title="Lấy vị trí GPS hiện tại"
        >
          {isQuickLocating ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Locate className="size-3" />
          )}
          <span>Định vị</span>
        </button>
      </div>

      {/* Reusable Dialog */}
      <LocationPickerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        initialMode={dialogMode}
      />
    </>
  );
}
