import React, { useEffect, useState } from "react";
import "../styles/plane.css";

export default function AnimatedPlane() {
  const [smokeActive, setSmokeActive] = useState(false);

  useEffect(() => {
    // Landing touchdown on the runway occurs at exactly 83% of the 20s animation.
    // 20 seconds * 0.83 = 16.6 seconds (16600ms).
    // We set up a timer to trigger the puff of tire smoke at the wheels at touchdown.
    const triggerSmoke = () => {
      setSmokeActive(true);
      const disableTimeout = setTimeout(() => {
        setSmokeActive(false);
      }, 1500); // smoke-burst-new animation duration
      return disableTimeout;
    };

    // First cycle trigger
    const initialTimeout = setTimeout(triggerSmoke, 16600);

    const interval = setInterval(() => {
      triggerSmoke();
    }, 20000); // 20 seconds loop cycle

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* 
        Plane Shadow:
        Moves horizontally and scales up on the runway/tarmac level.
        Synchronized with the plane position via plane-shadow-landing-path keyframes.
      */}
      <div className="plane-shadow-new" />

      {/* 
        Plane Container:
        Controls the curved glide path, deceleration, nose flare, touchdown, taxi, and exit.
        Synchronized with the flight path via plane-landing-path keyframes.
      */}
      <div className="plane-container-new plane-animated-new">
        {/* Engine physical vibration wrapper */}
        <div className="plane-vibration-new relative w-full h-full">
          {/* Subtle touchdown smoke puff element, positioned right below the main landing gear bogie */}
          <div
            className={`touchdown-smoke-new ${smokeActive ? "smoke-puff-active-new" : ""}`}
            style={{
              left: "53.8%",
              top: "76.4%",
            }}
          />

          {/* Premium Vector SVG Passenger Aircraft */}
          <svg
            viewBox="0 0 340 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_16px_20px_rgba(15,23,42,0.14)]"
          >
            <defs>
              {/* Luxury Natural Gold Theme Gradient for aircraft tail fin branding */}
              <linearGradient id="plane-luxury-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C68B59" />
                <stop offset="50%" stopColor="#B37C4F" />
                <stop offset="100%" stopColor="#9C6314" />
              </linearGradient>

              {/* Tonal Slate styling for realistic metal gradients */}
              <linearGradient id="plane-metallic-body" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="65%" stopColor="#FAFAF9" />
                <stop offset="100%" stopColor="#E7E5E4" />
              </linearGradient>

              {/* Jet Engine Intake gold highlight */}
              <linearGradient id="engine-metallic" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E7E5E4" />
                <stop offset="40%" stopColor="#C68B59" />
                <stop offset="100%" stopColor="#44403C" />
              </linearGradient>

              {/* Bright forward-casting nose landing light cone */}
              <linearGradient id="nose-light-glow" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
                <stop offset="45%" stopColor="#FEF08A" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* FAR WING (Opposite Side) */}
            <path d="M 205 48 L 255 68 L 270 68 L 225 47 Z" fill="#D6D3D1" opacity="0.7" />

            {/* FAR HORIZONTAL STABILIZER */}
            <path d="M 295 44 L 322 32 L 332 32 L 305 45 Z" fill="#A8A29E" opacity="0.65" />

            {/* MAIN FUSELAGE / AIRCRAFT BODY */}
            <path
              d="M 22 42 
                 C 36 28, 270 26, 310 33 
                 C 316 34, 321 38, 323 44 
                 C 320 48, 311 50, 298 50 
                 C 245 51, 80 51, 22 42 Z"
              fill="url(#plane-metallic-body)"
            />

            {/* PREMIUM COCKPIT SHIELD */}
            <path
              d="M 28 37 
                 C 32 36, 40 37, 44 38.5 
                 C 41 41.5, 34 41.5, 31 40 
                 C 28 39, 27 38.2, 28 37 Z"
              fill="#1C1917"
            />

            {/* CABIN WINDOW STRIPE (Aesthetic Dotted Sequence) */}
            <g fill="#44403C" opacity="0.75">
              <circle cx="65" cy="37.5" r="1.1" />
              <circle cx="76" cy="37.5" r="1.1" />
              <circle cx="87" cy="37.5" r="1.1" />
              <circle cx="98" cy="37.5" r="1.1" />
              <circle cx="109" cy="37.5" r="1.1" />
              <circle cx="120" cy="37.5" r="1.1" />
              <circle cx="131" cy="37.5" r="1.1" />
              <circle cx="142" cy="37.5" r="1.1" />
              <circle cx="153" cy="37.5" r="1.1" />
              <circle cx="164" cy="37.5" r="1.1" />
              <circle cx="175" cy="37.5" r="1.1" />
              <circle cx="186" cy="37.5" r="1.1" />
              <circle cx="197" cy="37.5" r="1.1" />
              <circle cx="208" cy="37.5" r="1.1" />
              <circle cx="219" cy="37.5" r="1.1" />
              <circle cx="230" cy="37.5" r="1.1" />
              <circle cx="241" cy="37.5" r="1.1" />
              <circle cx="252" cy="37.5" r="1.1" />
              <circle cx="263" cy="37.5" r="1.1" />
            </g>

            {/* TAIL FIN (Vertical Stabilizer with Luxury Emblem) */}
            <path
              d="M 280 33 
                 L 320 3 
                 L 334 3 
                 L 318 39 Z"
              fill="url(#plane-luxury-gold)"
            />
            {/* Elegant luxury vector crest on tail fin */}
            <path d="M312 14 L320 8 L323 12 L316 18 Z" fill="#FFFFFF" opacity="0.9" />
            <path d="M317 20 L324 15 L327 18 L320 24 Z" fill="#FFFFFF" opacity="0.6" />

            {/* NEAR HORIZONTAL STABILIZER */}
            <path d="M 302 43 L 325 29 L 333 29 L 312 44 Z" fill="#FAFAF9" />

            {/* HIGH-OUTPUT TURBOFAN JET ENGINE (Angled Underside) */}
            <g>
              {/* Engine nacelle casing */}
              <rect x="142" y="44" width="40" height="13" rx="6" fill="#F5F5F4" stroke="#E7E5E4" strokeWidth="0.8" />
              {/* Metallic cowl ring */}
              <path d="M142 44 C145 44, 146 47, 146 50.5 C146 54, 145 57, 142 57 Z" fill="url(#engine-metallic)" />
              {/* Fan cone dark recess */}
              <path d="M143.5 46 C145 46, 145.5 48, 145.5 50.5 C145.5 53, 145 55, 143.5 55 Z" fill="#1C1917" />
              {/* Exhaust cone exhaust */}
              <path d="M182 46.5 L189 48.5 L189 51.5 L182 53.5 Z" fill="#44403C" />
            </g>

            {/* MAIN SWEPT FOREGROUND WING */}
            <path
              d="M 158 44 
                 L 214 66 
                 L 232 66 
                 L 190 43 Z"
              fill="#FAFAF9"
            />
            <path d="M214 66 L232 66 L220 61 L206 61 Z" fill="#D6D3D1" /> {/* Wing trim flaps */}

            {/* DETAILED LANDING GEAR SYSTEM (Fully deployed and detailed) */}
            {/* Nose Gear Bogie */}
            <g stroke="#78716C" strokeWidth="1.2" fill="none">
              <line x1="56" y1="46" x2="56" y2="70" />
              <line x1="56" y1="64" x2="51" y2="69" />
              {/* Twin nose wheels */}
              <circle cx="56" cy="70" r="3" fill="#1C1917" stroke="none" />
              <circle cx="56" cy="70" r="1" fill="#FAFAF9" stroke="none" />
            </g>

            {/* Main Tandem Landing Gear Bogie */}
            <g stroke="#78716C" strokeWidth="1.5" fill="none">
              {/* Strut */}
              <line x1="181" y1="48" x2="175" y2="80" />
              {/* Dual-bogie wheel beam */}
              <line x1="171" y1="80" x2="182" y2="80" strokeWidth="2" />
              {/* Tandem primary wheels */}
              <circle cx="170" cy="80" r="5" fill="#1C1917" stroke="none" />
              <circle cx="170" cy="80" r="1.8" fill="#D6D3D1" stroke="none" />
              <circle cx="180" cy="80" r="5" fill="#1C1917" stroke="none" />
              <circle cx="180" cy="80" r="1.8" fill="#D6D3D1" stroke="none" />
            </g>

            {/* INTENTIONAL NAVIGATION & FLIGHT SAFETY LIGHTS (Active Beacon Indicators) */}
            {/* Red Beacon (Top Fuselage) */}
            <circle cx="180" cy="27" r="2.5" className="beacon-blink-red-new" fill="#EF4444" />
            {/* Red Beacon (Bottom Fuselage) */}
            <circle cx="180" cy="51.5" r="2.5" className="beacon-blink-red-new" fill="#EF4444" />
            {/* Green Navigation Light (Foreground Wingtip) */}
            <circle cx="230" cy="66" r="2" className="beacon-blink-green-new" fill="#22C55E" />
            {/* Red Navigation Light (Distant Far Wingtip) */}
            <circle cx="268" cy="68" r="1.5" className="beacon-blink-red-new" fill="#EF4444" opacity="0.6" />
            {/* White Tail Strobe Light */}
            <circle cx="334" cy="3" r="2" className="beacon-blink-white-new" fill="#FFFFFF" />

            {/* Landing Searchlight Beam Cone (bright, sweeping down-left) */}
            <g>
              <polygon points="22,42 0,22 0,58" fill="url(#nose-light-glow)" />
              <circle cx="22" cy="42" r="2" fill="#FEF08A" />
              <circle cx="22" cy="42" r="0.8" fill="#FFFFFF" />
            </g>
          </svg>
        </div>
      </div>
    </>
  );
}
