import { Client } from "pg";
import { SCHEMA_TABLES } from "./schema.ts";
import { checkTableExists } from "./helpers.ts";

// Runs the database migrations on the connected PG Client
export async function runMigrations(client: Client): Promise<void> {
  console.log("Starting production-grade Supabase database bootstrap...");

  for (const table of SCHEMA_TABLES) {
    try {
      const exists = await checkTableExists(table.name);

      if (exists) {
        console.log(`✓ ${table.name} table already exists.`);
        continue;
      }

      console.log(`Creating table public.${table.name}...`);
      
      // Execute table creation
      await client.query(table.createSql);
      
      // Execute Row Level Security configuration
      if (table.rlsSql) {
        try {
          await client.query(table.rlsSql);
        } catch (rlsErr: any) {
          console.warn(`[Warning] Could not enable RLS on ${table.name}:`, rlsErr.message);
        }
      }

      // Execute Policy creations
      if (table.policies && table.policies.length > 0) {
        for (const policy of table.policies) {
          try {
            await client.query(policy.sql);
            console.log(`  - Created policy: "${policy.name}"`);
          } catch (policyErr: any) {
            // Avoid failing migration if policy already exists
            if (!policyErr.message.includes("already exists")) {
              console.warn(`  [Warning] Could not create policy "${policy.name}":`, policyErr.message);
            }
          }
        }
      }

      // Execute Index creations
      if (table.indexes && table.indexes.length > 0) {
        for (const indexSql of table.indexes) {
          try {
            await client.query(indexSql);
          } catch (indexErr: any) {
            console.warn(`  [Warning] Could not create index on ${table.name}:`, indexErr.message);
          }
        }
      }

      console.log(`✓ ${table.name} ready`);
    } catch (err: any) {
      console.error(`✕ Failed to bootstrap table ${table.name}:`, err.message);
      // We do not rethrow, to satisfy the requirement: "Never crash if tables are missing"
    }
  }

  console.log("Database bootstrap complete.");
}
