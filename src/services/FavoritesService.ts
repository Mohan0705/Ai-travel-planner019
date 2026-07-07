import { supabase } from "../lib/supabase.ts";

export interface FavoriteDestination {
  id: string;
  user_id: string;
  destination: string;
  notes?: string;
  created_at: string;
}

export const FavoritesService = {
  async getFavorites(userId: string): Promise<FavoriteDestination[]> {
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading favorites:", error);
      return [];
    }
    return data || [];
  },

  async addFavorite(userId: string, destination: string, notes?: string): Promise<FavoriteDestination> {
    const { data, error } = await supabase
      .from("favorites")
      .insert({
        user_id: userId,
        destination,
        notes: notes || null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFavoriteNotes(favoriteId: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from("favorites")
      .update({ notes })
      .eq("id", favoriteId);

    if (error) throw error;
  },

  async removeFavorite(favoriteId: string): Promise<void> {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", favoriteId);

    if (error) throw error;
  }
};
