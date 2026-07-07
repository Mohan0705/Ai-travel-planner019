import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

if ((!process.env.SUPABASE_URL && !process.env.VITE_SUPABASE_URL) || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY)) {
  console.warn("Supabase server environment variables (SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY) are missing. Using placeholders to prevent startup crash.");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});
