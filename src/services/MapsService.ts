import { getEnvVar, withRetries, rateLimit } from "./utils.ts";
import { CacheManager } from "./CacheManager.ts";

export interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'hotel' | 'restaurant' | 'attraction' | 'airport' | 'current';
  description?: string;
}

export interface RouteDetail {
  distance: string; // e.g. "4.2 km"
  duration: string; // e.g. "12 mins"
  mode: 'driving' | 'transit' | 'walking' | 'bicycling';
  coordinates: [number, number][];
}

export const MapsService = {
  /**
   * Distance between two coordinates in km using Haversine formula
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  /**
   * Estimate travel time based on distance and mode
   */
  estimateTime(distanceKm: number, mode: 'driving' | 'transit' | 'walking' | 'bicycling'): { duration: string; distance: string } {
    let speed = 40; // km/h driving
    if (mode === 'walking') speed = 5;
    else if (mode === 'bicycling') speed = 15;
    else if (mode === 'transit') speed = 25;

    const timeHours = distanceKm / speed;
    const timeMins = Math.round(timeHours * 60);
    
    let durationStr = `${timeMins} mins`;
    if (timeMins > 60) {
      const h = Math.floor(timeMins / 60);
      const m = timeMins % 60;
      durationStr = `${h}h ${m}m`;
    }

    return {
      distance: `${distanceKm.toFixed(1)} km`,
      duration: durationStr
    };
  },

  /**
   * Get dynamic routes matching locations using Mapbox Directions API
   */
  async getDirections(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: RouteDetail['mode'] = 'driving'
  ): Promise<RouteDetail> {
    const accessToken = getEnvVar("MAPBOX_ACCESS_TOKEN") || getEnvVar("VITE_MAPBOX_ACCESS_TOKEN") || "";
    const cacheKey = CacheManager.getCacheKey("directions", { origin, destination, mode });

    // 1. Check cache (24 hours = 86400 seconds)
    const cached = await CacheManager.get(cacheKey);
    if (cached) {
      return cached.data;
    }

    if (accessToken && accessToken !== "MY_MAPBOX_ACCESS_TOKEN") {
      try {
        await rateLimit("maps", 150);

        // Mapbox routing profiles: driving, walking, cycling
        let profile = "mapbox/driving";
        if (mode === "walking") profile = "mapbox/walking";
        else if (mode === "bicycling") profile = "mapbox/cycling";

        const url = `https://api.mapbox.com/directions/v5/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=geojson&overview=full&access_token=${accessToken}`;

        const data = await withRetries(async () => {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Mapbox Directions API failed");
          return await res.json();
        });

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distKm = route.distance / 1000;
          const durMin = Math.round(route.duration / 60);
          
          let durationStr = `${durMin} mins`;
          if (durMin > 60) {
            const h = Math.floor(durMin / 60);
            const m = durMin % 60;
            durationStr = `${h}h ${m}m`;
          }

          // Mapbox returns coordinates as [lng, lat], we must swap to [lat, lng] for the application logic
          const coordinates: [number, number][] = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);

          const result: RouteDetail = {
            distance: `${distKm.toFixed(1)} km`,
            duration: durationStr,
            mode,
            coordinates
          };

          await CacheManager.set(cacheKey, result, 86400, "Mapbox Directions API");
          return result;
        }
      } catch (err) {
        console.warn("Mapbox Directions API failed, using high-fidelity fallback interpolation:", err);
      }
    }

    // Dynamic linear interpolation points fallback
    const distanceVal = this.calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const { distance, duration } = this.estimateTime(distanceVal, mode);

    const steps = 12;
    const coordinates: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const lat = origin.lat + (destination.lat - origin.lat) * ratio;
      const offset = Math.sin(ratio * Math.PI) * 0.005; 
      const lng = origin.lng + (destination.lng - origin.lng) * ratio + offset;
      coordinates.push([lat, lng]);
    }

    const fallbackResult: RouteDetail = {
      distance,
      duration,
      mode,
      coordinates
    };

    return fallbackResult;
  }
};
export const MapsServiceAlias = MapsService;
