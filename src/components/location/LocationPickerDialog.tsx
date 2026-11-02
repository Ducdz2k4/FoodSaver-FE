"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  MapPin,
  Locate,
  Map,
  Search,
  Check,
  Home,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { AddressSearchInput } from "./AddressSearchInput";
import { MapLocationPicker } from "./MapLocationPicker";
import { useDeliveryLocation, LocationSource } from "@/context/DeliveryLocationContext";
import { useAuth } from "@/context/AuthContext";
import { GeocodeSuggestion, reverseGeocode } from "@/services/mapboxService";
import { toast } from "sonner";

interface LocationPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "search" | "map" | "gps";
}

export function LocationPickerDialog({
  isOpen,
  onClose,
  initialMode = "search",
}: LocationPickerDialogProps) {
  const { location, setSessionLocation, saveAsHomeLocation } = useDeliveryLocation();
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<"search" | "map">(
    initialMode === "map" ? "map" : "search"
  );

  // Draft working state inside dialog (never commits until confirmed)
  const [draftAddress, setDraftAddress] = useState(location.address);
  const [draftLat, setDraftLat] = useState(location.lat);
  const [draftLng, setDraftLng] = useState(location.lng);
  const [draftSource, setDraftSource] = useState<LocationSource>(location.source);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);

  // Sync draft with current location when opening
  useEffect(() => {
    if (isOpen) {
      setDraftAddress(location.address);
      setDraftLat(location.lat);
      setDraftLng(location.lng);
      setDraftSource(location.source);
      setSaveToProfile(false);
      setActiveTab(initialMode === "map" ? "map" : "search");

      if (initialMode === "gps") {
        handleTriggerGPS();
      }
    }
  }, [isOpen, location, initialMode]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleTriggerGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị GPS.");
      return;
    }

    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const rev = await reverseGeocode(longitude, latitude);
          const fullAddr =
            rev?.fullAddress ||
            rev?.name ||
            "Vị trí GPS hiện tại";

          setDraftLat(latitude);
          setDraftLng(longitude);
          setDraftAddress(fullAddr);
          setDraftSource("gps");
          toast.success("Đã lấy được địa chỉ theo GPS! Vui lòng xác nhận bên dưới.");
        } catch {
          setDraftLat(latitude);
          setDraftLng(longitude);
          setDraftAddress("Vị trí GPS hiện tại");
          setDraftSource("gps");
        } finally {
          setIsLocatingGPS(false);
        }
      },
      (err) => {
        setIsLocatingGPS(false);
        console.warn("[LocationPickerDialog] GPS error:", err);
        if (err.code === 1) {
          toast.error("Quyền truy cập vị trí bị từ chối. Vui lòng cấp quyền định vị hoặc gõ địa chỉ.");
        } else {
          toast.error("Không thể lấy tín hiệu GPS lúc này. Vui lòng chọn địa chỉ thủ công.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectSuggestion = (item: GeocodeSuggestion) => {
    setDraftAddress(item.fullAddress || item.name);
    setDraftLat(item.lat);
    setDraftLng(item.lng);
    setDraftSource("search");
  };

  const handleMapChange = (loc: { lat: number; lng: number; address: string }) => {
    setDraftLat(loc.lat);
    setDraftLng(loc.lng);
    setDraftAddress(loc.address);
    setDraftSource("map");
  };

  const handleConfirm = async () => {
    if (!draftAddress.trim()) {
      toast.error("Vui lòng chọn hoặc nhập địa chỉ giao hàng hợp lệ.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (saveToProfile && isAuthenticated && user) {
        await saveAsHomeLocation({
          address: draftAddress.trim(),
          lat: draftLat,
          lng: draftLng,
        });
      } else {
        setSessionLocation({
          address: draftAddress.trim(),
          lat: draftLat,
          lng: draftLng,
          source: draftSource,
        });
        toast.success("Đã cập nhật vị trí giao hàng cho lần này!");
      }
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Không thể xác nhận vị trí giao hàng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-dialog-title"
    >
      {/* Click outside to cancel */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Dialog Card */}
      <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-[#00615f]/10 text-[#00615f] flex items-center justify-center">
              <MapPin className="size-4.5" />
            </div>
            <div>
              <h2 id="location-dialog-title" className="text-base font-black text-stone-900 leading-snug">
                Chọn điểm giao hàng
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Tìm đồ ăn giải cứu gần bạn nhất trong bán kính mong muốn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 flex items-center justify-center transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Quick Tabs: Tìm theo địa chỉ vs Chọn trên bản đồ */}
          <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("search")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "search"
                  ? "bg-white text-[#00615f] shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Search className="size-3.5" />
              <span>Gõ tìm địa chỉ</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("map")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "map"
                  ? "bg-white text-[#00615f] shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Map className="size-3.5" />
              <span>Chọn trên bản đồ</span>
            </button>
          </div>

          {/* Quick GPS Action Button */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
            <div className="flex items-center gap-2 min-w-0">
              <Locate className="size-4 text-[#00615f] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900 truncate">Sử dụng vị trí hiện tại</p>
                <p className="text-[11px] text-stone-500 truncate">Tự động định vị GPS qua trình duyệt</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleTriggerGPS}
              disabled={isLocatingGPS}
              className="px-3.5 py-1.5 rounded-xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold transition shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isLocatingGPS ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  <span>Đang lấy...</span>
                </>
              ) : (
                <>
                  <Locate className="size-3" />
                  <span>Định vị ngay</span>
                </>
              )}
            </button>
          </div>

          {/* Mode 1: Search Input */}
          {activeTab === "search" && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                Tìm kiếm đường phố hoặc địa điểm:
              </label>
              <AddressSearchInput
                initialValue=""
                onSelect={handleSelectSuggestion}
                placeholder="Nhập tên đường, số nhà, phường hoặc quận..."
                autoFocus
                proximity={[draftLng, draftLat]}
              />
            </div>
          )}

          {/* Mode 2: Interactive Map Picker */}
          {activeTab === "map" && (
            <div className="space-y-1.5">
              <MapLocationPicker
                initialLat={draftLat}
                initialLng={draftLng}
                onLocationChange={handleMapChange}
                className="w-full h-64 sm:h-72"
              />
            </div>
          )}

          {/* Selected Address Preview & Fine-Tuning */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="address-detail-input" className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <MapPin className="size-3.5 text-[#00615f]" />
                <span>Chi tiết địa chỉ giao tới:</span>
              </label>
              {draftSource && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200/80 text-stone-600 uppercase tracking-wider">
                  {draftSource === "gps"
                    ? "Từ GPS"
                    : draftSource === "map"
                    ? "Từ Bản đồ"
                    : draftSource === "profile"
                    ? "Địa chỉ nhà"
                    : "Đã tìm kiếm"}
                </span>
              )}
            </div>

            <textarea
              id="address-detail-input"
              rows={2}
              value={draftAddress}
              onChange={(e) => setDraftAddress(e.target.value)}
              placeholder="Chỉnh sửa thêm số nhà, tên tòa nhà, số phòng nếu cần..."
              className="w-full p-2.5 text-xs font-medium text-stone-900 bg-white border border-stone-200 focus:border-[#00615f] focus:ring-1 focus:ring-[#00615f] rounded-xl outline-none resize-none transition"
            />
            <p className="text-[10px] text-stone-500 italic">
              * Bạn có thể gõ thêm số nhà/tầng/phòng để shipper giao chính xác nhất.
            </p>
          </div>

          {/* Save to Home Profile Option (only for logged-in users) */}
          {isAuthenticated && user && (
            <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={saveToProfile}
                onChange={(e) => setSaveToProfile(e.target.checked)}
                className="size-4 mt-0.5 rounded text-[#00615f] focus:ring-[#00615f] cursor-pointer"
              />
              <div className="text-left text-xs">
                <p className="font-bold text-stone-900 flex items-center gap-1">
                  <Home className="size-3.5 text-amber-700" />
                  <span>Lưu làm địa chỉ nhà trong hồ sơ cá nhân</span>
                </p>
                <p className="text-[11px] text-stone-600">
                  Lần sau đăng nhập hệ thống sẽ tự động dùng địa chỉ này làm mặc định.
                </p>
              </div>
            </label>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-stone-100 bg-stone-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200/60 transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || !draftAddress.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                <span>Xác nhận vị trí này</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
