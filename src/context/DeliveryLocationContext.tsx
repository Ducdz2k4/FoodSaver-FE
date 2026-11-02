"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUpdateProfileMutation } from "@/redux/api/authApi";
import { forwardGeocode } from "@/services/mapboxService";
import { toast } from "sonner";

export type LocationSource = "profile" | "gps" | "search" | "map" | "default";

export interface DeliveryLocation {
  address: string;
  lat: number;
  lng: number;
  source: LocationSource;
  isConfirmed: boolean;
  isSavedHome?: boolean;
}

export interface DeliveryLocationContextType {
  location: DeliveryLocation;
  isLoading: boolean;
  setSessionLocation: (loc: {
    address: string;
    lat: number;
    lng: number;
    source: LocationSource;
  }) => void;
  saveAsHomeLocation: (loc: {
    address: string;
    lat: number;
    lng: number;
  }) => Promise<boolean>;
  resetToHomeLocation: () => void;
}

// Default Location: 12 Đường Bình Hòa 10, Khuê Trung, Cẩm Lệ, Đà Nẵng
const DEFAULT_LOCATION: DeliveryLocation = {
  address: "12 Đường Bình Hòa 10, Khuê Trung, Cẩm Lệ, Đà Nẵng",
  lat: 16.022091,
  lng: 108.214485,
  source: "default",
  isConfirmed: false,
  isSavedHome: false,
};

const GUEST_STORAGE_KEY = "foodsaver_guest_delivery_loc";
const USER_STORAGE_PREFIX = "foodsaver_user_delivery_loc_";

const DeliveryLocationContext = createContext<DeliveryLocationContextType | undefined>(undefined);

export function DeliveryLocationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, updateUserLocal } = useAuth();
  const [updateProfileMutation] = useUpdateProfileMutation();

  const [location, setLocation] = useState<DeliveryLocation>(DEFAULT_LOCATION);
  const [isLoading, setIsLoading] = useState(false);

  // Track the previous user ID to detect logins, account switches, or logouts
  const previousUserIdRef = useRef<string | null | undefined>(undefined);

  const getStorageKey = useCallback((userId?: string | null) => {
    return userId ? `${USER_STORAGE_PREFIX}${userId}` : GUEST_STORAGE_KEY;
  }, []);

  // Handle User Change & Session Initialization
  useEffect(() => {
    const currentUserId = user?.id || null;
    const isFirstRun = previousUserIdRef.current === undefined;
    const hasUserSwitched = !isFirstRun && previousUserIdRef.current !== currentUserId;

    if (hasUserSwitched) {
      // Clear old session storage if logging out or switching accounts to prevent data leaking
      if (typeof window !== "undefined") {
        if (previousUserIdRef.current) {
          sessionStorage.removeItem(getStorageKey(previousUserIdRef.current));
        } else {
          sessionStorage.removeItem(GUEST_STORAGE_KEY);
        }
      }
    }

    previousUserIdRef.current = currentUserId;

    // 1. Check if we have an active session location saved in sessionStorage for this specific user/guest
    if (typeof window !== "undefined") {
      try {
        const rawSaved = sessionStorage.getItem(getStorageKey(currentUserId));
        if (rawSaved) {
          const parsed = JSON.parse(rawSaved) as DeliveryLocation;
          if (parsed && typeof parsed.lat === "number" && typeof parsed.lng === "number" && parsed.address) {
            setLocation(parsed);
            return;
          }
        }
      } catch (e) {
        console.error("[DeliveryLocation] Failed to parse sessionStorage location:", e);
      }
    }

    // 2. If logged in with an existing address in profile, use it as initial location
    if (user?.address && user.address.trim()) {
      const homeAddress = user.address.trim();

      // Check if current location already has this address
      if (location.address === homeAddress && location.source === "profile") {
        return;
      }

      setIsLoading(true);
      // Geocode the text address into coordinates once
      forwardGeocode(homeAddress, { proximity: [106.695, 10.7769], limit: 1 })
        .then((results) => {
          if (results.length > 0) {
            const first = results[0];
            const profileLoc: DeliveryLocation = {
              address: homeAddress,
              lat: first.lat,
              lng: first.lng,
              source: "profile",
              isConfirmed: true,
              isSavedHome: true,
            };
            setLocation(profileLoc);
          } else {
            // Fallback coordinates with user's text address
            setLocation({
              address: homeAddress,
              lat: DEFAULT_LOCATION.lat,
              lng: DEFAULT_LOCATION.lng,
              source: "profile",
              isConfirmed: true,
              isSavedHome: true,
            });
          }
        })
        .catch(() => {
          setLocation({
            address: homeAddress,
            lat: DEFAULT_LOCATION.lat,
            lng: DEFAULT_LOCATION.lng,
            source: "profile",
            isConfirmed: true,
            isSavedHome: true,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Guest or user without saved address
      setLocation(DEFAULT_LOCATION);
    }
  }, [user?.id, user?.address, getStorageKey]);

  /**
   * Set delivery location for current session ("dùng cho lần này")
   */
  const setSessionLocation = useCallback(
    (loc: { address: string; lat: number; lng: number; source: LocationSource }) => {
      const newLoc: DeliveryLocation = {
        address: loc.address,
        lat: loc.lat,
        lng: loc.lng,
        source: loc.source,
        isConfirmed: true,
        isSavedHome: false,
      };

      setLocation(newLoc);

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(getStorageKey(user?.id), JSON.stringify(newLoc));
        } catch (e) {
          console.error("[DeliveryLocation] Failed to write to sessionStorage:", e);
        }
      }
    },
    [user?.id, getStorageKey]
  );

  /**
   * Save as home address in profile (requires login)
   */
  const saveAsHomeLocation = useCallback(
    async (loc: { address: string; lat: number; lng: number }): Promise<boolean> => {
      if (!isAuthenticated || !user) {
        toast.error("Vui lòng đăng nhập để lưu địa chỉ nhà vào hồ sơ!");
        return false;
      }

      setIsLoading(true);
      try {
        await updateProfileMutation({
          address: loc.address.trim(),
        }).unwrap();

        updateUserLocal({ address: loc.address.trim() });

        const homeLoc: DeliveryLocation = {
          address: loc.address.trim(),
          lat: loc.lat,
          lng: loc.lng,
          source: "profile",
          isConfirmed: true,
          isSavedHome: true,
        };

        setLocation(homeLoc);

        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(getStorageKey(user.id), JSON.stringify(homeLoc));
          } catch (e) {
            console.error("[DeliveryLocation] sessionStorage save error:", e);
          }
        }

        toast.success("Đã cập nhật địa chỉ nhà vào hồ sơ thành công!");
        return true;
      } catch (err: any) {
        console.error("[DeliveryLocation] Failed to update home address:", err);
        toast.error(err?.data?.message || "Không thể lưu địa chỉ vào hồ sơ");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, user, updateProfileMutation, updateUserLocal, getStorageKey]
  );

  /**
   * Reset to user's saved home location
   */
  const resetToHomeLocation = useCallback(() => {
    if (user?.address) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(getStorageKey(user.id));
      }
      setIsLoading(true);
      forwardGeocode(user.address, { proximity: [106.695, 10.7769], limit: 1 })
        .then((results) => {
          if (results.length > 0) {
            setLocation({
              address: user.address!,
              lat: results[0].lat,
              lng: results[0].lng,
              source: "profile",
              isConfirmed: true,
              isSavedHome: true,
            });
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [user?.address, user?.id, getStorageKey]);

  return (
    <DeliveryLocationContext.Provider
      value={{
        location,
        isLoading,
        setSessionLocation,
        saveAsHomeLocation,
        resetToHomeLocation,
      }}
    >
      {children}
    </DeliveryLocationContext.Provider>
  );
}

export function useDeliveryLocation(): DeliveryLocationContextType {
  const context = useContext(DeliveryLocationContext);
  if (!context) {
    throw new Error("useDeliveryLocation must be used within a DeliveryLocationProvider");
  }
  return context;
}
