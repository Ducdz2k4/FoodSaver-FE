"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Compass,
  ShoppingBag,
  Sparkles,
  Layers,
  Check,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  ArrowLeft,
} from "lucide-react";
import { ExpiryCountdown } from "@/components/common/ExpiryCountdown";
import { ListingDTO, FoodCategory } from "@/types/contract";
import { useGetListingsQuery } from "@/redux/api/listingApi";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface GroceryCartItem {
  name: string;
  category?: string;
  estimatedPrice?: number;
  checked: boolean;
}

interface GroceryCartData {
  daysCount: number;
  dateRangeStr: string;
  totalItems: number;
  neededItems: GroceryCartItem[];
  haveAtHome?: string[];
  savedMoney?: number;
  neededCost?: number;
  nearestStore?: {
    id?: string;
    name: string;
    distanceKm: number;
    address?: string;
    badge?: string;
    lat: number;
    lng: number;
  };
  createdAt?: number;
}

export default function FoodMapPage() {
  const [selectedListing, setSelectedListing] = useState<ListingDTO | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<FoodCategory | "ALL">("ALL");
  const [radiusKm, setRadiusKm] = useState<number>(3);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Smart Grocery Radar integration from Meal Planner
  const [groceryCart, setGroceryCart] = useState<GroceryCartData | null>(null);
  const [isGroceryRadarOpen, setIsGroceryRadarOpen] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("foodsaver_shopping_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.neededItems) && parsed.neededItems.length > 0) {
          setGroceryCart(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load grocery cart:", e);
    }
  }, []);

  const handleToggleGroceryItem = (idx: number) => {
    if (!groceryCart) return;
    const nextItems = [...groceryCart.neededItems];
    nextItems[idx] = {
      ...nextItems[idx],
      checked: !nextItems[idx].checked,
    };
    const nextCart = { ...groceryCart, neededItems: nextItems };
    setGroceryCart(nextCart);
    try {
      localStorage.setItem("foodsaver_shopping_cart", JSON.stringify(nextCart));
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearGroceryCart = () => {
    try {
      localStorage.removeItem("foodsaver_shopping_cart");
    } catch (e) {
      console.error(e);
    }
    setGroceryCart(null);
  };

  const handleFlyToNearestStore = () => {
    if (mapRef.current && groceryCart?.nearestStore) {
      mapRef.current.flyTo({
        center: [groceryCart.nearestStore.lng, groceryCart.nearestStore.lat],
        zoom: 15.5,
        speed: 1.2,
      });
    }
  };

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const { data: realListings } = useGetListingsQuery({
    radiusKm,
    category: categoryFilter !== "ALL" ? categoryFilter : undefined,
    urgentOnly,
  });

  const allListings = realListings || [];

  const filteredListings = allListings.filter((item) => {
    if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
    if (item.distanceKm && item.distanceKm > radiusKm) return false;
    if (urgentOnly && item.status !== "EXPIRING_SOON") return false;
    return true;
  });

  useEffect(() => {
    if (!selectedListing && allListings.length > 0) setSelectedListing(allListings[0]);
  }, [allListings, selectedListing]);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [106.695, 10.7769], // District 1, HCMC
      zoom: 14,
      pitch: 35,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

    map.on("load", () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Update Markers when filtered listings change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add user position marker
    const userEl = document.createElement("div");
    userEl.className = "flex flex-col items-center cursor-pointer";
    userEl.innerHTML = `
      <div class="size-5 rounded-full bg-[#00615f] border-2 border-white shadow-xl flex items-center justify-center">
        <div class="size-2 rounded-full bg-[#79e4a7] animate-ping"></div>
      </div>
      <span class="text-[9px] font-black text-[#00615f] bg-white/95 px-1.5 py-0.5 rounded shadow mt-1">Bạn đang ở đây</span>
    `;

    const userMarker = new mapboxgl.Marker(userEl)
      .setLngLat([106.695, 10.7769])
      .addTo(mapRef.current);
    markersRef.current.push(userMarker);

    // Add listing markers
    filteredListings.forEach((item) => {
      const isSelected = selectedListing?.id === item.id;
      const isUrgent = item.status === "EXPIRING_SOON";

      const el = document.createElement("div");
      el.className = "cursor-pointer transition-transform duration-200 hover:scale-110";
      el.innerHTML = `
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-2xl border text-xs font-black transition-all ${
          isSelected
            ? "bg-[#00615f] text-white border-white ring-4 ring-[#00615f]/30 scale-105"
            : isUrgent
            ? "bg-rose-500 text-white border-rose-200 animate-pulse"
            : "bg-white text-stone-900 border-stone-200"
        }">
          <span class="size-2 rounded-full ${isSelected || isUrgent ? "bg-white" : "bg-[#00615f]"}"></span>
          <span>${item.discountPrice.toLocaleString("vi-VN")}đ</span>
        </div>
      `;

      el.addEventListener("click", () => {
        setSelectedListing(item);
        mapRef.current?.flyTo({
          center: [item.lng, item.lat],
          zoom: 15,
          speed: 1.2,
          curve: 1.42,
        });
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([item.lng, item.lat])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [filteredListings, selectedListing, mapLoaded]);

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-bold mb-1.5">
              <Compass className="size-3.5" />
              <span>MAPBOX VECTOR TILES • GEOHASH RADAR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
              Bản đồ món ngon lân cận
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Định vị các tiệm bánh, nhà hàng và cửa hàng tiện lợi có thực phẩm cận date đạt chuẩn ATTP.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setUrgentOnly(!urgentOnly)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border ${
                urgentOnly
                  ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                  : "bg-white text-stone-700 hover:bg-stone-50 border-stone-200"
              }`}
            >
              <Clock className="size-3.5" />
              <span>Chỉ món cấp bách (&lt; 2h)</span>
            </button>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-white border border-stone-200 px-3 py-2 rounded-2xl text-xs font-bold text-stone-800 shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả danh mục</option>
              <option value="BAKERY">Tiệm bánh</option>
              <option value="COOKED_MEAL">Món nấu chín</option>
              <option value="DRINKS">Đồ uống</option>
            </select>
          </div>
        </div>

        {/* Smart Grocery Trip Top Banner (Active Shopping Session) */}
        {groceryCart && (
          <div className="rounded-3xl bg-white border border-stone-200/90 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 text-[#00615f]">
                <ShoppingCart className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-stone-900">
                    Đang thực hiện chuyến đi chợ: {groceryCart.neededItems.filter((i) => i.checked).length}/{groceryCart.neededItems.length} món đã mua
                  </p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {groceryCart.daysCount} ngày
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Lập từ Lịch ăn ({groceryCart.dateRangeStr}) · Điểm mua tối ưu: {groceryCart.nearestStore?.name || "GreenMart (0.6 km)"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsGroceryRadarOpen(!isGroceryRadarOpen)}
                className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
              >
                {isGroceryRadarOpen ? "Thu gọn radar" : "Mở checklist đi chợ"}
              </button>
              <Link
                href="/meal-planner/calendar"
                className="px-3.5 py-1.5 rounded-xl bg-[#00615f] hover:bg-[#004e4c] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                <ArrowLeft className="size-3.5" />
                <span>Về Lịch ăn</span>
              </Link>
            </div>
          </div>
        )}

        {/* Map Grid Canvas + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Mapbox Container (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200/90 shadow-md overflow-hidden relative">
            {/* Top Toolbar overlay */}
            <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-200/80 shadow-md flex items-center gap-3 text-xs font-bold text-stone-700">
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5 text-[#00615f]" />
                <span>Bán kính tìm:</span>
              </span>
              <div className="flex items-center gap-1">
                {[1, 3, 5, 10, 20].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRadiusKm(r)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                      radiusKm === r
                        ? "bg-[#00615f] text-white shadow-sm"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            </div>

            {/* Mapbox Map Render Element */}
            <div
              ref={mapContainerRef}
              className="aspect-[16/10] sm:aspect-[16/9] w-full min-h-[420px]"
            />

            {/* Floating Shopping Radar Checklist Drawer */}
            {groceryCart && (
              <>
                {!isGroceryRadarOpen ? (
                  <button
                    type="button"
                    onClick={() => setIsGroceryRadarOpen(true)}
                    className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-200/90 shadow-xl flex items-center gap-2 text-xs font-bold text-[#00615f] hover:bg-stone-50 transition cursor-pointer"
                  >
                    <ShoppingCart className="size-4" />
                    <span>Radar Đi Chợ: {groceryCart.neededItems.filter((i) => i.checked).length}/{groceryCart.neededItems.length} món</span>
                    <ChevronUp className="size-3.5 text-stone-400" />
                  </button>
                ) : (
                  <div className="absolute bottom-4 left-4 z-20 max-w-sm w-[calc(100%-2rem)] sm:w-84 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/90 shadow-2xl p-3.5 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="size-4 text-[#00615f]" />
                        <div>
                          <h4 className="text-xs font-bold text-stone-900">
                            Checklist Đi Chợ ({groceryCart.neededItems.filter((i) => i.checked).length}/{groceryCart.neededItems.length})
                          </h4>
                          <p className="text-[10px] text-stone-500">
                            {groceryCart.daysCount} ngày · {groceryCart.nearestStore?.name || "GreenMart (0.6 km)"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsGroceryRadarOpen(false)}
                        className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition"
                      >
                        <ChevronDown className="size-4" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className="h-full bg-[#00615f] transition-all duration-300"
                          style={{
                            width: `${Math.round(
                              (groceryCart.neededItems.filter((i) => i.checked).length /
                                Math.max(1, groceryCart.neededItems.length)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-stone-500">
                        <span>Tiến độ mua sắm</span>
                        <span className="font-bold text-[#00615f]">
                          {Math.round(
                            (groceryCart.neededItems.filter((i) => i.checked).length /
                              Math.max(1, groceryCart.neededItems.length)) *
                              100
                          )}%
                        </span>
                      </div>
                    </div>

                    {/* Checklist items */}
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {groceryCart.neededItems.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleToggleGroceryItem(idx)}
                          className={`p-2 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between gap-2 ${
                            item.checked
                              ? "bg-stone-50 border-stone-200 text-stone-400"
                              : "bg-white border-stone-200 text-stone-800 hover:border-[#00615f]"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`size-4 rounded-md border flex items-center justify-center shrink-0 transition ${
                                item.checked
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "border-stone-300 bg-white"
                              }`}
                            >
                              {item.checked && <Check className="size-3 stroke-[3]" />}
                            </div>
                            <span
                              className={`truncate text-xs font-medium ${
                                item.checked ? "line-through text-stone-400" : "text-stone-900"
                              }`}
                            >
                              {item.name}
                            </span>
                          </div>
                          {item.estimatedPrice && (
                            <span
                              className={`text-[10px] shrink-0 font-medium ${
                                item.checked ? "line-through text-stone-400" : "text-stone-500"
                              }`}
                            >
                              ~{item.estimatedPrice.toLocaleString("vi-VN")}đ
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Completed All celebration */}
                    {groceryCart.neededItems.length > 0 &&
                      groceryCart.neededItems.every((i) => i.checked) && (
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
                          🎉 Tuyệt vời! Bạn đã mua đủ nguyên liệu cho {groceryCart.daysCount} ngày!
                        </div>
                      )}

                    {/* Drawer Action buttons */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handleFlyToNearestStore}
                        className="py-1.5 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold transition flex items-center gap-1"
                      >
                        <MapPin className="size-3 text-[#00615f]" />
                        <span>Ghim điểm mua</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleClearGroceryCart}
                        className="text-[11px] text-stone-400 hover:text-rose-600 transition"
                      >
                        Xong chuyến đi
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar: Selected Food Popup & Quick Action (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
              Địa điểm đã chọn
            </span>

            {selectedListing ? (
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-lg space-y-4 animate-in fade-in duration-200">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-stone-100">
                  <img
                    src={selectedListing.imageUrls[0]}
                    alt={selectedListing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow">
                      -{Math.round(((selectedListing.originalPrice - selectedListing.discountPrice) / selectedListing.originalPrice) * 100)}%
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5">
                    <ExpiryCountdown expiryAt={selectedListing.expiryAt} compact />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-bold text-[#00615f]">{selectedListing.partnerName}</span>
                    <span>Cách bạn {selectedListing.distanceKm} km</span>
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm leading-snug line-clamp-2">
                    {selectedListing.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2">
                    {selectedListing.description}
                  </p>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-stone-100">
                  <div>
                    <span className="text-lg font-black text-[#00615f]">
                      {selectedListing.discountPrice.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-xs text-stone-400 line-through ml-1.5">
                      {selectedListing.originalPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    Còn {selectedListing.quantity} {selectedListing.unit}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={`/listing/${selectedListing.id}`}
                    className="py-2.5 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold text-center transition"
                  >
                    Xem chi tiết
                  </Link>
                  <Link
                    href={`/checkout/${selectedListing.id}`}
                    className="py-2.5 px-3 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold text-center shadow-md transition flex items-center justify-center gap-1"
                  >
                    <ShoppingBag className="size-3.5" />
                    <span>Đặt giữ</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center text-xs text-stone-500">
                Nhấp vào một điểm ghim trên bản đồ để xem chi tiết món ăn giải cứu.
              </div>
            )}

            {/* List of other spots */}
            <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-sm space-y-2">
              <span className="text-xs font-bold text-stone-700 block mb-1">
                Tất cả điểm cứu trợ gần bạn ({filteredListings.length}):
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredListings.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedListing(item);
                      mapRef.current?.flyTo({
                        center: [item.lng, item.lat],
                        zoom: 15,
                        speed: 1.2,
                      });
                    }}
                    className={`p-2.5 rounded-2xl cursor-pointer transition flex items-center justify-between gap-2 border ${
                      selectedListing?.id === item.id
                        ? "bg-emerald-50 border-emerald-300"
                        : "bg-stone-50 hover:bg-stone-100 border-stone-100"
                    }`}
                  >
                    <div className="min-w-0">
                      <strong className="text-xs font-bold text-stone-900 block truncate">
                        {item.title}
                      </strong>
                      <span className="text-[11px] text-stone-500">
                        {item.partnerName} • {item.distanceKm} km
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#00615f] shrink-0">
                      {item.discountPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
