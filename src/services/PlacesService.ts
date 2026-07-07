import { getEnvVar, withRetries, rateLimit } from "./utils.ts";
import { CacheManager } from "./CacheManager.ts";

import { RestaurantService } from "./RestaurantService.ts";
import { TouristPlaceService } from "./TouristPlaceService.ts";

export interface PlaceDetail {
  id: string;
  name: string;
  type: string;
  rating: number;
  reviewsCount: number;
  reviews: { author: string; text: string; rating: number }[];
  openingHours: string;
  priceLevel: string; // e.g. "$$", "$$$$"
  website: string;
  phone: string;
  lat: number;
  lng: number;
  distance: string;
  photoUrl: string;
}

export const PlacesService = {
  /**
   * Search nearby attractions, restaurants, cafes, etc. based on destination
   */
  async searchNearby(city: string, type: string): Promise<PlaceDetail[]> {
    const isFood = type.toLowerCase().includes("restaurant") || type.toLowerCase().includes("food") || type.toLowerCase().includes("cafe");
    
    if (isFood) {
      const restaurants = await RestaurantService.searchRestaurants(city);
      return restaurants.map(r => ({
        id: r.id,
        name: r.name,
        type: r.cuisine,
        rating: r.rating,
        reviewsCount: r.reviewsCount,
        reviews: [
          { author: "Alexander Thorne", text: "Exceptional dining, highly recommended.", rating: 5 }
        ],
        openingHours: r.openingHours,
        priceLevel: r.priceLevel,
        website: "https://voyageur.travel",
        phone: "+1 (555) 781-3094",
        lat: r.lat,
        lng: r.lng,
        distance: r.distance,
        photoUrl: r.photoUrl
      }));
    } else {
      const attractions = await TouristPlaceService.searchTouristPlaces(city);
      return attractions.map(a => ({
        id: a.id,
        name: a.name,
        type: a.category,
        rating: a.rating,
        reviewsCount: a.reviewsCount,
        reviews: [
          { author: "Elena Rostova", text: "A breathtaking cultural experience.", rating: 5 }
        ],
        openingHours: a.openingHours,
        priceLevel: a.priceLevel,
        website: "https://voyageur.travel",
        phone: "+1 (555) 781-3094",
        lat: a.lat,
        lng: a.lng,
        distance: a.distance,
        photoUrl: a.photoUrl
      }));
    }
  },

  generateSyntheticPlaces(city: string, category: string): PlaceDetail[] {
    const cleanCat = category.toLowerCase();
    const cleanCity = city.trim();

    const items = [];
    const baseLat = 35.6762;
    const baseLng = 139.6503;

    if (cleanCat.includes("restaurant") || cleanCat.includes("cafe")) {
      items.push(
        {
          name: `${cleanCity} Heritage Tea Salon`,
          type: "Cafe",
          rating: 4.8,
          reviewsCount: 382,
          openingHours: "08:00 AM - 07:00 PM",
          priceLevel: "$$$",
          photoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: "L'Aura Gastronomy & Bistro",
          type: "Fine Dining",
          rating: 4.9,
          reviewsCount: 512,
          openingHours: "12:00 PM - 10:30 PM",
          priceLevel: "$$$$",
          photoUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: "The Velvet Lounge & Bar",
          type: "Nightlife",
          rating: 4.6,
          reviewsCount: 198,
          openingHours: "06:00 PM - 02:00 AM",
          priceLevel: "$$$",
          photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=400&q=80"
        }
      );
    } else {
      items.push(
        {
          name: `${cleanCity} Ancient Arts Pavilion`,
          type: "Museum / Landmark",
          rating: 4.9,
          reviewsCount: 1420,
          openingHours: "09:00 AM - 05:00 PM",
          priceLevel: "$$",
          photoUrl: "https://images.unsplash.com/photo-1544013513-304ed1da7e7b?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: "Botanical Conservatory & Zen Path",
          type: "Park",
          rating: 4.7,
          reviewsCount: 890,
          openingHours: "06:00 AM - 08:00 PM",
          priceLevel: "Free",
          photoUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: "The Imperial Clock Tower & Plaza",
          type: "Tourist Landmark",
          rating: 4.5,
          reviewsCount: 2310,
          openingHours: "24/7",
          priceLevel: "Free",
          photoUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80"
        }
      );
    }

    return items.map((it, idx) => ({
      id: `place-${category}-${idx}-${Date.now()}`,
      name: it.name,
      type: it.type,
      rating: it.rating,
      reviewsCount: it.reviewsCount,
      reviews: [
        { author: "Alexander Thorne", text: `Exceptional quality, matching the refined expectations of a true traveler in ${cleanCity}.`, rating: 5 },
        { author: "Elena Rostova", text: "A peaceful oasis! Wonderful curation and incredibly warm staff members.", rating: 5 }
      ],
      openingHours: it.openingHours,
      priceLevel: it.priceLevel,
      website: "https://voyageur.travel",
      phone: "+1 (555) 781-3094",
      lat: baseLat + (idx * 0.015) - 0.01,
      lng: baseLng + (idx * -0.015) + 0.01,
      distance: `${(0.4 + idx * 0.6).toFixed(1)} km from active center`,
      photoUrl: it.photoUrl
    }));
  }
};
export const PlacesServiceAlias = PlacesService;
