import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as medlearnSchema from "./medlearn-schema";

/**
 * Optional read-only Drizzle client for the Doctor/MedLearn database.
 *
 * Uses MEDLEARN_DATABASE_URL (separate from this app's DATABASE_URL).
 * When the variable is absent (local dev without Doctor DB) this export is
 * `null` and all helpers in lib/medlearn-client.ts return null gracefully.
 *
 * Free-tier limits: keep pool at max:1 to stay within Supabase free connection
 * quota across both apps.
 */

let medlearnDb: ReturnType<typeof drizzle<typeof medlearnSchema>> | null = null;

if (process.env.MEDLEARN_DATABASE_URL) {
  const client = postgres(process.env.MEDLEARN_DATABASE_URL, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  });
  medlearnDb = drizzle(client, { schema: medlearnSchema });
}

export { medlearnDb };
