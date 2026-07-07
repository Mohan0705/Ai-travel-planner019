import React from "react";
import { Sparkles, MapPin, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import HeroBackground from "./HeroBackground.tsx";

interface LandingHeroProps {
  searchVal: string;
  setSearchVal: (val: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
}

export default function LandingHero({ searchVal, setSearchVal, handleSearchSubmit }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden py-24 px-6 md:px-12 border-b border-earth-border/60">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1920&q=20')] bg-cover bg-center opacity-[0.015] pointer-events-none" />
      
      {/* Immersive Background Scenes (Airplane Landing & Vande Bharat Glide) */}
      <HeroBackground />
      
      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-earth-accent/10 border border-earth-accent/20 text-earth-accent text-xs font-mono tracking-wider uppercase"
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Introducing Voyage AI Multi-Agent v2.5</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif font-light italic text-4xl md:text-6xl text-earth-text tracking-tight leading-tight"
        >
          The Ultimate Intelligence in <br />
          <span className="gold-gradient-text">Modern Luxury Travel</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-earth-text/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light"
        >
          A high-fidelity multi-agent itinerary architect. Experience tailor-made cultural routes, Michelin-star culinary schedules, weather-adaptive suggestions, and dynamic expense tracking.
        </motion.p>

        {/* Interactive Search Bar (Glassmorphic) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-xl mx-auto"
        >
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 p-2 rounded-full bg-white border border-earth-border shadow-sm">
            <div className="flex-1 flex items-center gap-3 px-5 py-2 text-earth-text">
              <MapPin className="w-5 h-5 text-earth-sage shrink-0" />
              <input 
                id="hero-destination-search"
                type="text" 
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Where is your soul traveling next? (e.g. Kyoto, London...)" 
                className="bg-transparent border-none text-earth-text focus:outline-none w-full text-sm font-medium placeholder-earth-text/40"
              />
            </div>
            <button 
              id="hero-search-submit"
              type="submit"
              className="px-8 py-3.5 rounded-full bg-earth-dark hover:bg-earth-dark-accent text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm font-sans"
            >
              <span>Plan Now</span>
              <ArrowRight className="w-4 h-4 text-earth-light-sage" />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
