import { getEnvVar, rateLimit } from "./utils.ts";
import { CacheManager } from "./CacheManager.ts";
import { MapService } from "./MapService.ts";

export interface TransportRecommendation {
  id: string;
  mode: string; // e.g. "Metro", "Taxi", "Uber", "Walking", "Bike", "Rapido", "Ola"
  icon: string;
  description: string;
  travelTime: string;
  estimatedCost: string;
  availability: 'Very High' | 'High' | 'Medium' | 'Low';
  suitability: string;
  bestFor: string;
}

export interface TransportProfile {
  destination: string;
  options: TransportRecommendation[];
  estimatedDailyCost: string;
  tip: string;
}

export const TransportService = {
  /**
   * Generates a fully customized local transport profile and estimates for a given city and trip distance.
   */
  async getTransportProfile(city: string, distanceKm: number = 5): Promise<TransportProfile> {
    const cacheKey = CacheManager.getCacheKey("local_transport_osm", { city, distanceKm });

    // 1. Check cache (24 hours = 86400 seconds)
    const cached = await CacheManager.get(cacheKey);
    if (cached && cached.data) {
      console.log(`[Cache Hit] Transport estimates for ${city}`);
      return cached.data;
    }

    const lower = city.toLowerCase();
    let profile: TransportProfile;

    // Custom regional rules for major global travel zones (e.g. Tokyo, Hyderabad, or general default)
    if (lower.includes("tokyo") || lower.includes("japan") || lower.includes("kyoto") || lower.includes("osaka")) {
      profile = {
        destination: city,
        estimatedDailyCost: "¥1200 - ¥2200 / day",
        tip: "Buy a digital Pasmo/Suica card. The Tokyo Subway is world-class and reaches every attraction within minutes. Taxis are pristine but expensive.",
        options: [
          {
            id: "tokyo-metro",
            mode: "Tokyo Subway (Metro)",
            icon: "🚇",
            description: "Punctual, super-dense underground rail crossing Tokyo.",
            travelTime: `${Math.round(distanceKm * 2 + 5)} mins`,
            estimatedCost: `¥210 - ¥350 ($1.50 - $2.50)`,
            availability: "Very High",
            suitability: "Avoiding surface traffic and navigating city districts.",
            bestFor: " Sightseeing and loops around central Tokyo"
          },
          {
            id: "tokyo-walking",
            mode: "Walking",
            icon: "🚶",
            description: "Extremely safe, flat pedestrian pathways with clean English-bilingual signs.",
            travelTime: `${Math.round(distanceKm * 12)} mins`,
            estimatedCost: "Free",
            availability: "Very High",
            suitability: "Discovering quiet side alleys, vending machines, and local shrines.",
            bestFor: "Short distances under 1.5 km"
          },
          {
            id: "tokyo-taxi",
            mode: "Local Luxury Taxi",
            icon: "🚕",
            description: "Air-conditioned black cabs with automatic doors and polite drivers.",
            travelTime: `${Math.round(distanceKm * 3 + 4)} mins`,
            estimatedCost: `¥2200 - ¥4500 ($15 - $30)`,
            availability: "High",
            suitability: "Luxury group transit or when carrying heavy luggage.",
            bestFor: "Late-night commutes or direct door-to-door comfort"
          },
          {
            id: "tokyo-bike",
            mode: "City Rental Bike (Docomo)",
            icon: "🚲",
            description: "Red electric-assist bikes available at hundreds of street docks.",
            travelTime: `${Math.round(distanceKm * 4)} mins`,
            estimatedCost: `¥300 - ¥600 ($2 - $4)`,
            availability: "High",
            suitability: "Biking along rivers, local neighborhood streets, or through parks.",
            bestFor: "Active, eco-friendly local exploring"
          }
        ]
      };
    } else if (lower.includes("hyderabad") || lower.includes("india") || lower.includes("delhi") || lower.includes("mumbai") || lower.includes("bangalore")) {
      profile = {
        destination: city,
        estimatedDailyCost: "₹350 - ₹750 / day",
        tip: "Use the Hyderabad Metro for long distances to avoid heavy traffic congestion on major crossroads. Use Rapido bike-taxis for fast solo commutes.",
        options: [
          {
            id: "hyd-metro",
            mode: "Hyderabad Metro Rail",
            icon: "🚇",
            description: "Elevated modern rapid transit connecting primary tech and heritage stations.",
            travelTime: `${Math.round(distanceKm * 1.8 + 6)} mins`,
            estimatedCost: "₹20 - ₹60 ($0.25 - $0.75)",
            availability: "High",
            suitability: "Bypassing heavy road junctions on HITEC City/Secunderabad routes.",
            bestFor: "Congestion-free, air-conditioned long-distance transfers"
          },
          {
            id: "hyd-uber",
            mode: "Uber & Ola Cabs",
            icon: "🚗",
            description: "App-booked private air-conditioned cabs (hatchback/sedan).",
            travelTime: `${Math.round(distanceKm * 4 + 10)} mins`,
            estimatedCost: "₹180 - ₹380 ($2.20 - $4.50)",
            availability: "Very High",
            suitability: "Pristine private travel during hot afternoons or direct commutes.",
            bestFor: "Comfortable family trips and direct hotel-to-attraction rides"
          },
          {
            id: "hyd-rapido",
            mode: "Rapido (Bike Taxi)",
            icon: "🏍️",
            description: "On-demand motorcycle taxi booked via smartphone app.",
            travelTime: `${Math.round(distanceKm * 2.5)} mins`,
            estimatedCost: "₹40 - ₹90 ($0.50 - $1.10)",
            availability: "Very High",
            suitability: "Weaving through tight lanes and dense traffic blocks swiftly.",
            bestFor: "Solo travelers wanting maximum speed and budget savings"
          },
          {
            id: "hyd-auto",
            mode: "Auto-Rickshaw",
            icon: "🛺",
            description: "Iconic three-wheeled open-air motorized shared or private rides.",
            travelTime: `${Math.round(distanceKm * 3 + 3)} mins`,
            estimatedCost: "₹70 - ₹150 ($0.85 - $1.80)",
            availability: "Very High",
            suitability: "Classic Indian street transport; make sure to negotiate or use app auto-booking.",
            bestFor: "Quick short-hop commutes and local market trips"
          },
          {
            id: "hyd-walking",
            mode: "Walking",
            icon: "🚶",
            description: "Vibrant sidewalks, ideal for heritage street photography.",
            travelTime: `${Math.round(distanceKm * 13)} mins`,
            estimatedCost: "Free",
            availability: "Very High",
            suitability: "Walking around Charminar, local bazaars, or parks.",
            bestFor: "Short local strolls under 1.0 km"
          }
        ]
      };
    } else {
      // Default dynamic model for other global destinations (Paris, New York, London, Sydney, etc.)
      profile = {
        destination: city,
        estimatedDailyCost: "$12 - $25 / day",
        tip: "Public metro passes combined with walkable sightseeing routes represent the most flexible and sustainable option.",
        options: [
          {
            id: "def-metro",
            mode: "Metro / Underground Subway",
            icon: "🚇",
            description: `Mass rapid rail spanning the core areas of ${city}.`,
            travelTime: `${Math.round(distanceKm * 2 + 4)} mins`,
            estimatedCost: "$2.50 - $4.50",
            availability: "Very High",
            suitability: "Fastest way to get around standard city highlights.",
            bestFor: "Reliable, traffic-free general sightseeing"
          },
          {
            id: "def-uber",
            mode: "Uber / Lyft Ride-Share",
            icon: "🚗",
            description: "On-demand private vehicle hailing.",
            travelTime: `${Math.round(distanceKm * 3.5 + 5)} mins`,
            estimatedCost: "$15.00 - $32.00",
            availability: "Very High",
            suitability: "Seamless point-to-point transfers and luxury night returns.",
            bestFor: "Direct door-to-door comfort and dining out late"
          },
          {
            id: "def-walking",
            mode: "Walking",
            icon: "🚶",
            description: "Excellent self-guided sightseeing along central pedestrian avenues.",
            travelTime: `${Math.round(distanceKm * 12.5)} mins`,
            estimatedCost: "Free",
            availability: "Very High",
            suitability: "Full immersion into city architecture, cafes, and parks.",
            bestFor: "Short-distance neighborhood hops under 1.5 km"
          },
          {
            id: "def-bike",
            mode: "Public Shared Bicycle",
            icon: "🚲",
            description: "City-wide bicycle stations with on-demand tap-to-unlock.",
            travelTime: `${Math.round(distanceKm * 4.5)} mins`,
            estimatedCost: "$3.00 - $7.00 per hour",
            availability: "High",
            suitability: "Cruising along bicycle highways, river lanes, and urban gardens.",
            bestFor: "Healthy, active, and scenic sightseeing tours"
          }
        ]
      };
    }

    // Save estimates securely in durable Supabase/local cache (24 hours = 86400 seconds)
    await CacheManager.set(cacheKey, profile, 86400, "OSM Transport Service");
    return profile;
  }
};
export default TransportService;
export const TransportServiceAlias = TransportService;
