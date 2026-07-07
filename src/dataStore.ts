import { Trip, User, TravelNotification, Expense } from "./types";

// PRE-MADE SPECTACULAR TRIP: KYOTO
export const PRESET_KYOTO: Trip = {
  id: "trip-kyoto-cherry",
  destination: "Kyoto",
  country: "Japan",
  startDate: "2026-04-02",
  endDate: "2026-04-06",
  travelers: 2,
  children: 0,
  budget: 3500,
  currency: "USD",
  travelStyle: "Cultural Luxury",
  foodPreference: "Traditional Japanese & Michelin Guide",
  hotelPreference: "Boutique Ryokan",
  transport: "Bullet Train & Premium Taxi",
  interests: ["Temples", "Gardens", "Tea Ceremony", "Gastronomy", "History"],
  isSaved: true,
  isFavorite: true,
  createdAt: "2026-03-01T12:00:00Z",
  expenses: [
    { id: "exp-k1", title: "Luxury Ryokan Stay", amount: 1800, category: "hotel", date: "2026-04-02", description: "Traditional tatami suite with private onsen." },
    { id: "exp-k2", title: "Kaiseki Dinner Gion", amount: 450, category: "food", date: "2026-04-03", description: "11-course Michelin-starred dining." },
    { id: "exp-k3", title: "Shinkansen Tickets", amount: 260, category: "transport", date: "2026-04-02", description: "Tokyo-Kyoto green car roundtrip." },
    { id: "exp-k4", title: "Craft Kimono Shopping", amount: 350, category: "shopping", date: "2026-04-04", description: "Handwoven silk kimono from Nishijin." },
    { id: "exp-k5", title: "Tea Ceremony Masterclass", amount: 120, category: "entertainment", date: "2026-04-05", description: "Private tea ritual with Urasenke master." }
  ],
  hotels: [
    {
      id: "kh-1",
      name: "Sowaka Ryokan & Villa",
      rating: 4.9,
      price: 650,
      amenities: ["Spa", "Michelin Dining", "Private Gardens", "Zen Bath", "Free WiFi"],
      distance: "Gion District",
      imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
      bookingUrl: "#",
      description: "A restored historic townhome matching exquisite luxury with authentic classic Zen peace."
    },
    {
      id: "kh-2",
      name: "The Ritz-Carlton Kyoto",
      rating: 4.8,
      price: 850,
      amenities: ["Indoor Pool", "Riverside Views", "Spa", "Gym", "Concierge"],
      distance: "Kamogawa River",
      imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
      bookingUrl: "#",
      description: "Overlooking the tranquil Kamogawa River, blending timeless Japanese craftsmanship with five-star world-class hospitality."
    }
  ],
  restaurants: [
    {
      id: "kr-1",
      name: "Gion Karyo Kaiseki",
      rating: 4.9,
      distance: "0.2 miles from Yasaka Shrine",
      cuisine: "Seasonal Kaiseki Ryori",
      priceRange: "$$$$",
      isVegetarian: true,
      isNonVegetarian: true,
      imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
      reviewsCount: 312,
      description: "A historic teahouse serving authentic seasonal tasting menus curated daily."
    },
    {
      id: "kr-2",
      name: "Honke Owariya",
      rating: 4.6,
      distance: "Central Kyoto",
      cuisine: "Handcrafted Soba",
      priceRange: "$$",
      isVegetarian: true,
      isNonVegetarian: true,
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
      reviewsCount: 945,
      description: "Kyoto's oldest confectionery and noodle shop, serving Imperial royalty since 1465."
    }
  ],
  itinerary: [
    {
      dayNumber: 1,
      date: "April 2nd",
      theme: "Ancient Arashiyama & Bamboo Paths",
      morning: [
        {
          id: "k-act-1",
          title: "Bamboo Grove Sunrise Walk",
          description: "Stroll along the atmospheric paths of Arashiyama Bamboo Grove before tourist crowds arrive, surrounded by towering emerald stalks.",
          time: "07:30 AM",
          duration: "2 hours",
          cost: 0,
          location: { name: "Arashiyama Bamboo Grove", lat: 35.0156, lng: 135.6715, type: "attraction" },
          type: "sightseeing",
          rating: 4.8,
          image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=500&q=80"
        }
      ],
      afternoon: [
        {
          id: "k-act-2",
          title: "Tenryu-ji Temple Zen Gardens",
          description: "Explore the UNESCO-listed 14th-century temple featuring a beautiful pond garden mirroring the Arashiyama mountains.",
          time: "12:00 PM",
          duration: "1.5 hours",
          cost: 15,
          location: { name: "Tenryu-ji Temple", lat: 35.0158, lng: 135.6776, type: "attraction" },
          type: "sightseeing",
          rating: 4.7
        },
        {
          id: "k-act-3",
          title: "Traditional Soba Lunch by the River",
          description: "Dine on handmade buckwheat noodles on a wooden deck overlooking the Katsura River, enjoying local pickles and tempura.",
          time: "01:45 PM",
          duration: "1.2 hours",
          cost: 25,
          location: { name: "Shigetsu Restaurant", lat: 35.0160, lng: 135.6780, type: "restaurant" },
          type: "food",
          rating: 4.6
        }
      ],
      evening: [
        {
          id: "k-act-4",
          title: "Gion Lantern-lit Evening Stroll",
          description: "Wander Gion's preserved wooden machiya lanes, watching for geiko and maiko in elegant silk kimonos, concluding with an authentic sake pairing.",
          time: "06:30 PM",
          duration: "3 hours",
          cost: 80,
          location: { name: "Gion Shirakawa", lat: 35.0055, lng: 135.7735, type: "attraction" },
          type: "rest",
          rating: 4.9,
          image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=500&q=80"
        }
      ]
    },
    {
      dayNumber: 2,
      date: "April 3rd",
      theme: "Sacred Torii Gates & Golden Pavilions",
      morning: [
        {
          id: "k-act-5",
          title: "Fushimi Inari Mountain Path",
          description: "Hike beneath thousands of vermilion Shinto Torii gates winding up Mt. Inari, appreciating stone fox guards and sacred shrines.",
          time: "08:00 AM",
          duration: "3 hours",
          cost: 0,
          location: { name: "Fushimi Inari Shrine", lat: 34.9671, lng: 135.7727, type: "attraction" },
          type: "sightseeing",
          rating: 4.9,
          image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=500&q=80"
        }
      ],
      afternoon: [
        {
          id: "k-act-6",
          title: "Kinkaku-ji Golden Pavilion",
          description: "Behold the top two floors of the Zen temple entirely covered in dazzling gold leaf, reflecting in the tranquil Mirror Pond.",
          time: "12:30 PM",
          duration: "1.5 hours",
          cost: 10,
          location: { name: "Kinkaku-ji", lat: 35.0394, lng: 135.7292, type: "attraction" },
          type: "sightseeing",
          rating: 4.8
        },
        {
          id: "k-act-7",
          title: "Imperial Palace Garden Walk",
          description: "A leisurely stroll through the expansive pine gardens of the historic Kyoto Imperial Palace, feeling ancient aristocratic peace.",
          time: "02:30 PM",
          duration: "2 hours",
          cost: 0,
          location: { name: "Kyoto Imperial Palace", lat: 35.0254, lng: 135.7621, type: "attraction" },
          type: "rest"
        }
      ],
      evening: [
        {
          id: "k-act-8",
          title: "Exquisite Michelin Kaiseki Experience",
          description: "Savor a masterful multi-course Kaiseki dinner at Karyo, experiencing the heights of food art, presentation, and taste.",
          time: "07:00 PM",
          duration: "3.5 hours",
          cost: 220,
          location: { name: "Gion Karyo", lat: 35.0022, lng: 135.7745, type: "restaurant" },
          type: "food",
          rating: 4.9,
          image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80"
        }
      ]
    }
  ]
};

// PRESET PARIS
export const PRESET_PARIS: Trip = {
  id: "trip-paris-luxury",
  destination: "Paris",
  country: "France",
  startDate: "2026-09-10",
  endDate: "2026-09-14",
  travelers: 1,
  children: 0,
  budget: 5200,
  currency: "EUR",
  travelStyle: "Art & Elegance",
  foodPreference: "Gourmet French & Patisserie Tour",
  hotelPreference: "Modern Luxury Palace",
  transport: "Private Chauffeur",
  interests: ["Louvre Museum", "Haute Couture", "Eiffel Tower", "Wine Tasting", "Architecture"],
  isSaved: true,
  isFavorite: false,
  createdAt: "2026-05-15T10:00:00Z",
  expenses: [
    { id: "exp-p1", title: "Luxury Hotel Saint-Germain", amount: 2400, category: "hotel", date: "2026-09-10", description: "Suites with balcony facing Eiffel." },
    { id: "exp-p2", title: "Private Louvre Tour", amount: 320, category: "entertainment", date: "2026-09-11", description: "Skip-the-line personal art guide." },
    { id: "exp-p3", title: "L'Ambroisie Dinner", amount: 620, category: "food", date: "2026-09-12", description: "Legendary 3-Star Michelin French Dining." },
    { id: "exp-p4", title: "Private Chauffeur Service", amount: 480, category: "transport", date: "2026-09-11", description: "Mercedes E-Class full-day transport." }
  ],
  hotels: [
    {
      id: "ph-1",
      name: "Le Meurice Palace",
      rating: 4.9,
      price: 980,
      amenities: ["Butler", "Spa", "Michelin Dining", "Balcony View", "Gym"],
      distance: "Facing Tuileries Gardens",
      imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
      bookingUrl: "#",
      description: "Art-centric Palace hotel blending Versailles opulence with modern luxury accents."
    }
  ],
  restaurants: [
    {
      id: "pr-1",
      name: "Le Jules Verne",
      rating: 4.8,
      distance: "Eiffel Tower 2nd Floor",
      cuisine: "Fine Gastronomic French",
      priceRange: "$$$$",
      isVegetarian: true,
      isNonVegetarian: true,
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
      reviewsCount: 1420,
      description: "Breathtaking views of Paris paired with culinary masterworks by Chef Frédéric Anton."
    }
  ],
  itinerary: [
    {
      dayNumber: 1,
      date: "September 10th",
      theme: "Louvre Treasures & Seine River Lights",
      morning: [
        {
          id: "p-act-1",
          title: "Private VIP Louvre Masterpieces Tour",
          description: "Be guided privately through quiet wings to see the Mona Lisa, Winged Victory, and Venus de Milo with an art historian.",
          time: "09:30 AM",
          duration: "3 hours",
          cost: 160,
          location: { name: "The Louvre Museum", lat: 48.8606, lng: 2.3376, type: "attraction" },
          type: "sightseeing",
          rating: 4.9,
          image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=500&q=80"
        }
      ],
      afternoon: [
        {
          id: "p-act-2",
          title: "Luxurious Patisserie Tasting",
          description: "Indulge in handcrafted macarons and pristine hot chocolate at historic Angelina on Rue de Rivoli.",
          time: "01:00 PM",
          duration: "1.5 hours",
          cost: 45,
          location: { name: "Angelina Paris", lat: 48.8631, lng: 2.3275, type: "restaurant" },
          type: "food",
          rating: 4.7
        },
        {
          id: "p-act-3",
          title: "Tuileries Gardens Architecture Walk",
          description: "Stroll along gravel tree-lined boulevards and fountains modeled by Andre Le Notre under the gaze of majestic statues.",
          time: "03:00 PM",
          duration: "2 hours",
          cost: 0,
          location: { name: "Tuileries Garden", lat: 48.8635, lng: 2.3272, type: "attraction" },
          type: "rest"
        }
      ],
      evening: [
        {
          id: "p-act-4",
          title: "Sunset Champagne Dinner Cruise",
          description: "Drift past the illuminated Notre Dame and Eiffel Tower on a private mahogany cruise yacht while dining on standard French recipes.",
          time: "07:30 PM",
          duration: "3 hours",
          cost: 250,
          location: { name: "Seine River Embarkation", lat: 48.8615, lng: 2.3255, type: "restaurant" },
          type: "food",
          rating: 4.9,
          image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=500&q=80"
        }
      ]
    }
  ]
};

// PRESET AMALFI COAST
export const PRESET_AMALFI: Trip = {
  id: "trip-amalfi-ocean",
  destination: "Amalfi Coast",
  country: "Italy",
  startDate: "2026-07-15",
  endDate: "2026-07-20",
  travelers: 4,
  children: 2,
  budget: 6500,
  currency: "USD",
  travelStyle: "Coastal Family Adventure",
  foodPreference: "Fresh Seafood & Lemon Groves",
  hotelPreference: "Cliffside Luxury Villa",
  transport: "Private Yacht & Convertible Alfa",
  interests: ["Boat Tour", "Cliff Diving", "Limoncello Tour", "Beaches", "Ancient Ruins"],
  isSaved: true,
  isFavorite: true,
  createdAt: "2026-06-10T14:30:00Z",
  expenses: [
    { id: "exp-a1", title: "Cliffside Positano Villa", amount: 3500, category: "hotel", date: "2026-07-15" },
    { id: "exp-a2", title: "Private Capri Yacht Charter", amount: 1100, category: "transport", date: "2026-07-17" },
    { id: "exp-a3", title: "Seafood Feast Da Adolfo", amount: 350, category: "food", date: "2026-07-16" }
  ],
  itinerary: [
    {
      dayNumber: 1,
      date: "July 15th",
      theme: "Positano Cliffside Heights",
      morning: [
        {
          id: "a-act-1",
          title: "Lemon Grove Garden Exploration",
          description: "Walk under high lemon pergolas on a multi-generational family estate. Pick fresh lemons and taste organic slushies.",
          time: "09:00 AM",
          duration: "2 hours",
          cost: 30,
          location: { name: "Amalfi Lemon Experience", lat: 40.6340, lng: 14.6027, type: "attraction" },
          type: "sightseeing",
          rating: 4.8,
          image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80"
        }
      ],
      afternoon: [
        {
          id: "a-act-2",
          title: "Positano Beach Swim",
          description: "Rent premium umbrellas on the grey sands of Positano, cooling off in Mediterranean waters facing stacked pastel houses.",
          time: "12:30 PM",
          duration: "4 hours",
          cost: 50,
          location: { name: "Spiaggia Grande", lat: 40.6273, lng: 14.4850, type: "attraction" },
          type: "rest"
        }
      ],
      evening: [
        {
          id: "a-act-3",
          title: "Gourmet Seafood Cliff Dinner",
          description: "Enjoy handmade scialatielli pasta with clams on a high terrace facing thousands of shimmering coastal stars.",
          time: "08:00 PM",
          duration: "2.5 hours",
          cost: 180,
          location: { name: "Zass Restaurant Terrace", lat: 40.6260, lng: 14.4920, type: "restaurant" },
          type: "food",
          rating: 4.9
        }
      ]
    }
  ]
};

export const PRESET_TRIPS: Trip[] = [PRESET_KYOTO, PRESET_PARIS, PRESET_AMALFI];

// INITIAL TRAVEL TIPS
export const PRESET_TIPS = [
  { id: "t1", category: "Packing", title: "Roll, Don't Fold", content: "To maximize bag volume and minimize wrinkling, roll lightweight garments tightly. Place heavy items near the wheels." },
  { id: "t2", category: "Finance", title: "Local ATM Withdrawals", content: "Always decline the dynamic currency conversion at foreign ATMs. Allow your home bank to perform the conversion rate for 4-8% savings." },
  { id: "t3", category: "Safety", title: "Emergency Documents offline", content: "Upload high-quality scans of passports, credit cards, and travel insurances to secure encrypted cloud folders and save copies locally." },
  { id: "t4", category: "Culinary", title: "Eat Two Blocks Away", content: "To find genuine local specialties at real local prices, walk at least two blocks away from central city squares or key architectural monuments." }
];

// DATA STORAGE CLASS WITH LOCAL STORAGE CACHING
class LocalDataStore {
  private trips: Trip[] = [];
  private currentUser: User | null = null;
  private notifications: TravelNotification[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      // 1. Loading User
      const storedUser = localStorage.getItem("voyage_user");
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      } else {
        // Default guest user
        this.currentUser = {
          id: "guest-user",
          email: "akhilvarmakshatriya3@gmail.com",
          username: "Voyageur Luxe",
          bio: "Wanderlust luxury specialist. Exploring the culinary and architectural wonders of the world.",
          createdAt: new Date().toISOString()
        };
        this.saveUser();
      }

      // 2. Loading Trips
      const storedTrips = localStorage.getItem("voyage_trips");
      if (storedTrips) {
        this.trips = JSON.parse(storedTrips);
      } else {
        // Seed default trips
        this.trips = [PRESET_KYOTO, PRESET_PARIS, PRESET_AMALFI];
        this.saveTrips();
      }

      // 3. Loading Notifications
      const storedNotifs = localStorage.getItem("voyage_notifs");
      if (storedNotifs) {
        this.notifications = JSON.parse(storedNotifs);
      } else {
        this.notifications = [
          { id: "n-1", type: "weather", title: "Kyoto Cherry Blossom Alert", message: "Perfect sunny climate forecast. Wind is low, ideal for bamboo walks and sakura gardens.", date: "Just now", read: false },
          { id: "n-2", type: "reminder", title: "Capri Yacht Charter Scheduled", message: "Private skipper departs from Positano dock at 09:00 AM on Day 3. Bring sunscreen and jackets.", date: "2 hours ago", read: false },
          { id: "n-3", type: "flight", title: "Check-in Open", message: "Check-in is now open for your luxury booking to Paris Charles de Gaulle.", date: "1 day ago", read: true }
        ];
        this.saveNotifications();
      }

      // No admin logs loaded

    } catch (e) {
      console.error("Failed to load local data storage state", e);
    }
  }

  // AUTH ACTIONS
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public loginUser(email: string, username: string) {
    this.currentUser = {
      id: `user-${Date.now()}`,
      email,
      username,
      bio: "Sophisticated travel connoisseur.",
      createdAt: new Date().toISOString()
    };
    this.saveUser();
  }

  public logoutUser() {
    this.currentUser = null;
    localStorage.removeItem("voyage_user");
  }

  public updateUserProfile(username: string, bio: string) {
    if (this.currentUser) {
      this.currentUser.username = username;
      this.currentUser.bio = bio;
      this.saveUser();
    }
  }

  // TRIP ACTIONS
  public getTrips(): Trip[] {
    return this.trips;
  }

  public saveNewTrip(trip: Trip) {
    this.trips = [trip, ...this.trips];
    this.saveTrips();
  }

  public updateTrip(updatedTrip: Trip) {
    this.trips = this.trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);
    this.saveTrips();
  }

  public deleteTrip(tripId: string) {
    this.trips = this.trips.filter(t => t.id !== tripId);
    this.saveTrips();
  }

  public duplicateTrip(tripId: string) {
    const original = this.trips.find(t => t.id === tripId);
    if (original) {
      const copy: Trip = {
        ...original,
        id: `trip-dup-${Date.now()}`,
        destination: `${original.destination} (Copy)`,
        createdAt: new Date().toISOString()
      };
      this.trips = [copy, ...this.trips];
      this.saveTrips();
    }
  }

  public toggleFavorite(tripId: string) {
    this.trips = this.trips.map(t => {
      if (t.id === tripId) {
        return { ...t, isFavorite: !t.isFavorite };
      }
      return t;
    });
    this.saveTrips();
  }

  // EXPENSE TRACKING ACTIONS
  public addExpense(tripId: string, expense: Expense) {
    this.trips = this.trips.map(t => {
      if (t.id === tripId) {
        const expenses = [expense, ...t.expenses];
        return { ...t, expenses };
      }
      return t;
    });
    this.saveTrips();
  }

  public deleteExpense(tripId: string, expenseId: string) {
    this.trips = this.trips.map(t => {
      if (t.id === tripId) {
        const expenses = t.expenses.filter(e => e.id !== expenseId);
        return { ...t, expenses };
      }
      return t;
    });
    this.saveTrips();
  }

  // NOTIFICATION ACTIONS
  public getNotifications(): TravelNotification[] {
    return this.notifications;
  }

  public markNotificationRead(id: string) {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    this.saveNotifications();
  }

  public clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
  }

  public addNotification(type: TravelNotification['type'], title: string, message: string) {
    const notif: TravelNotification = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      date: "Just now",
      read: false
    };
    this.notifications = [notif, ...this.notifications];
    this.saveNotifications();
  }

  // PRIVATE SAVES
  private saveUser() {
    localStorage.setItem("voyage_user", JSON.stringify(this.currentUser));
  }

  private saveTrips() {
    localStorage.setItem("voyage_trips", JSON.stringify(this.trips));
  }

  private saveNotifications() {
    localStorage.setItem("voyage_notifs", JSON.stringify(this.notifications));
  }

  // PUBLIC SETTERS FOR COMPATIBILITY
  public setTrips(trips: Trip[]) {
    this.trips = trips;
    this.saveTrips();
  }

  public markAllNotificationsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.saveNotifications();
  }
}

export const dataStore = new LocalDataStore();

// STANDALONE HELPER WRAPPER EXPORTS
export function getTrips(): Trip[] {
  return dataStore.getTrips();
}

export function saveTrips(trips: Trip[]) {
  dataStore.setTrips(trips);
}

export function getNotifications(): TravelNotification[] {
  return dataStore.getNotifications();
}

export function markNotificationsAsRead() {
  dataStore.markAllNotificationsRead();
}
