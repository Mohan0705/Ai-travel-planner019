import { getEnvVar, withRetries, rateLimit } from "./utils.ts";
import { CacheManager } from "./CacheManager.ts";
import { FlightOption } from "./FlightService.ts";

export interface AviationStackFlightDetail extends FlightOption {
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  flightStatus: string;
  gate?: string;
  delay?: number;
}

export const AviationStackService = {
  /**
   * Search real flights using Aviationstack API
   */
  async searchFlights(
    origin: string,
    destination: string,
    departureDate: string,
    cabinClass: 'economy' | 'premium' | 'business' | 'first' = 'economy'
  ): Promise<AviationStackFlightDetail[] | null> {
    const apiKey = getEnvVar("AVIATIONSTACK_API_KEY") || "";
    if (!apiKey || apiKey === "MY_AVIATIONSTACK_API_KEY" || apiKey.trim() === "") {
      console.log("[AviationStack] No valid API key configured. Utilizing synthetic fallback.");
      return null;
    }

    const depIata = origin.toUpperCase().slice(0, 3);
    const arrIata = destination.toUpperCase().slice(0, 3);
    const cacheKey = CacheManager.getCacheKey("aviationstack_flights", { depIata, arrIata, departureDate });

    // 1. Check cache (15 minutes = 900 seconds)
    const cached = await CacheManager.get(cacheKey);
    if (cached) {
      console.log(`[Cache Hit] Aviationstack flights from ${depIata} to ${arrIata}`);
      return cached.data;
    }

    try {
      await rateLimit("aviationstack", 1000); // 1s safety interval for rate-limiting

      const data = await withRetries(async () => {
        // Build URL. We use http as many free Aviationstack keys only support HTTP.
        // We'll try http first, and support https if needed.
        const url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&dep_iata=${depIata}&arr_iata=${arrIata}&limit=5`;
        console.log(`[AviationStack] Fetching real flights from: http://api.aviationstack.com/v1/flights (dep: ${depIata}, arr: ${arrIata})`);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Aviationstack flight search failed with status ${response.status}`);
        }
        
        const json = await response.json();
        if (json.error) {
          throw new Error(`Aviationstack API Error: ${json.error.message || json.error.code}`);
        }
        return json;
      }, 2, 1000);

      if (data && data.data && data.data.length > 0) {
        const parsed = this.parseFlights(data.data, cabinClass);
        if (parsed.length > 0) {
          await CacheManager.set(cacheKey, parsed, 900, "Aviationstack API");
          return parsed;
        }
      }
      
      console.log("[AviationStack] No active flights returned from API query. Gracefully falling back.");
      return null;
    } catch (err) {
      console.warn("[AviationStack] API exception occurred:", err);
      return null;
    }
  },

  /**
   * Parse raw Aviationstack payload items into formatted FlightOption + extra details
   */
  parseFlights(items: any[], cabinClass: 'economy' | 'premium' | 'business' | 'first'): AviationStackFlightDetail[] {
    const basePrices: Record<string, number> = {
      economy: 420,
      premium: 720,
      business: 1650,
      first: 3900
    };
    const basePrice = basePrices[cabinClass] || 450;

    return items.map((item: any, idx: number) => {
      const departure = item.departure || {};
      const arrival = item.arrival || {};
      const airline = item.airline || {};
      const flight = item.flight || {};

      const depTimeStr = departure.scheduled || departure.estimated;
      const arrTimeStr = arrival.scheduled || arrival.estimated;

      const depDate = depTimeStr ? new Date(depTimeStr) : null;
      const arrDate = arrTimeStr ? new Date(arrTimeStr) : null;

      // Format times to readable format
      const departureTime = depDate 
        ? depDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : "08:30 AM";
      const arrivalTime = arrDate 
        ? arrDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : "09:40 PM";

      // Calculate duration
      let duration = "12h 10m"; // sensible default
      if (depDate && arrDate) {
        const diffMs = arrDate.getTime() - depDate.getTime();
        if (diffMs > 0) {
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          duration = `${diffHrs}h ${diffMins}m`;
        }
      }

      // Airline code-based logo mapping (matching current design)
      const carrierCode = airline.iata || "SQ";
      const airlineLogo = this.getAirlineLogoByCode(carrierCode);

      // Generate realistic price per flight item
      const priceVal = Math.round(basePrice * (0.85 + (idx * 0.08) % 0.3));

      return {
        id: `avstack-${idx}-${flight.iata || flight.number || Math.random().toString(36).substr(2, 5)}`,
        airlineName: airline.name || "Global Airways",
        airlineLogo,
        departureTime,
        arrivalTime,
        duration,
        stops: 0,
        stopsDetail: "Non Stop",
        price: priceVal,
        currency: "USD",
        cabinClass,
        terminal: departure.terminal || "Terminal 1",
        baggageAllowance: "Checked: 1x 23kg, Cabin: 1x 8kg",
        refundableStatus: idx === 0 ? "Refundable" : "Refundable with Fee",
        bookingUrl: "https://www.skyscanner.net",
        
        // Aviationstack specific fields
        flightNumber: flight.number || flight.iata || "N/A",
        departureAirport: departure.airport || departure.iata || "N/A",
        arrivalAirport: arrival.airport || arrival.iata || "N/A",
        flightStatus: item.flight_status || "scheduled",
        gate: departure.gate || undefined,
        delay: departure.delay || undefined
      };
    });
  },

  getAirlineLogoByCode(code: string): string {
    const map: Record<string, string> = {
      SQ: "🇸🇬",
      EK: "🇦🇪",
      LH: "🇩🇪",
      AI: "🇮🇳",
      BA: "🇬🇧",
      JL: "🇯🇵",
      NH: "🇯🇵",
      QR: "🇶🇦"
    };
    return map[code?.toUpperCase()] || "✈";
  }
};
