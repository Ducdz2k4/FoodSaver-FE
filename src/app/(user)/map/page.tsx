"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ArrowLeft,
  LocateFixed,
  Navigation,
  Route,
  X,
  Share2,
  ExternalLink,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { ExpiryCountdown } from "@/components/common/ExpiryCountdown";
import { ListingDTO, FoodCategory } from "@/types/contract";
import { useGetListingsQuery } from "@/redux/api/listingApi";
import { useDeliveryLocation } from "@/context/DeliveryLocationContext";
import { DeliveryHeaderPill } from "@/components/location/DeliveryHeaderPill";
import { getShortestRoute, RouteDirectionsResult } from "@/services/mapboxService";
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

// Helper to generate a 64-point circle Polygon GeoJSON for Mapbox radar coverage
function createGeoJSONCircle(center: [number, number], radiusInKm: number, points: number = 64) {
  const coords: [number, number][] = [];
  const distanceX = radiusInKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusInKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center[0] + x, center[1] + y]);
  }
  coords.push(coords[0]); // close polygon loop

  return {
    type: "Feature" as const,
    geometry: {
      type: "Polygon" as const,
      coordinates: [coords],
    },
    properties: {},
  };
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Downscale and optimize thumbnail resolution for high-performance map markers
function getOptimizedThumbnail(url?: string): string {
  if (!url) {
    return "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=120&q=60&auto=format";
  }
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", "/upload/w_120,q_60,f_auto/");
  }
  if (url.includes("unsplash.com")) {
    try {
      const u = new URL(url);
      u.searchParams.set("w", "120");
      u.searchParams.set("q", "60");
      u.searchParams.set("auto", "format");
      return u.toString();
    } catch {
      return url;
    }
  }
  return url;
}

export default function FoodMapPage() {
  const { location: deliveryLoc } = useDeliveryLocation();
  const [selectedListing, setSelectedListing] = useState<ListingDTO | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<FoodCategory | "ALL">("ALL");
  const [radiusKm, setRadiusKm] = useState<number>(3);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  // Shortest route directions state
  const [activeRoute, setActiveRoute] = useState<RouteDirectionsResult | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isCopiedRoute, setIsCopiedRoute] = useState(false);

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

  const handleFlyToMyLocation = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [deliveryLoc.lng, deliveryLoc.lat],
        zoom: 14.5,
        speed: 1.3,
        curve: 1.42,
        essential: true,
      });
    }
  };

  const handleFindShortestRoute = async (targetListing?: ListingDTO) => {
    const target = targetListing || selectedListing;
    if (!target || typeof target.lat !== "number" || typeof target.lng !== "number") return;

    setIsLoadingRoute(true);
    try {
      const result = await getShortestRoute(
        [deliveryLoc.lng, deliveryLoc.lat],
        [target.lng, target.lat],
        "driving"
      );

      if (result) {
        setActiveRoute(result);

        // Smoothly fit map camera to display the whole route
        if (mapRef.current && result.geometry.coordinates.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend([deliveryLoc.lng, deliveryLoc.lat]);
          bounds.extend([target.lng, target.lat]);
          result.geometry.coordinates.forEach((coord) => bounds.extend(coord));
          mapRef.current.fitBounds(bounds, {
            padding: { top: 90, bottom: 90, left: 60, right: 60 },
            maxZoom: 16,
            duration: 1200,
          });
        }
      } else {
        // Fallback: estimate direct distance if API routing fails
        const distKm = target.distanceKm || 1;
        setActiveRoute({
          distanceMeters: Math.round(distKm * 1000),
          durationSeconds: Math.round(distKm * 180),
          geometry: {
            type: "LineString",
            coordinates: [
              [deliveryLoc.lng, deliveryLoc.lat],
              [target.lng, target.lat],
            ],
          },
          summary: "Tuyến đường ước lượng trực tiếp",
        });
      }
    } catch (err) {
      console.error("[Map] Failed to find shortest route:", err);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
  };

  const getGoogleMapsDirectionsUrl = (targetListing?: ListingDTO | null) => {
    const target = targetListing || selectedListing;
    if (!target || typeof target.lat !== "number" || typeof target.lng !== "number") {
      return "";
    }
    return `https://www.google.com/maps/dir/?api=1&origin=${deliveryLoc.lat},${deliveryLoc.lng}&destination=${target.lat},${target.lng}&travelmode=driving`;
  };

  const handleShareGoogleMapsRoute = async (targetListing?: ListingDTO | null) => {
    const target = targetListing || selectedListing;
    if (!target || typeof target.lat !== "number" || typeof target.lng !== "number") {
      toast.error("Vui lòng chọn một điểm cứu trợ có toạ độ hợp lệ.");
      return;
    }

    const url = getGoogleMapsDirectionsUrl(target);
    const title = `Lộ trình tới ${target.partnerName} - FoodSaver`;
    const text = `Xem chỉ đường cứu trợ món "${target.title}" tại ${target.partnerName} (${target.distanceKm != null ? `${target.distanceKm}km` : ""}) trên Google Maps:`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        toast.success("Đã mở chia sẻ lộ trình Google Maps!");
        return;
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.warn("navigator.share failed, fallback to clipboard:", err);
        } else {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setIsCopiedRoute(true);
      toast.success("Đã sao chép liên kết dẫn đường Google Maps vào clipboard!");
      setTimeout(() => setIsCopiedRoute(false), 2500);
    } catch (err) {
      toast.error("Không thể tự động sao chép. Bạn có thể mở liên kết trực tiếp.");
    }
  };

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const { data: realListings } = useGetListingsQuery({
    lat: deliveryLoc.lat,
    lng: deliveryLoc.lng,
    radiusKm,
    category: categoryFilter !== "ALL" ? categoryFilter : undefined,
    urgentOnly,
    limit: 100,
  });

  const allListings = useMemo(() => realListings || [], [realListings]);

  const filteredListings = useMemo(() => {
    return allListings
      .filter((item) => {
        if (typeof item.lat !== "number" || typeof item.lng !== "number") return false;
        if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
        if (item.distanceKm && item.distanceKm > radiusKm) return false;
        if (urgentOnly && item.status !== "EXPIRING_SOON") return false;
        return true;
      })
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [allListings, categoryFilter, radiusKm, urgentOnly]);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [radiusKm, categoryFilter, urgentOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / ITEMS_PER_PAGE));

  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredListings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredListings, currentPage]);

  // Find listing that needs rescuing most urgently in current radar scope (earliest expiryAt)
  const mostUrgentListing = useMemo(() => {
    if (!filteredListings || filteredListings.length === 0) return null;
    return [...filteredListings].sort((a, b) => {
      const timeA = new Date(a.expiryAt).getTime();
      const timeB = new Date(b.expiryAt).getTime();
      return timeA - timeB;
    })[0];
  }, [filteredListings]);

  // When entering the map and no listing has been chosen yet, default to the most urgent listing
  useEffect(() => {
    if (filteredListings.length > 0) {
      const isCurrentInScope = selectedListing && filteredListings.some((l) => l.id === selectedListing.id);
      if (!isCurrentInScope && mostUrgentListing) {
        setSelectedListing(mostUrgentListing);
      }
    }
  }, [filteredListings, mostUrgentListing, selectedListing]);

  // Reset route when selected listing changes
  useEffect(() => {
    setActiveRoute(null);
  }, [selectedListing?.id]);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!MAPBOX_TOKEN) {
      setMapError("Thiếu Mapbox Token. Vui lòng cấu hình NEXT_PUBLIC_MAPBOX_TOKEN trong .env.local.");
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [deliveryLoc.lng, deliveryLoc.lat],
        zoom: 14,
        pitch: 35,
      });

      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

      map.on("load", () => {
        setMapLoaded(true);
        setMapError(null);
      });

      map.on("error", (e) => {
        console.error("[Mapbox] Error:", e);
        if (e.error?.message?.includes("Forbidden") || e.error?.message?.includes("Unauthorized")) {
          setMapError("Token Mapbox không hợp lệ hoặc đã hết hạn quyền truy cập.");
        }
      });

      mapRef.current = map;

      return () => {
        map.remove();
      };
    } catch (err: any) {
      console.error("[Mapbox] Initialization failed:", err);
      setMapError("Không thể khởi tạo bản đồ Mapbox. Trình duyệt có thể cần bật tính năng WebGL.");
    }
  }, []);

  // Smoothly center map when confirmed delivery location changes
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      mapRef.current.flyTo({
        center: [deliveryLoc.lng, deliveryLoc.lat],
        zoom: 14,
        essential: true,
      });
    }
  }, [deliveryLoc.lat, deliveryLoc.lng, mapLoaded]);

  // Draw radar perimeter (green border only, no permanent fill) + 2s expanding sweep wave on load / radius change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const center: [number, number] = [deliveryLoc.lng, deliveryLoc.lat];
    const perimeterData = createGeoJSONCircle(center, radiusKm);

    let animFrameId: number;

    try {
      // 0. Remove any legacy permanent fill layer if present
      if (map.getLayer("radar-radius-fill")) {
        map.removeLayer("radar-radius-fill");
      }

      // 1. Setup / Update permanent perimeter line (border only, no permanent fill)
      const perimeterSource = map.getSource("radar-radius-source") as mapboxgl.GeoJSONSource | undefined;
      if (perimeterSource) {
        perimeterSource.setData(perimeterData as any);
      } else {
        map.addSource("radar-radius-source", {
          type: "geojson",
          data: perimeterData as any,
        });

        // Soft outer glow line for perimeter
        map.addLayer({
          id: "radar-radius-glow",
          type: "line",
          source: "radar-radius-source",
          paint: {
            "line-color": "#10b981",
            "line-width": 4,
            "line-opacity": 0.2,
          },
        });

        // Crisp green perimeter border ("rada chỉ xanh ở viền")
        map.addLayer({
          id: "radar-radius-line",
          type: "line",
          source: "radar-radius-source",
          paint: {
            "line-color": "#059669",
            "line-width": 2,
            "line-opacity": 0.85,
            "line-dasharray": [4, 3],
          },
        });
      }

      // 2. Setup / Update animated radar sweep wave source & layers
      let sweepSource = map.getSource("radar-sweep-source") as mapboxgl.GeoJSONSource | undefined;
      if (!sweepSource) {
        map.addSource("radar-sweep-source", {
          type: "geojson",
          data: createGeoJSONCircle(center, 0.001) as any,
        });

        // Sweep fill (only active during ~2s pulse, then fades to 0)
        map.addLayer(
          {
            id: "radar-sweep-fill",
            type: "fill",
            source: "radar-sweep-source",
            paint: {
              "fill-color": "#10b981",
              "fill-opacity": 0,
            },
          },
          "radar-radius-glow"
        );

        // Sweep wavefront line
        map.addLayer(
          {
            id: "radar-sweep-line",
            type: "line",
            source: "radar-sweep-source",
            paint: {
              "line-color": "#10b981",
              "line-width": 2.5,
              "line-opacity": 0,
            },
          },
          "radar-radius-glow"
        );
      }

      // 3. Kick off ~2s outward expanding sonar sweep ("hiệu ứng tỏa ra và quét tầm 2s")
      const startTime = performance.now();
      const DURATION_MS = 2000; // ~2 seconds

      const animateSweep = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / DURATION_MS);

        // Cubic ease-out: expands quickly from center then settles at outer perimeter
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentRadius = Math.max(0.01, radiusKm * ease);

        // Soft green fill fades out to 0 as it sweeps to edge
        const fillOpacity = 0.22 * Math.pow(1 - progress, 1.2);
        const waveLineOpacity = 0.75 * (1 - progress);

        try {
          const currentSweepSource = map.getSource("radar-sweep-source") as mapboxgl.GeoJSONSource | undefined;
          if (currentSweepSource && map.getLayer("radar-sweep-fill")) {
            currentSweepSource.setData(createGeoJSONCircle(center, currentRadius, 48) as any);
            map.setPaintProperty("radar-sweep-fill", "fill-opacity", fillOpacity);
            map.setPaintProperty("radar-sweep-line", "line-opacity", waveLineOpacity);
          }
        } catch {
          // ignore transient animation frame errors during unmount/style switch
        }

        if (progress < 1) {
          animFrameId = requestAnimationFrame(animateSweep);
        } else {
          // Animation finished at ~2s: strictly NO background inside ("bên trong ko có nền")
          try {
            if (map.getLayer("radar-sweep-fill")) {
              map.setPaintProperty("radar-sweep-fill", "fill-opacity", 0);
            }
            if (map.getLayer("radar-sweep-line")) {
              map.setPaintProperty("radar-sweep-line", "line-opacity", 0);
            }
          } catch {}
        }
      };

      animFrameId = requestAnimationFrame(animateSweep);

      return () => {
        if (animFrameId) cancelAnimationFrame(animFrameId);
      };
    } catch (e) {
      console.error("[Map] Failed to update radar circle:", e);
    }
  }, [mapLoaded, deliveryLoc.lat, deliveryLoc.lng, radiusKm]);

  // Draw and update active shortest route line on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    try {
      const source = map.getSource("route-source") as mapboxgl.GeoJSONSource | undefined;
      if (activeRoute) {
        const geojsonData = {
          type: "Feature" as const,
          geometry: activeRoute.geometry,
          properties: {},
        };

        if (source) {
          source.setData(geojsonData as any);
        } else {
          map.addSource("route-source", {
            type: "geojson",
            data: geojsonData as any,
          });

          // Route outer halo glow
          map.addLayer(
            {
              id: "route-glow-layer",
              type: "line",
              source: "route-source",
              paint: {
                "line-color": "#10b981",
                "line-width": 8,
                "line-opacity": 0.45,
                "line-blur": 2,
              },
            },
            "radar-radius-glow"
          );

          // Route main path line
          map.addLayer(
            {
              id: "route-line-layer",
              type: "line",
              source: "route-source",
              paint: {
                "line-color": "#00615f",
                "line-width": 4.5,
                "line-opacity": 0.95,
              },
              layout: {
                "line-cap": "round",
                "line-join": "round",
              },
            },
            "radar-radius-glow"
          );
        }
      } else {
        if (source) {
          source.setData({
            type: "Feature" as const,
            geometry: { type: "LineString", coordinates: [] },
            properties: {},
          } as any);
        }
      }
    } catch (e) {
      console.error("[Map] Route layer update error:", e);
    }
  }, [activeRoute, mapLoaded]);

  // Update Markers when filtered listings change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add user position marker with active radar beacon
    const userEl = document.createElement("div");
    userEl.className = "flex flex-col items-center cursor-pointer select-none z-20";
    userEl.innerHTML = `
      <div class="relative flex items-center justify-center">
        <div class="size-6 rounded-full bg-[#00615f] border-2 border-white shadow-xl flex items-center justify-center text-white">
          <div class="size-2 rounded-full bg-[#79e4a7] animate-pulse"></div>
        </div>
        <div class="absolute -inset-1.5 rounded-full border border-emerald-400/50 animate-ping pointer-events-none"></div>
      </div>
      <span class="text-[9px] font-black text-[#00615f] bg-white/95 px-2 py-0.5 rounded-full shadow-md mt-1 whitespace-nowrap max-w-[160px] truncate border border-emerald-100" title="${deliveryLoc.address}">
        📍 ${deliveryLoc.isSavedHome ? "Nhà của bạn" : "Vị trí của bạn"} (${radiusKm}km radar)
      </span>
    `;

    const userMarker = new mapboxgl.Marker({ element: userEl, anchor: "bottom" })
      .setLngLat([deliveryLoc.lng, deliveryLoc.lat])
      .addTo(mapRef.current);
    markersRef.current.push(userMarker);

    // Add listing markers as Rich Teardrop Pin Markers
    // With food image visible and hover card revealing dish name and price only on hover ("khi hover vào mới hiện chi tiết, hover ra thì không hiển thị")
    filteredListings.forEach((item) => {
      const isSelected = selectedListing?.id === item.id;
      const isMostUrgent = mostUrgentListing?.id === item.id;
      const isUrgent = item.status === "EXPIRING_SOON" || isMostUrgent;
      const discountPercent =
        item.originalPrice > 0
          ? Math.round((1 - item.discountPrice / item.originalPrice) * 100)
          : 0;
      const thumbLowRes = getOptimizedThumbnail(item.imageUrls?.[0]);

      const el = document.createElement("div");
      el.className = `group relative cursor-pointer select-none transition-transform duration-200 ${
        isSelected ? "z-30" : isMostUrgent ? "z-20" : "z-10 hover:z-30"
      }`;

      el.innerHTML = `
        <!-- Floating Hover Card (Chỉ hiện khi hover vào ghim, hover ra thì ẩn ngay để không che bản đồ) -->
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-60 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-stone-200/90 p-3 transition-all duration-200 pointer-events-none opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto z-50 text-left">
          <!-- Store Header & Distance -->
          <div class="flex items-center justify-between gap-1 pb-1.5 border-b border-stone-100">
            <span class="text-[11px] font-bold text-stone-700 truncate max-w-[130px] flex items-center gap-1">
              🏪 ${escapeHtml(item.partnerName)}
            </span>
            ${
              item.distanceKm != null
                ? `<span class="text-[10px] font-bold text-[#00615f] bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                    ${item.distanceKm} km
                  </span>`
                : ""
            }
          </div>

          <!-- TÊN MÓN ĂN -->
          <h4 class="text-xs font-black text-stone-900 leading-snug line-clamp-2 mt-2">
            ${escapeHtml(item.title)}
          </h4>

          <!-- GIÁ TIỀN -->
          <div class="flex items-baseline gap-2 mt-2 pt-2 border-t border-dashed border-stone-200">
            <span class="text-sm font-black text-[#00615f]">
              ${item.discountPrice.toLocaleString("vi-VN")}đ
            </span>
            ${
              item.originalPrice > item.discountPrice
                ? `<span class="text-[11px] text-stone-400 line-through font-medium">
                    ${item.originalPrice.toLocaleString("vi-VN")}đ
                  </span>`
                : ""
            }
            ${
              discountPercent > 0
                ? `<span class="text-[9px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full ml-auto">
                    -${discountPercent}%
                  </span>`
                : ""
            }
          </div>

          <!-- Micro CTA hint -->
          <div class="mt-2 text-[10px] text-center font-bold text-[#00615f] bg-emerald-50/90 py-1 rounded-xl">
            Nhấp để xem chi tiết & tìm đường →
          </div>
        </div>

        <!-- Teardrop Map Pin Marker (Kiểu ghim giọt nước: ảnh tròn món ăn + % giảm giá ở góc nhỏ + đuôi nhọn chỉ xuống) -->
        <div class="relative flex flex-col items-center transform transition-transform duration-200 group-hover:scale-115">
          <!-- Circular Food Pin Head with Crisp Border & Shadow -->
          <div class="relative size-11 sm:size-12 rounded-full bg-white p-0.5 shadow-xl border-2.5 ${
            isSelected
              ? "border-[#00615f] ring-4 ring-[#00615f]/30 scale-105"
              : isMostUrgent
              ? "border-rose-500 ring-2 ring-rose-400/40"
              : isUrgent
              ? "border-rose-500 ring-2 ring-rose-400/30"
              : "border-emerald-600 group-hover:border-[#00615f]"
          } flex items-center justify-center shrink-0">
            <!-- Downscaled Low-Res Thumbnail (Tối ưu hiệu năng tải ảnh nhẹ) -->
            <img
              src="${thumbLowRes}"
              alt="${escapeHtml(item.title)}"
              loading="lazy"
              width="44"
              height="44"
              class="size-full rounded-full object-cover"
            />

            <!-- Small Corner % Discount Badge (% giảm giá ở góc nhỏ) -->
            ${
              discountPercent > 0
                ? `<span class="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-md border border-white tracking-tighter leading-tight pointer-events-none">
                    -${discountPercent}%
                  </span>`
                : ""
            }

            <!-- Active Ping Beacon for the Most Urgent Listing (khi vừa vào map chưa select cái nào thì cái cần cứu nhất ping) -->
            ${
              isMostUrgent
                ? `<span class="absolute -inset-1.5 rounded-full border-2 border-rose-500 animate-ping pointer-events-none opacity-60"></span>`
                : ""
            }
          </div>

          <!-- Teardrop Pin Pointer Tail Pointing Down to Exact GPS Point -->
          <div class="w-3 h-2.5 -mt-0.5 flex justify-center">
            <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${
              isSelected
                ? "border-t-[#00615f]"
                : isMostUrgent || isUrgent
                ? "border-t-rose-500"
                : "border-t-emerald-600 group-hover:border-t-[#00615f]"
            }"></div>
          </div>
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

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([item.lng, item.lat])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [filteredListings, selectedListing, mapLoaded, deliveryLoc.lat, deliveryLoc.lng, deliveryLoc.address, deliveryLoc.isSavedHome]);

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
            <div className="mt-2.5">
              <DeliveryHeaderPill />
            </div>
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

        {/* Map Grid Canvas + Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left Column: Mapbox Container + All Spots Under Map (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Mapbox Container */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md overflow-hidden relative">
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
                className="aspect-[16/10] sm:aspect-[16/9] w-full min-h-[420px] relative bg-stone-100 overflow-hidden"
              >
                {!mapLoaded && !mapError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100/90 z-10 text-stone-500 text-xs font-bold gap-2">
                    <div className="size-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span>Đang kết nối bản đồ vệ tinh Mapbox...</span>
                  </div>
                )}
                {mapError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-50/95 p-6 z-10 text-center space-y-2">
                    <Compass className="size-8 text-amber-600 mx-auto" />
                    <h4 className="text-sm font-bold text-stone-900">Không thể tải bản đồ Mapbox</h4>
                    <p className="text-xs text-stone-600 max-w-sm">{mapError}</p>
                    <p className="text-[11px] text-stone-500">
                      Hãy đảm bảo biến môi trường <code className="bg-white px-1.5 py-0.5 rounded border text-stone-800">NEXT_PUBLIC_MAPBOX_TOKEN</code> đã được cấu hình trong <code className="bg-white px-1.5 py-0.5 rounded border text-stone-800">.env.local</code>.
                    </p>
                  </div>
                )}
              </div>

              {/* Floating Route HUD on Map Canvas */}
              {activeRoute && selectedListing && (
                <div className="absolute top-16 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-emerald-200/90 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="size-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[#00615f] shrink-0">
                    <Navigation className="size-4 fill-current" />
                  </div>
                  <div className="text-left leading-tight pr-1">
                    <div className="text-[11px] font-bold text-stone-500 truncate max-w-[180px]">
                      Đường ngắn nhất tới {selectedListing.partnerName}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-black text-stone-900">
                        {(activeRoute.distanceMeters / 1000).toFixed(1)} km
                      </span>
                      <span className="text-xs font-bold text-[#00615f] bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        ~{Math.max(1, Math.round(activeRoute.durationSeconds / 60))} phút
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 border-l border-stone-200 pl-2">
                    <a
                      href={getGoogleMapsDirectionsUrl(selectedListing)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Mở Google Maps dẫn đường"
                      className="p-1.5 rounded-xl text-stone-500 hover:text-[#00615f] hover:bg-emerald-50 transition cursor-pointer"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleShareGoogleMapsRoute(selectedListing)}
                      title="Chia sẻ lộ trình Google Maps"
                      className="p-1.5 rounded-xl text-stone-500 hover:text-[#00615f] hover:bg-emerald-50 transition cursor-pointer"
                    >
                      <Share2 className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleClearRoute}
                      title="Xóa đường đi"
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Nút quay về vị trí của mình (Recenter to My Location) */}
              <button
                type="button"
                onClick={handleFlyToMyLocation}
                title="Quay về vị trí của bạn"
                aria-label="Quay về vị trí của tôi"
                className="absolute bottom-4 right-4 z-10 bg-white/95 hover:bg-white text-stone-700 hover:text-[#00615f] px-3.5 py-2.5 rounded-2xl shadow-xl border border-stone-200/90 transition-all duration-200 flex items-center gap-2 group backdrop-blur-md active:scale-95 cursor-pointer ring-1 ring-black/5"
              >
                <div className="relative flex items-center justify-center">
                  <LocateFixed className="size-4 sm:size-4.5 text-[#00615f] group-hover:scale-110 transition-transform duration-200" />
                </div>
                <span className="text-xs font-bold hidden sm:inline-block">
                  Về vị trí của tôi
                </span>
              </button>

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

            {/* Tất cả điểm cứu trợ gần bạn (Phần hiển thị dưới bản đồ có phân trang) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Tất cả điểm cứu trợ gần bạn ({filteredListings.length})</span>
                  </h3>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    Trong bán kính {radiusKm}km từ {deliveryLoc.isSavedHome ? "địa chỉ nhà" : "vị trí của bạn"} • Nhấp để xem vị trí trên bản đồ
                  </p>
                </div>
                {filteredListings.length > 0 && (
                  <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-xl self-start sm:self-auto">
                    Trang {currentPage} / {totalPages}
                  </span>
                )}
              </div>

              {filteredListings.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="size-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <MapPin className="size-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-800">Không tìm thấy điểm cứu trợ nào</h4>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                      Hiện chưa có món ăn cận date nào trong bán kính {radiusKm}km. Bạn hãy thử mở rộng bán kính lên 10km hoặc 20km.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setRadiusKm(10)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#00615f] text-white text-xs font-bold hover:bg-[#089184] transition cursor-pointer"
                    >
                      Bán kính 10km
                    </button>
                    <button
                      type="button"
                      onClick={() => setRadiusKm(20)}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition cursor-pointer"
                    >
                      Bán kính 20km
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {paginatedListings.map((item) => {
                      const isSelected = selectedListing?.id === item.id;
                      const discountPercent =
                        item.originalPrice > 0
                          ? Math.round((1 - item.discountPrice / item.originalPrice) * 100)
                          : 0;
                      const thumb = getOptimizedThumbnail(item.imageUrls?.[0]);

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedListing(item);
                            mapRef.current?.flyTo({
                              center: [item.lng, item.lat],
                              zoom: 15.5,
                              speed: 1.2,
                            });
                          }}
                          className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 flex items-start gap-3 border text-left group ${
                            isSelected
                              ? "bg-emerald-50/90 border-[#00615f] ring-2 ring-[#00615f]/25 shadow-sm"
                              : "bg-white hover:bg-stone-50/80 border-stone-200/90 hover:border-stone-300"
                          }`}
                        >
                          {/* Food Image Thumbnail */}
                          <div className="relative size-20 rounded-2xl overflow-hidden shrink-0 bg-stone-100 border border-stone-100 shadow-xs">
                            <img
                              src={thumb}
                              alt={item.title}
                              loading="lazy"
                              width={80}
                              height={80}
                              className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            {discountPercent > 0 && (
                              <span className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-bl-lg leading-tight shadow-xs">
                                -{discountPercent}%
                              </span>
                            )}
                          </div>

                          {/* Food & Store Info */}
                          <div className="min-w-0 flex-1 flex flex-col justify-between self-stretch">
                            <div>
                              <div className="flex items-center justify-between text-[11px] text-stone-500 mb-0.5">
                                <span className="font-bold text-[#00615f] truncate max-w-[130px]">
                                  {item.partnerName}
                                </span>
                                <span className="shrink-0 font-medium">
                                  {item.distanceKm != null ? `${item.distanceKm} km` : ""}
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 leading-snug group-hover:text-[#00615f] transition-colors">
                                {item.title}
                              </h4>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-stone-100/80 mt-1">
                              <div>
                                <span className="text-xs sm:text-sm font-black text-[#00615f]">
                                  {item.discountPrice.toLocaleString("vi-VN")}đ
                                </span>
                                {item.originalPrice > item.discountPrice && (
                                  <span className="text-[10px] text-stone-400 line-through ml-1">
                                    {item.originalPrice.toLocaleString("vi-VN")}đ
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  title="Chia sẻ lộ trình Google Maps"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShareGoogleMapsRoute(item);
                                  }}
                                  className="p-1 rounded-lg text-stone-400 hover:text-[#00615f] hover:bg-emerald-50 transition cursor-pointer"
                                >
                                  <Share2 className="size-3.5" />
                                </button>
                                <a
                                  href={getGoogleMapsDirectionsUrl(item)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Mở trên Google Maps"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1 rounded-lg text-stone-400 hover:text-[#00615f] hover:bg-emerald-50 transition cursor-pointer"
                                >
                                  <ExternalLink className="size-3.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-xs text-stone-500">
                        Hiển thị <span className="font-bold text-stone-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>–<span className="font-bold text-stone-800">{Math.min(currentPage * ITEMS_PER_PAGE, filteredListings.length)}</span> trong số <span className="font-bold text-stone-800">{filteredListings.length}</span> điểm cứu trợ
                      </p>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-100 transition disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft className="size-3.5" />
                          <span>Trước</span>
                        </button>

                        <div className="flex items-center gap-1 px-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => setCurrentPage(pageNum)}
                              className={`size-8 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                                currentPage === pageNum
                                  ? "bg-[#00615f] text-white shadow-xs"
                                  : "text-stone-700 hover:bg-stone-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-100 transition disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
                        >
                          <span>Sau</span>
                          <ChevronRight className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column (4 cols): Sticky Selected Food Detail Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
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

                {/* Nút Tìm đường đi ngắn nhất + Chia sẻ Google Maps nhanh */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFindShortestRoute()}
                    disabled={isLoadingRoute}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-[#00615f] hover:from-emerald-700 hover:to-[#004e4c] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 active:scale-[0.99]"
                  >
                    {isLoadingRoute ? (
                      <>
                        <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Đang tính...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="size-3.5 fill-current" />
                        <span>Tìm đường đi</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareGoogleMapsRoute()}
                    title="Chia sẻ lộ trình hoặc sao chép link Google Maps"
                    className="py-2.5 px-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#00615f] border border-emerald-200/90 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
                  >
                    {isCopiedRoute ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span>Đã chép!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="size-3.5" />
                        <span>Chia sẻ GG Map</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Kết quả tuyến đường ngắn nhất */}
                {activeRoute && (
                  <div className="p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200/90 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-bold text-[#00615f]">
                      <span className="flex items-center gap-1.5">
                        <Route className="size-3.5 text-[#00615f]" />
                        <span>Tuyến đường ngắn nhất</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleClearRoute}
                        className="text-[11px] font-bold text-stone-400 hover:text-stone-700 flex items-center gap-0.5 cursor-pointer"
                      >
                        <X className="size-3" />
                        <span>Đóng</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-2xl border border-emerald-100 shadow-2xs">
                        <span className="text-stone-400 text-[10px] block font-medium">Khoảng cách xe</span>
                        <span className="font-black text-stone-900 text-sm">
                          {(activeRoute.distanceMeters / 1000).toFixed(1)} km
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-2xl border border-emerald-100 shadow-2xs">
                        <span className="text-stone-400 text-[10px] block font-medium">Thời gian ước tính</span>
                        <span className="font-black text-[#00615f] text-sm">
                          ~{Math.max(1, Math.round(activeRoute.durationSeconds / 60))} phút
                        </span>
                      </div>
                    </div>

                    {/* Google Maps Actions & Direct Navigation Link */}
                    <div className="pt-2 border-t border-emerald-200/80 flex items-center gap-2">
                      <a
                        href={getGoogleMapsDirectionsUrl(selectedListing)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-3 rounded-2xl bg-white hover:bg-emerald-50 text-[#00615f] border border-emerald-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>Mở Google Maps</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleShareGoogleMapsRoute()}
                        className="flex-1 py-2.5 px-3 rounded-2xl bg-[#00615f] hover:bg-[#004e4c] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                      >
                        {isCopiedRoute ? (
                          <>
                            <Check className="size-3.5 text-emerald-300" />
                            <span>Đã sao chép!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="size-3.5" />
                            <span>Chia sẻ lộ trình</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

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
          </div>
        </div>
      </div>
    </div>
  );
}
