import React from "react";
import { 
  Compass, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar, 
  Heart, 
  Copy, 
  Trash2, 
  Sun, 
  Bell, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Sparkles
} from "lucide-react";

// Sub-components
import Sidebar from "./components/Sidebar";
import DiscoverView from "./components/DiscoverView";
import DashboardView from "./components/DashboardView";
import CreateTripView from "./components/CreateTripView";
import ItineraryView from "./components/ItineraryView";
import ChatAssistantView from "./components/ChatAssistantView";
import ExpenseTrackerView from "./components/ExpenseTrackerView";
import AuthModal from "./components/AuthModal";

// Firebase
import { useAuth } from "./context/AuthContext.tsx";
import PrivateRoute from "./components/PrivateRoute.tsx";
import { TripService } from "./services/TripService.ts";
import { ExpenseService } from "./services/ExpenseService.ts";
import { ProfileService } from "./services/ProfileService.ts";

// Data & Store
import { 
  getTrips, 
  saveTrips, 
  getNotifications, 
  markNotificationsAsRead, 
  PRESET_TRIPS 
} from "./dataStore";
import { Trip, User, TravelNotification } from "./types";

const API_BASE = (import.meta as any).env?.VITE_API_URL || "";

export default function App() {
  const [activeTab, setActiveTab] = React.useState<string>("discover");
  
  // Auth state
  const { currentUser, session, signOut } = useAuth();
  const authToken = session?.access_token || null;
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [initialDestination, setInitialDestination] = React.useState("");

  // Loaded Trips
  const [trips, setTrips] = React.useState<Trip[]>(() => {
    return getTrips();
  });

  // Active loaded trip
  const [activeTrip, setActiveTrip] = React.useState<Trip | null>(() => {
    const loaded = getTrips();
    const storedActiveId = localStorage.getItem("voyage_active_trip_id");
    if (storedActiveId && loaded.length > 0) {
      const found = loaded.find(t => t.id === storedActiveId);
      if (found) return found;
    }
    return loaded.length > 0 ? loaded[0] : null;
  });

  const changeActiveTrip = async (trip: Trip | null) => {
    setActiveTrip(trip);
    if (trip) {
      localStorage.setItem("voyage_active_trip_id", trip.id);
      if (currentUser) {
        try {
          const profile = await ProfileService.getProfile(currentUser.id);
          const existingPrefs = profile?.preferences || {};
          await ProfileService.updateProfile(currentUser.id, {
            preferences: {
              ...existingPrefs,
              activeTripId: trip.id
            }
          });
        } catch (err) {
          console.error("Failed to update active trip ID in Supabase preferences:", err);
        }
      }
    } else {
      localStorage.removeItem("voyage_active_trip_id");
      if (currentUser) {
        try {
          const profile = await ProfileService.getProfile(currentUser.id);
          const existingPrefs = profile?.preferences || {};
          const { activeTripId, ...otherPrefs } = existingPrefs;
          await ProfileService.updateProfile(currentUser.id, {
            preferences: otherPrefs
          });
        } catch (err) {
          console.error("Failed to clear active trip ID in Supabase preferences:", err);
        }
      }
    }
  };

  // Alert Notifications
  const [notifications, setNotifications] = React.useState<TravelNotification[]>(() => {
    return getNotifications();
  });

  // 1. Load data synchronized with Supabase Auth context
  React.useEffect(() => {
    let active = true;
    async function loadData() {
      if (currentUser) {
        try {
          let dbTrips = await TripService.getTrips(currentUser.id);
          
          // Migrate local guest trips to Supabase if any exist
          const localTripsStr = localStorage.getItem("voyage_trips");
          if (localTripsStr) {
            try {
              const localTrips: Trip[] = JSON.parse(localTripsStr);
              const presetIds = ["trip-kyoto-cherry", "trip-paris-luxury", "trip-amalfi-ocean"];
              const customGuestTrips = localTrips.filter(t => !presetIds.includes(t.id));
              
              if (customGuestTrips.length > 0) {
                console.log(`Migrating ${customGuestTrips.length} guest trips to Supabase...`);
                for (const trip of customGuestTrips) {
                  const existsInDb = dbTrips.some(dbT => dbT.id === trip.id);
                  if (!existsInDb) {
                    await TripService.saveTrip(currentUser.id, trip);
                  }
                }
                // Clear migrated trips from localStorage to keep only presets
                const remainingTrips = localTrips.filter(t => presetIds.includes(t.id));
                localStorage.setItem("voyage_trips", JSON.stringify(remainingTrips));
                
                // Re-fetch trips from database now that they are migrated
                dbTrips = await TripService.getTrips(currentUser.id);
              }
            } catch (migErr) {
              console.error("Guest-to-User trip migration failed:", migErr);
            }
          }

          if (active) {
            setTrips(dbTrips);
            
            // Determine active trip to restore
            let restoredTrip: Trip | null = null;
            
            // Try Supabase profile preferences first
            try {
              const profile = await ProfileService.getProfile(currentUser.id);
              const activeTripIdFromPrefs = profile?.preferences?.activeTripId;
              
              if (activeTripIdFromPrefs && dbTrips.length > 0) {
                restoredTrip = dbTrips.find(t => t.id === activeTripIdFromPrefs) || null;
              }
            } catch (err) {
              console.warn("Could not load active trip ID from profile preferences:", err);
            }
            
            // If not found in profile preferences, try localStorage fallback
            if (!restoredTrip) {
              const localActiveId = localStorage.getItem("voyage_active_trip_id");
              if (localActiveId && dbTrips.length > 0) {
                restoredTrip = dbTrips.find(t => t.id === localActiveId) || null;
              }
            }
            
            // If still no active trip, fallback to latest created trip (index 0)
            if (!restoredTrip && dbTrips.length > 0) {
              restoredTrip = dbTrips[0];
            }
            
            setActiveTrip(restoredTrip);
            if (restoredTrip) {
              localStorage.setItem("voyage_active_trip_id", restoredTrip.id);
            } else {
              localStorage.removeItem("voyage_active_trip_id");
            }
          }
          
          // Load user notifications from backend
          const response = await fetch(`${API_BASE}/api/notifications`, {
            headers: { "Authorization": `Bearer ${authToken}` }
          });
          if (response.ok && active) {
            const dbNotifs = await response.json();
            setNotifications(dbNotifs);
          }
        } catch (error) {
          console.error("Failed to sync with Supabase services:", error);
        }
      } else {
        if (active) {
          const localTrips = getTrips();
          setTrips(localTrips);
          
          let restoredTrip: Trip | null = null;
          const localActiveId = localStorage.getItem("voyage_active_trip_id");
          if (localActiveId && localTrips.length > 0) {
            restoredTrip = localTrips.find(t => t.id === localActiveId) || null;
          }
          if (!restoredTrip && localTrips.length > 0) {
            restoredTrip = localTrips[0];
          }
          
          setActiveTrip(restoredTrip);
          if (restoredTrip) {
            localStorage.setItem("voyage_active_trip_id", restoredTrip.id);
          } else {
            localStorage.removeItem("voyage_active_trip_id");
          }
          
          setNotifications(getNotifications());
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [currentUser, authToken]);

  // 2. CREATE TRIP GENERATOR CALLBACK
  const handleTripGenerated = async (newTrip: Trip) => {
    const updated = [newTrip, ...trips];
    setTrips(updated);
    saveTrips(updated);
    await changeActiveTrip(newTrip);

    if (currentUser) {
      try {
        await TripService.saveTrip(currentUser.id, newTrip);
      } catch (error) {
        console.error("Failed to sync generated trip to Supabase:", error);
      }
    }
    
    // Push new alert
    const newAlert: TravelNotification = {
      id: `alert-${Date.now()}`,
      type: "system",
      title: "Itinerary Ready",
      message: `BESPOKE PLAN READY: Hour-by-hour itinerary for ${newTrip.destination} has been compiled successfully.`,
      read: false,
      date: "Just now"
    };
    const storedAlerts = JSON.parse(localStorage.getItem("voyage_notifications") || "[]");
    const nextAlerts = [newAlert, ...storedAlerts];
    localStorage.setItem("voyage_notifications", JSON.stringify(nextAlerts));
    setNotifications(nextAlerts);

    setActiveTab("itinerary");
  };

  // 3. DELETE TRIP
  const handleDeleteTrip = async (tripId: string) => {
    const updated = trips.filter(t => t.id !== tripId);
    setTrips(updated);
    saveTrips(updated);

    if (activeTrip?.id === tripId) {
      await changeActiveTrip(updated.length > 0 ? updated[0] : null);
    }

    if (currentUser) {
      try {
        await TripService.deleteTrip(currentUser.id, tripId);
      } catch (error) {
        console.error("Failed to delete trip from Supabase:", error);
      }
    }
  };

  // 4. DUPLICATE TRIP
  const handleDuplicateTrip = async (tripId: string) => {
    const original = trips.find(t => t.id === tripId);
    if (!original) return;

    if (currentUser) {
      try {
        const duplicated = await TripService.duplicateTrip(currentUser.id, tripId);
        const updated = [duplicated, ...trips];
        setTrips(updated);
        saveTrips(updated);
        await changeActiveTrip(duplicated);
      } catch (error) {
        console.error("Failed to duplicate trip in Supabase:", error);
      }
    } else {
      const copy: Trip = {
        ...original,
        id: `trip-copy-${Date.now()}`,
        destination: `${original.destination} (Copy)`,
        createdAt: new Date().toISOString()
      };

      const updated = [copy, ...trips];
      setTrips(updated);
      saveTrips(updated);
      await changeActiveTrip(copy);
    }
  };

  // 5. TOGGLE FAVORITE
  const handleToggleFavorite = async (tripId: string) => {
    const updated = trips.map(t => {
      if (t.id === tripId) {
        return { ...t, isFavorite: !t.isFavorite };
      }
      return t;
    });

    setTrips(updated);
    saveTrips(updated);

    if (activeTrip?.id === tripId) {
      const match = updated.find(t => t.id === tripId);
      if (match) setActiveTrip(match);
    }

    if (currentUser) {
      try {
        const matched = updated.find(t => t.id === tripId);
        if (matched) {
          await TripService.updateTrip(currentUser.id, tripId, { isFavorite: matched.isFavorite });
        }
      } catch (error) {
        console.error("Failed to favorite trip in Supabase:", error);
      }
    }
  };

  // 5.5. UPDATE TRIP
  const handleUpdateTrip = async (tripId: string, updates: Partial<Trip>) => {
    const updated = trips.map(t => {
      if (t.id === tripId) {
        return { ...t, ...updates };
      }
      return t;
    });

    setTrips(updated);
    saveTrips(updated);

    if (activeTrip?.id === tripId) {
      const match = updated.find(t => t.id === tripId);
      if (match) setActiveTrip(match);
    }

    if (currentUser) {
      try {
        await TripService.updateTrip(currentUser.id, tripId, updates);
      } catch (error) {
        console.error("Failed to update trip in Supabase:", error);
      }
    }
  };

  // 6. ADD EXPENSE
  const handleAddExpense = async (
    tripId: string,
    amount: number,
    title: string,
    category: 'hotel' | 'food' | 'shopping' | 'transport' | 'entertainment' | 'other'
  ) => {
    const localExpense = {
      id: `exp-local-${Date.now()}`,
      title,
      amount,
      category,
      date: new Date().toISOString().slice(0, 10)
    };


    const updated = trips.map(t => {
      if (t.id === tripId) {
        return { ...t, expenses: [localExpense, ...(t.expenses || [])] };
      }
      return t;
    });

    setTrips(updated);
    saveTrips(updated);

    const matchedTrip = updated.find(t => t.id === tripId);
    if (matchedTrip) {
      setActiveTrip(matchedTrip);
    }

    if (currentUser) {
      try {
        const dbExpense = await ExpenseService.addExpense(tripId, localExpense, activeTrip?.currency || "USD");
        // Update local state with proper database ID
        const updatedWithDb = updated.map(t => {
          if (t.id === tripId) {
            const filtered = (t.expenses || []).filter(e => e.id !== localExpense.id);
            return { ...t, expenses: [dbExpense, ...filtered] };
          }
          return t;
        });
        setTrips(updatedWithDb);
        saveTrips(updatedWithDb);
        const matchedDbTrip = updatedWithDb.find(t => t.id === tripId);
        if (matchedDbTrip) setActiveTrip(matchedDbTrip);
      } catch (error) {
        console.error("Failed to add expense in Supabase:", error);
      }
    }
  };

  // 7. REMOVE EXPENSE
  const handleRemoveExpense = async (tripId: string, expenseId: string) => {
    const updated = trips.map(t => {
      if (t.id === tripId) {
        const nextExpenses = (t.expenses || []).filter(e => e.id !== expenseId);
        return { ...t, expenses: nextExpenses };
      }
      return t;
    });

    setTrips(updated);
    saveTrips(updated);

    const matchedTrip = updated.find(t => t.id === tripId);
    if (matchedTrip) {
      setActiveTrip(matchedTrip);
    }

    if (currentUser) {
      try {
        await ExpenseService.deleteExpense(expenseId);
      } catch (error) {
        console.error("Failed to remove expense from Supabase:", error);
      }
    }
  };

  const handleLoadPreset = async (presetId: string) => {
    const preset = PRESET_TRIPS.find(p => p.id === presetId);
    if (!preset) return;

    // Check if we already have this preset loaded
    const alreadyExists = trips.some(t => t.destination === preset.destination);
    if (alreadyExists) {
      const match = trips.find(t => t.destination === preset.destination);
      if (match) {
        await changeActiveTrip(match);
        setActiveTab("itinerary");
        return;
      }
    }

    // Duplicate preset with fresh dates to avoid stale presets
    const currentYear = new Date().getFullYear();
    const freshTrip: Trip = {
      ...preset,
      id: `trip-preset-${Date.now()}`,
      startDate: `${currentYear}-07-10`,
      endDate: `${currentYear}-07-15`,
      isSaved: true,
      isFavorite: false,
      expenses: [],
      createdAt: new Date().toISOString()
    };

    handleTripGenerated(freshTrip);
  };

  const handlePlanCustomTrip = (destName?: string) => {
    setInitialDestination(destName || "");
    setActiveTab("create");
  };

  const handleLoginSuccess = (user: User) => {
    setIsAuthOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("voyage_user");
  };



  const handleMarkAllRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);

    if (authToken) {
      try {
        await fetch(`${API_BASE}/api/notifications`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${authToken}` }
        });
      } catch (error) {
        console.error("Failed to flush alerts from database:", error);
      }
    } else {
      markNotificationsAsRead();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-earth-bg font-sans antialiased text-earth-text">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Main Panel views switcher */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {activeTab === "discover" && (
          <DiscoverView 
            onPlanTrip={handlePlanCustomTrip} 
            onLoadPreset={handleLoadPreset} 
          />
        )}

        {activeTab === "dashboard" && (
          <PrivateRoute onOpenAuth={() => setIsAuthOpen(true)} title="My Voyage Ledger" description="Unlock your personal vault to secure all itineraries, load history, and save premium custom trips.">
            <DashboardView 
              trips={trips}
              activeTrip={activeTrip}
              onSelectTrip={(id) => {
                const matched = trips.find(t => t.id === id);
                if (matched) {
                  changeActiveTrip(matched);
                  setActiveTab("itinerary");
                }
              }}
              onDeleteTrip={handleDeleteTrip}
              onDuplicateTrip={handleDuplicateTrip}
              onToggleFavorite={handleToggleFavorite}
              onPlanCustomTrip={() => setActiveTab("create")}
              onOpenWeatherCity={activeTrip?.destination || "Kyoto"}
              onUpdateTrip={handleUpdateTrip}
            />
          </PrivateRoute>
        )}

        {activeTab === "create" && (
          <CreateTripView 
            onTripGenerated={handleTripGenerated}
            initialDestination={initialDestination}
          />
        )}

        {activeTab === "itinerary" && (
          <ItineraryView 
            trip={activeTrip}
            onToggleFavorite={handleToggleFavorite}
            onAddExpense={handleAddExpense}
          />
        )}

        {activeTab === "chat" && (
          <ChatAssistantView 
            currentTrip={activeTrip} 
          />
        )}

        {activeTab === "expenses" && (
          <ExpenseTrackerView 
            trip={activeTrip}
            onAddExpense={handleAddExpense}
            onRemoveExpense={handleRemoveExpense}
          />
        )}

        {activeTab === "notifications" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-earth-bg">
            <div className="flex items-center justify-between border-b border-earth-border pb-4">
              <div>
                <h1 className="font-serif italic font-light text-3xl text-earth-text tracking-tight">Alert Center</h1>
                <p className="text-xs text-earth-text/60 mt-1">Real-time alerts, flight status updates, and security disclosures.</p>
              </div>

              {unreadCount > 0 && (
                <button
                  id="mark-all-read-btn"
                  onClick={handleMarkAllRead}
                  className="px-4 py-2 rounded-full bg-white border border-earth-border text-xs font-semibold hover:bg-earth-accent/10 text-earth-accent transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Dismiss All Alerts</span>
                </button>
              )}
            </div>

            <div className="space-y-3 max-w-3xl">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 rounded-2xl border flex items-start gap-4 transition-all
                    ${notif.read 
                      ? "bg-white/40 border-earth-border/40 opacity-60" 
                      : "bg-white border-earth-accent/30 shadow-sm"
                    }
                  `}
                >
                  <div className={`p-2 rounded-lg ${notif.read ? "bg-earth-bg text-earth-text/60" : "bg-earth-accent/10 text-earth-accent animate-pulse"}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs md:text-sm text-earth-text leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] font-mono text-earth-text/50">{notif.date}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-xs text-earth-text/50 italic font-light p-4 text-center">No active alerts inside your console.</p>
              )}
            </div>
          </div>
        )}



      </main>

      {/* Auth Drawer Modal overlay */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
