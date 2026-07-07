import React from "react";

export default function CloudLayer() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-1">
      {/* Dynamic Keyframe Animations for Clouds */}
      <style>{`
        @keyframes cloud-drift-slow {
          0% { transform: translate3d(-30%, 0, 0); }
          100% { transform: translate3d(110%, 0, 0); }
        }
        @keyframes cloud-drift-medium {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(120%, 0, 0); }
        }
        @keyframes cloud-drift-fast {
          0% { transform: translate3d(-80%, 0, 0); }
          100% { transform: translate3d(130%, 0, 0); }
        }
        
        .cloud-slow {
          animation: cloud-drift-slow 160s linear infinite;
        }
        .cloud-medium {
          animation: cloud-drift-medium 110s linear infinite;
        }
        .cloud-fast {
          animation: cloud-drift-fast 70s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .cloud-slow, .cloud-medium, .cloud-fast {
            animation: none !important;
          }
        }
      `}</style>

      {/* Layer 1: Slow, distant, wispy clouds */}
      <div className="cloud-slow absolute top-[8%] left-0 w-full opacity-35">
        <svg viewBox="0 0 1200 120" className="w-[1800px] h-auto fill-white/50">
          {/* Cloud Group A */}
          <path d="M100 80 C120 50, 170 50, 190 70 C210 50, 260 50, 280 80 C300 80, 310 90, 310 100 C310 110, 290 120, 260 120 L120 120 C90 120, 80 110, 80 100 C80 90, 90 80, 100 80 Z" />
          <path d="M550 75 C575 40, 630 40, 655 65 C680 40, 735 40, 760 75 C780 75, 795 85, 795 100 C795 115, 775 120, 740 120 L580 120 C545 120, 530 115, 530 100 C530 85, 545 75, 550 75 Z" opacity="0.75" />
          <path d="M900 85 C915 60, 950 60, 965 78 C980 60, 1015 60, 1030 85 C1045 85, 1055 92, 1055 102 C1055 112, 1040 120, 1015 120 L915 120 C890 120, 880 112, 880 102 C880 92, 890 85, 900 85 Z" opacity="0.6" />
        </svg>
      </div>

      {/* Layer 2: Medium, fluffy clouds */}
      <div className="cloud-medium absolute top-[18%] left-0 w-full opacity-25">
        <svg viewBox="0 0 1200 120" className="w-[1500px] h-auto fill-white/40">
          <path d="M300 60 C330 20, 390 20, 420 50 C450 20, 510 20, 540 60 C565 60, 580 75, 580 95 C580 115, 555 120, 520 120 L320 120 C285 120, 260 115, 260 95 C260 75, 275 60, 300 60 Z" />
          <path d="M780 65 C805 30, 855 30, 880 55 C905 30, 955 30, 980 65 C1000 65, 1015 78, 1015 95 C1015 112, 995 120, 965 120 L795 120 C765 120, 750 112, 750 95 C750 78, 765 65, 780 65 Z" />
        </svg>
      </div>

      {/* Layer 3: Slightly faster, low-altitude wisps */}
      <div className="cloud-fast absolute top-[28%] left-0 w-full opacity-15">
        <svg viewBox="0 0 1200 120" className="w-[1200px] h-auto fill-white/30">
          <path d="M120 70 C140 45, 180 45, 200 65 C220 45, 260 45, 280 70 C295 70, 305 80, 305 92 C305 105, 290 110, 265 110 L135 110 C110 110, 95 105, 95 92 C95 80, 110 70, 120 70 Z" />
          <path d="M820 75 C835 55, 870 55, 885 70 C900 55, 935 55, 950 75 C962 75, 970 82, 970 92 C970 102, 958 108, 938 108 L832 108 C812 108, 800 102, 800 92 C800 82, 810 75, 820 75 Z" />
        </svg>
      </div>
    </div>
  );
}
