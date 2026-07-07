import React from "react";

interface AirportSceneProps {
  children?: React.ReactNode;
}

export default function AirportScene({ children }: AirportSceneProps) {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-2 flex flex-col justify-end">
      {/* 
        Landscape & Airport Scene:
        - Layer 1: Far horizon mountains (warm slate/grey)
        - Layer 2: Midground Airport terminal, hangers, and control tower silhouette
        - Layer 3: Main runway apron with navigation/guidance markings
        - Layer 4: Taxiway light systems (blinking)
        - Layer 5: Beautiful railway track at the absolute bottom
      */}
      
      {/* 1. MOUNTAIN SILHOUETTE (Far Background) */}
      <div className="absolute bottom-[22%] left-0 right-0 h-[100px] opacity-15 overflow-hidden">
        <svg
          className="w-full h-full text-slate-800 fill-current"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
        >
          {/* Layered mountain ridges with soft gradients */}
          <path d="M0 85 L120 70 L280 92 L420 55 L610 88 L790 45 L940 78 L1120 48 L1280 82 L1440 60 L1440 100 L0 100 Z" />
          <path d="M0 90 L180 80 L350 95 L520 72 L700 90 L850 78 L1040 92 L1210 75 L1380 95 L1440 90 L1440 100 L0 100 Z" opacity="0.5" />
        </svg>
      </div>

      {/* 2. AIRPORT TERMINAL & CONTROL TOWER SILHOUETTE (Midground) */}
      <div className="absolute bottom-[16%] left-0 right-0 h-[80px] opacity-20 overflow-hidden">
        <svg
          className="w-full h-full text-slate-800 fill-current"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          {/* Main Airport Terminal Building */}
          <rect x="150" y="45" width="280" height="35" rx="3" />
          {/* Arched terminal roof glass domes */}
          <path d="M 165 45 C 165 30, 220 30, 220 45 Z" />
          <path d="M 230 45 C 230 30, 285 30, 285 45 Z" />
          <path d="M 295 45 C 295 30, 350 30, 350 45 Z" />
          <path d="M 360 45 C 360 30, 415 30, 415 45 Z" />
          
          {/* Hangar Buildings */}
          <path d="M 40 80 L 40 55 C 40 50, 110 50, 110 55 L 110 80 Z" />
          <path d="M 105 80 L 105 58 C 105 53, 160 53, 160 58 L 160 80 Z" opacity="0.8" />

          {/* Passenger Boarding Jet Bridges */}
          <line x1="200" y1="65" x2="190" y2="72" stroke="currentColor" strokeWidth="2" />
          <rect x="182" y="70" width="10" height="10" rx="1" />
          <line x1="330" y1="65" x2="315" y2="73" stroke="currentColor" strokeWidth="2" />
          <rect x="307" y="71" width="10" height="10" rx="1" />

          {/* Radar Dishes & Antennas on Terminal Roof */}
          <line x1="255" y1="45" x2="255" y2="35" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 250 35 Q 255 38, 260 35 L 255 30 Z" />

          {/* Airport Control Tower on the far right background */}
          <path d="M1220 80 L1227 42 L1220 34 L1220 20 L1245 20 L1245 34 L1238 42 L1245 80 Z" />
          <rect x="1215" y="14" width="35" height="6" rx="1" />
          <line x1="1232" y1="14" x2="1232" y2="6" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="1232" cy="5" r="1.5" />

          {/* Distant light poles */}
          <line x1="600" y1="80" x2="600" y2="40" stroke="currentColor" strokeWidth="1" />
          <line x1="595" y1="40" x2="605" y2="40" stroke="currentColor" strokeWidth="1" />
          <line x1="850" y1="80" x2="850" y2="40" stroke="currentColor" strokeWidth="1" />
          <line x1="845" y1="80" x2="855" y2="40" stroke="currentColor" strokeWidth="1" />

          {/* Small stationary aircraft silhouette parked at gates */}
          <path d="M470 70 L485 73 L505 73 L490 68 L495 62 L488 68 Z" opacity="0.6" />
          <path d="M680 72 L695 75 L715 75 L700 70 L705 64 L698 70 Z" opacity="0.4" />
        </svg>
      </div>

      {/* 3. RUNWAY MARKINGS & APTRON SYSTEM (Interactive Layer) */}
      <div className="absolute bottom-[13%] left-0 right-0 h-[28px] overflow-hidden">
        {/* Soft runway tarmac color background overlay */}
        <div className="absolute inset-0 bg-slate-900/5 border-t border-b border-slate-900/10" />

        <svg
          className="w-full h-full text-slate-400 opacity-30 fill-current"
          viewBox="0 0 1440 28"
          preserveAspectRatio="none"
        >
          {/* Runway white edge stripes */}
          <line x1="0" y1="4" x2="1440" y2="4" stroke="currentColor" strokeWidth="1" strokeDasharray="15,10" />
          <line x1="0" y1="24" x2="1440" y2="24" stroke="currentColor" strokeWidth="1.2" />

          {/* Central dashed guidance markings */}
          <line x1="0" y1="14" x2="1440" y2="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="30,20" />

          {/* Runway touchdown markings */}
          <rect x="250" y="8" width="45" height="3" />
          <rect x="250" y="17" width="45" height="3" />
          
          <rect x="310" y="8" width="30" height="2" />
          <rect x="310" y="18" width="30" height="2" />
          
          <rect x="850" y="8" width="45" height="3" />
          <rect x="850" y="17" width="45" height="3" />
          
          {/* Runway Number (e.g., 27L) */}
          <text x="180" y="17" fontFamily="sans-serif" fontSize="9" fontWeight="bold" letterSpacing="1">27R</text>
        </svg>
      </div>

      {/* 4. RUNWAY TAXIWAY LIGHTS (Pulsing Ambient LED lights) */}
      <div className="absolute bottom-[13%] left-0 right-0 h-[28px] pointer-events-none">
        {/* Blinking taxiway neon lights built using Tailwind animate-pulse helper */}
        <div className="absolute left-[8%] top-[4px] w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)] animate-pulse" style={{ animationDuration: "1.4s" }} />
        <div className="absolute left-[22%] top-[4px] w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)] animate-pulse" style={{ animationDuration: "1.7s" }} />
        <div className="absolute left-[38%] top-[20px] w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,1)] animate-pulse" style={{ animationDuration: "2.1s" }} />
        <div className="absolute left-[54%] top-[4px] w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)] animate-pulse" style={{ animationDuration: "1.9s" }} />
        <div className="absolute left-[68%] top-[20px] w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,1)] animate-pulse" style={{ animationDuration: "1.5s" }} />
        <div className="absolute left-[82%] top-[4px] w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)] animate-pulse" style={{ animationDuration: "2.3s" }} />
        <div className="absolute left-[94%] top-[20px] w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,1)] animate-pulse" style={{ animationDuration: "1.2s" }} />
      </div>

      {/* 5. LUXURY HIGH-SPEED RAILWAY TRACK (Directly at the bottom) */}
      <div className="railway-track-container">
        {/* Underlay rail bed ballast */}
        <div className="absolute left-[-10%] right-[-10%] top-[40%] h-[12px] bg-slate-900/[0.04] filter blur-[1px] transform rotate-[0.4deg] origin-left" />
        {/* Ties / Sleeper wood */}
        <div className="railway-track-ties" />
        {/* Shiny Steel Rails */}
        <div className="railway-track-steel" />
        {children}
      </div>
    </div>
  );
}
