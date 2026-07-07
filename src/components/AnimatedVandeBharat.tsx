import React from "react";
import "../styles/train.css";

export default function AnimatedVandeBharat() {
  return (
    <div className="train-container-vande train-animated-vande">
      {/* Dynamic ground shadow traveling with the train coach */}
      <div className="train-shadow-vande" />

      {/* Dual high-intensity forward headlight cone beam */}
      <div className="train-headlights-beam" />

      {/* Speed motion blur trail at the rear of the train */}
      <div className="train-motion-blur-vande" />

      {/* Modern High-Fidelity Vande Bharat Express SVG Vector */}
      <svg
        viewBox="0 0 460 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_8px_12px_rgba(15,23,42,0.15)]"
      >
        <defs>
          {/* Shading gradients for 3D curved metallic railway look */}
          <linearGradient id="vande-chassis" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Vande Bharat Signature Blue Stripe */}
          <linearGradient id="vande-blue-stripe" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>

          {/* Saffron / Orange premium accent trim lines */}
          <linearGradient id="vande-saffron" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          {/* Under-carriage dark wheel-wells shadow */}
          <linearGradient id="vande-undercarriage" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Soft yellow passenger interior compartment glow */}
          <linearGradient id="interior-glow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* 1. WHEEL BOGIES & UNDERCARRIAGE COVERS */}
        <g fill="url(#vande-undercarriage)">
          {/* Coach 1 Wheels */}
          <rect x="25" y="19" width="30" height="5" rx="2.5" />
          <circle cx="32" cy="21.5" r="3" fill="#475569" />
          <circle cx="48" cy="21.5" r="3" fill="#475569" />
          
          {/* Coach 2 Wheels */}
          <rect x="115" y="19" width="30" height="5" rx="2.5" />
          <circle cx="122" cy="21.5" r="3" fill="#475569" />
          <circle cx="138" cy="21.5" r="3" fill="#475569" />

          {/* Coach 3 Wheels */}
          <rect x="205" y="19" width="30" height="5" rx="2.5" />
          <circle cx="212" cy="21.5" r="3" fill="#475569" />
          <circle cx="228" cy="21.5" r="3" fill="#475569" />

          {/* Coach 4 Wheels */}
          <rect x="295" y="19" width="30" height="5" rx="2.5" />
          <circle cx="302" cy="21.5" r="3" fill="#475569" />
          <circle cx="318" cy="21.5" r="3" fill="#475569" />

          {/* Coach 5 Driver Wheels */}
          <rect x="385" y="19" width="32" height="5" rx="2.5" />
          <circle cx="392" cy="21.5" r="3" fill="#475569" />
          <circle cx="410" cy="21.5" r="3" fill="#475569" />
        </g>

        {/* 2. MAIN COCH CHASSIS & AERODYNAMIC BODY */}
        {/* Facing RIGHT - aerodynamic sloped nose on the right */}
        <path
          d="M 0 6 
             L 390 6 
             C 415 6, 432 7.5, 444 11 
             C 452 13.5, 458 16, 459 19.2 
             C 455 21.5, 435 22, 400 22 
             L 0 22 Z"
          fill="url(#vande-chassis)"
        />

        {/* 3. ROOF PANTOGRAPHS (Modern technical gear) */}
        <g stroke="#94A3B8" strokeWidth="1" fill="none" opacity="0.8">
          <path d="M 152 6 L 158 2 L 168 2 L 165 6" />
          <line x1="158" y1="2" x2="164" y2="6" />
          <line x1="155" y1="2" x2="171" y2="2" strokeWidth="1.5" />
        </g>

        {/* 4. HIGH-SPEED SAFFRON TRICOLOR TRIM LINE */}
        <path
          d="M 0 20 L 395 20 C 410 20, 425 20, 436 17 L 434 20.5 L 0 20.5 Z"
          fill="url(#vande-saffron)"
        />

        {/* 5. SIGNATURE DEEP BLUE STRIPE & PILOT NOSE ARROW */}
        <path
          d="M 0 9 
             L 370 9 
             C 388 9, 400 9.5, 412 12.5 
             C 422 15, 428 17.5, 431 19.5 
             L 421 19.5 
             C 412 17.5, 400 16.5, 370 16.5 
             L 0 16.5 Z"
          fill="url(#vande-blue-stripe)"
        />

        {/* Characteristic Vande Bharat Front Windshield Nose Wrap */}
        <path
          d="M 412 12.5
             C 422 15, 428 17.5, 431 19.5
             C 432 19, 430 18, 428 17
             C 424 15.5, 418 14.5, 412 13.5 Z"
          fill="#0F172A"
          opacity="0.8"
        />

        {/* 6. INDIVIDUAL PASSENGER WINDOWS WITH GLOWING INTERIOR */}
        <g fill="url(#interior-glow)" stroke="#1E3A8A" strokeWidth="0.5">
          {/* Coach 1 Compartments */}
          <rect x="15" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="29" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="43" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="57" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="71" y="10.5" width="10" height="3.5" rx="1" />

          {/* Connection Seal */}
          <rect x="85" y="6" width="3" height="16" fill="#1E293B" stroke="none" />

          {/* Coach 2 Compartments */}
          <rect x="92" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="106" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="120" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="134" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="148" y="10.5" width="10" height="3.5" rx="1" />

          {/* Connection Seal */}
          <rect x="162" y="6" width="3" height="16" fill="#1E293B" stroke="none" />

          {/* Coach 3 Compartments */}
          <rect x="169" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="183" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="197" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="211" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="225" y="10.5" width="10" height="3.5" rx="1" />

          {/* Connection Seal */}
          <rect x="239" y="6" width="3" height="16" fill="#1E293B" stroke="none" />

          {/* Coach 4 Compartments */}
          <rect x="246" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="260" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="274" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="288" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="302" y="10.5" width="10" height="3.5" rx="1" />

          {/* Connection Seal */}
          <rect x="316" y="6" width="3" height="16" fill="#1E293B" stroke="none" />

          {/* Coach 5 Driver Compartment windows */}
          <rect x="323" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="337" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="351" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="365" y="10.5" width="10" height="3.5" rx="1" />
          <rect x="379" y="10.5" width="10" height="3.5" rx="1" />
        </g>

        {/* 7. PILOT WINDOW / AERODYNAMIC CABIN GLASS */}
        <path
          d="M 414 13 
             C 420 14, 426 15, 429 16.5 
             C 426 18, 418 18, 412 16.5 
             C 409 15, 409 13.5, 414 13 Z"
          fill="#1C1917"
        />

        {/* 8. HIGH INTENSITY BULLET HEADLIGHTS */}
        <circle cx="431" cy="18.5" r="1.2" fill="#FEF08A" />
        <circle cx="431" cy="18.5" r="0.5" fill="#FFFFFF" />
        
        <circle cx="433" cy="19.5" r="1.2" fill="#FEF08A" />
        <circle cx="433" cy="19.5" r="0.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
