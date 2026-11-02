"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Locate, Loader2, Plus, Minus } from "lucide-react";
import { reverseGeocode } from "@/services/mapboxService";
import { toast } from "sonner";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MapLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationChange: (loc: { lat: number; lng: number; address: string }) => void;
  className?: string;
}

export function MapLocationPicker({
  initialLat = 10.7769,
  initialLng = 106.695,
  onLocationChange,
  className = "w-full h-80 sm:h-96",
}: MapLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Debounced reverse geocoding on drag / click
  const triggerReverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setIsGeocoding(true);
      try {
        const result = await reverseGeocode(lng, lat);
        const address =
          result?.fullAddress ||
          result?.name ||
          "Vị trí đã chọn trên bản đồ";

        onLocationChange({ lat, lng, address });
      } catch (err) {
        console.error("[MapLocationPicker] Reverse geocode error:", err);
        onLocationChange({
          lat,
          lng,
          address: "Vị trí đã chọn trên bản đồ",
        });
      } finally {
        setIsGeocoding(false);
      }
    },
    [onLocationChange]
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!MAPBOX_TOKEN) {
      toast.error("Thiếu Mapbox Access Token. Vui lòng cấu hình NEXT_PUBLIC_MAPBOX_TOKEN.");
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialLng, initialLat],
      zoom: 15,
      pitch: 0,
    });

    mapRef.current = map;

    // Create a custom styled draggable pin element
    const el = document.createElement("div");
    el.className = "flex flex-col items-center cursor-grab active:cursor-grabbing transform -translate-y-1/2";
    el.innerHTML = `
      <div class="relative flex items-center justify-center">
        <div class="size-8 rounded-full bg-[#00615f] border-2 border-white shadow-xl flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div class="absolute -bottom-1 size-2 rounded-full bg-emerald-500 animate-ping"></div>
      </div>
    `;

    const marker = new mapboxgl.Marker({
      element: el,
      draggable: true,
    })
      .setLngLat([initialLng, initialLat])
      .addTo(map);

    markerRef.current = marker;

    // Marker drag end event
    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      triggerReverseGeocode(lngLat.lat, lngLat.lng);
    });

    // Map click event: click anywhere to move the marker there
    map.on("click", (e) => {
      marker.setLngLat(e.lngLat);
      triggerReverseGeocode(e.lngLat.lat, e.lngLat.lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // Run on mount

  // Sync marker position if initial coordinates change externally (e.g. from address search)
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const current = markerRef.current.getLngLat();
      const isDiff =
        Math.abs(current.lat - initialLat) > 0.0001 ||
        Math.abs(current.lng - initialLng) > 0.0001;

      if (isDiff) {
        markerRef.current.setLngLat([initialLng, initialLat]);
        mapRef.current.flyTo({
          center: [initialLng, initialLat],
          zoom: 15,
          essential: true,
        });
      }
    }
  }, [initialLat, initialLng]);

  // Handle GPS location request from map button
  const handleGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị GPS.");
      return;
    }

    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapRef.current && markerRef.current) {
          markerRef.current.setLngLat([longitude, latitude]);
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 16,
            essential: true,
          });
        }
        triggerReverseGeocode(latitude, longitude);
        setIsLocatingGPS(false);
        toast.success("Đã tìm thấy vị trí GPS của bạn!");
      },
      (err) => {
        setIsLocatingGPS(false);
        console.warn("[MapLocationPicker] GPS error:", err);
        if (err.code === 1) {
          toast.error("Quyền truy cập vị trí bị từ chối. Vui lòng bật định vị trên trình duyệt.");
        } else {
          toast.error("Không thể lấy tín hiệu GPS. Vui lòng chọn điểm trên bản đồ.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-stone-200 shadow-sm ${className}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Instructions Banner */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-xs z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/80 shadow-md text-xs font-semibold text-stone-700 flex items-center justify-between gap-2 pointer-events-none">
        <span>Chạm hoặc kéo ghim để chọn điểm</span>
        {isGeocoding && <Loader2 className="size-3 animate-spin text-[#00615f] shrink-0" />}
      </div>

      {/* Custom Map Controls */}
      <div className="absolute bottom-4 right-3 z-10 flex flex-col gap-2">
        {/* GPS Button */}
        <button
          type="button"
          onClick={handleGPS}
          disabled={isLocatingGPS}
          className="size-9 rounded-xl bg-white hover:bg-emerald-50 text-[#00615f] border border-stone-200/90 shadow-md flex items-center justify-center transition active:scale-95 disabled:opacity-50"
          title="Định vị vị trí hiện tại"
          aria-label="Định vị vị trí hiện tại"
        >
          {isLocatingGPS ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Locate className="size-4" />
          )}
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col bg-white border border-stone-200/90 rounded-xl shadow-md overflow-hidden">
          <button
            type="button"
            onClick={handleZoomIn}
            className="size-8 flex items-center justify-center text-stone-700 hover:bg-stone-50 border-b border-stone-100 transition active:scale-95"
            title="Phóng to"
            aria-label="Phóng to"
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="size-8 flex items-center justify-center text-stone-700 hover:bg-stone-50 transition active:scale-95"
            title="Thu nhỏ"
            aria-label="Thu nhỏ"
          >
            <Minus className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
