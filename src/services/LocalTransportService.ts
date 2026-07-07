import { getEnvVar, rateLimit } from "./utils.ts";
import { CacheManager } from "./CacheManager.ts";
import { TransportService } from "./TransportService.ts";

export interface TransportRecommendation {
  id: string;
  mode: string; // e.g. "Metro", "Taxi", "Uber", "Walking", "Rental Bike"
  icon: string;
  description: string;
  travelTime: string; // e.g. "12 mins avg"
  estimatedCost: string; // e.g. "$2 - $4 per trip"
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

export const LocalTransportService = {
  /**
   * Returns a customized local transit guide for a city
   */
  async getTransportProfile(city: string): Promise<TransportProfile> {
    return await TransportService.getTransportProfile(city);
  }
};
export const LocalTransportServiceAlias = LocalTransportService;
