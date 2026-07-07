import { getEnvVar } from "./utils.ts";
import { supabase } from "../lib/supabase.ts";

export interface CacheEntry {
  data: any;
  timestamp: number;
  expiry: number;
  apiSource: string;
}

async function getSupabaseClient() {
  if (typeof window === "undefined") {
    try {
      const { supabaseAdmin } = await import("../lib/supabase-server.ts");
      return supabaseAdmin;
    } catch (err) {
      console.warn("[CacheManager] Could not load supabaseAdmin on server, using default client:", err);
    }
  }
  return supabase;
}

export const CacheManager = {
  getCacheKey(service: string, params: Record<string, any>): string {
    return `${service}:${JSON.stringify(params)}`;
  },

  async get(key: string): Promise<CacheEntry | null> {
    try {
      // 1. Try Supabase durable DB cache
      const client = await getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from("api_cache")
            .select("*")
            .eq("key", key)
            .maybeSingle();

          if (!error && data) {
            const expiryTime = new Date(data.expiry).getTime();
            if (Date.now() < expiryTime) {
              return {
                data: data.data,
                timestamp: new Date(data.created_at).getTime(),
                expiry: expiryTime,
                apiSource: data.api_source || "Supabase DB Cache"
              };
            } else {
              // Non-blocking cleanup of expired cache item
              Promise.resolve(client.from("api_cache").delete().eq("key", key)).catch(() => {});
            }
          }
        } catch (dbErr) {
          console.warn("[CacheManager] Supabase DB read failed (table might not exist yet), falling back to local:", dbErr);
        }
      }

      // 2. Server-side caching fallback (fs)
      if (typeof process !== "undefined" && process.versions && process.versions.node) {
        try {
          const fs = await import("fs");
          const path = await import("path");
          const cacheFile = path.join(process.cwd(), "api_cache.json");
          if (fs.existsSync(cacheFile)) {
            const raw = fs.readFileSync(cacheFile, "utf-8");
            const db = JSON.parse(raw);
            const entry = db[key];
            if (entry) {
              if (Date.now() < entry.expiry) {
                return entry;
              } else {
                delete db[key];
                fs.writeFileSync(cacheFile, JSON.stringify(db, null, 2), "utf-8");
              }
            }
          }
        } catch (err) {
          console.warn("[CacheManager] Server Local Cache read failed:", err);
        }
      }

      // 3. Client-side caching fallback (localStorage)
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = window.localStorage.getItem(`cache:${key}`);
        if (raw) {
          const entry = JSON.parse(raw) as CacheEntry;
          if (Date.now() < entry.expiry) {
            return entry;
          } else {
            window.localStorage.removeItem(`cache:${key}`);
          }
        }
      }
    } catch (err) {
      console.warn("[CacheManager] get failed:", err);
    }
    return null;
  },

  async set(key: string, data: any, ttlSeconds: number, apiSource: string): Promise<void> {
    const timestamp = Date.now();
    const expiry = timestamp + ttlSeconds * 1000;
    const entry: CacheEntry = { data, timestamp, expiry, apiSource };

    try {
      // 1. Try Supabase durable DB cache
      const client = await getSupabaseClient();
      if (client) {
        try {
          const expiryDateString = new Date(expiry).toISOString();
          const { error } = await client
            .from("api_cache")
            .upsert({
              key,
              data,
              expiry: expiryDateString,
              api_source: apiSource,
              updated_at: new Date().toISOString()
            });
          if (error) {
            console.warn("[CacheManager] Supabase DB upsert returned error:", error.message);
          }
        } catch (dbErr) {
          console.warn("[CacheManager] Supabase DB write failed, using local/fs fallbacks:", dbErr);
        }
      }

      // 2. Server-side caching (fs)
      if (typeof process !== "undefined" && process.versions && process.versions.node) {
        try {
          const fs = await import("fs");
          const path = await import("path");
          const cacheFile = path.join(process.cwd(), "api_cache.json");
          let db: Record<string, any> = {};
          if (fs.existsSync(cacheFile)) {
            try {
              db = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
            } catch {
              db = {};
            }
          }
          db[key] = entry;
          fs.writeFileSync(cacheFile, JSON.stringify(db, null, 2), "utf-8");
        } catch (err) {
          console.warn("[CacheManager] Server Local Cache write failed:", err);
        }
      }

      // 3. Client-side caching (localStorage)
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(`cache:${key}`, JSON.stringify(entry));
      }
    } catch (err) {
      console.warn("[CacheManager] set failed:", err);
    }
  }
};
