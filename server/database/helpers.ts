import { Client } from "pg";
import { supabaseAdmin } from "../../src/lib/supabase-server.ts";

export interface DbCredentials {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
}

// Dynamically extracts database credentials from environment or URL
export function getDbCredentials(): DbCredentials | null {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!supabaseUrl) return null;

  // Extract project ref from: https://enzeougvtntcwnfjwrjv.supabase.co -> enzeougvtntcwnfjwrjv
  let projectRef = "";
  try {
    const parsed = new URL(supabaseUrl);
    projectRef = parsed.hostname.split(".")[0];
  } catch (err) {
    console.error("Failed to parse VITE_SUPABASE_URL:", err);
  }

  const host = projectRef ? `db.${projectRef}.supabase.co` : "localhost";
  const password = 
    process.env.SUPABASE_DB_PASSWORD || 
    process.env.SUPABASE_PASSWORD || 
    process.env.SQL_PASSWORD || 
    process.env.SQL_ADMIN_PASSWORD;

  return {
    host,
    port: 6543, // Default pooled port for PgBouncer
    user: "postgres",
    password,
    database: "postgres"
  };
}

// Instantiates a connected pg Client or throws a clean error
export async function createPgClient(): Promise<Client> {
  const creds = getDbCredentials();
  if (!creds) {
    throw new Error("Missing Supabase database URL or credentials.");
  }

  if (!creds.password) {
    throw new Error("Missing database password in environment (SUPABASE_DB_PASSWORD, SQL_PASSWORD, etc.).");
  }

  const client = new Client({
    host: creds.host,
    port: creds.port,
    user: creds.user,
    password: creds.password,
    database: creds.database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  await client.connect();
  return client;
}

// Gracefully checks if a table exists in the database
// Uses the supabase REST API (over HTTP) to avoid direct TCP/IPv6 failures!
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from(tableName)
      .select("count", { count: "exact", head: true });

    if (error) {
      // PostgREST code '42P01' is 'relation does not exist'
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        return false;
      }
      // Any other error means the table exists but some other issue occurred (e.g., auth or structure)
      console.log(`Table check returned error for ${tableName}:`, error.message);
      return true;
    }
    return true;
  } catch (err: any) {
    console.log(`Failed to check table existence for ${tableName}:`, err.message);
    return false;
  }
}
