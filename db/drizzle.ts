import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch — not supported for "Transaction" pool mode (Supabase pooler).
// Keep pool size small to stay within the Supabase free-tier connection limit:
//   Free plan = 60 connections total; this app uses at most 3.
const client = postgres(connectionString, {
  prepare: false,
  max: 3,
  idle_timeout: 20,    // seconds before idle connections are closed
  max_lifetime: 1800,  // 30 min — Supabase terminates stale connections at 24h anyway
});

export const db = drizzle(client, { schema });
