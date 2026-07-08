import { createPgClient } from "./helpers.ts";
import { runMigrations } from "./migrations.ts";

// High-level database bootstrapper
// Satisfies user intent: Never crash, self-healing, connects using Service Role Key context.
export async function bootstrapDatabase(): Promise<void> {
  console.log("[Bootstrap] Initializing database self-healing check...");
  
  try {
    const client = await createPgClient();
    
    try {
      await runMigrations(client);
    } finally {
      await client.end().catch((err: any) => {
        console.warn("[Bootstrap] Error closing client connection:", err.message);
      });
    }
    
    console.log("[Bootstrap] Database initialization completed successfully!");
  } catch (err: any) {
    console.warn("\n=========================================================================");
    console.warn("[Bootstrap] Database self-healing skipped or failed.");
    console.warn("[Reason]:", err.message);
    console.warn("[Info]: The server will start and operate normally. Missing tables may trigger errors during runtime queries.");
    console.warn("=========================================================================\n");
  }
}
