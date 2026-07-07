import React from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { Lock, Sparkles } from "lucide-react";

interface PrivateRouteProps {
  children: React.ReactNode;
  onOpenAuth: () => void;
  title?: string;
  description?: string;
}

export default function PrivateRoute({ 
  children, 
  onOpenAuth, 
  title = "Vault Access Required",
  description = "Unlock the complete travel suite to persist itineraries, manage multi-agent routes, sync ledgers, and chat with Voyage AI."
}: PrivateRouteProps) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-earth-accent border-t-transparent animate-spin mb-4"></div>
        <p className="text-xs text-earth-text/60 font-mono">Accessing Ledger...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-white border border-earth-border shadow-md text-center space-y-6 animate-fade-in">
        <div className="inline-flex p-3 rounded-xl bg-earth-accent/10 border border-earth-accent/20 text-earth-accent mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif italic font-light text-2xl text-earth-text tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-earth-text/60 font-light max-w-[320px] mx-auto leading-relaxed">
            {description}
          </p>
        </div>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 rounded-full bg-earth-accent hover:bg-earth-accent/90 text-white font-semibold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 font-sans shadow-sm mx-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Unlock Vault</span>
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
