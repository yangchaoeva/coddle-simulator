import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

loadEnvConfig(process.cwd());

let cachedDb: NeonHttpDatabase<typeof schema> | null = null;

export function getDb() {
  if (cachedDb) {
    return cachedDb;
  }

  const databaseUrl = process.env.DATABASE_URL_MIGRATION ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL or DATABASE_URL_MIGRATION is required to initialize the database client.");
  }

  cachedDb = drizzle(neon(databaseUrl), { schema });
  return cachedDb;
}

export { schema };
