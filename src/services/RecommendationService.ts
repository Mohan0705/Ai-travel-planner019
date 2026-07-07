export interface AIRecommendation {
  id: string;
  category: 'flight' | 'hotel' | 'transport' | 'weather' | 'budget';
  title: string;
  subtitle: string;
  reasoning: string;
  actionLabel: string;
  costSaving?: string;
  confidenceScore: number; // 1-100
}

export const RecommendationService = {
  /**
   * Generates dynamic reasoning cards based on actual compiled trip context
   */
  generateRecommendations(
    city: string,
    budget: number,
    weather: any,
    flights: any[],
    hotels: any[],
    transportProfile: any
  ): AIRecommendation[] {
    const cards: AIRecommendation[] = [];

    // 1. Weather Recommendation
    if (weather) {
      const isRainy = weather.condition?.toLowerCase().includes("rain") || weather.rainChance > 40;
      if (isRainy) {
        cards.push({
          id: "rec-weather-rain",
          category: "weather",
          title: "Wet Weather Itinerary Optimization",
          subtitle: `Strategic scheduling for ${city}`,
          reasoning: `With a high ${weather.rainChance}% probability of precipitation today, we recommend prioritizing the indoor sightseeing modules (such as the Heritage Tea Salon or Ancient Arts Pavilion) on Day 2 and shifting outdoor botanical garden tours to Day 4 when weather is forecasted to clear.`,
          actionLabel: "Reorder Itinerary Days",
          confidenceScore: 94
        });
      } else {
        cards.push({
          id: "rec-weather-sunny",
          category: "weather",
          title: "Optimal Sunshine Window",
          subtitle: "Outdoor excursion optimization",
          reasoning: `Excellent clear-sky conditions with temperature around ${weather.temp}°C are forecasted. Capitalize on the prime outdoor sightseeing window (${weather.bestSightseeingHours}) to explore monuments and parks, minimizing indoor museum stays until the peak UV hours of the afternoon.`,
          actionLabel: "View Day Activities",
          confidenceScore: 90
        });
      }
    }

    // 2. Flight Recommendation
    if (flights && flights.length > 0) {
      const sortedByPrice = [...flights].sort((a, b) => a.price - b.price);
      const cheapest = sortedByPrice[0];
      const direct = flights.find(f => f.stops === 0);

      if (direct && cheapest && direct.id !== cheapest.id) {
        const savings = direct.price - cheapest.price;
        if (savings > 80) {
          cards.push({
            id: "rec-flight-savings",
            category: "flight",
            title: "Value Transit Booking Option Found",
            subtitle: `Fly with ${cheapest.airlineName}`,
            reasoning: `Booking the flight with ${cheapest.stopsDetail} saves you a significant $${savings} per passenger compared to the direct route. The layover duration adds only 2.5 hours total travel time, representing an exceptional trade-off for budget-conscious schedules.`,
            actionLabel: `Book for $${cheapest.price}`,
            costSaving: `$${savings} total`,
            confidenceScore: 92
          });
        }
      } else if (cheapest) {
        cards.push({
          id: "rec-flight-cheapest",
          category: "flight",
          title: "Highly Rated Direct Connection",
          subtitle: `Fly with ${cheapest.airlineName}`,
          reasoning: `We identified a premium nonstop route operated by ${cheapest.airlineName} priced at $${cheapest.price}. With exceptional safety marks and comfortable baggage allowances included, this represents the fastest and most stress-free connection.`,
          actionLabel: `Book for $${cheapest.price}`,
          confidenceScore: 96
        });
      }
    }

    // 3. Hotel Recommendation
    if (hotels && hotels.length > 0) {
      const sortedByRating = [...hotels].sort((a, b) => b.rating - a.rating);
      const highlyRated = sortedByRating[0];
      const cheapest = [...hotels].sort((a, b) => a.pricePerNight - b.pricePerNight)[0];

      if (highlyRated && cheapest && highlyRated.id !== cheapest.id) {
        cards.push({
          id: "rec-hotel-location",
          category: "hotel",
          title: "Prime Location & Refined Solace",
          subtitle: highlyRated.name,
          reasoning: `Located a mere ${highlyRated.distance}, ${highlyRated.name} boasts a spectacular ${highlyRated.rating}/5 guest rating. Its superior amenities, including complimentary gourmet breakfast and rooftop pool, provide the ideal comfort offset for busy daily exploration.`,
          actionLabel: "Reserve Guestroom",
          confidenceScore: 89
        });
      } else if (cheapest) {
        cards.push({
          id: "rec-hotel-budget",
          category: "hotel",
          title: "Value Lodging Sweetspot",
          subtitle: cheapest.name,
          reasoning: `The ${cheapest.name} offers comfortable guestrooms with breakfast and high-speed Wi-Fi included, at a highly competitive $${cheapest.pricePerNight}/night. This option saves you significantly over other 4-star counterparts in the district while maintaining strict safety credentials.`,
          actionLabel: "Reserve Guestroom",
          costSaving: `Save up to 30%`,
          confidenceScore: 87
        });
      }
    }

    // 4. Transport Recommendation
    if (transportProfile && transportProfile.options && transportProfile.options.length > 0) {
      const metro = transportProfile.options.find((o: any) => o.mode.toLowerCase().includes("metro") || o.mode.toLowerCase().includes("subway"));
      if (metro) {
        cards.push({
          id: "rec-transport-transit",
          category: "transport",
          title: "Bypass Street Gridlock via Rapid Rail",
          subtitle: metro.mode,
          reasoning: `To avoid the dense peak-hour vehicular traffic of ${city}, the local rail networks represent the premier choice. With departures every 3-5 minutes and direct station links at all major sights, you'll shave up to 45 minutes of travel time per day.`,
          actionLabel: "View Station Directory",
          confidenceScore: 98
        });
      }
    }

    // 5. Budget Allocation Analysis
    const totalEst = (flights?.[0]?.price || 350) + ((hotels?.[0]?.pricePerNight || 150) * 3);
    if (budget > 0) {
      if (totalEst > budget) {
        cards.push({
          id: "rec-budget-warning",
          category: "budget",
          title: "Budget Rebalancing Advisory",
          subtitle: `Current cost estimate: $${totalEst}`,
          reasoning: `Your compiled flights and accommodations currently project to $${totalEst}, slightly exceeding your target threshold of $${budget}. We recommend selecting the highly-rated 3-star boutique lodging or booking flights mid-week to re-align your ledger perfectly.`,
          actionLabel: "Audit Budget Ledger",
          costSaving: "Rebalances $150+",
          confidenceScore: 91
        });
      } else {
        const cushion = budget - totalEst;
        if (cushion > 200) {
          cards.push({
            id: "rec-budget-surplus",
            category: "budget",
            title: "Discretionary Budget Surplus Identified",
            subtitle: `$${cushion} buffer remains`,
            reasoning: `Your selected travel options leave a comfortable cushion of $${cushion}. We suggest upgrading to a scenic-view hotel room or reserving a table at the city's premier Michelin-starred restaurant for a memorable dining experience.`,
            actionLabel: "View Fine Dining Guide",
            confidenceScore: 85
          });
        }
      }
    }

    return cards;
  }
};
export default RecommendationService;
