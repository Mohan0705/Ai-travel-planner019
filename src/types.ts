/**
 * AI Travel Planner - Shared Type Definitions
 */

export interface User {
  id: string;
  email: string;
  username: string;
  photoUrl?: string;
  bio?: string;
  preferences?: {
    food?: string;
    hotel?: string;
    transport?: string;
  };
  createdAt: string;
}

export interface Location {
  name: string;
  lat: number;
  lng: number;
  type: 'hotel' | 'restaurant' | 'attraction' | 'airport' | 'start';
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  duration: string;
  cost: number;
  location: Location;
  type: 'sightseeing' | 'food' | 'rest' | 'transport';
  rating?: number;
  image?: string;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  theme: string;
  morning: Activity[];
  afternoon: Activity[];
  evening: Activity[];
}

export interface HotelRecommendation {
  id: string;
  name: string;
  rating: number;
  price: number;
  amenities: string[];
  distance: string;
  imageUrl: string;
  bookingUrl: string;
  description?: string;
  stars?: number;
  address?: string;
}

export interface RestaurantRecommendation {
  id: string;
  name: string;
  rating: number;
  distance: string;
  cuisine: string;
  priceRange: string;
  isVegetarian: boolean;
  isNonVegetarian: boolean;
  imageUrl: string;
  reviewsCount: number;
  description?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'hotel' | 'food' | 'shopping' | 'transport' | 'entertainment' | 'other';
  date: string;
  description?: string;
}

export interface TravelNotification {
  id: string;
  type: 'weather' | 'reminder' | 'flight' | 'hotel' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
}
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface Trip {
  id: string;
  destination: string;
  startingLocation?: string;
  country: string;
  startDate: string;
  endDate: string;
  travelers: number;
  children: number;
  budget: number;
  currency: string;
  travelStyle: string;
  foodPreference: string;
  hotelPreference: string;
  transport: string;
  interests: string[];
  isSaved: boolean;
  isFavorite: boolean;
  itinerary: DayPlan[];
  expenses: Expense[];
  hotels?: HotelRecommendation[];
  restaurants?: RestaurantRecommendation[];
  flights?: any[];
  weather?: any;
  localTransport?: any;
  trains?: any[];
  buses?: any[];
  aiRecommendations?: any[];
  budgetAllocation?: any[];
  packingTips?: string[];
  savingTips?: string[];
  safetyTips?: string[];
  createdAt: string;
}

export interface WeatherInfo {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  recommendation: string;
  forecast: {
    day: string;
    temp: number;
    condition: string;
  }[];
}
