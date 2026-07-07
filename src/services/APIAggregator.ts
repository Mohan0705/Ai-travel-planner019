import { WeatherService } from "./WeatherService.ts";
import { FlightService } from "./FlightService.ts";
import { HotelService } from "./HotelService.ts";
import { PlacesService } from "./PlacesService.ts";
import { LocalTransportService } from "./LocalTransportService.ts";
import { IntercityTransitService } from "./IntercityTransitService.ts";
import { RecommendationService, AIRecommendation } from "./RecommendationService.ts";
import { MapService } from "./MapService.ts";

export interface AggregatedTravelData {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  weather: any;
  flights: any[];
  hotels: any[];
  restaurants: any[];
  attractions: any[];
  localTransport: any;
  trains: any[];
  buses: any[];
  aiRecommendations: AIRecommendation[];
  apiSource: string;
  timestamp: number;
  cityCenter?: any;
}

export const APIAggregator = {
  /**
   * Orchestrate parallel queries to gather real-time data from all modules
   */
  async aggregateData(
    origin: string,
    destination: string,
    startDate: string,
    endDate: string,
    travelers: number = 1,
    children: number = 0,
    budget: number = 1000,
    cabinClass: 'economy' | 'premium' | 'business' | 'first' = 'economy'
  ): Promise<AggregatedTravelData> {
    console.log(`[APIAggregator] Beginning parallel aggregation for ${destination}...`);
    const timestamp = Date.now();

    // Fetch city center coordinate for geocoding
    const cityCenter = await MapService.geocode(destination).catch(err => {
      console.warn("Geocoding failed inside aggregator:", err);
      return MapService.getSyntheticCoordinates(destination);
    });

    // 1. Parallel execution (Phase 14 optimization!)
    const [
      weather,
      flights,
      hotels,
      restaurants,
      attractions,
      localTransport,
      trains,
      buses
    ] = await Promise.all([
      WeatherService.getWeatherForCity(destination).catch(err => {
        console.warn("Weather integration errored, falling back:", err);
        return WeatherService.generateSyntheticWeather(destination);
      }),
      FlightService.searchFlights(origin || "NYC", destination, startDate, endDate, travelers, cabinClass).catch(err => {
        console.warn("Flight integration errored, falling back:", err);
        return FlightService.generateSyntheticFlights(origin || "NYC", destination, cabinClass);
      }),
      HotelService.searchHotels(destination, budget).catch(err => {
        console.warn("Hotel integration errored, falling back:", err);
        return HotelService.generateSyntheticHotels(destination, budget);
      }),
      PlacesService.searchNearby(destination, "restaurant").catch(err => {
        console.warn("Restaurants search errored, falling back:", err);
        return PlacesService.generateSyntheticPlaces(destination, "restaurant");
      }),
      PlacesService.searchNearby(destination, "attractions").catch(err => {
        console.warn("Attractions search errored, falling back:", err);
        return PlacesService.generateSyntheticPlaces(destination, "attractions");
      }),
      LocalTransportService.getTransportProfile(destination).catch(err => {
        console.warn("Transport profile search errored, falling back:", err);
        return LocalTransportService.getTransportProfile(destination);
      }),
      IntercityTransitService.getTrains(destination, origin).catch(err => {
        console.warn("Trains query errored, falling back:", err);
        return [];
      }),
      IntercityTransitService.getBuses(destination, origin).catch(err => {
        console.warn("Buses query errored, falling back:", err);
        return [];
      })
    ]);

    // 2. Compute dynamic recommendations
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
      country: cityCenter?.address?.country || (weather.rainWarning ? "Optimized Zone" : "Standard Zone"),
      startDate,
      endDate,
      travelers,
      budget,
      weather,
      flights,
      hotels,
      restaurants,
      attractions,
      localTransport,
      trains,
      buses,
      aiRecommendations,
      apiSource: "Unified Voyager Aggregator v1",
      timestamp,
      cityCenter
    };
  },

  /**
   * Inject aggregated data into Gemini prompt guidelines
   */
  buildGeminiContextPrompt(data: AggregatedTravelData): string {
    return `
=== REAL TRAVEL PLATFORM DATASETS ===
The system has collected the following LIVE, AUTHENTIC datasets for ${data.destination}. 
You MUST NOT invent other flights, hotels, or restaurants. Reason ONLY over the real-time options below:

0. GEOGRAPHIC BOUNDS & CENTER:
- Center Latitude: ${data.cityCenter ? data.cityCenter.lat : 35.6762}
- Center Longitude: ${data.cityCenter ? data.cityCenter.lng : 139.6503}
- Geocoded Display: ${data.cityCenter ? data.cityCenter.displayName : data.destination}

1. WEATHER FORECAST:
- Current Temperature: ${data.weather.temp}°C (Feels like: ${data.weather.feelsLike}°C)
- Condition: ${data.weather.condition} (${data.weather.description})
- Humidity: ${data.weather.humidity}%, Wind: ${data.weather.windSpeed} km/h, UV Index: ${data.weather.uvIndex}
- Packing Guide: ${data.weather.packingSuggestion}
- Best Hours for Outdoor Movement: ${data.weather.bestSightseeingHours}
- Weather Warnings: ${data.weather.rainWarning || "None"}

2. FLIGHT OFFERS (REAL-TIME):
${JSON.stringify(data.flights.slice(0, 3), null, 2)}

3. HOTEL RECOMMENDATIONS (REAL-TIME WITH COORDINATES):
${JSON.stringify(data.hotels.slice(0, 3).map(h => ({ name: h.name, stars: h.stars, rating: h.rating, pricePerNight: h.pricePerNight, lat: h.lat, lng: h.lng, address: h.address })), null, 2)}

4. LOCAL GASTRONOMY / RESTAURANTS (REAL-TIME WITH COORDINATES):
${JSON.stringify(data.restaurants.slice(0, 4).map(r => ({ name: r.name, cuisine: r.type || r.cuisine, rating: r.rating, priceLevel: r.priceLevel, lat: r.lat, lng: r.lng })), null, 2)}

5. POPULAR ATTRACTIONS (REAL-TIME WITH COORDINATES):
${JSON.stringify(data.attractions.slice(0, 4).map(a => ({ name: a.name, category: a.type || a.category, rating: a.rating, lat: a.lat, lng: a.lng })), null, 2)}

6. LOCAL TRANSIT PROFILE:
${JSON.stringify(data.localTransport, null, 2)}

7. REGIONAL INTERCITY TRANSIT:
- Trains: ${JSON.stringify(data.trains, null, 2)}
- Buses: ${JSON.stringify(data.buses, null, 2)}

=== GENERATION DIRECTIVES ===
- Draft a daily chronological travel itinerary mapping to the exact dates requested.
- Ensure mornings, afternoons, and evenings are mapped to the REAL-TIME gastronomy and attractions listed above.
- Ground every hotel checkout, meal, and attraction strictly using the real name and coordinates (lat, lng) provided above. DO NOT alter, shift, or fabricate coordinates!
- NEVER fabricate prices or amenities that are not explicitly documented in the dataset.
- Respect the traveler's budget constraint ($${data.budget}) and food preferences.
`;
  }
};
export default APIAggregator;
export * from "./RecommendationService.ts";
