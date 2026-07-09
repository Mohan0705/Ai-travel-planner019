import React from "react";
import { 
  Sparkles, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar, 
  Heart, 
  Compass, 
  Check, 
  ChevronRight, 
  PlaneTakeoff,
  AlertCircle
} from "lucide-react";
import { Trip } from "../types";

interface CreateTripViewProps {
  onTripGenerated: (trip: Trip) => void;
  initialDestination?: string;
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || "";

const TRAVEL_STYLES = [
  "Cultural Luxury",
  "High-End Adventure",
  "Relaxed Coastal / Beach",
  "Eco-Friendly Sanctuary",
  "Family-Friendly Exploration",
  "Romantic Honeymoon",
  "Art, Architecture & Fashion"
];

const FOOD_PREFERENCES = [
  "Michelin Star Dining",
  "Local Traditional Cuisines",
  "Seafood & Waterfront Grills",
  "Strict Vegetarian / Plant-based",
  "Gluten-Free Fine Cuisine",
  "Anything / Global Gastronomy"
];

const HOTEL_PREFERENCES = [
  "Historic Palace / Ryokan",
  "Modern Boutique Hotels",
  "Five-Star Luxury Resort",
  "Scenic Eco Lodges",
  "Private Villas & Chalets"
];

const TRANSPORTS = [
  "Private Chauffeur & Tesla",
  "First-Class Rail / Bullet Train",
  "Scenic Convertible Rental",
  "Premium Taxi & Public Transit",
  "Yacht Charters & Helicopters"
];

const INTERESTS_LIST = [
  "Temples & Shrines",
  "Museums & Art Archives",
  "Shopping & Haute Couture",
  "Hiking & Forest Trails",
  "Spa, Onsen & Rejuvenation",
  "Sunset Lounges & Nightlife",
  "Historical Castles & Ruins",
  "Cooking Classes & Wine Tastings",
  "Hidden Local Gems",
  "Beaches & Water Sports"
];

const LOADING_STEPS = [
  "Booting Voyage Multi-Agent Orchestrator...",
  "Spatial Coordinator plotting geographical coordinates...",
  "Gastronomy Agent vetting seasonal local restaurant cuisines...",
  "Concierge Specialist selecting boutique lodging choices...",
  "Meteorological Agent checking early weather calendars...",
  "Formatting high-contrast luxury day timeline PDF outputs..."
];

export default function CreateTripView({ onTripGenerated, initialDestination = "" }: CreateTripViewProps) {
  // Form States
  const [startingLocation, setStartingLocation] = React.useState("");
  const [fetchingLocation, setFetchingLocation] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const [destination, setDestination] = React.useState(initialDestination);
  const [country, setCountry] = React.useState("");
  const [budget, setBudget] = React.useState("1500");
  const [currency, setCurrency] = React.useState("USD");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [travelers, setTravelers] = React.useState(2);
  const [children, setChildren] = React.useState(0);
  const [travelStyle, setTravelStyle] = React.useState(TRAVEL_STYLES[0]);
  const [foodPreference, setFoodPreference] = React.useState(FOOD_PREFERENCES[1]);
  const [hotelPreference, setHotelPreference] = React.useState(HOTEL_PREFERENCES[1]);
  const [transport, setTransport] = React.useState(TRANSPORTS[3]);
  const [interests, setInterests] = React.useState<string[]>([]);
  const [tripTiming, setTripTiming] = React.useState<"upcoming" | "completed">("upcoming");
  
  // Multi-City Planner States
  const [plannerMode, setPlannerMode] = React.useState<"single" | "multi">("single");
  const [multicityDestinations, setMulticityDestinations] = React.useState<string[]>(["Delhi", "Agra", "Jaipur"]);
  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);

  // App states
  const [loading, setLoading] = React.useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = React.useState(0);
  const [validationError, setValidationError] = React.useState("");

  const suggestionsTimeoutRef = React.useRef<any>(null);

  React.useEffect(() => {
    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setValidationError("Browser geolocation is not supported by your system.");
      return;
    }

    setFetchingLocation(true);
    setValidationError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const response = await fetch(`${API_BASE}/api/geocode/reverse?lat=${latitude}&lng=${longitude}`);
          if (!response.ok) throw new Error("Reverse geocoding failed");
          const data = await response.json();
          if (data && data.address) {
            setStartingLocation(data.address);
          } else {
            setStartingLocation(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          }
        } catch (err) {
          console.warn("Could not reverse geocode coordinates, using raw coords:", err);
          setStartingLocation(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        } finally {
          setFetchingLocation(false);
        }
      },
      (err) => {
        console.warn("Geolocation access denied or failed:", err);
        setValidationError("Location access was denied or failed. Please type your starting location manually.");
        setFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleStartingLocationChange = (val: string) => {
    setStartingLocation(val);
    setShowSuggestions(true);

    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    if (!val.trim() || val.length < 2) {
      setSuggestions([]);
      return;
    }

    suggestionsTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE}/api/geocode/search?q=${encodeURIComponent(val)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data || []);
        }
      } catch (err) {
        console.warn("Error fetching autocomplete suggestions:", err);
      }
    }, 400);
  };

  const handleSelectSuggestion = (s: any) => {
    setStartingLocation(s.displayName);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  React.useEffect(() => {
    if (initialDestination) {
      setDestination(initialDestination);
    }
  }, [initialDestination]);

  // Dynamic loading message transitions
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  // Multi-city Helpers
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (idx: number) => {
    if (draggedIdx === null) return;
    const list = [...multicityDestinations];
    const item = list[draggedIdx];
    list.splice(draggedIdx, 1);
    list.splice(idx, 0, item);
    setMulticityDestinations(list);
    setDraggedIdx(null);
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const list = [...multicityDestinations];
    const temp = list[idx];
    list[idx] = list[idx - 1];
    list[idx - 1] = temp;
    setMulticityDestinations(list);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === multicityDestinations.length - 1) return;
    const list = [...multicityDestinations];
    const temp = list[idx];
    list[idx] = list[idx + 1];
    list[idx + 1] = temp;
    setMulticityDestinations(list);
  };

  const handleAddCity = () => {
    setMulticityDestinations([...multicityDestinations, ""]);
  };

  const handleRemoveCity = (idx: number) => {
    setMulticityDestinations(multicityDestinations.filter((_, i) => i !== idx));
  };

  const handleCityChange = (idx: number, val: string) => {
    const list = [...multicityDestinations];
    list[idx] = val;
    setMulticityDestinations(list);
  };

  const optimizeRouteAI = async () => {
    const validDests = multicityDestinations.filter(c => c.trim().length > 0);
    if (validDests.length < 2) {
      setValidationError("Please add at least 2 destinations to run route optimization.");
      return;
    }
    if (!startingLocation.trim()) {
      setValidationError("Starting Location is required to optimize the route from.");
      return;
    }
    setValidationError("");
    setLoading(true);
    setLoadingStepIdx(1); // Spatial coordinator plotting geographical coordinates...
    
    try {
      // 1. Geocode starting location
      const startRes = await fetch(`${API_BASE}/api/geocode/search?q=${encodeURIComponent(startingLocation)}`);
      let startLat = 17.3850;
      let startLng = 78.4867; // Default Hyderabad fallback
      if (startRes.ok) {
        const data = await startRes.json();
        if (data && data.length > 0) {
          startLat = parseFloat(data[0].lat || "17.3850");
          startLng = parseFloat(data[0].lon || "78.4867");
        }
      }
      
      // 2. Geocode all destinations
      const coordsList = await Promise.all(
        validDests.map(async (city) => {
          try {
            const res = await fetch(`${API_BASE}/api/geocode/search?q=${encodeURIComponent(city)}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.length > 0) {
                return { city, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
              }
            }
          } catch (e) {
            console.warn("Geocoding city failed for TSP optimizer:", e);
          }
          // Fallback synthetic coordinates using simple hash code
          let hash = 0;
          for (let i = 0; i < city.length; i++) {
            hash = city.charCodeAt(i) + ((hash << 5) - hash);
          }
          const lat = 10 + (Math.abs(hash % 500) / 10);
          const lng = 70 + (Math.abs((hash >> 3) % 40) / 10);
          return { city, lat, lng };
        })
      );
      
      // 3. Nearest Neighbor TSP algorithm starting from startLat, startLng
      const unvisited = [...coordsList];
      const optimized: string[] = [];
      let currentLat = startLat;
      let currentLng = startLng;
      
      const calculateDistance = (la1: number, ln1: number, la2: number, ln2: number) => {
        const R = 6371;
        const dLat = ((la2 - la1) * Math.PI) / 180;
        const dLng = ((ln2 - ln1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos((la1 * Math.PI) / 180) * Math.cos((la2 * Math.PI) / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };
      
      while (unvisited.length > 0) {
        let bestIdx = 0;
        let minDistance = Infinity;
        for (let i = 0; i < unvisited.length; i++) {
          const d = calculateDistance(currentLat, currentLng, unvisited[i].lat, unvisited[i].lng);
          if (d < minDistance) {
            minDistance = d;
            bestIdx = i;
          }
        }
        const nextNode = unvisited.splice(bestIdx, 1)[0];
        optimized.push(nextNode.city);
        currentLat = nextNode.lat;
        currentLng = nextNode.lng;
      }
      
      setMulticityDestinations(optimized);
    } catch (error) {
      console.error("AI Route optimization failed:", error);
      setValidationError("Route optimization failed. Reordered list manually or try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // VALIDATION
    if (!startingLocation.trim()) {
      setValidationError("Starting Location is required. Please enter a city or airport manually.");
      return;
    }

    const isMulticity = plannerMode === "multi";
    const validDestinations = isMulticity 
      ? multicityDestinations.filter(d => d.trim().length > 0)
      : [destination.trim()];

    if (!isMulticity && !destination.trim()) {
      setValidationError("Destination location is required.");
      return;
    }

    if (isMulticity && validDestinations.length === 0) {
      setValidationError("At least one destination city is required.");
      return;
    }

    if (!startDate || !endDate) {
      setValidationError("Please select both start and end dates.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setValidationError("End Date cannot precede the Start Date.");
      return;
    }

    setLoading(true);
    setLoadingStepIdx(0);

    const endpoint = isMulticity ? "/api/itinerary/generate-multicity" : "/api/itinerary/generate";
    const payload = isMulticity ? {
      startingLocation: startingLocation.trim(),
      destinations: validDestinations,
      budget: Number(budget) || 1500,
      currency,
      startDate,
      endDate,
      travelers,
      children,
      travelStyle,
      foodPreference,
      hotelPreference,
      transport,
      interests
    } : {
      startingLocation: startingLocation.trim(),
      destination: destination.trim(),
      country: country.trim() || "International",
      budget: Number(budget) || 1500,
      currency,
      startDate,
      endDate,
      travelers,
      children,
      travelStyle,
      foodPreference,
      hotelPreference,
      transport,
      interests
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Server itinerary generation failed.");
      }

      const generatedData = await response.json();
      
      const newTrip: Trip = {
        id: `trip-${Date.now()}`,
        destination: isMulticity ? validDestinations.join(" → ") : (payload as any).destination,
        startingLocation: payload.startingLocation,
        country: isMulticity ? "Multi-City Route" : (payload as any).country,
        startDate: payload.startDate,
        endDate: payload.endDate,
        travelers: payload.travelers,
        children: payload.children,
        budget: payload.budget,
        currency: payload.currency,
        travelStyle: payload.travelStyle,
        foodPreference: payload.foodPreference,
        hotelPreference: payload.hotelPreference,
        transport: payload.transport,
        interests: payload.interests,
        isSaved: true,
        isFavorite: false,
        status: tripTiming,
        itinerary: generatedData.itinerary || [],
        expenses: [],
        hotels: generatedData.hotels || [],
        restaurants: generatedData.restaurants || [],
        weather: isMulticity 
          ? (generatedData.weather && generatedData.weather.length > 0 ? generatedData.weather[0] : null)
          : (generatedData.weather || null),
        flights: generatedData.flights || [],
        localTransport: generatedData.localTransport || null,
        trains: generatedData.trains || [],
        buses: generatedData.buses || [],
        aiRecommendations: generatedData.aiRecommendations || [],
        budgetAllocation: generatedData.budgetAllocation || [],
        packingTips: generatedData.packingTips || [],
        savingTips: generatedData.savingTips || [],
        safetyTips: generatedData.safetyTips || [],
        createdAt: new Date().toISOString(),
        isMulticity,
        totalDistance: generatedData.totalDistance,
        totalDuration: generatedData.totalDuration,
        weatherList: isMulticity ? generatedData.weather : undefined,
        segments: isMulticity ? generatedData.segments : undefined
      };

      onTripGenerated(newTrip);
    } catch (err) {
      console.error("AI Generation Error", err);
      setValidationError("AI failed to generate a response. Please verify your internet connection and API credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-earth-bg text-earth-text">
      
      {/* Loading Cinematic Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-earth-bg/98 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center space-y-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-t-earth-accent border-earth-border/25 animate-spin" />
            <Sparkles className="w-8 h-8 text-earth-accent animate-pulse absolute inset-0 m-auto" />
          </div>
          <div className="space-y-3 max-w-md">
            <h3 className="font-serif italic font-light text-[#4A4A3A] text-2xl tracking-tight">Designing Your Masterwork</h3>
            <p className="text-sm font-mono text-earth-accent h-12 transition-all duration-300">
              {LOADING_STEPS[loadingStepIdx]}
            </p>
            <p className="text-xs text-earth-text/60 font-light leading-relaxed">Please wait. AI is drafting optimized coordinate loops, selecting fine culinary structures, and calculating overall spend curves.</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Title */}
        <div className="space-y-1">
          <h1 className="font-serif italic font-light text-3xl text-earth-text tracking-tight">AI Itinerary Planner</h1>
          <p className="text-sm text-earth-text/65 font-light">Input your travel characteristics below to orchestrate a bespoke luxury agenda.</p>
        </div>

        {validationError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-8 p-6 md:p-8 rounded-[32px] bg-white border border-earth-border shadow-sm">
          
          {/* Section 1: Geo & Dates */}
          <div className="space-y-4">
            <h3 className="text-sm font-serif italic text-[#4A4A3A] font-medium border-b border-earth-border pb-2">1. Destination Coordinates & Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5 md:col-span-2 relative">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-earth-text/80">Starting Location <span className="text-red-500">*</span></label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={fetchingLocation}
                    className="text-[10px] text-earth-accent hover:text-earth-dark font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {fetchingLocation ? (
                      <span className="inline-block w-2.5 h-2.5 rounded-full border-2 border-t-transparent border-earth-accent animate-spin" />
                    ) : (
                      <span>📍</span>
                    )}
                    <span>{fetchingLocation ? "Locating..." : "Use Current Location"}</span>
                  </button>
                </div>
                <div className="relative">
                  <PlaneTakeoff className="w-4 h-4 text-earth-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    id="form-starting-location"
                    type="text"
                    required
                    value={startingLocation}
                    onChange={(e) => handleStartingLocationChange(e.target.value)}
                    placeholder="Search city, airport code, or 'Current Location'..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                    onFocus={() => setShowSuggestions(true)}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />
                      <div className="absolute left-0 right-0 mt-1.5 bg-white border border-earth-border rounded-xl shadow-lg z-20 overflow-hidden font-sans max-h-60 overflow-y-auto">
                        {suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectSuggestion(s)}
                            className="w-full text-left px-4 py-2.5 text-xs hover:bg-earth-light-sage/10 text-earth-text flex items-center justify-between border-b border-earth-border/40 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span>{s.type.includes("airport") || s.type.includes("aerodrome") ? "✈️" : "🏙️"}</span>
                              <span className="font-medium truncate">{s.displayName}</span>
                            </div>
                            <span className="text-[10px] font-mono text-earth-accent shrink-0 uppercase tracking-wider">{s.type}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Planning Strategy Toggle */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-semibold text-earth-text/80">Planning Strategy</label>
                <div className="flex gap-4 p-1.5 rounded-2xl bg-[#F5F5F0] border border-earth-border max-w-md">
                  <button
                    type="button"
                    onClick={() => setPlannerMode("single")}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                      plannerMode === "single"
                        ? "bg-[#5F5E4E] text-white shadow"
                        : "text-earth-text/60 hover:text-earth-text"
                    }`}
                  >
                    🗺️ Single Destination
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlannerMode("multi")}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                      plannerMode === "multi"
                        ? "bg-earth-accent text-white shadow"
                        : "text-earth-text/60 hover:text-earth-text"
                    }`}
                  >
                    ⭐ Multi-City Route
                  </button>
                </div>
              </div>

              {plannerMode === "single" ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-earth-text/80">Destination City</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-earth-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        id="form-destination"
                        type="text"
                        required={plannerMode === "single"}
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="E.g., Kyoto, London, New York..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-earth-text/80">Country (Optional)</label>
                    <input 
                      id="form-country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="E.g., Japan, United Kingdom..."
                      className="w-full px-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                    />
                  </div>
                </>
              ) : (
                <div className="md:col-span-2 space-y-4 p-5 rounded-2xl bg-[#FAF9F5]/80 border border-earth-border/60">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-[#4A4A3A] uppercase font-medium">Quick Path Presets</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStartingLocation("Delhi");
                          setMulticityDestinations(["Agra", "Jaipur", "Mumbai", "Goa", "Kerala"]);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-earth-border bg-[#F5F5F0] hover:bg-white text-xs font-medium text-earth-text/80 transition-all cursor-pointer"
                      >
                        🇮🇳 Golden Triangle & South (Delhi → Kerala)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStartingLocation("Hyderabad");
                          setMulticityDestinations(["Bangalore", "Mysore", "Coorg", "Goa"]);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-earth-border bg-[#F5F5F0] hover:bg-white text-xs font-medium text-earth-text/80 transition-all cursor-pointer"
                      >
                        🌴 South India Explorer (Hyderabad → Goa)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-earth-text/80">Destinations Array <span className="text-red-500">*</span></label>
                      <button
                        type="button"
                        onClick={optimizeRouteAI}
                        className="px-3 py-1.5 rounded-lg bg-earth-sage/15 hover:bg-earth-sage/30 text-[10px] font-mono text-earth-dark flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Optimize Route (AI TSP)
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {multicityDestinations.map((city, idx) => (
                        <div
                          key={idx}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(idx)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            draggedIdx === idx 
                              ? "border-earth-accent bg-[#FAF9F5] opacity-50" 
                              : "border-earth-border bg-white"
                          }`}
                        >
                          <div className="cursor-grab text-earth-text/30 hover:text-earth-text/60 select-none font-mono text-xs">
                            ⠿
                          </div>
                          
                          <span className="text-[10px] font-mono font-medium text-[#4A4A3A]/60 w-5">
                            #{idx + 1}
                          </span>
                          
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => handleCityChange(idx, e.target.value)}
                            placeholder={`Destination City #${idx + 1}`}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-[#FAF9F5]/40 border border-earth-border/60 text-earth-text text-xs font-medium focus:outline-none focus:ring-1 focus:ring-earth-accent/30"
                          />

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveUp(idx)}
                              disabled={idx === 0}
                              className="p-1 rounded text-earth-text/40 hover:text-earth-text disabled:opacity-20 cursor-pointer"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDown(idx)}
                              disabled={idx === multicityDestinations.length - 1}
                              className="p-1 rounded text-earth-text/40 hover:text-earth-text disabled:opacity-20 cursor-pointer"
                            >
                              ▼
                            </button>
                            {multicityDestinations.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveCity(idx)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCity}
                      className="w-full py-2 border border-dashed border-earth-border hover:border-earth-accent/65 rounded-xl text-xs font-mono text-[#4A4A3A]/70 hover:text-earth-accent transition-all cursor-pointer"
                    >
                      + Add Destination City
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Departure Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-earth-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    id="form-start-date"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Return Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-earth-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    id="form-end-date"
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-semibold text-earth-text/80">Voyage Timing Phase</label>
                <div className="flex gap-4 p-1.5 rounded-2xl bg-[#F5F5F0] border border-earth-border max-w-md">
                  <button
                    type="button"
                    onClick={() => setTripTiming("upcoming")}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                      tripTiming === "upcoming"
                        ? "bg-[#5F5E4E] text-white shadow"
                        : "text-earth-text/60 hover:text-earth-text"
                    }`}
                  >
                    🚀 Upcoming / Planned
                  </button>
                  <button
                    type="button"
                    onClick={() => setTripTiming("completed")}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                      tripTiming === "completed"
                        ? "bg-earth-olive text-white shadow"
                        : "text-earth-text/60 hover:text-earth-text"
                    }`}
                  >
                    🕰️ Past / Completed
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Budget & Travelers */}
          <div className="space-y-4">
            <h3 className="text-sm font-serif italic text-[#4A4A3A] font-medium border-b border-earth-border pb-2">2. Budget & Travelers Density</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-earth-text/80">Max Budget Limit</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-earth-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    id="form-budget"
                    type="number"
                    required
                    min="1"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Adult Travelers</label>
                <input 
                  id="form-travelers"
                  type="number"
                  min="1"
                  max="20"
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Children / Kids</label>
                <input 
                  id="form-children"
                  type="number"
                  min="0"
                  max="10"
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                />
              </div>

            </div>
          </div>

          {/* Section 3: Luxury Characteristics Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-serif italic text-[#4A4A3A] font-medium border-b border-earth-border pb-2">3. Journey Characteristics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Travel Style Theme</label>
                <select 
                  id="form-style"
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                >
                  {TRAVEL_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Culinary / Dining Preference</label>
                <select 
                  id="form-food"
                  value={foodPreference}
                  onChange={(e) => setFoodPreference(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                >
                  {FOOD_PREFERENCES.map(food => <option key={food} value={food}>{food}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Lodging & Hotel Class</label>
                <select 
                  id="form-hotel"
                  value={hotelPreference}
                  onChange={(e) => setHotelPreference(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                >
                  {HOTEL_PREFERENCES.map(hotel => <option key={hotel} value={hotel}>{hotel}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Transport Method</label>
                <select 
                  id="form-transport"
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                >
                  {TRANSPORTS.map(tr => <option key={tr} value={tr}>{tr}</option>)}
                </select>
              </div>

            </div>
          </div>

          {/* Section 4: Activities Interests Checklist */}
          <div className="space-y-4">
            <h3 className="text-sm font-serif italic text-[#4A4A3A] font-medium border-b border-earth-border pb-2">4. Personalized Interests</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {INTERESTS_LIST.map((interest) => {
                const isSelected = interests.includes(interest);
                return (
                  <button
                    id={`interest-tag-${interest.toLowerCase().replace(/\s+/g, '-')}`}
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`
                      px-3.5 py-3 rounded-xl text-left text-xs font-medium transition-all duration-200 border flex items-center justify-between
                      ${isSelected 
                        ? "bg-earth-accent/10 border-earth-accent text-earth-accent font-semibold" 
                        : "bg-earth-light-sage/20 border-earth-border/40 text-earth-text/80 hover:bg-white hover:border-earth-accent/30"}
                    `}
                  >
                    <span>{interest}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-earth-accent shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            id="form-submit-generate"
            type="submit"
            className="w-full py-4 rounded-full bg-earth-dark hover:bg-earth-dark-accent text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm font-sans"
          >
            <Sparkles className="w-4 h-4 text-earth-light-sage" />
            <span>Engage AI Itinerary Engine</span>
            <ChevronRight className="w-4 h-4 text-earth-light-sage" />
          </button>

        </form>
      </div>

    </div>
  );
}
