/**
 * Mapbox Geocoding Service (v6 API)
 * FoodSaver Clean & Reusable Geolocation API Client
 */

export interface GeocodeSuggestion {
  id: string;
  name: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

export interface ReverseGeocodeResult {
  name: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

export interface RouteDirectionsResult {
  distanceMeters: number;
  durationSeconds: number;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  summary?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * Reverse geocode coordinates [lng, lat] to a readable address in Vietnam
 */
export async function reverseGeocode(
  lng: number,
  lat: number,
  signal?: AbortSignal
): Promise<ReverseGeocodeResult | null> {
  if (!MAPBOX_TOKEN) {
    console.warn("[MapboxService] Missing NEXT_PUBLIC_MAPBOX_TOKEN");
    return null;
  }

  try {
    const url = new URL("https://api.mapbox.com/search/geocode/v6/reverse");
    url.searchParams.set("longitude", lng.toString());
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("access_token", MAPBOX_TOKEN);
    url.searchParams.set("country", "vn");
    url.searchParams.set("language", "vi");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), { signal });
    if (!res.ok) {
      throw new Error(`Mapbox reverse geocode failed with status ${res.status}`);
    }

    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;

    const fullAddress =
      feature.properties?.full_address ||
      feature.properties?.name ||
      "";
    const name = feature.properties?.name || fullAddress;
    const [featureLng, featureLat] = feature.geometry?.coordinates || [lng, lat];

    return {
      name,
      fullAddress,
      lat: featureLat,
      lng: featureLng,
    };
  } catch (error: any) {
    if (error.name === "AbortError") {
      return null;
    }
    console.error("[MapboxService] reverseGeocode error:", error);
    return null;
  }
}

/**
 * Forward geocode search query string to structured address suggestions
 */
export async function forwardGeocode(
  query: string,
  options?: {
    proximity?: [number, number]; // [lng, lat]
    signal?: AbortSignal;
    limit?: number;
  }
): Promise<GeocodeSuggestion[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  if (!MAPBOX_TOKEN) {
    console.warn("[MapboxService] Missing NEXT_PUBLIC_MAPBOX_TOKEN");
    return [];
  }

  try {
    const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
    url.searchParams.set("q", trimmed);
    url.searchParams.set("access_token", MAPBOX_TOKEN);
    url.searchParams.set("country", "vn");
    url.searchParams.set("language", "vi");
    url.searchParams.set("limit", (options?.limit || 6).toString());

    if (options?.proximity) {
      url.searchParams.set(
        "proximity",
        `${options.proximity[0]},${options.proximity[1]}`
      );
    }

    const res = await fetch(url.toString(), { signal: options?.signal });
    if (!res.ok) {
      throw new Error(`Mapbox forward geocode failed with status ${res.status}`);
    }

    const data = await res.json();
    if (!Array.isArray(data.features)) return [];

    return data.features.map((f: any) => {
      const [lng, lat] = f.geometry?.coordinates || [0, 0];
      return {
        id: f.id || f.properties?.mapbox_id || `${lat},${lng}`,
        name: f.properties?.name || "",
        fullAddress: f.properties?.full_address || f.properties?.name || "",
        lat,
        lng,
      };
    });
  } catch (error: any) {
    if (error.name === "AbortError") {
      return [];
    }
    console.error("[MapboxService] forwardGeocode error:", error);
    return [];
  }
}

/**
 * Get shortest route directions between start [lng, lat] and end [lng, lat]
 * Uses Mapbox Directions API v5 (profile: driving, walking, or cycling)
 */
export async function getShortestRoute(
  start: [number, number],
  end: [number, number],
  profile: "driving" | "walking" | "cycling" = "driving",
  signal?: AbortSignal
): Promise<RouteDirectionsResult | null> {
  if (!MAPBOX_TOKEN) {
    console.warn("[MapboxService] Missing NEXT_PUBLIC_MAPBOX_TOKEN");
    return null;
  }

  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&overview=full&language=vi&access_token=${MAPBOX_TOKEN}`;

    const res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error(`Mapbox directions failed with status ${res.status}`);
    }

    const data = await res.json();
    if (data.code !== "Ok" || !Array.isArray(data.routes) || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    return {
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      geometry: route.geometry,
      summary: route.legs?.[0]?.summary || "",
    };
  } catch (error: any) {
    if (error.name === "AbortError") return null;
    console.error("[MapboxService] getShortestRoute error:", error);
    return null;
  }
}
