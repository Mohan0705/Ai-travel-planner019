import cors from "cors";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { supabaseAdmin } from "./src/lib/supabase-server.ts";

import { WeatherService } from "./src/services/WeatherService.ts";
import { FlightService } from "./src/services/FlightService.ts";
import { HotelService } from "./src/services/HotelService.ts";
import { LocalTransportService } from "./src/services/LocalTransportService.ts";
import { IntercityTransitService } from "./src/services/IntercityTransitService.ts";
import { PlacesService } from "./src/services/PlacesService.ts";
import { APIAggregator } from "./src/services/APIAggregator.ts";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({
  origin: [
    "https://ai-travel-planner019.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.options("*", cors());

app.use(express.json());

// --------------------------------------------------------
// PHASE 16: SECURITY SANITIZATION & RATE-LIMITING UTILITIES
// --------------------------------------------------------

// In-memory IP rate limiter to secure our API endpoints
const ipRequestsMap = new Map<string, { count: number; resetTime: number }>();

function rateLimitMiddleware(limit: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown-ip";
    const now = Date.now();
    const record = ipRequestsMap.get(ip);

    if (!record || now > record.resetTime) {
      ipRequestsMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count++;
    if (record.count > limit) {
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }

    next();
  };
}

// Sanitize query params and request body fields to prevent injection vectors
function sanitizeString(str: string): string {
  if (typeof str !== "string") return "";
  return str.replace(/[<>'"&;]/g, "").trim().slice(0, 150);
}

// In-memory travel alerts synchronized per authenticated user
const userNotificationsMap = new Map<string, any[]>();

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// RESTAURANT MOCK GENERATOR FOR FALLBACK
const MOCK_RESTAURANTS_TEMPLATES = [
  { name: "La Trattoria Premium", cuisine: "Italian", priceRange: "$$$", isVegetarian: true, isNonVegetarian: true, description: "Authentic handmade pasta and cozy rustic vibe." },
  { name: "The Grill Master", cuisine: "Steakhouse", priceRange: "$$$$", isVegetarian: false, isNonVegetarian: true, description: "Flame-broiled prime cuts with skyline views." },
  { name: "Zen Sushi Bar", cuisine: "Japanese", priceRange: "$$$", isVegetarian: true, isNonVegetarian: true, description: "Fresh sashimi and innovative signature rolls." },
  { name: "Green Garden Bistro", cuisine: "Vegetarian / Vegan", priceRange: "$$", isVegetarian: true, isNonVegetarian: false, description: "Organic farm-to-table plant-based delicacies." },
  { name: "Spice Route Lounge", cuisine: "Indian Fusion", priceRange: "$$", isVegetarian: true, isNonVegetarian: true, description: "Rich, aromatic curries and clay-oven specialties." },
];

const MOCK_HOTEL_TEMPLATES = [
  { name: "Grand Vista Luxury Resort", rating: 4.9, price: 320, amenities: ["Pool", "Spa", "Free WiFi", "Ocean View", "Gym"], distance: "0.2 miles from center", description: "Breathtaking views, world-class luxury and direct access to major attractions." },
  { name: "Metropolitan Boutique Hotel", rating: 4.7, price: 180, amenities: ["Breakfast", "Free WiFi", "Bar", "City View"], distance: "0.5 miles from center", description: "Modern, stylish rooms featuring hand-picked local art and a vibrant cocktail bar." },
  { name: "The Eco Lodge & Spa", rating: 4.8, price: 210, amenities: ["Eco Friendly", "Organic Dining", "Spa", "Pool"], distance: "1.4 miles from center", description: "Peaceful forest-surrounded eco sanctuary designed for relaxation and rejuvenation." },
];

function generateFallbackItinerary(dest: string, days: number, style: string, budget: number, foodPref: string): any {
  const daysArray = [];
  const baseLat = 40.7128 + (Math.random() - 0.5) * 5;
  const baseLng = -74.0060 + (Math.random() - 0.5) * 5;

  for (let i = 1; i <= days; i++) {
    daysArray.push({
      dayNumber: i,
      date: `Day ${i}`,
      theme: `${style} Exploration of ${dest}`,
      morning: [
        {
          id: `act-${i}-m`,
          title: `Discover ${dest}'s Cultural Landmarks`,
          description: `Kick off your day with a guided walking tour exploring historical sights, striking architecture, and beautiful plazas in the heart of ${dest}.`,
          time: "09:00 AM",
          duration: "3 hours",
          cost: Math.min(budget * 0.05, 30),
          location: { name: `${dest} Historical Center`, lat: baseLat + 0.01, lng: baseLng - 0.01, type: "attraction" },
          type: "sightseeing",
          rating: 4.8,
          image: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80`
        }
      ],
      afternoon: [
        {
          id: `act-${i}-a1`,
          title: `Culinary Tasting Experience`,
          description: `Enjoy a curated lunch matching your food preference (${foodPref}) at a highly rated local diner, highlighting local culinary secrets.`,
          time: "12:30 PM",
          duration: "1.5 hours",
          cost: Math.min(budget * 0.08, 45),
          location: { name: `${dest} Artisan Kitchen`, lat: baseLat + 0.005, lng: baseLng + 0.015, type: "restaurant" },
          type: "food",
          rating: 4.7,
          image: `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80`
        },
        {
          id: `act-${i}-a2`,
          title: `Leisurely Scenic Tour & Views`,
          description: `Stroll through premium gardens, local craft markets, or iconic viewpoints. Perfect for taking pictures and picking up authentic souvenirs.`,
          time: "02:30 PM",
          duration: "2.5 hours",
          cost: 0,
          location: { name: `${dest} Panoramic Gardens`, lat: baseLat - 0.015, lng: baseLng + 0.005, type: "attraction" },
          type: "sightseeing",
          rating: 4.6
        }
      ],
      evening: [
        {
          id: `act-${i}-e`,
          title: `Panoramic Sunset Dinner & Lounge`,
          description: `Unwind with a spectacular sunset view, premium local drinks, and custom chef pairings, summarizing the vibrant spirit of ${dest}.`,
          time: "07:00 PM",
          duration: "3 hours",
          cost: Math.min(budget * 0.15, 80),
          location: { name: `${dest} Sunset Skybar`, lat: baseLat, lng: baseLng, type: "restaurant" },
          type: "food",
          rating: 4.9,
          image: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80`
        }
      ]
    });
  }

  const hotelsList = MOCK_HOTEL_TEMPLATES.map((h, index) => ({
    id: `hotel-${index}`,
    name: h.name,
    rating: h.rating,
    price: Math.round(h.price * (budget > 1000 ? 1.5 : budget < 400 ? 0.6 : 1.0)),
    amenities: h.amenities,
    distance: h.distance,
    imageUrl: `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80`,
    bookingUrl: "#",
    description: h.description
  }));

  const restaurantsList = MOCK_RESTAURANTS_TEMPLATES.map((r, index) => ({
    id: `rest-${index}`,
    name: `${dest} ${r.name}`,
    rating: 4.5 + Math.random() * 0.4,
    distance: `${(0.4 + index * 0.3).toFixed(1)} miles from center`,
    cuisine: r.cuisine,
    priceRange: r.priceRange,
    isVegetarian: r.isVegetarian,
    isNonVegetarian: r.isNonVegetarian,
    imageUrl: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80`,
    reviewsCount: Math.floor(100 + Math.random() * 800),
    description: r.description
  }));

  return { itinerary: daysArray, hotels: hotelsList, restaurants: restaurantsList };
}

// --------------------------------------------------------
// HEALTH CHECK ENDPOINT
// --------------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Voyage AI Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// --------------------------------------------------------
// SECURE USER SESSION & ALERTS ENDPOINTS (Supabase Backend proxy)
// --------------------------------------------------------

// 1. GET, CREATE & CLEAR NOTIFICATIONS
app.get("/api/notifications", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const userNotifs = userNotificationsMap.get(userId) || [
      {
        id: `alert-welcome-${Date.now()}`,
        type: "system",
        title: "Welcome aboard",
        message: "Your luxury digital travel console is fully synchronized with Supabase.",
        read: false,
        date: "Just now"
      }
    ];
    res.json(userNotifs);
  } catch (error) {
    console.error("Query notifications failed:", error);
    res.status(500).json({ error: "Failed to query system travel alerts" });
  }
});

app.delete("/api/notifications", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    userNotificationsMap.set(userId, []);
    res.json({ success: true });
  } catch (error) {
    console.error("Clear notifications database error:", error);
    res.status(500).json({ error: "Failed to flush alerts" });
  }
});



// --------------------------------------------------------
// EXISTING AI & CONCIERGE ENDPOINTS
// --------------------------------------------------------

// DYNAMIC WEATHER GENERATOR
app.get("/api/weather", rateLimitMiddleware(60, 60000), async (req, res) => {
  const city = sanitizeString((req.query.city as string) || "Paris");

  try {
    const weatherData = await WeatherService.getWeatherForCity(city);
    const recommendation = weatherData.rainWarning || `Excellent weather with ${weatherData.description}. Best hours for sightseeing: ${weatherData.bestSightseeingHours}. Pack: ${weatherData.packingSuggestion}`;
    
    // Map forecast format slightly to ensure full compatibility with any legacy expectations
    const mappedForecast = weatherData.forecast.map(f => ({
      day: f.day,
      temp: f.temp,
      condition: f.condition
    }));

    res.json({
      ...weatherData,
      recommendation,
      forecast: mappedForecast
    });
  } catch (error) {
    console.error("Weather Route Error:", error);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

// AI ITINERARY GENERATOR WITH STRUCTURED SCHEMA (UPGRADED WITH WEATHER, FLIGHTS, HOTELS, MAPS, TRANSIT)
app.post("/api/itinerary/generate", rateLimitMiddleware(15, 60000), async (req, res) => {
  const destination = sanitizeString(req.body.destination || "");
  const startingLocation = sanitizeString(req.body.startingLocation || "");
  const country = sanitizeString(req.body.country || "International");
  const budget = Number(req.body.budget) || 1000;
  const currency = sanitizeString(req.body.currency || "USD");
  const startDate = sanitizeString(req.body.startDate || "");
  const endDate = sanitizeString(req.body.endDate || "");
  const travelers = Number(req.body.travelers) || 1;
  const children = Number(req.body.children) || 0;
  const travelStyle = sanitizeString(req.body.travelStyle || "Adventure");
  const foodPreference = sanitizeString(req.body.foodPreference || "Local Cuisines");
  const hotelPreference = sanitizeString(req.body.hotelPreference || "Boutique Art Hotels");
  const transport = sanitizeString(req.body.transport || "Private Transport");
  const interests = Array.isArray(req.body.interests)
    ? req.body.interests.map((i: any) => sanitizeString(i))
    : [];

  if (!destination) {
    res.status(400).json({ error: "Destination is required" });
    return;
  }

  if (!startingLocation) {
    res.status(400).json({ error: "Starting Location is required" });
    return;
  }

  const daysCount = Math.min(
    14,
    Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1) || 3
  );

  try {
    // 1. COLLECT ALL INTEGRATION SERVICE DATA IN PARALLEL VIA SMART API AGGREGATOR
    const aggregated = await APIAggregator.aggregateData(
      startingLocation,
      destination,
      startDate,
      endDate,
      travelers || 1,
      children || 0,
      budget || 1000,
      'economy'
    );

    const weatherData = aggregated.weather;
    const flightOptions = aggregated.flights;
    const hotelOptions = aggregated.hotels;
    const placesData = aggregated.restaurants;
    const transportProfile = aggregated.localTransport;
    const trains = aggregated.trains;
    const buses = aggregated.buses;

    const client = getGeminiClient();

    // 2. OFFLINE PRE-COMPILED COMPILATION IN CASE GEMINI API IS OFFLINE
    if (!client) {
      console.log("No Gemini API key detected. Compiling rich offline travel platform profile...");
      
      const fallbackItin = generateFallbackItinerary(destination, daysCount, travelStyle || "Adventure", budget || 1000, foodPreference || "Local Cuisines");
      
      // Compute budget allocation
      const budgetAllocation = [
        { category: "Lodging & Hotels", amount: Math.round(budget * 0.4), percentage: 40 },
        { category: "Flights & Transport", amount: Math.round(budget * 0.3), percentage: 30 },
        { category: "Gastronomy & Dining", amount: Math.round(budget * 0.18), percentage: 18 },
        { category: "Sightseeing & Leisure", amount: Math.round(budget * 0.12), percentage: 12 }
      ];

      // Formulate custom Phase 10 Recommendations Cards
      const bestFlight: any = flightOptions[0] || { airlineName: "Singapore Airlines", price: 39000 };
      const bestHotel: any = hotelOptions[0] || { name: "APA Hotel", pricePerNight: 4500, rating: 4.5 };
      
      const aiRecommendations = [
        {
          type: "flight",
          title: "✈ Flight Recommendation",
          text: `${bestFlight.airlineName} is recommended because it is $${Math.round(bestFlight.price * 0.08)} cheaper than premium carriers while keeping stops at a single hub.`
        },
        {
          type: "hotel",
          title: "🏨 Hotel Recommendation",
          text: `${bestHotel.name} offers the absolute best value because it has stellar community ratings (${bestHotel.rating}/5) while saving considerable budget per night.`
        },
        {
          type: "transport",
          title: "🚖 Local Transport Guide",
          text: `Using the local ${transportProfile.options[0]?.mode || "Metro"} is recommended because it covers all main sightseeing points within 20 minutes and costs only ${transportProfile.estimatedDailyCost}.`
        },
        {
          type: "weather",
          title: "🌤 Weather Alert",
          text: weatherData.rainWarning 
            ? `Rain showers are expected. Schedule museums for indoor days and outdoor walking tours for clear sunny periods.`
            : `Delightful conditions (${weatherData.temp}°C) are projected. Pack light layers and schedule outdoor vistas during the best sightseeing window: ${weatherData.bestSightseeingHours}.`
        }
      ];

      res.json({
        itinerary: fallbackItin.itinerary,
        hotels: hotelOptions,
        restaurants: placesData,
        weather: weatherData,
        flights: flightOptions,
        localTransport: transportProfile,
        trains,
        buses,
        aiRecommendations,
        budgetAllocation,
        packingTips: [weatherData.packingSuggestion, "Bring a universal travel plug adapter.", "Carry copies of your digital passport."],
        savingTips: ["Use the subway instead of private taxis.", "Dine at market food halls instead of major squares.", "Book early morning slots to avoid peak pricing."],
        safetyTips: ["Keep emergency contacts saved.", "Use zipped travel bags.", "Buy premium travel medical insurance."]
      });
      return;
    }

    // 3. GENERATE ITINERARY COMBINING ALL LIVE API DATA VIA GEMINI
    const prompt = `
      Act as an elite full-stack travel concierge with 15+ years of experience. Compile an exceptionally polished travel itinerary and platform data profile for:
      - Starting Location (Origin of the Journey): ${startingLocation}
      - Destination: ${destination}, ${country || ""}
      - Duration: ${daysCount} Days
      - Budget Limit: ${budget} ${currency || "USD"}
      - Travelers: ${travelers} Adults, ${children} Children
      - Travel Style: ${travelStyle}
      - Food Preferences: ${foodPreference}
      - Hotel Preference: ${hotelPreference}
      - Preferred Transport: ${transport}
      - Interests: ${interests?.join(", ") || "Sightseeing, culture"}

      ${APIAggregator.buildGeminiContextPrompt(aggregated)}

      ADDITIONAL FORMATTING DIRECTIVES:
      1. Use the weather data to plan the itinerary. If there is rain expected, suggest indoor museums.
      2. Set coordinates (lat, lng) within the actual geographic bounds of ${destination} for every single activity.
      3. Match the day-by-day plans to the travel style and preferred dining preferences.
      4. Formulate 4 high-value AI Recommendations cards (Flight, Hotel, Transport, and Weather) matching the exact response schema.
      5. Estimate a realistic budget allocation breakdown summing up to ${budget}.
      6. Provide packing tips, money-saving, and safety advice.
      7. Calculate transportation options and include concrete route plans from the Starting Location (${startingLocation}) to the Destination (${destination}):
         - CRITICAL ROUTE VALIDATION RULES:
           * Detect if this trip is Domestic (origin & destination in the same country) or International (different countries).
           * For INTERNATIONAL TRIPS (different countries): ONLY show international flights for the segment connecting origin and destination. Never suggest trains, buses, or driving routes between them unless a verified direct rail connection like Eurostar (UK-France/Belgium/Netherlands) exists. After arrival, show only local transit options (metro, taxi, Uber, Rapido, buses, or rental cars).
           * For DOMESTIC TRIPS: flights, trains, buses, driving, and local transport are all valid transport options.
           * Never generate impossible transport combinations (e.g., train or bus across oceans or thousands of kilometers of water).
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itinerary: {
              type: Type.ARRAY,
              description: "Day-by-day travel plan",
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  date: { type: Type.STRING, description: "E.g., Day 1 or June 15th" },
                  theme: { type: Type.STRING, description: "Theme of the day" },
                  morning: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        time: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        cost: { type: Type.NUMBER },
                        type: { type: Type.STRING, description: "sightseeing, food, rest, or transport" },
                        location: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            lat: { type: Type.NUMBER },
                            lng: { type: Type.NUMBER },
                            type: { type: Type.STRING }
                          },
                          required: ["name", "lat", "lng"]
                        }
                      },
                      required: ["id", "title", "description", "time", "duration", "cost", "type", "location"]
                    }
                  },
                  afternoon: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        time: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        cost: { type: Type.NUMBER },
                        type: { type: Type.STRING },
                        location: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            lat: { type: Type.NUMBER },
                            lng: { type: Type.NUMBER }
                          },
                          required: ["name", "lat", "lng"]
                        }
                      },
                      required: ["id", "title", "description", "time", "duration", "cost", "type", "location"]
                    }
                  },
                  evening: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        time: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        cost: { type: Type.NUMBER },
                        type: { type: Type.STRING },
                        location: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            lat: { type: Type.NUMBER },
                            lng: { type: Type.NUMBER }
                          },
                          required: ["name", "lat", "lng"]
                        }
                      },
                      required: ["id", "title", "description", "time", "duration", "cost", "type", "location"]
                    }
                  }
                },
                required: ["dayNumber", "date", "theme", "morning", "afternoon", "evening"]
              }
            },
            aiRecommendations: {
              type: Type.ARRAY,
              description: "4 recommendations cards: flight, hotel, transport, weather",
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "flight, hotel, transport, or weather" },
                  title: { type: Type.STRING, description: "E.g. Flight Recommendation" },
                  text: { type: Type.STRING, description: "Concise analysis comparison" }
                },
                required: ["type", "title", "text"]
              }
            },
            budgetAllocation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  percentage: { type: Type.NUMBER }
                },
                required: ["category", "amount", "percentage"]
              }
            },
            packingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            savingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            safetyTips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["itinerary", "aiRecommendations", "budgetAllocation", "packingTips", "savingTips", "safetyTips"]
        }
      }
    });

    const aiResult = JSON.parse(response.text.trim());

    // Merge generated AI outputs with live services datasets for a comprehensive travel blueprint response
    res.json({
      itinerary: aiResult.itinerary,
      hotels: hotelOptions,
      restaurants: placesData,
      weather: weatherData,
      flights: flightOptions,
      localTransport: transportProfile,
      trains,
      buses,
      aiRecommendations: aiResult.aiRecommendations,
      budgetAllocation: aiResult.budgetAllocation,
      packingTips: aiResult.packingTips || [weatherData.packingSuggestion],
      savingTips: aiResult.savingTips || [],
      safetyTips: aiResult.safetyTips || []
    });

  } catch (error) {
    console.error("AI Unified Generation Failed. Using graceful offline fallback...", error);
    const fallbackItin = generateFallbackItinerary(destination, daysCount, travelStyle || "Adventure", budget || 1000, foodPreference || "Local Cuisines");
    const weatherData = await WeatherService.getWeatherForCity(destination);
    const flightOptions = await FlightService.searchFlights(startingLocation || "NYC", destination, startDate, endDate, travelers || 1, 'economy');
    const hotelOptions = await HotelService.searchHotels(destination, budget || 1000);
    const transportProfile = LocalTransportService.getTransportProfile(destination);
    const trains = await IntercityTransitService.getTrains(destination, startingLocation);
    const buses = await IntercityTransitService.getBuses(destination, startingLocation);
    const placesData = await PlacesService.searchNearby(destination, interests?.join(", ") || "tourist attractions");

    res.json({
      itinerary: fallbackItin.itinerary,
      hotels: hotelOptions,
      restaurants: placesData,
      weather: weatherData,
      flights: flightOptions,
      localTransport: transportProfile,
      trains,
      buses,
      aiRecommendations: [
        { type: "flight", title: "✈ Flight Recommendation", text: "Direct route matches identified. Singapore Airlines recommended for premium legroom." },
        { type: "hotel", title: "🏨 Hotel Recommendation", text: "The Grand Palace offers the absolute finest luxury amenities." }
      ],
      budgetAllocation: [
        { category: "Lodging & Hotels", amount: Math.round(budget * 0.4), percentage: 40 },
        { category: "Flights & Transport", amount: Math.round(budget * 0.3), percentage: 30 }
      ],
      packingTips: [weatherData.packingSuggestion],
      savingTips: ["Use public mass transit guides."],
      safetyTips: ["Keep copy of passports."]
    });
  }
});

// AI TRAVEL CHAT ENDPOINT WITH COMPREHENSIVE SYSTEM INSTRUCTIONS
app.post("/api/chat", rateLimitMiddleware(30, 60000), async (req, res) => {
  const { messages, currentTrip } = req.body;
  const client = getGeminiClient();

  if (!messages || messages.length === 0) {
    res.status(400).json({ error: "Messages are required" });
    return;
  }

  const sanitizedMessages = Array.isArray(messages)
    ? messages.map((m: any) => ({
        role: sanitizeString(m.role || "user"),
        text: sanitizeString(m.text || "")
      }))
    : [];

  const formattedHistory = sanitizedMessages.map((m: any) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text }]
  }));

  const userQuery = formattedHistory[formattedHistory.length - 1].parts[0].text;
  const historyBeforeQuery = formattedHistory.slice(0, -1);

  const tripContext = currentTrip
    ? `The user is currently planning or viewing a trip to: ${currentTrip.destination}, ${currentTrip.country}.
       Trip style is ${currentTrip.travelStyle || "casual"} with a budget of ${currentTrip.budget} ${currentTrip.currency || "USD"}.
       The itinerary includes ${currentTrip.itinerary?.length || 0} days.`
    : "No active trip is loaded. Invite them to plan a trip using the Quick Planner.";

  if (!client) {
    let answer = "I'm running in offline assistant mode. ";
    if (userQuery.toLowerCase().includes("restaurant") || userQuery.toLowerCase().includes("food")) {
      answer += "For a truly gourmet experience, explore local street food or look for family-owned bistros near the main square. Always try the seasonal specials!";
    } else if (userQuery.toLowerCase().includes("packing") || userQuery.toLowerCase().includes("pack")) {
      answer += "Pack versatile, breathable layers. Don't forget comfortable walking shoes, a waterproof jacket, a power bank, and a refillable water bottle!";
    } else if (userQuery.toLowerCase().includes("safety") || userQuery.toLowerCase().includes("safe")) {
      answer += "Always keep your essentials in a zipped secure bag, keep photocopies of passport on cloud, buy comprehensive travel insurance, and note local emergency numbers.";
    } else if (userQuery.toLowerCase().includes("budget") || userQuery.toLowerCase().includes("cost")) {
      answer += "Consider taking high-quality public transit or walking instead of ride-sharing. Eat at central marketplaces instead of immediate tourist spots for 40% cost savings.";
    } else {
      answer += `That is a marvelous question! Traveling to unique places offers incredible memory-making. If you want customized insights about ${currentTrip?.destination || "your next adventure"}, try connecting your Gemini API Key in the Secrets panel!`;
    }
    res.json({ text: answer });
    return;
  }

  try {
    const chat = client.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `You are 'Voyage AI', an elite, ultra-knowledgeable luxury AI Travel Concierge.
        Your style is sophisticated, warm, helpful, objective, and scannable.
        Here is the current Trip Context: ${tripContext}
        Always keep suggestions highly practical, referring to best local restaurants, hidden gems, and safety guidelines.
        Give well-structured answers using clear Markdown. Do not praise yourself or write flowery fluff. Maintain extreme professionalism.`
      },
      history: historyBeforeQuery
    });

    const response = await chat.sendMessage({ message: userQuery });
    res.json({ text: response.text });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

// GEOLOCATION AUTOCOMPLETE SUGGESTIONS PROXY ENDPOINT
app.get("/api/geocode/search", async (req, res) => {
  const query = sanitizeString(req.query.q as string || "");
  if (!query) {
    res.json([]);
    return;
  }
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "VoyageurAIPlanner/1.0 (akhilvarmakshatriya3@gmail.com)"
      }
    });
    if (!response.ok) {
      throw new Error("Nominatim request failed");
    }
    const data = await response.json();
    const suggestions = data.map((item: any) => ({
      displayName: item.display_name,
      name: item.name || query,
      type: item.type || item.class || "location",
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
    res.json(suggestions);
  } catch (err) {
    console.error("Geocode search error:", err);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

// GEOLOCATION REVERSE PROXY ENDPOINT
app.get("/api/geocode/reverse", async (req, res) => {
  const lat = parseFloat(req.query.lat as string || "");
  const lng = parseFloat(req.query.lng as string || "");
  if (isNaN(lat) || isNaN(lng)) {
    res.status(400).json({ error: "Invalid coordinates" });
    return;
  }
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "VoyageurAIPlanner/1.0 (akhilvarmakshatriya3@gmail.com)"
      }
    });
    if (!response.ok) {
      throw new Error("Nominatim reverse geocoding request failed");
    }
    const data = await response.json();
    res.json({ address: data.display_name || `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}` });
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    res.status(500).json({ error: "Failed to reverse geocode" });
  }
});

// START PRODUCTION BUILD ROUTING HANDLERS
if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running in DEV mode on http://localhost:${PORT}`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running in PRODUCTION mode on http://localhost:${PORT}`);
  });
}
