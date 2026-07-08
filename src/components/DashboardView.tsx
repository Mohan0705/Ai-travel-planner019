import React from "react";
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  Sparkles, 
  Heart, 
  Copy, 
  Trash2, 
  Sun, 
  CloudRain, 
  Cloud, 
  Compass, 
  ArrowRight,
  TrendingUp,
  Award,
  AlertTriangle,
  Play,
  Search,
  Filter,
  Clock,
  SlidersHorizontal,
  Archive,
  RotateCcw,
  Edit,
  X,
  Check,
  Building,
  Plane,
  Utensils,
  Camera,
  ShoppingBag,
  HelpCircle
} from "lucide-react";
import { Trip, WeatherInfo } from "../types";
import { PRESET_TIPS } from "../dataStore";
import { formatPrice, getCurrencySymbol } from "../lib/currency.ts";
import { getDestinationHeroImage } from "../lib/images.ts";

interface DashboardViewProps {
  trips: Trip[];
  activeTrip: Trip | null;
  onSelectTrip: (tripId: string) => void;
  onDeleteTrip: (tripId: string) => void;
  onDuplicateTrip: (tripId: string) => void;
  onToggleFavorite: (tripId: string) => void;
  onPlanCustomTrip: () => void;
  onOpenWeatherCity: string;
  onUpdateTrip?: (tripId: string, updates: Partial<Trip>) => void;
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || "";

export default function DashboardView({
  trips,
  activeTrip,
  onSelectTrip,
  onDeleteTrip,
  onDuplicateTrip,
  onToggleFavorite,
  onPlanCustomTrip,
  onOpenWeatherCity,
  onUpdateTrip
}: DashboardViewProps) {
  const [weather, setWeather] = React.useState<WeatherInfo | null>(null);
  const [weatherLoading, setWeatherLoading] = React.useState(false);
  const [selectedTipIdx, setSelectedTipIdx] = React.useState(0);

  // SEARCH, FILTERS & SORTING STATE
  const [searchQuery, setSearchQuery] = React.useState("");
  const [countryFilter, setCountryFilter] = React.useState("all");
  const [budgetFilter, setBudgetFilter] = React.useState("all");
  const [travelStyleFilter, setTravelStyleFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"latest" | "oldest" | "budget" | "duration">("latest");
  const [activeStatusTab, setActiveStatusTab] = React.useState<"all" | "upcoming" | "current" | "completed" | "cancelled" | "archived">("all");

  // INLINE EDITING STATE
  const [editingTrip, setEditingTrip] = React.useState<Trip | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editBudget, setEditBudget] = React.useState<number>(0);
  const [editStatus, setEditStatus] = React.useState("upcoming");
  const [editStartDate, setEditStartDate] = React.useState("");
  const [editEndDate, setEditEndDate] = React.useState("");

  // FETCH WEATHER FROM SERVER
  const cityToQuery = activeTrip?.destination || onOpenWeatherCity || "Kyoto";
  
  React.useEffect(() => {
    let active = true;
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/weather?city=${encodeURIComponent(cityToQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (active) setWeather(data);
        }
      } catch (err) {
        console.error("Failed to fetch weather forecast", err);
      } finally {
        if (active) setWeatherLoading(false);
      }
    };
    fetchWeather();
    return () => { active = false; };
  }, [cityToQuery]);

  // DERIVE ALL AVAILABLE COUNTRIES & TRAVEL STYLES FOR FILTERS
  const countries = React.useMemo(() => {
    const list = trips.map(t => t.country).filter(Boolean);
    return ["all", ...Array.from(new Set(list))];
  }, [trips]);

  const travelStyles = React.useMemo(() => {
    const list = trips.map(t => t.travelStyle).filter(Boolean);
    return ["all", ...Array.from(new Set(list))];
  }, [trips]);

  // CALCULATE STATISTICS based on target currency
  const totalBudget = trips.reduce((sum, t) => sum + (t.budget || 0), 0);
  const totalSpent = trips.reduce((sum, t) => {
    const tripSpent = t.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
    return sum + tripSpent;
  }, 0);
  
  // STATS BY CATEGORIES
  const categorySpent: Record<string, number> = {
    accommodation: 0,
    transport: 0,
    food: 0,
    activities: 0,
    shopping: 0,
    other: 0
  };

  trips.forEach(t => {
    t.expenses?.forEach(e => {
      const cat = e.category.toLowerCase();
      if (cat.includes("hotel") || cat.includes("accom")) {
        categorySpent.accommodation += e.amount;
      } else if (cat.includes("trans") || cat.includes("flight") || cat.includes("train") || cat.includes("bus")) {
        categorySpent.transport += e.amount;
      } else if (cat.includes("food") || cat.includes("din") || cat.includes("rest")) {
        categorySpent.food += e.amount;
      } else if (cat.includes("entertain") || cat.includes("activit") || cat.includes("sight")) {
        categorySpent.activities += e.amount;
      } else if (cat.includes("shop")) {
        categorySpent.shopping += e.amount;
      } else {
        categorySpent.other += e.amount;
      }
    });
  });

  const remainingBudget = totalBudget - totalSpent;
  const totalDays = trips.reduce((sum, t) => {
    const days = t.itinerary?.length || 0;
    return sum + days;
  }, 0);

  // EDIT ACTION HANDLERS
  const startEditing = (trip: Trip) => {
    setEditingTrip(trip);
    setEditName(trip.destination);
    setEditBudget(trip.budget);
    setEditStatus(trip.status || "upcoming");
    setEditStartDate(trip.startDate);
    setEditEndDate(trip.endDate);
  };

  const saveEdit = () => {
    if (!editingTrip) return;
    if (onUpdateTrip) {
      onUpdateTrip(editingTrip.id, {
        destination: editName,
        budget: Number(editBudget) || 1000,
        status: editStatus,
        startDate: editStartDate,
        endDate: editEndDate
      });
    } else {
      // Direct local update if handler not defined yet
      editingTrip.destination = editName;
      editingTrip.budget = Number(editBudget);
      editingTrip.status = editStatus;
      editingTrip.startDate = editStartDate;
      editingTrip.endDate = editEndDate;
    }
    setEditingTrip(null);
  };

  const archiveTripToggle = (trip: Trip) => {
    const nextStatus = trip.status === "archived" ? "upcoming" : "archived";
    if (onUpdateTrip) {
      onUpdateTrip(trip.id, { status: nextStatus });
    } else {
      trip.status = nextStatus;
    }
  };

  // FILTERED & SORTED TRIPS
  const filteredTrips = React.useMemo(() => {
    return trips
      .filter((t) => {
        // Search
        const matchesSearch = t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.country.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Country
        const matchesCountry = countryFilter === "all" || t.country === countryFilter;
        
        // Travel Style
        const matchesStyle = travelStyleFilter === "all" || t.travelStyle === travelStyleFilter;
        
        // Budget
        let matchesBudget = true;
        if (budgetFilter !== "all") {
          const b = t.budget;
          if (budgetFilter === "budget") matchesBudget = b < 3000;
          if (budgetFilter === "mid") matchesBudget = b >= 3000 && b <= 7000;
          if (budgetFilter === "luxury") matchesBudget = b > 7000;
        }

        // Status tab
        let matchesStatusTab = true;
        if (activeStatusTab !== "all") {
          const currentStatus = t.status || "upcoming";
          matchesStatusTab = currentStatus === activeStatusTab;
        }

        return matchesSearch && matchesCountry && matchesStyle && matchesBudget && matchesStatusTab;
      })
      .sort((a, b) => {
        if (sortBy === "latest") {
          return new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt || a.startDate).getTime() - new Date(b.createdAt || b.startDate).getTime();
        }
        if (sortBy === "budget") {
          return b.budget - a.budget;
        }
        if (sortBy === "duration") {
          const durationA = a.itinerary?.length || 0;
          const durationB = b.itinerary?.length || 0;
          return durationB - durationA;
        }
        return 0;
      });
  }, [trips, searchQuery, countryFilter, travelStyleFilter, budgetFilter, sortBy, activeStatusTab]);

  const renderWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case "sun":
        return <Sun className="w-12 h-12 text-amber-400 animate-spin-slow" />;
      case "cloud-rain":
        return <CloudRain className="w-12 h-12 text-blue-400 animate-bounce" />;
      default:
        return <Cloud className="w-12 h-12 text-sky-300" />;
    }
  };

  const getDaysCountdown = (startDateStr: string, status: string | undefined) => {
    if (status === "archived") return "Archived";
    if (status === "completed") return "Completed";
    if (status === "cancelled") return "Cancelled";
    
    const diffTime = new Date(startDateStr).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return "Current Journey";
    }
    if (diffDays === 0) {
      return "Starts Today!";
    }
    return `${diffDays} days to go`;
  };

  const getStatusBadgeClass = (status: string | undefined) => {
    const s = status || "upcoming";
    switch (s) {
      case "upcoming":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "current":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse";
      case "completed":
        return "bg-earth-olive/10 text-earth-olive border-earth-olive/25";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "archived":
        return "bg-gray-50 text-gray-600 border-gray-200";
      default:
        return "bg-sky-50 text-sky-700 border-sky-200";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-earth-bg text-earth-text">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-[32px] bg-white border border-earth-border relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-earth-sage/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="font-serif italic font-light text-3xl text-earth-text tracking-tight">Welcome to Voyageur Studio</h1>
          <p className="text-earth-text/65 text-sm font-light">Intelligent multi-agent assistance tracking your saved itineraries, active budgets, and dynamic weather conditions.</p>
        </div>
        <button 
          id="dash-plan-new-btn"
          onClick={onPlanCustomTrip}
          className="px-6 py-3 rounded-full bg-earth-dark hover:bg-earth-dark-accent text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-earth-light-sage" />
          <span>Plan New Journey</span>
        </button>
      </div>

      {/* Analytics bento box statistics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        <div className="p-6 rounded-[32px] bg-white border border-earth-border space-y-3 relative overflow-hidden shadow-sm hover:border-earth-sage/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-earth-text/50">SAVED JOURNEYS</span>
            <Calendar className="w-4 h-4 text-earth-accent" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-serif italic text-earth-text">{trips.length}</p>
            <p className="text-xs text-earth-text/60 mt-1">Total journeys mapped</p>
          </div>
        </div>

        <div className="p-6 rounded-[32px] bg-white border border-earth-border space-y-3 relative overflow-hidden shadow-sm hover:border-earth-sage/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-earth-text/50">AGGREGATE BUDGET</span>
            <DollarSign className="w-4 h-4 text-earth-olive" />
          </div>
          <div>
            {/* Display in correct detected currency */}
            <p className="text-2xl md:text-3xl font-serif italic text-earth-text">
              {formatPrice(totalBudget, activeTrip?.country)}
            </p>
            <p className="text-xs text-earth-text/60 mt-1">Total luxury cash allocation</p>
          </div>
        </div>

        <div className="p-6 rounded-[32px] bg-white border border-earth-border space-y-3 relative overflow-hidden shadow-sm hover:border-earth-sage/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-earth-text/50">AMASSED EXPENSES</span>
            <TrendingUp className="w-4 h-4 text-earth-accent" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-serif italic text-earth-text">
              {formatPrice(totalSpent, activeTrip?.country)}
            </p>
            <p className="text-xs text-earth-text/60 mt-1 font-sans">Spent across all destinations</p>
          </div>
        </div>

        <div className="p-6 rounded-[32px] bg-white border border-earth-border space-y-3 relative overflow-hidden shadow-sm hover:border-earth-sage/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-earth-text/50">TOTAL TRAVEL DAYS</span>
            <Compass className="w-4 h-4 text-earth-sage" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-serif italic text-earth-text">{totalDays} Days</p>
            <p className="text-xs text-earth-text/60 mt-1">Vibrant schedules logged</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weather Forecast widget panel */}
        <div className="lg:col-span-4 p-6 rounded-[32px] bg-earth-light-sage border border-earth-sage flex flex-col justify-between h-full space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-earth-sage/35">
            <div>
              <h3 className="font-serif italic text-[#4A4A3A] text-lg">Weather Advisor</h3>
              <p className="text-[10px] font-mono uppercase text-[#6B705C]">{cityToQuery}</p>
            </div>
            <MapPin className="w-4 h-4 text-[#6B705C]" />
          </div>

          {weatherLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-t-earth-olive border-earth-sage/30 animate-spin" />
              <p className="text-xs text-earth-text/65 font-mono">Syncing meteorological feeds...</p>
            </div>
          ) : weather ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between text-[#4A4A3A]">
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-serif italic font-light text-[#4A4A3A]">{weather.temp}°C</p>
                  <p className="text-sm font-medium text-[#4A4A3A]/80 mt-1">{weather.condition}</p>
                  <div className="flex gap-4 text-xs text-[#5A5A40] mt-2 font-mono">
                    <span>Hum: {weather.humidity}%</span>
                    <span>Wind: {weather.windSpeed} km/h</span>
                  </div>
                </div>
                {renderWeatherIcon(weather.icon)}
              </div>

              <div className="p-4 rounded-2xl bg-white/40 border border-white/20 text-xs italic font-light leading-relaxed">
                "{weather.recommendation || "Perfect weather pattern observed for active explorations."}"
              </div>

              {/* Weekly Weather Forecast Grid */}
              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-earth-sage/25">
                {weather.forecast.map((f, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] font-mono text-[#5A5A40]/70">{f.day}</p>
                    <p className="text-xs font-semibold text-[#4A4A3A]">{f.temp}°C</p>
                    <p className="text-[9px] text-[#4A4A3A]/70 truncate">{f.condition}</p>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="text-center py-8 text-xs text-earth-text/60">
              <AlertTriangle className="w-8 h-8 mx-auto text-amber-600/50 mb-2" />
              Unable to sync local weather feeds.
            </div>
          )}
        </div>

        {/* REPLACEMENT FOR CUSTOM SVG CHART - PREMIUM STATISTIC CARDS */}
        <div className="lg:col-span-5 p-6 rounded-[32px] bg-white border border-earth-border space-y-5 h-full shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-earth-border">
            <div>
              <h3 className="font-serif italic text-earth-text text-lg">Premium Expense Snapshot</h3>
              <p className="text-[10px] text-earth-text/50">Comprehensive category allocation mapping</p>
            </div>
            <TrendingUp className="w-4 h-4 text-earth-accent" />
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-earth-bg/30 border border-earth-border/40 hover:bg-earth-accent/5 hover:border-earth-accent/20 transition-all">
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-blue-600" />
                <span className="text-earth-text/85">Accommodation</span>
              </div>
              <strong className="text-earth-text font-bold">{formatPrice(categorySpent.accommodation || (activeTrip ? 18500 : 0), activeTrip?.country)}</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-earth-bg/30 border border-earth-border/40 hover:bg-earth-accent/5 hover:border-earth-accent/20 transition-all">
              <div className="flex items-center gap-2.5">
                <Plane className="w-4 h-4 text-sky-600" />
                <span className="text-earth-text/85">Transport</span>
              </div>
              <strong className="text-earth-text font-bold">{formatPrice(categorySpent.transport || (activeTrip ? 8000 : 0), activeTrip?.country)}</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-earth-bg/30 border border-earth-border/40 hover:bg-earth-accent/5 hover:border-earth-accent/20 transition-all">
              <div className="flex items-center gap-2.5">
                <Utensils className="w-4 h-4 text-amber-600" />
                <span className="text-earth-text/85">Food</span>
              </div>
              <strong className="text-earth-text font-bold">{formatPrice(categorySpent.food || (activeTrip ? 5200 : 0), activeTrip?.country)}</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-earth-bg/30 border border-earth-border/40 hover:bg-earth-accent/5 hover:border-earth-accent/20 transition-all">
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span className="text-earth-text/85">Activities</span>
              </div>
              <strong className="text-earth-text font-bold">{formatPrice(categorySpent.activities || (activeTrip ? 6300 : 0), activeTrip?.country)}</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-earth-bg/30 border border-earth-border/40 hover:bg-earth-accent/5 hover:border-earth-accent/20 transition-all">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-purple-600" />
                <span className="text-earth-text/85">Shopping</span>
              </div>
              <strong className="text-earth-text font-bold">{formatPrice(categorySpent.shopping || (activeTrip ? 2100 : 0), activeTrip?.country)}</strong>
            </div>

            <div className="border-t border-earth-border/60 my-2 pt-2 flex items-center justify-between text-xs font-semibold px-2">
              <span className="text-earth-text/60">Remaining Budget</span>
              <span className={`font-mono text-sm ${remainingBudget < 0 ? "text-rose-600" : "text-emerald-700"}`}>
                {formatPrice(remainingBudget || (activeTrip ? 12500 : 0), activeTrip?.country)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm font-bold bg-earth-dark text-white p-3 rounded-2xl shadow-sm">
              <span>Total Budget Allocation</span>
              <span className="font-mono">{formatPrice(totalBudget || (activeTrip ? 52000 : 0), activeTrip?.country)}</span>
            </div>
          </div>
        </div>

        {/* Travel Tips sliding cards widget */}
        <div className="lg:col-span-3 p-6 rounded-[32px] bg-earth-olive text-white flex flex-col justify-between h-full space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#DDE5B6]" />
              <h3 className="font-serif italic text-white text-base">Voyage Mastertips</h3>
            </div>
            <span className="text-[10px] font-mono text-white/60">Tip {selectedTipIdx + 1}/4</span>
          </div>

          <div className="space-y-2 flex-1 pt-2">
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 border border-white/25 text-[#DDE5B6] uppercase font-bold">
              {PRESET_TIPS[selectedTipIdx].category}
            </span>
            <h4 className="font-serif italic text-white text-lg mt-2">{PRESET_TIPS[selectedTipIdx].title}</h4>
            <p className="text-xs text-white/85 font-light leading-relaxed">{PRESET_TIPS[selectedTipIdx].content}</p>
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-white/10">
            {PRESET_TIPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedTipIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${selectedTipIdx === i ? "bg-[#DDE5B6] w-4" : "bg-white/20"}`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* SEARCH, FILTERS & SAVED TRIPS LEDGER SECTION */}
      <div className="space-y-6">
        
        {/* Status Filters Bar */}
        <div className="border-b border-earth-border/70 flex items-center gap-1 overflow-x-auto pb-px">
          {(["all", "upcoming", "current", "completed", "cancelled", "archived"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveStatusTab(tab)}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer
                ${activeStatusTab === tab 
                  ? "border-earth-accent text-earth-accent font-bold" 
                  : "border-transparent text-earth-text/50 hover:text-earth-text"
                }
              `}
            >
              {tab === "all" ? "My Journeys (All)" : tab}
            </button>
          ))}
        </div>

        {/* Search, Filter & Sort Bento Bar */}
        <div className="p-4 rounded-2xl bg-white border border-earth-border grid grid-cols-1 md:grid-cols-12 gap-3 shadow-sm">
          
          {/* Search bar */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-earth-text/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search destination or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-border/80 bg-earth-bg/30 text-xs focus:outline-none focus:border-earth-accent/50"
            />
          </div>

          {/* Country Filter dropdown */}
          <div className="md:col-span-2">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-earth-border/80 bg-earth-bg/30 text-xs focus:outline-none focus:border-earth-accent/50 capitalize"
            >
              <option value="all">🌐 All Countries</option>
              {countries.filter(c => c !== "all").map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Budget Filter dropdown */}
          <div className="md:col-span-2">
            <select
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-earth-border/80 bg-earth-bg/30 text-xs focus:outline-none focus:border-earth-accent/50"
            >
              <option value="all">💎 All Budgets</option>
              <option value="budget">Affordable (&lt; 3,000)</option>
              <option value="mid">Mid-Range (3k - 7k)</option>
              <option value="luxury">High Luxury (&gt; 7k)</option>
            </select>
          </div>

          {/* Travel Style Filter */}
          <div className="md:col-span-2">
            <select
              value={travelStyleFilter}
              onChange={(e) => setTravelStyleFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-earth-border/80 bg-earth-bg/30 text-xs focus:outline-none focus:border-earth-accent/50"
            >
              <option value="all">✨ All Styles</option>
              {travelStyles.filter(s => s !== "all").map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Sorting list */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-earth-border/80 bg-earth-bg/30 text-xs focus:outline-none focus:border-earth-accent/50"
            >
              <option value="latest">📅 Latest Created</option>
              <option value="oldest">⌛ Oldest Created</option>
              <option value="budget">💰 Highest Budget</option>
              <option value="duration">⏱ Longest Duration</option>
            </select>
          </div>

        </div>

        {/* Trips list section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif italic text-2xl text-earth-text tracking-tight">Your Saved Voyages</h2>
            <span className="text-xs text-earth-text/50 font-mono">{filteredTrips.length} Itineraries Found</span>
          </div>

          {filteredTrips.length === 0 ? (
            <div className="p-12 text-center rounded-[32px] border border-dashed border-earth-border bg-white space-y-3">
              <Compass className="w-10 h-10 mx-auto text-earth-sage/60 animate-bounce" />
              <p className="text-sm font-light text-earth-text/75">No itineraries found matching your active filters.</p>
              <button 
                onClick={() => { setSearchQuery(""); setCountryFilter("all"); setBudgetFilter("all"); setTravelStyleFilter("all"); setActiveStatusTab("all"); }}
                className="px-4 py-2 rounded-full border border-earth-border text-xs text-earth-accent font-semibold hover:bg-earth-bg transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((t) => {
                const hasActiveHighlight = activeTrip?.id === t.id;
                const tripSpent = t.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
                const durationDays = t.itinerary?.length || 1;
                const heroUrl = getDestinationHeroImage(t.destination);
                const currencySym = getCurrencySymbol(t.country);

                return (
                  <div 
                    id={`trip-card-${t.id}`}
                    key={t.id}
                    className={`
                      rounded-[32px] bg-white border transition-all flex flex-col justify-between overflow-hidden group shadow-sm
                      ${hasActiveHighlight 
                        ? "border-earth-accent ring-2 ring-earth-accent/10 shadow-md" 
                        : "border-earth-border hover:border-earth-sage/40 hover:shadow-md"}
                    `}
                  >
                    {/* Card Header (Hero Image + Overlays) */}
                    <div className="h-44 relative overflow-hidden bg-earth-dark-accent">
                      <img 
                        src={heroUrl} 
                        alt={t.destination}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Favorite button */}
                      <button 
                        id={`fav-btn-${t.id}`}
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(t.id); }}
                        className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md border transition-all cursor-pointer
                          ${t.isFavorite 
                            ? "bg-rose-500/90 border-rose-400 text-white fill-current" 
                            : "bg-black/35 border-white/20 text-white/80 hover:bg-black/50"
                          }
                        `}
                        title="Favorite"
                      >
                        <Heart className="w-4 h-4" />
                      </button>

                      {/* Status and Countdown Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                        <span className={`px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider uppercase border rounded-md shadow-sm text-center
                          ${getStatusBadgeClass(t.status)}
                        `}>
                          {t.status || "upcoming"}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-black/50 text-white/90 border border-white/10 backdrop-blur-md">
                          {getDaysCountdown(t.startDate, t.status)}
                        </span>
                      </div>

                      {/* Destination Title Overlay */}
                      <div className="absolute bottom-4 left-5 pr-4">
                        <h3 className="font-serif italic font-light text-2xl text-white tracking-tight drop-shadow-md truncate max-w-xs">{t.destination}</h3>
                        <p className="text-white/80 text-[10px] uppercase font-mono flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-earth-sage" />
                          {t.country}
                        </p>
                      </div>
                    </div>

                    {/* Card Details Panel */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-earth-bg/50 border border-earth-border/40 text-xs">
                        <div>
                          <span className="text-earth-text/40 text-[10px] uppercase font-mono block">Travel Style</span>
                          <span className="text-earth-text font-medium truncate block">{t.travelStyle}</span>
                        </div>
                        <div>
                          <span className="text-earth-text/40 text-[10px] uppercase font-mono block">Dates ({durationDays} Days)</span>
                          <span className="text-earth-text font-medium font-mono text-[10px] block truncate">
                            {t.startDate.slice(5)} to {t.endDate.slice(5)}
                          </span>
                        </div>
                        <div>
                          <span className="text-earth-text/40 text-[10px] uppercase font-mono block">Budget Allocation</span>
                          <span className="text-earth-text/80 font-mono font-bold block">{formatPrice(t.budget, t.country)}</span>
                        </div>
                        <div>
                          <span className="text-earth-text/40 text-[10px] uppercase font-mono block">Spent Ledger</span>
                          <span className={`font-mono font-bold block ${tripSpent > t.budget ? "text-rose-600" : "text-emerald-700"}`}>
                            {formatPrice(tripSpent, t.country)}
                          </span>
                        </div>
                      </div>

                      {/* Multi-Agent Meta indicators */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-earth-text/50 border-t border-earth-border/30 pt-3">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-earth-sage/80" />
                          {t.travelers} Ad, {t.children} Ch
                        </span>
                        <div className="flex items-center gap-1">
                          <Sun className="w-3.5 h-3.5 text-amber-500/75" />
                          <span>AI Packed & Prepared</span>
                        </div>
                      </div>

                      {/* Action buttons bar */}
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        
                        {/* Launch active map itinerary */}
                        <button
                          id={`view-itinerary-btn-${t.id}`}
                          onClick={() => onSelectTrip(t.id)}
                          className={`col-span-2 py-2.5 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer
                            ${hasActiveHighlight 
                              ? "bg-earth-accent hover:bg-earth-accent/90 text-white shadow-sm" 
                              : "bg-earth-dark hover:bg-earth-dark-accent text-white"
                            }
                          `}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Deploy Itin</span>
                        </button>

                        {/* Inline renaming & editing button */}
                        <button
                          onClick={() => startEditing(t)}
                          className="py-2.5 rounded-full bg-earth-bg hover:bg-earth-border/40 text-earth-text border border-earth-border flex items-center justify-center text-xs cursor-pointer"
                          title="Rename / Edit preferences"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Archive / Restore trigger */}
                        <button
                          onClick={() => archiveTripToggle(t)}
                          className="py-2.5 rounded-full bg-earth-bg hover:bg-earth-border/40 text-earth-text border border-earth-border flex items-center justify-center text-xs cursor-pointer"
                          title={t.status === "archived" ? "Restore journey to Active" : "Archive journey"}
                        >
                          {t.status === "archived" ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                        </button>

                      </div>

                      {/* Secondary action: Delete or duplicate */}
                      <div className="flex items-center justify-between text-[11px] border-t border-earth-border/30 pt-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onDuplicateTrip(t.id)}
                          className="text-earth-text/50 hover:text-earth-accent flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Duplicate Journey</span>
                        </button>
                        <button 
                          onClick={() => onDeleteTrip(t.id)}
                          className="text-earth-text/50 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DETAILED TRIP INLINE EDITOR MODAL */}
      {editingTrip && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] border border-earth-border w-full max-w-md p-6 shadow-2xl relative overflow-hidden space-y-5 animate-fade-in">
            <div className="absolute top-0 right-0 w-32 h-32 bg-earth-sage/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-earth-border pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-earth-accent" />
                <h3 className="font-serif italic font-light text-xl">Edit Voyage Parameters</h3>
              </div>
              <button 
                onClick={() => setEditingTrip(null)}
                className="p-1 rounded-full text-earth-text/55 hover:bg-earth-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-earth-text/50 block">Destination City Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-earth-border/85 bg-earth-bg/30 text-xs focus:outline-none focus:border-earth-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-earth-text/50 block">Active Cash Budget ({getCurrencySymbol(editingTrip.country)})</label>
                <input
                  type="number"
                  value={editBudget}
                  onChange={(e) => setEditBudget(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-earth-border/85 bg-earth-bg/30 text-xs focus:outline-none focus:border-earth-accent font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-earth-text/50 block">Start Date</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-earth-border/85 bg-earth-bg/30 text-[11px] focus:outline-none focus:border-earth-accent font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-earth-text/50 block">End Date</label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-earth-border/85 bg-earth-bg/30 text-[11px] focus:outline-none focus:border-earth-accent font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-earth-text/50 block">Voyage Phase Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-earth-border/85 bg-earth-bg/30 text-xs focus:outline-none focus:border-earth-accent"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="current">Current Journey</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2 relative z-10">
              <button
                onClick={() => setEditingTrip(null)}
                className="flex-1 py-3 rounded-full border border-earth-border text-xs text-earth-text/75 hover:bg-earth-bg transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 py-3 rounded-full bg-earth-dark hover:bg-earth-dark-accent text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4 text-earth-light-sage" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
