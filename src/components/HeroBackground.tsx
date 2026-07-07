import React, { useEffect, useState, Suspense, lazy } from "react";
import CloudLayer from "./CloudLayer.tsx";
import AirportScene from "./AirportScene.tsx";

// Lazy load high-fidelity animations to guarantee fast initial load metrics
const AnimatedPlane = lazy(() => import("./AnimatedPlane.tsx"));
const AnimatedVandeBharat = lazy(() => import("./AnimatedVandeBharat.tsx"));

export default function HeroBackground() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for the full browser layout cycle to finish before triggering intensive heavy animations.
    // This allows initial critical styles and images to complete rendering first.
    const handlePageLoad = () => {
      setIsReady(true);
    };

    if (document.readyState === "complete") {
      const timer = setTimeout(() => setIsReady(true), 150);
      return () => clearTimeout(timer);
    } else {
      window.addEventListener("load", handlePageLoad);
      return () => window.removeEventListener("load", handlePageLoad);
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
      {/* 
        1. PREMIUM BLUE SKY GRADIENT with Sunlight Flare Overlay
        - Base: Clean sky-to-dawn transition (representing premium luxury travel at sunrise)
        - Light burst: Warm, soft atmospheric glow from the top-center
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#b9d5ec] via-[#d0e4f5] to-[#f4f8fc]" />
      
      {/* Atmospheric Sunrise Sunburst Glow */}
      <div className="absolute top-0 left-[45%] -translate-x-1/2 w-[900px] h-[550px] bg-radial-gradient from-amber-100/35 via-orange-50/10 to-transparent filter blur-[70px] opacity-80" />

      {/* Atmospheric Fog / Warm horizon blend */}
      <div className="absolute bottom-[16%] left-0 right-0 h-[60px] bg-gradient-to-t from-white via-white/40 to-transparent opacity-85" />

      {/* 2. CLOUDS LAYER (Drifting programmatically in parallel vectors) */}
      <CloudLayer />

      {/* 3. AIRPORT TERMINAL, SILHOUETTES, TRACKS, AND APTRON SYSTEMS */}
      <AirportScene>
        {isReady && (
          <div className="hidden sm:block">
            <Suspense fallback={null}>
              <AnimatedVandeBharat />
            </Suspense>
          </div>
        )}
      </AirportScene>

      {/* 4. SUSPENDED CONTINUOUS ACTIVE ANIMATION ELEMENTS */}
      {isReady && (
        <Suspense fallback={null}>
          {/* Landing Plane Layer (Z-Indexed above background, behind UI) */}
          <div className="absolute inset-0">
            <AnimatedPlane />
          </div>
        </Suspense>
      )}
    </div>
  );
}
