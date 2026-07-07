import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet Default Icon asset issues inside Vite environments
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'hotel' | 'restaurant' | 'attraction' | 'airport' | 'start' | 'current';
  time?: string;
}

interface MapboxMapProps {
  mapPoints: MapPoint[];
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
}

/**
 * Controller to handle dynamic auto bounds-fitting and hovered element centering.
 */
function MapController({ mapPoints, hoveredNodeId }: { mapPoints: MapPoint[]; hoveredNodeId: string | null }) {
  const map = useMap();

  // Auto-fit bounds when points change
  useEffect(() => {
    if (!map || mapPoints.length === 0) return;

    // Filter points to prevent invalid lat/lngs from crashing Leaflet
    const validPoints = mapPoints.filter(p => !isNaN(p.lat) && !isNaN(p.lng));
    if (validPoints.length === 0) return;

    const bounds = L.latLngBounds(validPoints.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
      animate: true,
      duration: 1.0
    });
  }, [mapPoints, map]);

  // Handle fly-to/centering on hovered nodes
  useEffect(() => {
    if (!map || !hoveredNodeId) return;

    const hoveredPoint = mapPoints.find(p => p.id === hoveredNodeId);
    if (hoveredPoint && !isNaN(hoveredPoint.lat) && !isNaN(hoveredPoint.lng)) {
      map.setView([hoveredPoint.lat, hoveredPoint.lng], 15, {
        animate: true,
        duration: 0.8
      });
    }
  }, [hoveredNodeId, mapPoints, map]);

  return null;
}

export default function MapboxMap({ mapPoints, hoveredNodeId, setHoveredNodeId }: MapboxMapProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUserPos, setCurrentUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [activePoints, setActivePoints] = useState<MapPoint[]>([]);

  // 1. Detect dark mode from document class list
  useEffect(() => {
    const checkDark = () => {
      const dark = document.documentElement.classList.contains("dark") || document.body.classList.contains("dark");
      setIsDarkMode(dark);
    };
    checkDark();

    // Observe theme class alterations
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // 2. Align local active points when coordinates or GPS positions are established
  useEffect(() => {
    const points = [...mapPoints];
    if (currentUserPos) {
      points.push({
        id: "current-user-gps",
        name: "Current GPS Location",
        lat: currentUserPos.lat,
        lng: currentUserPos.lng,
        type: "current"
      });
    }
    setActivePoints(points);
  }, [mapPoints, currentUserPos]);

  // 3. Locate Me GPS tracking handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentUserPos({ lat: latitude, lng: longitude });
      },
      (err) => {
        console.warn("GPS tracking access failed:", err.message);
        alert(`Failed to retrieve current location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // 4. Create Category-specific styled HTML markers matching Natural Tones styling
  const createCustomMarkerIcon = (point: MapPoint, index: number) => {
    let bgColor = "bg-amber-600"; // Attractions (Green-Gold/Brown)
    let dotColor = "bg-white";

    if (point.type === "restaurant") {
      bgColor = "bg-rose-600"; // Red
    } else if (point.type === "hotel") {
      bgColor = "bg-[#C5A880]"; // Gold
    } else if (point.type === "airport") {
      bgColor = "bg-blue-600"; // Blue
    } else if (point.type === "current") {
      bgColor = "bg-purple-600 animate-pulse"; // Purple GPS
      dotColor = "bg-purple-100";
    } else if (point.type === "start") {
      bgColor = "bg-orange-500"; // Orange start
    }

    const displayText = point.type === "current" ? "★" : (index + 1).toString();

    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 rounded-full ${bgColor} border-2 border-white text-white text-[11px] font-bold flex items-center justify-center shadow-lg transform transition-transform duration-200 hover:scale-110">
            ${displayText}
          </div>
          <div class="absolute -bottom-1 w-2 h-2 rounded-full ${dotColor} border border-gray-300 shadow"></div>
        </div>
      `,
      className: "custom-leaflet-pin",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
  };

  // Default coordinate center if points list is empty
  const defaultCenter: [number, number] = activePoints.length > 0 
    ? [activePoints[0].lat, activePoints[0].lng] 
    : [35.6762, 139.6503];

  const mapStyleUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const attribution = '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div id="leaflet-map-root" className="w-full h-full relative rounded-xl overflow-hidden shadow-inner border border-earth-border/40 min-h-[350px]">
      {/* Dynamic Map Rendering Container */}
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer url={mapStyleUrl} attribution={attribution} />

        {/* Path routing segment line */}
        {activePoints.length > 1 && (
          <Polyline
            positions={activePoints.filter(p => p.type !== "current").map(p => [p.lat, p.lng])}
            color="#C5A880"
            weight={3.5}
            dashArray="6, 6"
            opacity={0.8}
          />
        )}

        {/* Dynamic Pins */}
        {activePoints.map((point, idx) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={createCustomMarkerIcon(point, idx)}
            eventHandlers={{
              mouseover: () => setHoveredNodeId(point.id),
              mouseout: () => setHoveredNodeId(null)
            }}
          >
            <Popup closeButton={false} offset={[0, -10]}>
              <div className="font-sans p-1 text-xs text-earth-dark">
                <div className="font-bold border-b border-earth-border pb-1 mb-1">{point.name}</div>
                <div className="flex justify-between items-center text-[10px] uppercase font-semibold text-earth-sage">
                  <span>{point.type}</span>
                  {point.time && <span className="text-earth-accent">{point.time}</span>}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Auto controller component */}
        <MapController mapPoints={activePoints} hoveredNodeId={hoveredNodeId} />
      </MapContainer>

      {/* Locate Me Overlay Control Button */}
      <button
        id="btn-locate-me"
        onClick={handleLocateMe}
        className="absolute top-4 right-4 z-[400] bg-white/90 hover:bg-white dark:bg-earth-dark/90 dark:hover:bg-earth-dark border border-earth-border/50 rounded-lg p-2.5 shadow-md flex items-center justify-center transition-all duration-200 active:scale-95 group"
        title="Locate Current Position"
      >
        <span className="text-lg group-hover:animate-bounce">📍</span>
        <span className="text-[10px] font-bold text-earth-dark dark:text-white font-mono ml-1.5 hidden sm:inline">Locate Me</span>
      </button>

      {/* Dynamic Map Legend HUD */}
      <div id="map-legend-hud" className="absolute bottom-4 left-4 z-[400] bg-white/95 dark:bg-earth-dark/95 border border-earth-border/40 rounded-lg shadow-md p-2.5 flex flex-wrap gap-3 text-[9px] font-mono">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-600 border border-white" />Sights</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-600 border border-white" />Gastronomy</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#C5A880] border border-white" />Lodging</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-600 border border-white" />Airport</span>
        {currentUserPos && (
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-600 border border-white animate-pulse" />My GPS</span>
        )}
      </div>
    </div>
  );
}
