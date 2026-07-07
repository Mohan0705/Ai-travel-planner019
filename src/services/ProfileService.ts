import { supabase } from "../lib/supabase.ts";

export interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  country?: string;
  bio?: string;
  preferences?: any;
}

export const ProfileService = {
  async getProfile(userId: string): Promise<ProfileData | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data;
  },

  async updateProfile(userId: string, updates: Partial<ProfileData>): Promise<ProfileData> {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: updates.full_name,
        avatar_url: updates.avatar_url,
        country: updates.country,
        bio: updates.bio,
        preferences: updates.preferences,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  },

  /**
   * Helper to upload avatar files into the 'avatars' storage bucket
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload image
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
