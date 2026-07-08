import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.ts";
import { User as UserType } from "../types";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

interface AuthContextType {
  currentUser: UserType | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, pass: string, username: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (username: string, bio: string, country?: string, preferences?: any, avatarUrl?: string) => Promise<UserType>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch or upsert profile
  const fetchProfile = async (sUser: SupabaseUser): Promise<UserType> => {
    try {
      const { data, error: pError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sUser.id)
        .single();

      if (pError) {
        if (pError.code === "PGRST116") {
          // Profile doesn't exist yet, let's insert it
          const emailStr = sUser.email || "";
          const usernameStr = sUser.user_metadata?.username || sUser.user_metadata?.full_name || emailStr.split("@")[0] || "Voyager";
          
          const newProfile = {
            id: sUser.id,
            email: emailStr,
            full_name: usernameStr,
            avatar_url: sUser.user_metadata?.avatar_url || sUser.user_metadata?.photoUrl || "",
            country: "International",
            bio: "Sophisticated travel connoisseur.",
            preferences: {
              food: "Local Cuisines",
              hotel: "Boutique Art Hotels",
              transport: "Walk / Transit"
            }
          };

          const { data: insertedData, error: insertErr } = await supabase
            .from("profiles")
            .insert(newProfile)
            .select()
            .single();

          if (insertErr) throw insertErr;
          
          return {
            id: insertedData.id,
            email: insertedData.email,
            username: insertedData.full_name || insertedData.email.split("@")[0],
            photoUrl: insertedData.avatar_url || undefined,
            bio: insertedData.bio || undefined,
            preferences: insertedData.preferences || undefined,
            createdAt: insertedData.created_at
          };
        }
        throw pError;
      }

      return {
        id: data.id,
        email: data.email,
        username: data.full_name || data.email.split("@")[0],
        photoUrl: data.avatar_url || undefined,
        bio: data.bio || undefined,
        preferences: data.preferences || undefined,
        createdAt: data.created_at
      };
    } catch (err: any) {
      console.warn("User profile setup note (safe fallback used):", err.message || err);
      // Fallback in case table queries fail before migration runs
      return {
        id: sUser.id,
        email: sUser.email || "",
        username: sUser.user_metadata?.username || sUser.user_metadata?.full_name || sUser.email?.split("@")[0] || "Voyager",
        photoUrl: sUser.user_metadata?.avatar_url || sUser.user_metadata?.photoUrl || undefined,
        bio: "Sophisticated travel connoisseur.",
        preferences: {
          food: "Local Cuisines",
          hotel: "Boutique Art Hotels",
          transport: "Walk / Transit"
        },
        createdAt: new Date().toISOString()
      };
    }
  };

  // Initial session check & listener
  useEffect(() => {
    let mounted = true;

    // Get current session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!mounted) return;
      setSession(initialSession);
      const sUser = initialSession?.user ?? null;
      setSupabaseUser(sUser);

      if (sUser) {
        try {
          const profile = await fetchProfile(sUser);
          if (mounted) {
            setCurrentUser(profile);
          }
        } catch (err) {
          console.error("Initial session profile setup failed gracefully:", err);
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      } else {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      const sUser = currentSession?.user ?? null;
      setSupabaseUser(sUser);

      if (sUser) {
        setLoading(true);
        try {
          const profile = await fetchProfile(sUser);
          if (mounted) {
            setCurrentUser(profile);
          }
        } catch (err) {
          console.error("Auth state change profile setup failed gracefully:", err);
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      } else {
        setCurrentUser(null);
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // SIGN UP
  const signUp = async (email: string, pass: string, username: string) => {
    setError(null);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          username,
          full_name: username
        }
      }
    });
    if (err) {
      setError(err.message);
      throw err;
    }
    return data;
  };

  // SIGN IN
  const signIn = async (email: string, pass: string) => {
    setError(null);
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (err) {
      setError(err.message);
      throw err;
    }
    return data;
  };

  // GOOGLE SIGN IN
  const signInWithGoogle = async () => {
    setError(null);
    const { data, error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
    if (err) {
      setError(err.message);
      throw err;
    }
    return data;
  };

  // SIGN OUT
  const signOut = async () => {
    setError(null);
    const { error: err } = await supabase.auth.signOut();
    if (err) {
      setError(err.message);
      throw err;
    }
    setCurrentUser(null);
    setSupabaseUser(null);
    setSession(null);
  };

  // PASSWORD RESET
  const resetPassword = async (email: string) => {
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (err) {
      setError(err.message);
      throw err;
    }
  };

  // PROFILE UPDATE
  const updateProfile = async (
    username: string, 
    bio: string, 
    country?: string, 
    preferences?: any,
    avatarUrl?: string
  ): Promise<UserType> => {
    if (!supabaseUser) throw new Error("No active authenticated session");
    setError(null);

    const updates = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      full_name: username,
      avatar_url: avatarUrl !== undefined ? avatarUrl : currentUser?.photoUrl || "",
      country: country || currentUser?.preferences?.country || "International",
      bio,
      preferences: preferences || currentUser?.preferences || {},
      updated_at: new Date().toISOString()
    };

    const { data, error: err } = await supabase
      .from("profiles")
      .upsert(updates)
      .select()
      .single();

    if (err) {
      setError(err.message);
      throw err;
    }

    const updatedUser: UserType = {
      id: data.id,
      email: data.email,
      username: data.full_name,
      photoUrl: data.avatar_url || undefined,
      bio: data.bio || undefined,
      preferences: data.preferences || undefined,
      createdAt: data.created_at
    };

    setCurrentUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        supabaseUser,
        session,
        loading,
        error,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
