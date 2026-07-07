import { createClient } from "@supabase/supabase-js";

const getSupabaseConfig = () => {
  let url = "";
  let key = "";

  // 1. Try process.env first (for server-side or SSR)
  if (typeof process !== "undefined" && process.env) {
    url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
    key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  }

  // 2. Try import.meta.env (for Vite client-side)
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv) {
      if (metaEnv.VITE_SUPABASE_URL) url = metaEnv.VITE_SUPABASE_URL;
      if (metaEnv.VITE_SUPABASE_ANON_KEY) key = metaEnv.VITE_SUPABASE_ANON_KEY;
    }
  } catch (e) {
    // Safe to ignore if import.meta is not defined
  }

  // 3. Fallback to placeholders if still empty
  if (!url || !key) {
    console.warn("Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing. Using placeholders.");
    url = url || "https://placeholder.supabase.co";
    key = key || "placeholder-key";
  }

  return { url, key };
};

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

