import React from "react";
import { 
  Printer, 
  Share2, 
  MapPin, 
  DollarSign, 
  Utensils, 
  Hotel, 
  Activity, 
  Clock, 
  Heart, 
  ChevronRight, 
  Map, 
  Star,
  CheckCircle,
  Download,
  AlertCircle,
  Sun,
  CloudRain,
  Plane,
  Train,
  Bus,
  Compass,
  PieChart,
  Copy,
  Check,
  AlertTriangle,
  Flame,
  Wind,
  Shield,
  Lightbulb,
  Briefcase
} from "lucide-react";
import { Trip, DayPlan, Activity as ActivityType, HotelRecommendation, RestaurantRecommendation } from "../types";
import MapboxMap from "./MapboxMap.tsx";
import { formatPrice } from "../lib/currency.ts";

interface ItineraryViewProps {
  trip: Trip | null;
  onToggleFavorite: (tripId: string) => void;
  onAddExpense: (tripId: string, amount: number, title: string, category: any) => void;
}

type ActiveTabType = 'itinerary' | 'weather' | 'flights' | 'hotels' | 'transport' | 'insights';

export default function ItineraryView({ trip, onToggleFavorite, onAddExpense }: ItineraryViewProps) {
  const [selectedDayIdx, setSelectedDayIdx] = React.useState(0);
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);
  const [printMode, setPrintMode] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<ActiveTabType>('itinerary');
  const [shareCopied, setShareCopied] = React.useState(false);
  const [cabinClass, setCabinClass] = React.useState<'economy' | 'premium' | 'business' | 'first'>('economy');

  if (!trip) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-earth-bg text-earth-text/50">
        <Map className="w-16 h-16 text-earth-border animate-float" />
        <h3 className="font-serif italic font-light text-earth-text text-lg">No Active Itinerary Loaded</h3>
        <p className="text-xs text-earth-text/50 max-w-sm">Please select an existing trip from the Dashboard or create a custom journey in Plan New Trip to load the timeline layout.</p>
      </div>
    );
  }

  const activeDay = trip.itinerary[selectedDayIdx] || trip.itinerary[0];

  // SUM ALL COSTS
  const totalCostOfActivities = trip.itinerary.reduce((sum, day) => {
    const morningCost = day.morning?.reduce((s, a) => s + (a.cost || 0), 0) || 0;
    const afternoonCost = day.afternoon?.reduce((s, a) => s + (a.cost || 0), 0) || 0;
    const eveningCost = day.evening?.reduce((s, a) => s + (a.cost || 0), 0) || 0;
    return sum + morningCost + afternoonCost + eveningCost;
  }, 0);

  const totalSpentAll = (trip.expenses?.reduce((s, e) => s + e.amount, 0) || 0) + totalCostOfActivities;

  // SHARE HANDLER
  const handleShareTrip = () => {
    const shareUrl = `${window.location.origin}/share/${trip.id}`;
    navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  // ALL POINTS IN CURRENT DAY FOR MAP PLOTTING
  const mapPoints: { name: string; lat: number; lng: number; type: 'hotel' | 'restaurant' | 'attraction'; time: string; id: string }[] = [];

  if (activeDay) {
    activeDay.morning?.forEach(a => {
      mapPoints.push({ name: a.title, lat: a.location.lat, lng: a.location.lng, type: 'attraction', time: a.time, id: a.id });
    });
    activeDay.afternoon?.forEach(a => {
      mapPoints.push({ name: a.title, lat: a.location.lat, lng: a.location.lng, type: a.type === 'food' ? 'restaurant' : 'attraction', time: a.time, id: a.id });
    });
    activeDay.evening?.forEach(a => {
      mapPoints.push({ name: a.title, lat: a.location.lat, lng: a.location.lng, type: a.type === 'food' ? 'restaurant' : 'attraction', time: a.time, id: a.id });
    });
  }

  // Calculate coordinates bounds for the interactive Vector Map
  const lats = mapPoints.map(p => p.lat);
  const lngs = mapPoints.map(p => p.lng);
  const minLat = Math.min(...lats, 35.65);
  const maxLat = Math.max(...lats, 35.72);
  const minLng = Math.min(...lngs, 139.6);
  const maxLng = Math.max(...lngs, 139.75);
  const latRange = maxLat - minLat || 0.05;
  const lngRange = maxLng - minLng || 0.05;

  // PRINT / EXPORT METHOD
  const handleTriggerPrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 500);
  };

  // Curated fallback stats if server hasn't filled details
  const localWeather = trip.weather || {
    temp: 22,
    feelsLike: 23,
    condition: "Sunny",
    description: "delightful summer conditions",
    icon: "sun",
    humidity: 58,
    windSpeed: 12,
    rainChance: 5,
    uvIndex: 6,
    airQuality: "Good (AQI 32)",
    sunrise: "05:22 AM",
    sunset: "07:35 PM",
    bestSightseeingHours: "08:00 AM - 11:30 AM & 04:00 PM - 07:00 PM",
    packingSuggestion: "Linen garments, comfortable sunglasses, sunscreen and a light cardigan.",
    rainWarning: null,
    hourly: [
      { time: "08:00 AM", temp: 19, condition: "Sunny", rainChance: 0 },
      { time: "11:00 AM", temp: 22, condition: "Sunny", rainChance: 0 },
      { time: "02:00 PM", temp: 24, condition: "Sunny", rainChance: 5 },
      { time: "05:00 PM", temp: 23, condition: "Partly Cloudy", rainChance: 10 },
      { time: "08:00 PM", temp: 21, condition: "Clear Sky", rainChance: 5 },
      { time: "11:00 PM", temp: 18, condition: "Clear Sky", rainChance: 5 }
    ],
    forecast: [
      { day: "Tomorrow", date: "June 24", temp: 23, condition: "Sunny", description: "uninterrupted solar warmth", rainChance: 0 },
      { day: "Day 3", date: "June 25", temp: 21, condition: "Partly Cloudy", description: "mild breezy intervals", rainChance: 15 },
      { day: "Day 4", date: "June 26", temp: 20, condition: "Rainy", description: "afternoon rain showers", rainChance: 75 },
      { day: "Day 5", date: "June 27", temp: 22, condition: "Clear Sky", description: "vivid blue heavens", rainChance: 0 }
    ]
  };

  const flightsList = trip.flights || [
    {
      id: "f-1",
      airlineName: "Singapore Airlines",
      airlineLogo: "🇸🇬",
      departureTime: "08:30 AM",
      arrivalTime: "09:40 PM",
      duration: "13h 10m",
      stops: 1,
      stopsDetail: "1 Stop (SIN)",
      price: cabinClass === 'economy' ? 440 : cabinClass === 'premium' ? 740 : cabinClass === 'business' ? 1680 : 3800,
      currency: "USD",
      cabinClass,
      terminal: "Terminal 3",
      baggageAllowance: "Checked: 2x 23kg, Cabin: 1x 8kg",
      refundableStatus: "Refundable",
      bookingUrl: "https://www.singaporeair.com"
    },
    {
      id: "f-2",
      airlineName: "Emirates Airline",
      airlineLogo: "🇦🇪",
      departureTime: "11:15 AM",
      arrivalTime: "01:25 AM",
      duration: "14h 10m",
      stops: 1,
      stopsDetail: "1 Stop (DXB)",
      price: cabinClass === 'economy' ? 485 : cabinClass === 'premium' ? 790 : cabinClass === 'business' ? 1750 : 3950,
      currency: "USD",
      cabinClass,
      terminal: "Terminal 1",
      baggageAllowance: "Checked: 2x 23kg, Cabin: 1x 10kg",
      refundableStatus: "Refundable with Fee",
      bookingUrl: "https://www.emirates.com"
    }
  ];

  const localTransitProfile = trip.localTransport || {
    destination: trip.destination,
    estimatedDailyCost: "$10 - $18 / day",
    tip: "Public transit passes are highly cost-effective and perfectly integrated with primary tourist terminals.",
    options: [
      {
        id: "t-1",
        mode: "Underground Metro / Subway",
        icon: "🚇",
        description: "High-frequency rapid subway lines connecting urban neighborhoods.",
        travelTime: "10 - 15 mins avg",
        estimatedCost: "$1.80 - $3.00",
        availability: "Very High",
        suitability: "Fastest way to traverse main historic corridors.",
        bestFor: "District sightseeing"
      },
      {
        id: "t-2",
        mode: "Express Cabs & Ridesharing",
        icon: "🚕",
        description: "On-demand direct micro-mobility cars. Convenient luggage storage.",
        travelTime: "15 - 30 mins",
        estimatedCost: "$20.00 - $35.00",
        availability: "High",
        suitability: "Best for late-night transfers or hot afternoons.",
        bestFor: "Private point-to-point travel"
      }
    ]
  };

  const trainsList = trip.trains || [
    {
      id: "tr-1",
      name: "Nozomi Bullet Train",
      number: "N24",
      departure: "08:12 AM",
      arrival: "10:25 AM",
      duration: "2h 13m",
      seats: "24 Seats Available",
      cabinClass: "Green First Class",
      fare: 135,
      status: "On Time",
      bookingUrl: "https://www.jr-central.co.jp"
    }
  ];

  const busesList = trip.buses || [
    {
      id: "bu-1",
      operator: "Regency Coach Lines",
      busType: "Multi-Axle VIP Sleeper AC Coach",
      departure: "09:30 PM",
      arrival: "05:45 AM",
      duration: "8h 15m",
      price: 28,
      seatsLeft: 6,
      rating: 4.7,
      bookingUrl: "https://www.flixbus.com"
    }
  ];

  const aiRecommendations = trip.aiRecommendations || [
    {
      type: "flight",
      title: "✈ Flight Recommendation",
      text: `${flightsList[0]?.airlineName || "Singapore Airlines"} is flagged as the premium match for this departure window, saving 8% over peak schedules.`
    },
    {
      type: "hotel",
      title: "🏨 Hotel Recommendation",
      text: `Lodging recommendations are aligned with your preference. The Grand Palace provides top tier reviews (${trip.hotels?.[0]?.rating || '4.8'}/5) and easy transit access.`
    },
    {
      type: "transport",
      title: "🚇 Transit Optimization",
      text: "Utilizing the subway network is highly suggested to bypass street delays. It covers all active attractions on Day 1-3 perfectly."
    },
    {
      type: "weather",
      title: "🌤 Weather-Based Sightseeing",
      text: "Mild weather forecast provides beautiful conditions. Move extensive garden walks to morning slots to capture golden hour lighting."
    }
  ];

  const budgetAllocation = trip.budgetAllocation || [
    { category: "Lodging & Hotels", amount: Math.round(trip.budget * 0.45), percentage: 45 },
    { category: "Flights & Transport", amount: Math.round(trip.budget * 0.28), percentage: 28 },
    { category: "Gastronomy & Fine Dining", amount: Math.round(trip.budget * 0.16), percentage: 16 },
    { category: "Sightseeing & Leisure", amount: Math.round(trip.budget * 0.11), percentage: 11 }
  ];

  const packingTips = trip.packingTips || ["Bring an umbrella for seasonal rain showers.", "Comfortable shoes for walking tours.", "A lightweight jacket for breezy evenings."];
  const savingTips = trip.savingTips || ["Get a multi-day subway rail pass.", "Eat at local food halls instead of major squares.", "Book morning attraction tickets online."];
  const safetyTips = trip.safetyTips || ["Keep digital copies of all identity proofs.", "Secure valuables in zip pockets.", "Carry local emergency numbers."];

  return (
    <div className={`flex-1 overflow-y-auto bg-earth-bg text-earth-text ${printMode ? "p-0 bg-white text-black" : "p-6 space-y-8"}`}>
      
      {/* Action Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-earth-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-earth-accent">
            <span>JOURNEY CONSOLE</span>
            <span>•</span>
            <span className="uppercase">{trip.travelStyle}</span>
          </div>
          <h1 className="font-serif italic font-light text-3xl text-earth-text tracking-tight mt-1">
            {trip.startingLocation ? `${trip.startingLocation.split(',')[0]} → ${trip.destination}` : `${trip.destination} Planner Deck`}
          </h1>
          <p className="text-xs text-earth-text/50 mt-1">Spanning {trip.startDate} to {trip.endDate} for {trip.travelers} guests.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            id="share-itinerary-btn"
            onClick={handleShareTrip}
            className="px-4 py-2.5 rounded-full bg-white border border-earth-border text-earth-text hover:bg-earth-light-sage/20 transition-all flex items-center gap-2 text-xs font-medium shadow-sm"
          >
            {shareCopied ? (
              <>
                <Check className="w-4 h-4 text-earth-sage" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-earth-accent" />
                <span>Share Trip</span>
              </>
            )}
          </button>
          <button 
            id="print-itinerary-btn"
            onClick={handleTriggerPrint}
            className="px-4 py-2.5 rounded-full bg-white border border-earth-border text-earth-text hover:bg-earth-light-sage/20 transition-all flex items-center gap-2 text-xs font-medium shadow-sm"
          >
            <Printer className="w-4 h-4 text-earth-accent" />
            <span>Print / Export PDF</span>
          </button>
          <button 
            id="itinerary-favorite-btn"
            onClick={() => onToggleFavorite(trip.id)}
            className={`p-2.5 rounded-full border transition-all ${trip.isFavorite ? "border-rose-200 bg-rose-50 text-rose-500" : "border-earth-border bg-white text-earth-text/50 hover:text-rose-500 shadow-sm"}`}
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Budget Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white border border-earth-border space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-[#4A4A3A] uppercase font-medium">Cash Allocation</span>
          <p className="text-xl font-serif italic text-[#4A4A3A] font-light">{formatPrice(trip.budget, trip.country)}</p>
          <div className="w-full h-1 bg-earth-light-sage rounded overflow-hidden mt-2">
            <div 
              className="h-full bg-earth-accent" 
              style={{ width: `${Math.min(100, (totalSpentAll / trip.budget) * 100)}%` }} 
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-earth-border space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-[#4A4A3A] uppercase font-medium">Aggressed Spending</span>
          <p className="text-xl font-serif italic text-rose-600 font-light">{formatPrice(totalSpentAll, trip.country)}</p>
          <p className="text-[10px] text-earth-text/50 mt-1">Includes activities and ledger bills</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-earth-border space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-[#4A4A3A] uppercase font-medium">Remaining Reserves</span>
          <p className="text-xl font-serif italic text-earth-sage font-medium">
            {formatPrice(Math.max(0, trip.budget - totalSpentAll), trip.country)}
          </p>
          <p className="text-[10px] text-earth-text/50 mt-1">
            {totalSpentAll > trip.budget ? "Spending limit exceeded." : "Budget within target limit."}
          </p>
        </div>
      </div>

      {/* Earth Tone Horizontal Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-earth-border/40">
        {[
          { id: 'itinerary', label: 'Itinerary & Map', icon: Compass },
          { id: 'weather', label: 'Live Weather', icon: Sun },
          { id: 'flights', label: 'Flights & Rail', icon: Plane },
          { id: 'hotels', label: 'Lodging & Dining', icon: Hotel },
          { id: 'transport', label: 'Local Transport', icon: Bus },
          { id: 'insights', label: 'AI Recs & Budget', icon: PieChart },
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              id={`tab-btn-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase shrink-0 transition-all border flex items-center gap-2
                ${activeTab === tab.id 
                  ? "bg-[#5F5E4E] border-[#5F5E4E] text-white font-semibold" 
                  : "bg-white border-earth-border text-earth-text/70 hover:bg-earth-light-sage/20"}
              `}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Switchboard */}
      {activeTab === 'itinerary' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Timeline Col */}
          <div className="lg:col-span-7 space-y-6">
            
            {trip.isMulticity && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FAF9F5] to-white border border-earth-accent/30 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-earth-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    <div>
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-earth-accent">AI Route Optimizer Active</h3>
                      <p className="text-[10px] text-earth-text/50">Multi-destination tour sequence optimized using client TSP.</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-earth-accent text-[10px] font-mono text-white">OPTIMIZED</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-earth-text/50 uppercase">Total Distance</span>
                    <p className="text-sm font-semibold text-earth-dark">
                      {trip.totalDistance ? `${trip.totalDistance.toFixed(1)} km` : "Calculated"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-earth-text/50 uppercase">Total Duration</span>
                    <p className="text-sm font-semibold text-earth-dark">
                      {trip.totalDuration || "Calculated"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-earth-text/50 uppercase">Transport Style</span>
                    <p className="text-sm font-semibold text-earth-dark capitalize">
                      {trip.transport}
                    </p>
                  </div>
                </div>

                {trip.segments && trip.segments.length > 0 && (
                  <div className="space-y-2 border-t border-earth-border pt-3">
                    <span className="text-[10px] font-mono text-earth-text/50 uppercase">Optimized Travel Segments</span>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {trip.segments.map((seg: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-[#F5F5F0]/50 p-2.5 rounded-xl border border-earth-border/40 text-xs">
                          <div className="flex items-center gap-2 font-medium">
                            <span className="font-mono text-[10px] text-[#4A4A3A]/60">#{idx + 1}</span>
                            <span>{seg.from}</span>
                            <span className="text-earth-accent">→</span>
                            <span>{seg.to}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold block text-earth-dark">{seg.distance ? `${seg.distance.toFixed(1)} km` : "Calculated"}</span>
                            <span className="text-[9px] font-mono text-earth-text/50">{seg.transportSuggestion || "Flight / Train / Car"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Day selection tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-earth-border/60">
              {trip.itinerary.map((day, idx) => (
                <button
                  id={`day-tab-btn-${day.dayNumber}`}
                  key={day.dayNumber}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`
                    px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase shrink-0 transition-all border
                    ${selectedDayIdx === idx 
                      ? "bg-earth-accent/10 border-earth-accent text-earth-accent font-semibold" 
                      : "bg-white border border-earth-border text-earth-text/75 hover:bg-earth-light-sage/20"}
                  `}
                >
                  Day {day.dayNumber}
                </button>
              ))}
            </div>

            {activeDay ? (
              <div className="space-y-6">
                
                {/* Day Theme */}
                <div className="p-5 rounded-2xl bg-earth-light-sage/20 border border-earth-border/40">
                  <span className="text-[10px] font-mono text-earth-accent uppercase tracking-widest font-semibold">TODAY'S THEME</span>
                  <h2 className="font-serif italic text-xl text-[#4A4A3A] mt-1">{activeDay.theme}</h2>
                  <p className="text-xs text-earth-text/75 mt-1">Mapped with custom walking paths and coordinated dining reservations.</p>
                </div>

                {/* Day Activities */}
                <div className="space-y-8 pl-4 border-l-2 border-earth-border relative">
                  
                  {/* MORNING */}
                  {activeDay.morning?.map((act) => (
                    <div 
                      key={act.id} 
                      className="relative"
                      onMouseEnter={() => setHoveredNodeId(act.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                    >
                      <div className="absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full bg-earth-accent border-2 border-earth-bg" />
                      
                      <div className={`p-5 rounded-2xl bg-white border transition-all shadow-sm ${hoveredNodeId === act.id ? "border-earth-accent/40 bg-[#FAF9F5]" : "border-earth-border"}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-earth-accent/10 text-earth-accent border border-earth-accent/20 uppercase font-semibold">MORNING</span>
                            <h4 className="font-serif italic text-earth-text text-lg mt-2">{act.title}</h4>
                            <p className="text-xs text-earth-text/75 font-light leading-relaxed">{act.description}</p>
                          </div>
                          {act.image && (
                            <img 
                              src={act.image} 
                              alt={act.title} 
                              className="w-20 h-20 rounded-xl object-cover shrink-0 border border-earth-border"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-earth-border/60 text-[11px] text-earth-text/60 font-mono">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-earth-accent" />{act.time} ({act.duration})</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-earth-sage" />Cost: {formatPrice(act.cost, trip.country)}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-earth-dark" />{act.location.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* AFTERNOON */}
                  {activeDay.afternoon?.map((act) => (
                    <div 
                      key={act.id} 
                      className="relative"
                      onMouseEnter={() => setHoveredNodeId(act.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                    >
                      <div className="absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full bg-earth-sage border-2 border-earth-bg" />
                      
                      <div className={`p-5 rounded-2xl bg-white border transition-all shadow-sm ${hoveredNodeId === act.id ? "border-earth-sage/40 bg-[#FAF9F5]" : "border-earth-border"}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-earth-sage/10 text-earth-sage border border-earth-sage/20 uppercase font-semibold">AFTERNOON</span>
                            <h4 className="font-serif italic text-earth-text text-lg mt-2">{act.title}</h4>
                            <p className="text-xs text-earth-text/75 font-light leading-relaxed">{act.description}</p>
                          </div>
                          {act.image && (
                            <img 
                              src={act.image} 
                              alt={act.title} 
                              className="w-20 h-20 rounded-xl object-cover shrink-0 border border-earth-border"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-earth-border/60 text-[11px] text-earth-text/60 font-mono">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-earth-accent" />{act.time} ({act.duration})</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-earth-sage" />Cost: {formatPrice(act.cost, trip.country)}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-earth-dark" />{act.location.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* EVENING */}
                  {activeDay.evening?.map((act) => (
                    <div 
                      key={act.id} 
                      className="relative"
                      onMouseEnter={() => setHoveredNodeId(act.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                    >
                      <div className="absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full bg-earth-dark border-2 border-earth-bg" />
                      
                      <div className={`p-5 rounded-2xl bg-white border transition-all shadow-sm ${hoveredNodeId === act.id ? "border-earth-dark/40 bg-[#FAF9F5]" : "border-earth-border"}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-earth-dark/10 text-earth-dark border border-earth-dark/20 uppercase font-semibold">EVENING</span>
                            <h4 className="font-serif italic text-earth-text text-lg mt-2">{act.title}</h4>
                            <p className="text-xs text-earth-text/75 font-light leading-relaxed">{act.description}</p>
                          </div>
                          {act.image && (
                            <img 
                              src={act.image} 
                              alt={act.title} 
                              className="w-20 h-20 rounded-xl object-cover shrink-0 border border-earth-border"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-earth-border/60 text-[11px] text-earth-text/60 font-mono">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-earth-accent" />{act.time} ({act.duration})</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-earth-sage" />Cost: {formatPrice(act.cost, trip.country)}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-earth-dark" />{act.location.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                </div>

              </div>
            ) : (
              <p className="text-earth-text/50 text-xs">No day schedule has been compiled yet.</p>
            )}

          </div>

          {/* Spatial Maps Col */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-[32px] bg-white border border-earth-border space-y-4 shadow-sm">
              <div>
                <h3 className="font-serif italic font-light text-earth-text text-lg">Spatial Route Canvas</h3>
                <p className="text-[10px] text-earth-text/50">Day {selectedDayIdx + 1} Coordinate mapping</p>
              </div>

              {/* Custom Interactive Mapbox / SVG Map Grid */}
              <div className="relative h-64 bg-earth-light-sage/10 rounded-2xl border border-earth-border overflow-hidden flex items-center justify-center">
                <MapboxMap
                  mapPoints={mapPoints}
                  hoveredNodeId={hoveredNodeId}
                  setHoveredNodeId={setHoveredNodeId}
                />
              </div>
              <div className="pt-2">
                <span className="text-xs text-earth-text/50 block font-light leading-relaxed">
                  Pins automatically align with generated GPS coordinates. Hover over a pin to visually trace travel transitions.
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Weather tab */}
      {activeTab === 'weather' && (
        <div className="space-y-6">
          {trip.isMulticity && trip.weatherList && trip.weatherList.length > 0 && (
            <div className="p-6 rounded-[32px] bg-gradient-to-r from-amber-50/20 to-white border border-earth-border space-y-4 shadow-sm">
              <h3 className="font-serif italic font-light text-earth-text text-xl">Multi-City Weather Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {trip.weatherList.map((w: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-earth-border/60 flex items-center justify-between gap-4 shadow-xs">
                    <div>
                      <span className="text-[10px] font-mono text-earth-accent uppercase tracking-wider block">City #{idx+1}</span>
                      <strong className="font-serif italic text-base text-earth-text block truncate max-w-[130px]">{w.city || `Destination ${idx+1}`}</strong>
                      <span className="text-xs text-earth-text/60 block capitalize">{w.condition || "Clear"}</span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      {w.condition?.toLowerCase().includes("rain") ? (
                        <CloudRain className="w-8 h-8 text-blue-400" />
                      ) : (
                        <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />
                      )}
                      <div>
                        <strong className="text-lg font-semibold text-earth-dark block">{w.temp || 22}°C</strong>
                        <span className="text-[9px] font-mono text-earth-text/40">Feels {w.feelsLike || 22}°C</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Weather Card */}
          <div className="p-6 rounded-[32px] bg-white border border-earth-border grid grid-cols-1 md:grid-cols-12 gap-6 shadow-sm">
            <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start space-y-4 border-b md:border-b-0 md:border-r border-earth-border/50 pb-6 md:pb-0 md:pr-6">
              <span className="text-[10px] font-mono text-earth-accent uppercase tracking-widest font-semibold">Active Destination Climate</span>
              <div className="flex items-center gap-4">
                {localWeather.icon === 'sun' ? (
                  <Sun className="w-14 h-14 text-amber-500 animate-spin-slow" />
                ) : (
                  <CloudRain className="w-14 h-14 text-earth-accent" />
                )}
                <div>
                  <h3 className="text-4xl font-serif italic text-earth-text">{localWeather.temp}°C</h3>
                  <p className="text-xs text-earth-text/50">Feels like {localWeather.feelsLike}°C</p>
                </div>
              </div>
              <div className="text-center md:text-left">
                <h4 className="font-serif italic text-lg text-earth-text capitalize">{localWeather.condition}</h4>
                <p className="text-xs text-earth-text/60 leading-relaxed font-light">{localWeather.description}</p>
              </div>
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-earth-light-sage/10 rounded-xl border border-earth-border/40 text-center">
                  <span className="text-[9px] font-mono text-earth-text/50 block">Humidity</span>
                  <span className="text-sm font-semibold text-earth-text">{localWeather.humidity}%</span>
                </div>
                <div className="p-3 bg-earth-light-sage/10 rounded-xl border border-earth-border/40 text-center">
                  <span className="text-[9px] font-mono text-earth-text/50 block">Wind Speed</span>
                  <span className="text-sm font-semibold text-earth-text">{localWeather.windSpeed} km/h</span>
                </div>
                <div className="p-3 bg-earth-light-sage/10 rounded-xl border border-earth-border/40 text-center">
                  <span className="text-[9px] font-mono text-earth-text/50 block">UV Index</span>
                  <span className="text-sm font-semibold text-earth-text">{localWeather.uvIndex} / 10</span>
                </div>
                <div className="p-3 bg-earth-light-sage/10 rounded-xl border border-earth-border/40 text-center">
                  <span className="text-[9px] font-mono text-earth-text/50 block">Air Quality</span>
                  <span className="text-xs font-semibold text-earth-text">{localWeather.airQuality}</span>
                </div>
              </div>

              {localWeather.rainWarning && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3 text-xs leading-relaxed shadow-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block mb-0.5">Weather Advisory Triggered</strong>
                    <span>{localWeather.rainWarning}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-earth-border/40 text-xs font-light">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-earth-accent uppercase font-semibold">Best Sightseeing Window</span>
                  <p className="text-earth-text font-serif italic font-medium">{localWeather.bestSightseeingHours}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-earth-accent uppercase font-semibold">Packing Recommendation</span>
                  <p className="text-earth-text/80">{localWeather.packingSuggestion}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Timeline */}
          <div className="space-y-3">
            <h3 className="font-serif italic font-light text-earth-text text-xl">Sightseeing Hourly Prognosis</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {localWeather.hourly.map((h: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-earth-border text-center shrink-0 w-28 space-y-2 shadow-sm">
                  <span className="text-[10px] font-mono text-earth-text/50 block">{h.time}</span>
                  <div className="flex justify-center text-earth-accent">
                    {h.condition === 'Sunny' ? <Sun className="w-5 h-5 text-amber-500" /> : <CloudRain className="w-5 h-5" />}
                  </div>
                  <strong className="text-sm font-serif italic block text-earth-text">{h.temp}°C</strong>
                  <span className="text-[9px] font-mono text-blue-500 block">☔ {h.rainChance}% rain</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5-Day Forecast Table */}
          <div className="p-6 rounded-[32px] bg-white border border-earth-border space-y-4 shadow-sm">
            <h3 className="font-serif italic font-light text-earth-text text-xl">5-Day Weather Prognosis</h3>
            <div className="divide-y divide-earth-border/50">
              {localWeather.forecast.map((f: any, idx: number) => (
                <div key={idx} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-light">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-earth-text min-w-[70px]">{f.day}</span>
                    <span className="text-earth-text/50 text-[10px] min-w-[50px]">{f.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {f.condition.toLowerCase().includes("rain") ? (
                      <CloudRain className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="capitalize text-earth-text/80">{f.description}</span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="font-mono text-[10px] text-blue-500">☔ {f.rainChance}% rain</span>
                    <strong className="font-serif italic font-semibold text-earth-text text-sm min-w-[30px]">{f.temp}°C</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Flights & Intercity tab */}
      {activeTab === 'flights' && (
        <div className="space-y-6">
          {/* Cabin Selection Ribbon */}
          <div className="p-5 rounded-2xl bg-white border border-earth-border flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="font-serif italic text-[#4A4A3A] font-light text-lg">Curated Flight Schedules</h3>
              <p className="text-[10px] text-earth-text/50">Custom air route options loaded from {trip.startingLocation || 'origin'} to {trip.destination}</p>
            </div>
            <div className="flex gap-2 bg-earth-light-sage/20 p-1 rounded-full border border-earth-border/50">
              {(['economy', 'premium', 'business', 'first'] as const).map((cl) => (
                <button
                  key={cl}
                  onClick={() => setCabinClass(cl)}
                  className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-mono font-bold tracking-wider transition-all
                    ${cabinClass === cl ? "bg-[#5F5E4E] text-white" : "text-[#4A4A3A]/70 hover:text-[#4A4A3A]"}`}
                >
                  {cl}
                </button>
              ))}
            </div>
          </div>

          {/* Flights list */}
          <div className="space-y-4">
            {flightsList.map((f: any) => (
              <div key={f.id} className="p-5 rounded-3xl bg-white border border-earth-border space-y-4 shadow-sm hover:border-earth-accent/30 transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-earth-light-sage/20 border border-earth-border rounded-xl">{f.airlineLogo}</span>
                    <div>
                      <h4 className="font-serif italic font-medium text-earth-text text-base">
                        {f.airlineName} {f.flightNumber && <span className="text-xs font-mono font-normal text-earth-text/50">({f.flightNumber})</span>}
                      </h4>
                      <p className="text-[10px] font-mono text-earth-text/50">
                        {f.cabinClass.toUpperCase()} • {f.terminal} 
                        {f.gate && ` • Gate ${f.gate}`}
                        {f.flightStatus && ` • Status: ${f.flightStatus.toUpperCase()}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-earth-text/50 block font-mono">{f.refundableStatus}</span>
                    <strong className="text-xl font-serif italic text-earth-accent">${f.price} USD</strong>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-earth-border/40 text-center font-light text-xs">
                  <div>
                    <span className="text-[9px] font-mono text-earth-text/50 block">Departure</span>
                    <span className="font-semibold text-earth-text block">{f.departureTime}</span>
                    {f.departureAirport && (
                      <span className="text-[9px] font-mono text-earth-text/50 block mt-0.5 truncate max-w-[120px] mx-auto" title={f.departureAirport}>
                        {f.departureAirport}
                      </span>
                    )}
                  </div>
                  <div className="relative flex flex-col justify-center items-center">
                    <span className="text-[9px] font-mono text-earth-accent font-semibold">{f.stopsDetail}</span>
                    <div className="w-full h-0.5 bg-earth-border/60 my-1 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-earth-accent" />
                    </div>
                    <span className="text-[8px] font-mono text-earth-text/40">{f.duration}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-earth-text/50 block">Arrival</span>
                    <span className="font-semibold text-earth-text block">{f.arrivalTime}</span>
                    {f.arrivalAirport && (
                      <span className="text-[9px] font-mono text-earth-text/50 block mt-0.5 truncate max-w-[120px] mx-auto" title={f.arrivalAirport}>
                        {f.arrivalAirport}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delay and Status Notifications (Real-time Enhancement) */}
                {f.delay !== undefined && f.delay > 0 ? (
                  <div className="px-3 py-1.5 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-center gap-2 text-[10px] text-amber-800 font-mono">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>Delay Notice: Currently running {f.delay} minutes behind schedule.</span>
                  </div>
                ) : f.flightStatus === "active" || f.flightStatus === "scheduled" || f.flightStatus === "landed" ? (
                  <div className="px-3 py-1.5 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-2 text-[10px] text-emerald-800 font-mono">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>Flight status: {f.flightStatus.toUpperCase()}. No active delays reported.</span>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-light">
                  <span className="font-mono text-[10px] text-earth-text/55">💼 {f.baggageAllowance}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onAddExpense(trip.id, f.price * trip.travelers, `Flight tickets: ${f.airlineName}`, "transport")}
                      className="px-3 py-1.5 rounded-full bg-earth-light-sage/20 border border-earth-border hover:bg-earth-accent/10 transition-all font-medium text-[11px]"
                    >
                      Log Ledger (${f.price * trip.travelers})
                    </button>
                    <a
                      href={f.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-1.5 rounded-full bg-[#5F5E4E] text-white hover:bg-[#5F5E4E]/90 transition-all font-medium text-[11px]"
                    >
                      Book Flight
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Regional Trains - Phase 7 */}
          {trainsList.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-serif italic font-light text-earth-text text-xl">Regional Intercity Rail Lines</h3>
              {trainsList.map((t: any) => (
                <div key={t.id} className="p-5 rounded-3xl bg-white border border-earth-border space-y-4 shadow-sm hover:border-earth-accent/30 transition-all">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl p-2 bg-earth-light-sage/20 border border-earth-border rounded-xl">🚇</span>
                      <div>
                        <h4 className="font-serif italic font-medium text-earth-text text-base">{t.name}</h4>
                        <p className="text-[10px] font-mono text-earth-text/50">Train #{t.number} • {t.cabinClass}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-600 block mb-1">{t.status}</span>
                      <strong className="text-lg font-serif italic text-earth-text">${t.fare} USD</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-earth-border/40 text-center font-light text-xs">
                    <div>
                      <span className="text-[9px] font-mono text-earth-text/50 block">Dept Station</span>
                      <span className="font-semibold text-earth-text">{t.departure}</span>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                      <span className="text-[8px] font-mono text-earth-text/40">{t.duration}</span>
                      <div className="w-12 h-0.5 bg-earth-border/40 my-1" />
                      <span className="text-[8px] font-mono text-emerald-600 font-semibold">{t.seats}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-earth-text/50 block">Arr Station</span>
                      <span className="font-semibold text-earth-text">{t.arrival}</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <a
                      href={t.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-1.5 rounded-full bg-[#5F5E4E] text-white hover:bg-[#5F5E4E]/90 transition-all font-medium text-[11px]"
                    >
                      Book Train Ticket
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Regional Coach Buses - Phase 8 */}
          {busesList.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-serif italic font-light text-earth-text text-xl">Intercity Express Bus Liners</h3>
              {busesList.map((b: any) => (
                <div key={b.id} className="p-5 rounded-3xl bg-white border border-earth-border space-y-4 shadow-sm hover:border-earth-accent/30 transition-all">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl p-2 bg-earth-light-sage/20 border border-earth-border rounded-xl">🚌</span>
                      <div>
                        <h4 className="font-serif italic font-medium text-earth-text text-base">{b.operator}</h4>
                        <p className="text-[10px] font-mono text-earth-text/50">{b.busType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-earth-accent text-xs mb-1 justify-end">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-semibold font-mono">{b.rating}</span>
                      </div>
                      <strong className="text-lg font-serif italic text-earth-text">${b.price} USD</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-earth-border/40 text-center font-light text-xs">
                    <div>
                      <span className="text-[9px] font-mono text-earth-text/50 block">Departure</span>
                      <span className="font-semibold text-earth-text">{b.departure}</span>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                      <span className="text-[8px] font-mono text-earth-text/40">{b.duration}</span>
                      <div className="w-12 h-0.5 bg-earth-border/40 my-1" />
                      <span className="text-[9px] font-mono text-amber-600 font-semibold">{b.seatsLeft} seats left</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-earth-text/50 block">Arrival</span>
                      <span className="font-semibold text-earth-text">{b.arrival}</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <a
                      href={b.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-1.5 rounded-full bg-[#5F5E4E] text-white hover:bg-[#5F5E4E]/90 transition-all font-medium text-[11px]"
                    >
                      Book Bus Seat
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hotels & Dining tab */}
      {activeTab === 'hotels' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Curated Lodging suggestions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic font-light text-earth-text text-xl">Vetted Lodging Guides</h3>
              <span className="text-xs text-earth-text/50 font-mono">Curated Selection</span>
            </div>

            <div className="space-y-4">
              {trip.hotels && trip.hotels.length > 0 ? (
                trip.hotels.map((h) => (
                  <div key={h.id} className="p-5 rounded-2xl bg-white border border-earth-border space-y-3 group hover:border-earth-sage/30 transition-all shadow-sm">
                    <div className="flex gap-4">
                      <img 
                        src={h.imageUrl} 
                        alt={h.name} 
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-earth-border"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-earth-accent text-xs">
                          <span className="flex items-center gap-0.5 font-semibold font-mono"><Star className="w-3.5 h-3.5 fill-current" /> {h.rating}</span>
                          <span className="text-earth-border">•</span>
                          <span className="text-[10px] text-amber-600 font-semibold font-sans">{"★".repeat(h.stars || 5)}</span>
                        </div>
                        <h4 className="font-serif italic text-earth-text text-base group-hover:text-earth-accent transition-colors">{h.name}</h4>
                        <p className="text-[11px] text-earth-text/50">{h.distance}</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-earth-text/75 font-light leading-relaxed">{h.description || "Sophisticated luxury hotel featuring premium amenities, concierge service, and exquisite skyline views."}</p>
                    
                    {/* Facilities Ribbon */}
                    <div className="flex flex-wrap gap-1.5 py-1">
                      {h.amenities?.map((fac: string, idx: number) => (
                        <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded bg-earth-light-sage/20 border border-earth-border/40 text-earth-text/70">{fac}</span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-earth-border/60 space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center text-[10px] text-earth-text/50">
                        <span>Cancellation Policy:</span>
                        <span className="text-earth-sage font-medium">Fully Refundable</span>
                      </div>
                      <div className="text-[10px] text-earth-text/50 leading-tight">
                        <strong>Address:</strong> {h.address || "Main Promenade, City Centre"}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span>Price: <strong className="text-earth-text">${h.price}/night</strong></span>
                        <div className="flex gap-2">
                          <button 
                            id={`add-hotel-expense-${h.id}`}
                            onClick={() => onAddExpense(trip.id, h.price * 3, `Hotel Stay: ${h.name}`, "hotel")}
                            className="px-3 py-1.5 rounded-full bg-earth-light-sage/35 hover:bg-earth-accent/20 text-earth-accent border border-earth-border/50 transition-all font-sans text-[11px] font-medium"
                          >
                            Log Bills (${h.price * 3})
                          </button>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + " " + trip.destination)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-full bg-white text-earth-text/70 border border-earth-border hover:bg-earth-light-sage/20 transition-all font-sans text-[11px] font-medium flex items-center gap-1"
                          >
                            <Map className="w-3 h-3" />
                            <span>Maps</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-earth-text/50">No hotel profiles generated for this coordinate range.</p>
              )}
            </div>
          </div>

          {/* Curated Gastronomy Dining guides */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic font-light text-earth-text text-xl">Curated Gastronomy</h3>
              <span className="text-xs text-earth-text/50 font-mono">Michelin Vetted</span>
            </div>

            <div className="space-y-4">
              {trip.restaurants && trip.restaurants.length > 0 ? (
                trip.restaurants.map((r) => (
                  <div key={r.id} className="p-5 rounded-2xl bg-white border border-earth-border space-y-3 group hover:border-earth-sage/30 transition-all shadow-sm">
                    <div className="flex gap-4">
                      <img 
                        src={r.imageUrl} 
                        alt={r.name} 
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-earth-border"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-earth-accent flex items-center"><Star className="w-3.5 h-3.5 fill-current mr-0.5" />{r.rating}</span>
                          <span className="text-earth-border">•</span>
                          <span className="text-earth-accent font-bold font-mono">{r.priceRange}</span>
                          <span className="text-earth-border">•</span>
                          <span className="text-earth-text/75 capitalize">{r.cuisine}</span>
                        </div>
                        <h4 className="font-serif italic text-earth-text text-base group-hover:text-earth-accent transition-colors">{r.name}</h4>
                        <p className="text-[11px] text-earth-text/50">{r.distance}</p>
                      </div>
                    </div>
                    <p className="text-xs text-earth-text/75 font-light leading-relaxed">{r.description || "Highly recommended dining experience combining spectacular regional spices with an exceptional local atmosphere."}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-earth-border/60 text-[11px] text-earth-text/50 font-mono">
                      <span>Reviews: {r.reviewsCount} logged</span>
                      <div className="flex gap-2 text-[10px]">
                        {r.isVegetarian && <span className="px-1.5 py-0.5 rounded bg-earth-sage/10 border border-earth-sage/25 text-earth-sage">VEG</span>}
                        {r.isNonVegetarian && <span className="px-1.5 py-0.5 rounded bg-rose-50 border border-rose-100 text-rose-600">MEAT</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-earth-text/50">No restaurants curated for this food preference style.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Local Transport tab */}
      {activeTab === 'transport' && (
        <div className="space-y-6">
          {/* Daily estimated budget bar */}
          <div className="p-6 rounded-[32px] bg-white border border-earth-border grid grid-cols-1 md:grid-cols-2 gap-6 items-center shadow-sm">
            <div>
              <h3 className="font-serif italic font-light text-earth-text text-xl">Local Mobility Guide</h3>
              <p className="text-xs text-earth-text/60 leading-relaxed font-light mt-1">
                Estimated daily transport cost: <strong className="text-earth-accent text-sm font-mono">{localTransitProfile.estimatedDailyCost}</strong>.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-earth-light-sage/15 border border-earth-border/40 text-xs text-[#4A4A3A]/85 font-light leading-relaxed">
              <span className="font-mono text-[10px] text-earth-accent uppercase font-bold block mb-1">Transit Tip</span>
              {localTransitProfile.tip}
            </div>
          </div>

          {/* Transport mode catalog */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {localTransitProfile.options.map((t: any, idx: number) => (
              <div key={t.id || idx} className="p-5 rounded-2xl bg-white border border-earth-border space-y-4 shadow-sm hover:border-earth-sage/30 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{t.icon}</span>
                    <h4 className="font-serif italic font-semibold text-earth-text text-lg">{t.mode}</h4>
                  </div>
                  <p className="text-xs text-earth-text/70 font-light leading-relaxed">{t.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-earth-border/60 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-earth-text/50 block">Avg Time</span>
                    <span className="text-earth-text font-semibold">{t.travelTime}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-earth-text/50 block">Fare Cost</span>
                    <span className="text-earth-sage font-semibold">{t.estimatedCost}</span>
                  </div>
                  <div className="col-span-2 pt-1">
                    <span className="text-[9px] text-earth-text/50 block">Availability</span>
                    <span className="text-[#4A4A3A] font-semibold">{t.availability}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-earth-text/55 font-light">
                  <strong>Best for:</strong> {t.bestFor}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights and recommendations tab */}
      {activeTab === 'insights' && (
        <div className="space-y-8">
          
          {/* Phase 10: 4 Dedicated AI Recommendation Cards */}
          <div className="space-y-4">
            <h3 className="font-serif italic font-light text-earth-text text-2xl">Voyage AI Intelligent Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiRecommendations.map((rec: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-white border border-earth-border flex items-start gap-4 shadow-sm hover:border-earth-accent/30 transition-all">
                  <span className="text-2xl p-2 bg-earth-light-sage/15 rounded-xl border border-earth-border">
                    {rec.type === 'flight' ? '✈' : rec.type === 'hotel' ? '🏨' : rec.type === 'transport' ? '🚇' : '🌤'}
                  </span>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-serif italic font-semibold text-[#4A4A3A] text-base">{rec.title}</h4>
                    <p className="text-xs text-[#4A4A3A]/80 font-light leading-relaxed">{rec.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Allocation Pie / Category Chart - Phase 12 */}
          <div className="p-6 rounded-[32px] bg-white border border-earth-border space-y-6 shadow-sm">
            <div>
              <h3 className="font-serif italic font-light text-earth-text text-xl">Resource Allocation Chart</h3>
              <p className="text-xs text-earth-text/50">Comprehensive category allocation mapping for ${trip.budget.toLocaleString()}</p>
            </div>

            <div className="space-y-4">
              {budgetAllocation.map((item: any, idx: number) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-earth-text/75">{item.category}</span>
                    <strong className="font-mono font-bold text-earth-text">${item.amount.toLocaleString()} ({item.percentage}%)</strong>
                  </div>
                  <div className="w-full h-2 bg-earth-light-sage/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-earth-accent rounded-full" 
                      style={{ width: `${item.percentage}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Three Concise Columns for Tips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#FCFAF2] border border-earth-border/70 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-earth-accent font-serif italic">
                <Briefcase className="w-4 h-4" />
                <h4 className="font-semibold text-sm">Packing Guidelines</h4>
              </div>
              <ul className="space-y-1 text-xs text-[#4A4A3A]/90 list-disc pl-4 font-light leading-relaxed">
                {packingTips.map((tip: string, idx: number) => <li key={idx}>{tip}</li>)}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-[#FCFAF2] border border-earth-border/70 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-earth-sage font-serif italic">
                <Lightbulb className="w-4 h-4" />
                <h4 className="font-semibold text-sm">Money-Saving Advice</h4>
              </div>
              <ul className="space-y-1 text-xs text-[#4A4A3A]/90 list-disc pl-4 font-light leading-relaxed">
                {savingTips.map((tip: string, idx: number) => <li key={idx}>{tip}</li>)}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-[#FCFAF2] border border-earth-border/70 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-earth-dark font-serif italic">
                <Shield className="w-4 h-4" />
                <h4 className="font-semibold text-sm">Safety Recommendations</h4>
              </div>
              <ul className="space-y-1 text-xs text-[#4A4A3A]/90 list-disc pl-4 font-light leading-relaxed">
                {safetyTips.map((tip: string, idx: number) => <li key={idx}>{tip}</li>)}
              </ul>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
