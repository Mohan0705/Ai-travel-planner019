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
  Play
} from "lucide-react";
import { Trip, WeatherInfo } from "../types";
import { PRESET_TIPS } from "../dataStore";

interface DashboardViewProps {
  trips: Trip[];
  activeTrip: Trip | null;
  onSelectTrip: (tripId: string) => void;
  onDeleteTrip: (tripId: string) => void;
  onDuplicateTrip: (tripId: string) => void;
  onToggleFavorite: (tripId: string) => void;
  onPlanCustomTrip: () => void;
  onOpenWeatherCity: string;
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
  onOpenWeatherCity
}: DashboardViewProps) {
  const [weather, setWeather] = React.useState<WeatherInfo | null>(null);
  const [weatherLoading, setWeatherLoading] = React.useState(false);
  const [selectedTipIdx, setSelectedTipIdx] = React.useState(0);

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

  // CALCULATE STATISTICS
  const totalBudget = trips.reduce((sum, t) => sum + (t.budget || 0), 0);
  const totalSpent = trips.reduce((sum, t) => {
    const tripSpent = t.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
    return sum + tripSpent;
  }, 0);
  const remainingBudget = totalBudget - totalSpent;
  const totalDays = trips.reduce((sum, t) => {
    const days = t.itinerary?.length || 0;
    return sum + days;
  }, 0);

  // CATEGORY-WISE EXPENSE DATA FOR SVG CHART
  const categoryTotals: Record<string, number> = {
    hotel: 0,
    food: 0,
    shopping: 0,
    transport: 0,
    entertainment: 0,
    other: 0,
  };

  trips.forEach(t => {
    t.expenses?.forEach(e => {
      if (categoryTotals[e.category] !== undefined) {
        categoryTotals[e.category] += e.amount;
      } else {
        categoryTotals.other += e.amount;
      }
    });
  });

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  const maxChartValue = Math.max(...chartData.map(d => d.value), 1);

  // RENDER WEATHER ICON
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

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-earth-bg text-earth-text">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-[32px] bg-white border border-earth-border relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-earth-sage/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="font-serif italic font-light text-3xl text-earth-text tracking-tight">Welcome to your Voyage Deck</h1>
          <p className="text-earth-text/65 text-sm font-light">Intelligent multi-agent assistance tracking your saved itineraries, active budgets, and dynamic weather conditions.</p>
        </div>
        <button 
          id="dash-plan-new-btn"
          onClick={onPlanCustomTrip}
          className="px-6 py-3 rounded-full bg-earth-dark hover:bg-earth-dark-accent text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-earth-light-sage" />
          <span>Plan New Journey</span>
        </button>
      </div>

      {/* Analytics bento box statistics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        <div className="p-6 rounded-[32px] bg-white border border-earth-border space-y-3 relative overflow-hidden shadow-sm hover:border-earth-sage/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-earth-text/50">SAVED ITINERARIES</span>
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
            <p className="text-2xl md:text-3xl font-serif italic text-earth-text">${totalBudget.toLocaleString()}</p>
            <p className="text-xs text-earth-text/60 mt-1">Total luxury cash allocation</p>
          </div>
        </div>

        <div className="p-6 rounded-[32px] bg-white border border-earth-border space-y-3 relative overflow-hidden shadow-sm hover:border-earth-sage/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-earth-text/50">AMASSED EXPENSES</span>
            <TrendingUp className="w-4 h-4 text-earth-accent" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-serif italic text-earth-text">${totalSpent.toLocaleString()}</p>
            <p className="text-xs text-earth-text/60 mt-1">Spent across all destinations</p>
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

              {/* Indoor/Outdoor Activity Recommendations */}
              <div className="p-4 rounded-2xl bg-white/50 border border-earth-sage/30 text-xs leading-relaxed text-[#4A4A3A]">
                <span className="font-bold text-[#5A5A40] uppercase font-mono block mb-1">AI Suggestion:</span>
                {weather.recommendation}
              </div>

              {/* 4-Day Forecast list */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-earth-sage/35 text-center">
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

        {/* Expenses categories Custom SVG Chart */}
        <div className="lg:col-span-5 p-6 rounded-[32px] bg-white border border-earth-border space-y-6 h-full shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-earth-border">
            <div>
              <h3 className="font-serif italic text-earth-text text-lg">Expense Snapshot</h3>
              <p className="text-[10px] text-earth-text/50">Cumulative categories tracking</p>
            </div>
            <TrendingUp className="w-4 h-4 text-earth-accent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Custom SVG Bar Chart */}
            <div className="md:col-span-7 h-48 flex items-end justify-between gap-2.5 px-2">
              {chartData.map((d, i) => {
                const heightPercentage = Math.max(10, Math.round((d.value / maxChartValue) * 100));
                
                // Color variation based on category
                const barColors = [
                  "bg-earth-olive",
                  "bg-earth-sage",
                  "bg-earth-accent",
                  "bg-[#DDE5B6]",
                  "bg-earth-dark-accent",
                  "bg-[#BCA38A]"
                ];
                const barColor = barColors[i % barColors.length];

                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 bg-earth-dark text-white font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl whitespace-nowrap">
                      ${d.value.toLocaleString()}
                    </div>
                    
                    {/* Bar graphic */}
                    <div 
                      style={{ height: `${heightPercentage}%` }}
                      className={`w-full rounded-t ${barColor} hover:opacity-90 transition-all duration-300 shadow-sm relative`}
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-white/20" />
                    </div>
                    
                    {/* X-axis label */}
                    <span className="text-[9px] font-mono uppercase text-earth-text/50 mt-2 truncate max-w-full">
                      {d.name.slice(0, 4)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Category breakdown legend panel */}
            <div className="md:col-span-5 space-y-2.5">
              {chartData.map((d, i) => {
                const colors = [
                  "bg-earth-olive",
                  "bg-earth-sage",
                  "bg-earth-accent",
                  "bg-earth-light-sage",
                  "bg-earth-dark-accent",
                  "bg-[#BCA38A]"
                ];
                const bulletColor = colors[i % colors.length];

                return (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${bulletColor} shrink-0`} />
                      <span className="text-earth-text/75 capitalize">{d.name}</span>
                    </div>
                    <span className="font-mono font-bold text-earth-text">${d.value.toLocaleString()}</span>
                  </div>
                );
              })}
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

      {/* Trips list section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif italic text-2xl text-earth-text tracking-tight">Your Journeys Ledger</h2>
          <span className="text-xs text-earth-text/50 font-mono">{trips.length} Trips Plotted</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((t) => {
            const hasActiveHighlight = activeTrip?.id === t.id;
            const tripSpent = t.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
            
            return (
              <div 
                id={`trip-card-${t.id}`}
                key={t.id}
                className={`
                  p-6 rounded-[32px] bg-white border transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group shadow-sm
                  ${hasActiveHighlight 
                    ? "border-earth-accent shadow-md shadow-earth-accent/5" 
                    : "border-earth-border hover:border-earth-sage/40"}
                `}
              >
                {hasActiveHighlight && (
                  <div className="absolute top-0 right-0 px-3 py-1 rounded-bl bg-earth-accent text-white font-mono font-bold text-[9px] uppercase tracking-wider">
                    Viewing Active
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-earth-text/50 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {t.startDate.slice(5)} to {t.endDate.slice(5)}
                    </span>
                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button 
                        id={`fav-btn-${t.id}`}
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(t.id); }}
                        className={`p-1.5 rounded-full border border-earth-border hover:bg-earth-bg transition-all ${t.isFavorite ? "text-rose-500 fill-current" : "text-earth-text/40"}`}
                        title="Favorite"
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        id={`dup-btn-${t.id}`}
                        onClick={(e) => { e.stopPropagation(); onDuplicateTrip(t.id); }}
                        className="p-1.5 rounded-full border border-earth-border text-earth-text/50 hover:text-earth-text hover:bg-earth-bg transition-all"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        id={`del-btn-${t.id}`}
                        onClick={(e) => { e.stopPropagation(); onDeleteTrip(t.id); }}
                        className="p-1.5 rounded-full border border-earth-border text-earth-text/50 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif italic text-xl text-earth-text group-hover:text-earth-accent transition-colors">{t.destination}</h3>
                    <p className="text-xs text-earth-text/50 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-earth-sage" />
                      {t.country}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-earth-bg/50 border border-earth-border/40 text-xs">
                  <div>
                    <span className="text-earth-text/40 text-[10px] uppercase font-mono block">Style</span>
                    <span className="text-earth-text font-medium truncate block">{t.travelStyle}</span>
                  </div>
                  <div>
                    <span className="text-earth-text/40 text-[10px] uppercase font-mono block">Travelers</span>
                    <span className="text-earth-text font-medium block flex items-center gap-1">
                      <Users className="w-3 h-3 text-earth-sage" />
                      {t.travelers} Ad, {t.children} Ch
                    </span>
                  </div>
                  <div>
                    <span className="text-earth-text/40 text-[10px] uppercase font-mono block">Budget</span>
                    <span className="text-earth-text/80 font-mono block">${t.budget.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-earth-text/40 text-[10px] uppercase font-mono block">Spent</span>
                    <span className={`font-mono block ${tripSpent > t.budget ? "text-rose-600 font-bold" : "text-earth-olive font-bold"}`}>
                      ${tripSpent.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  id={`view-itinerary-btn-${t.id}`}
                  onClick={() => onSelectTrip(t.id)}
                  className={`
                    w-full py-3 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all
                    ${hasActiveHighlight 
                      ? "bg-earth-accent hover:bg-earth-accent/90 text-white shadow-sm" 
                      : "bg-earth-bg hover:bg-earth-border/40 text-earth-text border border-earth-border"}
                  `}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Launch Itinerary View</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
