import { supabase } from "../lib/supabase.ts";
import { ChatMessage } from "../types";

export const ChatService = {
  /**
   * Fetches the saved chat messages for a user
   */
  async getChatHistory(userId: string, tripId?: string): Promise<ChatMessage[]> {
    let query = supabase
      .from("chat_history")
      .select("*")
      .eq("user_id", userId);

    if (tripId) {
      query = query.eq("trip_id", tripId);
    }

    const { data, error } = await query.order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading chat history:", error);
      return [];
    }

    return (data || []).map((msg: any) => ({
      id: msg.id,
      role: msg.role as 'user' | 'model',
      text: msg.message,
      timestamp: msg.created_at
    }));
  },

  /**
   * Saves a chat message
   */
  async saveMessage(userId: string, message: { role: 'user' | 'model'; text: string; tripId?: string }): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from("chat_history")
      .insert({
        user_id: userId,
        role: message.role,
        message: message.text,
        trip_id: message.tripId || null
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      role: data.role as 'user' | 'model',
      text: data.message,
      timestamp: data.created_at
    };
  },

  /**
   * Clears chat history
   */
  async clearChatHistory(userId: string, tripId?: string): Promise<void> {
    let query = supabase
      .from("chat_history")
      .delete()
      .eq("user_id", userId);

    if (tripId) {
      query = query.eq("trip_id", tripId);
    }

    const { error } = await query;
    if (error) throw error;
  }
};
