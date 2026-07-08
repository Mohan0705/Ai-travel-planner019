import { supabase } from "../lib/supabase.ts";
import { Trip, Expense, DayPlan, HotelRecommendation, RestaurantRecommendation } from "../types";

export const TripService = {
  /**
   * Fetches all trips for the authenticated user and reconstructs the full Trip model
   */
  async getTrips(userId: string): Promise<Trip[]> {
    // 1. Fetch user trips
    const { data: tripsData, error: tripsErr } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (tripsErr) {
      console.warn("User trips fetched locally / none synchronized:", tripsErr.message || tripsErr);
      return [];
    }

    if (!tripsData || tripsData.length === 0) return [];

    const trips: Trip[] = [];

    for (const t of tripsData) {
      // 2. Fetch itinerary detail
      const { data: itinData } = await supabase
        .from("itineraries")
        .select("*")
        .eq("trip_id", t.id)
        .maybeSingle();

      // 3. Fetch expenses
      const { data: expData } = await supabase
        .from("expenses")
        .select("*")
        .eq("trip_id", t.id);

      // Reconstruct nested arrays
      const generated = itinData?.generated_json as any;
      const itineraryList: DayPlan[] = generated?.itinerary || [];
      const hotelsList: HotelRecommendation[] = generated?.hotels || [];
      const restaurantsList: RestaurantRecommendation[] = generated?.restaurants || [];

      const expensesList: Expense[] = (expData || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        category: e.category,
        date: e.date || e.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        description: e.description || undefined
      }));

      trips.push({
        id: t.id,
        destination: t.destination,
        startingLocation: generated?.startingLocation || "",
        country: t.country,
        startDate: t.start_date,
        endDate: t.end_date,
        travelers: Number(t.travelers) || 1,
        children: Number(t.children) || 0,
        budget: Number(t.budget),
        currency: t.currency || "USD",
        travelStyle: t.travel_style || "Classic Luxury",
        foodPreference: t.food_preference || "Local Cuisines",
        hotelPreference: t.hotel_preference || "Boutique Art Hotels",
        transport: t.transport || "Private Transport",
        interests: t.interests || [],
        isSaved: t.is_saved,
        isFavorite: t.is_favorite,
        status: t.status || "upcoming",
        itinerary: itineraryList,
        expenses: expensesList,
        hotels: hotelsList,
        restaurants: restaurantsList,
        flights: generated?.flights || [],
        weather: generated?.weather || null,
        localTransport: generated?.localTransport || null,
        trains: generated?.trains || [],
        buses: generated?.buses || [],
        aiRecommendations: generated?.aiRecommendations || [],
        budgetAllocation: generated?.budgetAllocation || [],
        packingTips: generated?.packingTips || [],
        savingTips: generated?.savingTips || [],
        safetyTips: generated?.safetyTips || [],
        createdAt: t.created_at
      });
    }

    return trips;
  },

  /**
   * Saves a new Trip and its nested Itinerary + Expenses
   */
  async saveTrip(userId: string, trip: Trip): Promise<void> {
    const duration = Math.max(1, Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 3600 * 24)) + 1);

    // 1. Insert Trip row
    const { error: tripErr } = await supabase
      .from("trips")
      .insert({
        id: trip.id,
        user_id: userId,
        destination: trip.destination,
        country: trip.country || "International",
        start_date: trip.startDate,
        end_date: trip.endDate,
        duration,
        budget: Number(trip.budget) || 1000,
        currency: trip.currency || "USD",
        travel_style: trip.travelStyle,
        interests: trip.interests || [],
        food_preference: trip.foodPreference,
        hotel_preference: trip.hotelPreference,
        transport: trip.transport,
        is_saved: trip.isSaved,
        is_favorite: trip.isFavorite,
        status: trip.status || "upcoming",
        created_at: trip.createdAt || new Date().toISOString()
      });

    if (tripErr) throw tripErr;

    // 2. Insert Itinerary detail
    const { error: itinErr } = await supabase
      .from("itineraries")
      .insert({
        trip_id: trip.id,
        title: `${trip.destination} Luxury Itinerary`,
        generated_json: {
          startingLocation: trip.startingLocation || "",
          itinerary: trip.itinerary || [],
          hotels: trip.hotels || [],
          restaurants: trip.restaurants || [],
          flights: trip.flights || [],
          weather: trip.weather || null,
          localTransport: trip.localTransport || null,
          trains: trip.trains || [],
          buses: trip.buses || [],
          aiRecommendations: trip.aiRecommendations || [],
          budgetAllocation: trip.budgetAllocation || [],
          packingTips: trip.packingTips || [],
          savingTips: trip.savingTips || [],
          safetyTips: trip.safetyTips || []
        }
      });

    if (itinErr) throw itinErr;

    // 3. Insert initial expenses if any
    if (trip.expenses && trip.expenses.length > 0) {
      for (const e of trip.expenses) {
        await supabase.from("expenses").insert({
          id: e.id,
          trip_id: trip.id,
          title: e.title,
          category: e.category,
          amount: Number(e.amount),
          currency: trip.currency || "USD",
          date: e.date,
          description: e.description || null
        });
      }
    }
  },

  /**
   * Updates basic trip preferences
   */
  async updateTrip(userId: string, tripId: string, updates: Partial<Trip>): Promise<void> {
    const dbUpdates: any = {};
    if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
    if (updates.isSaved !== undefined) dbUpdates.is_saved = updates.isSaved;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.destination !== undefined) dbUpdates.destination = updates.destination;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
    if (updates.country !== undefined) dbUpdates.country = updates.country;
    if (updates.budget !== undefined) dbUpdates.budget = Number(updates.budget);
    if (updates.travelStyle !== undefined) dbUpdates.travel_style = updates.travelStyle;
    if (updates.foodPreference !== undefined) dbUpdates.food_preference = updates.foodPreference;
    if (updates.hotelPreference !== undefined) dbUpdates.hotel_preference = updates.hotelPreference;
    if (updates.transport !== undefined) dbUpdates.transport = updates.transport;

    const { error } = await supabase
      .from("trips")
      .update(dbUpdates)
      .eq("id", tripId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  /**
   * Deletes a trip (cascade deletes itineraries & expenses)
   */
  async deleteTrip(userId: string, tripId: string): Promise<void> {
    const { error } = await supabase
      .from("trips")
      .delete()
      .eq("id", tripId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  /**
   * Clones/duplicates a trip record
   */
  async duplicateTrip(userId: string, tripId: string): Promise<Trip> {
    // 1. Fetch original
    const { data: origTrip, error: fetchErr } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .eq("user_id", userId)
      .single();

    if (fetchErr) throw fetchErr;

    const { data: origItin } = await supabase
      .from("itineraries")
      .select("*")
      .eq("trip_id", tripId)
      .maybeSingle();

    const { data: origExpenses } = await supabase
      .from("expenses")
      .select("*")
      .eq("trip_id", tripId);

    const newTripId = `trip-${Date.now()}`;

    // 2. Insert duplicated trip
    const { error: insertErr } = await supabase
      .from("trips")
      .insert({
        ...origTrip,
        id: newTripId,
        destination: `${origTrip.destination} (Copy)`,
        created_at: new Date().toISOString()
      });

    if (insertErr) throw insertErr;

    // 3. Insert duplicated itinerary
    if (origItin) {
      await supabase
        .from("itineraries")
        .insert({
          trip_id: newTripId,
          title: `${origTrip.destination} (Copy) Itinerary`,
          generated_json: origItin.generated_json
        });
    }

    // 4. Insert duplicated expenses
    if (origExpenses && origExpenses.length > 0) {
      const expensesList = origExpenses.map((e: any) => ({
        id: `exp-${Date.now()}-${Math.random()}`,
        trip_id: newTripId,
        title: e.title,
        category: e.category,
        amount: Number(e.amount),
        currency: e.currency,
        date: e.date,
        description: e.description
      }));
      await supabase.from("expenses").insert(expensesList);
    }

    // 5. Construct resulting model
    const generated = origItin?.generated_json as any;
    return {
      id: newTripId,
      destination: `${origTrip.destination} (Copy)`,
      country: origTrip.country,
      startDate: origTrip.start_date,
      endDate: origTrip.end_date,
      travelers: Number(origTrip.travelers) || 1,
      children: Number(origTrip.children) || 0,
      budget: Number(origTrip.budget),
      currency: origTrip.currency,
      travelStyle: origTrip.travel_style,
      foodPreference: origTrip.food_preference,
      hotelPreference: origTrip.hotel_preference,
      transport: origTrip.transport,
      interests: origTrip.interests || [],
      isSaved: origTrip.is_saved,
      isFavorite: origTrip.is_favorite,
      itinerary: generated?.itinerary || [],
      expenses: (origExpenses || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        category: e.category,
        date: e.date,
        description: e.description
      })),
      hotels: generated?.hotels || [],
      restaurants: generated?.restaurants || [],
      createdAt: new Date().toISOString()
    };
  },

  /**
   * Helper to upload trip images to Supabase 'trip-images' storage bucket
   */
  async uploadTripImage(tripId: string, file: File): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${tripId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("trip-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("trip-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
