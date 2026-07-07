import { getEnvVar, withRetries, rateLimit } from "./utils.ts";
import { CacheManager } from "./CacheManager.ts";
import { AviationStackService } from "./AviationStackService.ts";

export interface FlightOption {
  id: string;
  airlineName: string;
  airlineLogo: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopsDetail: string; // e.g. "Nonstop" or "1 Stop (SIN)"
  price: number;
  currency: string;
  cabinClass: 'economy' | 'premium' | 'business' | 'first';
  terminal: string;
  baggageAllowance: string;
  refundableStatus: 'Refundable' | 'Non-refundable' | 'Refundable with Fee';
  bookingUrl: string;
  
  // Aviationstack fields
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  flightStatus?: string;
  gate?: string;
  delay?: number;
}

export const FlightService = {
  /**
   * Search flights between global coordinates/cities
   */
  async searchFlights(
    origin: string,
    destination: string,
    departureDate: string,
    returnDate: string,
    passengers: number = 1,
    cabinClass: 'economy' | 'premium' | 'business' | 'first' = 'economy'
  ): Promise<FlightOption[]> {
    // 1. Try fetching real flights via AviationStackService
    try {
      const realFlights = await AviationStackService.searchFlights(origin, destination, departureDate, cabinClass);
      if (realFlights && realFlights.length > 0) {
        return realFlights;
      }
    } catch (err) {
      console.warn("[FlightService] Aviationstack query failed, reverting to synthetic fallback:", err);
    }

    // 2. Fallback Provider
    return this.generateSyntheticFlights(origin, destination, cabinClass);
  },

  getAirlineNameByCode(code: string): string {
    const map: Record<string, string> = {
      SQ: "Singapore Airlines",
      EK: "Emirates",
      LH: "Lufthansa",
      AI: "Air India",
      BA: "British Airways",
      JL: "Japan Airlines",
      NH: "All Nippon Airways",
      QR: "Qatar Airways"
    };
    return map[code] || "Global Airways";
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
    return map[code] || "✈";
  },

  generateSyntheticFlights(orig: string, dest: string, cabinClass: string): FlightOption[] {
    const oLower = orig.toLowerCase();
    const dLower = dest.toLowerCase();

    const getCountryOfCity = (city: string): string => {
      const q = city.toLowerCase();
      if (q.includes("india") || q.includes("hyderabad") || q.includes("delhi") || q.includes("mumbai") || q.includes("chennai") || q.includes("bengaluru") || q.includes("bangalore") || q.includes("rajahmundry") || q.includes("godavari") || q.includes("pune") || q.includes("secunderabad")) {
        return "India";
      }
      if (q.includes("united states") || q.includes("usa") || q.includes("new york") || q.includes("nyc") || q.includes("manhattan") || q.includes("brooklyn")) {
        return "United States";
      }
      if (q.includes("united kingdom") || q.includes("uk") || q.includes("london") || q.includes("england")) {
        return "United Kingdom";
      }
      if (q.includes("japan") || q.includes("tokyo") || q.includes("kyoto") || q.includes("osaka")) {
        return "Japan";
      }
      if (q.includes("singapore")) {
        return "Singapore";
      }
      if (q.includes("australia") || q.includes("sydney") || q.includes("melbourne")) {
        return "Australia";
      }
      if (q.includes("france") || q.includes("paris")) {
        return "France";
      }
      return "Other";
    };

    const oCountry = getCountryOfCity(orig);
    const dCountry = getCountryOfCity(dest);
    const isDomestic = oCountry !== "Other" && dCountry !== "Other" && oCountry === dCountry;

    // Check specific popular scenarios
    if (oLower.includes("hyderabad") && dLower.includes("rajahmundry")) {
      return [
        {
          id: "flight-hyd-rjy-1",
          airlineName: "IndiGo",
          airlineLogo: "🇮🇳",
          departureTime: "07:15 AM",
          arrivalTime: "08:15 AM",
          duration: "1h 00m",
          stops: 0,
          stopsDetail: "Non Stop",
          price: 45,
          currency: "USD",
          cabinClass: cabinClass as any,
          terminal: "RGIA Terminal 1",
          baggageAllowance: "15kg Checked Bag, 7kg Cabin Bag",
          refundableStatus: "Refundable with Fee",
          bookingUrl: "https://www.goindigo.in"
        },
        {
          id: "flight-hyd-rjy-2",
          airlineName: "Alliance Air",
          airlineLogo: "🇮🇳",
          departureTime: "04:30 PM",
          arrivalTime: "05:35 PM",
          duration: "1h 05m",
          stops: 0,
          stopsDetail: "Non Stop",
          price: 52,
          currency: "USD",
          cabinClass: cabinClass as any,
          terminal: "RGIA Terminal 1",
          baggageAllowance: "15kg Checked Bag, 7kg Cabin Bag",
          refundableStatus: "Non-refundable",
          bookingUrl: "https://www.allianceair.in"
        }
      ];
    }

    if (oLower.includes("delhi") && dLower.includes("mumbai")) {
      return [
        {
          id: "flight-del-bom-1",
          airlineName: "IndiGo",
          airlineLogo: "🇮🇳",
          departureTime: "08:00 AM",
          arrivalTime: "10:10 AM",
          duration: "2h 10m",
          stops: 0,
          stopsDetail: "Non Stop",
          price: 65,
          currency: "USD",
          cabinClass: cabinClass as any,
          terminal: "IGI Terminal 3",
          baggageAllowance: "15kg Checked Bag, 7kg Cabin Bag",
          refundableStatus: "Refundable with Fee",
          bookingUrl: "https://www.goindigo.in"
        },
        {
          id: "flight-del-bom-2",
          airlineName: "Air India",
          airlineLogo: "🇮🇳",
          departureTime: "11:30 AM",
          arrivalTime: "01:45 PM",
          duration: "2h 15m",
          stops: 0,
          stopsDetail: "Non Stop",
          price: 78,
          currency: "USD",
          cabinClass: cabinClass as any,
          terminal: "IGI Terminal 3",
          baggageAllowance: "25kg Checked Bag, 8kg Cabin Bag",
          refundableStatus: "Refundable",
          bookingUrl: "https://www.airindia.com"
        }
      ];
    }

    if (oLower.includes("chennai") && dLower.includes("bengaluru")) {
      return [
        {
          id: "flight-maa-blr-1",
          airlineName: "IndiGo",
          airlineLogo: "🇮🇳",
          departureTime: "09:15 AM",
          arrivalTime: "10:15 AM",
          duration: "1h 00m",
          stops: 0,
          stopsDetail: "Non Stop",
          price: 40,
          currency: "USD",
          cabinClass: cabinClass as any,
          terminal: "Chennai Domestic Terminal",
          baggageAllowance: "15kg Checked Bag, 7kg Cabin Bag",
          refundableStatus: "Refundable with Fee",
          bookingUrl: "https://www.goindigo.in"
        }
      ];
    }

    if (oLower.includes("new york") && dLower.includes("delhi")) {
      return [
        {
          id: "flight-jfk-del-1",
          airlineName: "Air India",
          airlineLogo: "🇮🇳",
          departureTime: "11:15 AM",
          arrivalTime: "11:35 AM",
          duration: "14h 50m",
          stops: 0,
          stopsDetail: "Non Stop",
          price: 950,
          currency: "USD",
          cabinClass: cabinClass as any,
          terminal: "JFK Terminal 4",
          baggageAllowance: "2x 23kg Checked Bags, 1x Cabin Bag",
          refundableStatus: "Refundable with Fee",
          bookingUrl: "https://www.airindia.com"
        },
        {
          id: "flight-jfk-del-2",
          airlineName: "Emirates",
          airlineLogo: "🇦🇪",
          departureTime: "10:40 PM",
          arrivalTime: "02:45 AM",
          duration: "16h 35m",
          stops: 1,
          stopsDetail: "1 Stop (DXB)",
          price: 1120,
          currency: "USD",
          cabinClass: cabinClass as any,
          terminal: "JFK Terminal 4",
          baggageAllowance: "2x 23kg Checked Bags, 1x Cabin Bag",
          refundableStatus: "Refundable",
          bookingUrl: "https://www.emirates.com"
        }
      ];
    }

    if (oLower.includes("london") && dLower.includes("tokyo")) {
      return [
        {
          id: "flight-lhr-hnd-1",
          airlineName: "Japan Airlines",
          airlineLogo: "🇯🇵",
          departureTime: "01:15 PM",
          arrivalTime: "09:45 AM",
          duration: "12h 30m",
          stops: 0,
          stopsDetail: "Non Stop",
          price: 1250,
          currency: "USD",
          cabinClass: cabinClass as any,
          terminal: "Heathrow Terminal 3",
          baggageAllowance: "2x 23kg Checked Bags, 2x Cabin Items",
          refundableStatus: "Refundable",
          bookingUrl: "https://www.jal.co.jp"
        },
        {
          id: "flight-lhr-hnd-2",
          airlineName: "British Airways",
          airlineLogo: "🇬🇧",
          departureTime: "10:45 AM",
          arrivalTime: "07:30 AM",
          duration: "12h 45m",
          stops: 0,
          stopsDetail: "Non Stop",
          price: 1180,
          currency: "USD",
          cabinClass: cabinClass as any,
          terminal: "Heathrow Terminal 5",
          baggageAllowance: "2x 23kg Checked Bags",
          refundableStatus: "Refundable with Fee",
          bookingUrl: "https://www.britishairways.com"
        }
      ];
    }

    if (oLower.includes("sydney") && dLower.includes("singapore")) {
      return [
        {
          id: "flight-syd-sin-1",
          airlineName: "Singapore Airlines",
          airlineLogo: "🇸🇬",
          departureTime: "09:05 AM",
          arrivalTime: "03:15 PM",
          duration: "8h 10m",
          stops: 0,
          stopsDetail: "Non Stop",
          price: 580,
          currency: "USD",
          cabinClass: cabinClass as any,
          terminal: "Kingsford Smith T1",
          baggageAllowance: "30kg Checked Bag",
          refundableStatus: "Refundable",
          bookingUrl: "https://www.singaporeair.com"
        },
        {
          id: "flight-syd-sin-2",
          airlineName: "Qantas Airways",
          airlineLogo: "🇦🇺",
          departureTime: "11:55 AM",
          arrivalTime: "06:15 PM",
          duration: "8h 20m",
          stops: 0,
          stopsDetail: "Non Stop",
          price: 540,
          currency: "USD",
          cabinClass: cabinClass as any,
          terminal: "Kingsford Smith T1",
          baggageAllowance: "1x 30kg Checked Bag",
          refundableStatus: "Refundable with Fee",
          bookingUrl: "https://www.qantas.com"
        }
      ];
    }

    // Default Fallbacks
    const cleanOrig = orig.toUpperCase().slice(0, 3) || "NYC";
    const cleanDest = dest.toUpperCase().slice(0, 3) || "TYO";
    const basePrice = isDomestic ? 85 : 550;

    return [
      {
        id: `flight-${cleanOrig}-${cleanDest}-1`,
        airlineName: isDomestic ? "Regional Air" : "Global Airways",
        airlineLogo: "✈",
        departureTime: "09:00 AM",
        arrivalTime: isDomestic ? "10:30 AM" : "09:30 PM",
        duration: isDomestic ? "1h 30m" : "12h 30m",
        stops: 0,
        stopsDetail: "Non Stop",
        price: basePrice,
        currency: "USD",
        cabinClass: cabinClass as any,
        terminal: "Terminal 1",
        baggageAllowance: isDomestic ? "15kg Checked Bag" : "2x 23kg Checked Bags",
        refundableStatus: "Refundable with Fee",
        bookingUrl: "https://google.com/travel/flights"
      }
    ];
  }
};
