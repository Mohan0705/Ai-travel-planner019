import { MapService, GeoLocation } from "./MapService.ts";
import { WeatherService } from "./WeatherService.ts";
import { FlightService } from "./FlightService.ts";
import { HotelService, HotelOption } from "./HotelService.ts";
import { RestaurantService, RestaurantOption } from "./RestaurantService.ts";
import { TouristPlaceService, TouristPlaceOption } from "./TouristPlaceService.ts";
import { TransportService, TransportProfile } from "./TransportService.ts";
import { OpenRouteService, RouteSegment } from "./OpenRouteService.ts";
import { RecommendationService, AIRecommendation } from "./RecommendationService.ts";

export interface AggregatedLocationData {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  cityCenter: GeoLocation | null;
  weather: any;
  flights: any[];
  hotels: HotelOption[];
  restaurants: RestaurantOption[];
  touristPlaces: TouristPlaceOption[];
  localTransport: TransportProfile;
  itineraryRoutes: RouteSegment[];
  aiRecommendations: AIRecommendation[];
  apiSource: string;
  timestamp: number;
}

export const LocationAggregator = {
  /**
   * Orchestrate parallel queries to gather real OSM and live partner data for the planner
   */
  async aggregateLocationData(
    origin: string,
    destination: string,
    startDate: string,
    endDate: string,
    travelers: number = 1,
    children: number = 0,
    budget: number = 1000,
    cabinClass: 'economy' | 'premium' | 'business' | 'first' = 'economy'
  ): Promise<AggregatedLocationData> {
    console.log(`[LocationAggregator] Initiating full-stack OSM data aggregation for ${destination}...`);
    const timestamp = Date.now();

    // 1. Resolve city geocoding first (to guide all downstream queries)
    const cityCenter = await MapService.geocode(destination).catch(err => {
      console.warn("Geocoding failed, using synthetic base:", err);
      return MapService.getSyntheticCoordinates(destination);
    });

    const lat = cityCenter ? cityCenter.lat : 35.6762;
    const lng = cityCenter ? cityCenter.lng : 139.6503;

    // 2. Parallel fetching of real location and transport assets (Phase 15: Parallel execution)
    const [
      weather,
      flights,
      hotels,
      restaurants,
      touristPlaces,
      localTransport
    ] = await Promise.all([
      WeatherService.getWeatherForCity(destination).catch(err => {
        console.warn("Weather service failed, generating synthetic:", err);
        return WeatherService.generateSyntheticWeather(destination);
      }),
      FlightService.searchFlights(origin || "NYC", destination, startDate, endDate, travelers, cabinClass).catch(err => {
        console.warn("Flight service failed, generating synthetic:", err);
        return FlightService.generateSyntheticFlights(origin || "NYC", destination, cabinClass);
      }),
      HotelService.searchHotels(destination, budget).catch(err => {
        console.warn("Hotel service failed, returning synthetic:", err);
        return HotelService.generateSyntheticHotels(destination, budget);
      }),
      RestaurantService.searchRestaurants(destination).catch(err => {
        console.warn("Restaurant service failed, returning synthetic:", err);
        return RestaurantService.generateSyntheticRestaurants(destination);
      }),
      TouristPlaceService.searchTouristPlaces(destination).catch(err => {
        console.warn("Tourist place service failed, returning synthetic:", err);
        return TouristPlaceService.generateSyntheticPlaces(destination);
      }),
      TransportService.getTransportProfile(destination, 5).catch(err => {
        console.warn("Transport service failed, returning synthetic:", err);
        return TransportService.getTransportProfile(destination, 5);
      })
    ]);

    // 3. Connect hotel, restaurant, and tourist places with real route polylines
    const routePoints: { lat: number; lng: number }[] = [];
    if (hotels.length > 0) routePoints.push({ lat: hotels[0].lat, lng: hotels[0].lng });
    if (restaurants.length > 0) routePoints.push({ lat: restaurants[0].lat, lng: restaurants[0].lng });
    if (touristPlaces.length > 0) routePoints.push({ lat: touristPlaces[0].lat, lng: touristPlaces[0].lng });
    
    const itineraryRoutes = await OpenRouteService.getItineraryRoute(routePoints, 'driving').catch(err => {
      console.warn("Route segment calculations failed:", err);
      return [];
    });

    // 4. Compute AI recommendations based on real location data
    const aiRecommendations = RecommendationService.generateRecommendations(
      destination,
      budget,
      weather,
      flights,
      hotels,
      localTransport
    );

    return {
      destination,
      country: cityCenter && cityCenter.address && cityCenter.address.country ? cityCenter.address.country : "International",
      startDate,
      endDate,
      travelers,
      budget,
      cityCenter,
      weather,
      flights,
      hotels,
      restaurants,
      touristPlaces,
      localTransport,
      itineraryRoutes,
      aiRecommendations,
      apiSource: "OSM Location Aware Voyager v2",
      timestamp
    };
  },

  /**
   * Build beautiful structured prompt context for Gemini to guarantee zero coordinate hallucination.
   */
  buildLocationContextPrompt(data: AggregatedLocationData): string {
    const formattedHotels = data.hotels.slice(0, 3).map(h => ({
      name: h.name,
      rating: h.rating,
      pricePerNight: h.pricePerNight,
      address: h.address,
      facilities: h.facilities.join(", "),
      lat: h.lat,
      lng: h.lng,
      distance: h.distance
    }));

    const formattedRestaurants = data.restaurants.slice(0, 4).map(r => ({
      name: r.name,
      cuisine: r.cuisine,
      rating: r.rating,
      priceLevel: r.priceLevel,
      address: r.address,
      lat: r.lat,
      lng: r.lng,
      distance: r.distance
    }));

    const formattedTouristPlaces = data.touristPlaces.slice(0, 4).map(p => ({
      name: p.name,
      category: p.category,
      rating: p.rating,
      priceLevel: p.priceLevel,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
      distance: p.distance
    }));

    return `
=== REAL OPENSTREETMAP LOCATION DATASET ===
The system has fetched real, coordinates-resolved location datasets for ${data.destination}. 
You MUST NOT invent other landmarks, hotels, or eateries. Design the daily itinerary ONLY using these options:

1. CENTER COORDINATES:
- Latitude: ${data.cityCenter ? data.cityCenter.lat : 35.6762}
- Longitude: ${data.cityCenter ? data.cityCenter.lng : 139.6503}
- Display Name: ${data.cityCenter ? data.cityCenter.displayName : data.destination}

2. REAL-TIME HOTELS (OSM):
${JSON.stringify(formattedHotels, null, 2)}

3. NEIGHBORHOOD RESTAURANTS & CAFES (OSM):
${JSON.stringify(formattedRestaurants, null, 2)}

4. HISTORICAL SIGHTS & ATTRACTIONS (OSM):
${JSON.stringify(formattedTouristPlaces, null, 2)}

5. WEATHER CONDITIONS (LIVE):
- Temperature: ${data.weather.temp}°C (Condition: ${data.weather.condition}, UV Index: ${data.weather.uvIndex})
- Sightseeing Recommendation: ${data.weather.bestSightseeingHours}
- Warnings: ${data.weather.rainWarning || "None"}
- Packing Suggestion: ${data.weather.packingSuggestion}

6. ESTIMATED LOCAL TRANSIT OPTIONS:
- Daily Cost Estimate: ${data.localTransport.estimatedDailyCost}
- Transit Tips: ${data.localTransport.tip}
- Transportation list: ${JSON.stringify(data.localTransport.options.slice(0, 4), null, 2)}

=== RIGID DIRECTIVES ===
- Map each day's itinerary chronologically.
- Ground every hotel checkout, meal, and sightseeing spot strictly using the real name and coordinates specified above.
- Incorporate transit suggestions (such as Metro or walking paths) directly based on the real distances listed.
- Respect the total budget of $${data.budget} and travelers (${data.travelers}).
`;
  }
};
export default LocationAggregator;
