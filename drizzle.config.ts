import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

const migrationUrl =
  process.env.DATABASE_URL_MIGRATION ?? process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error(
    "DATABASE_URL or DATABASE_URL_MIGRATION is required to use Drizzle configuration.",
  );
}

function toPostgresCredentials(urlString: string) {
  const url = new URL(urlString);

  if (!url.hostname || !url.pathname || url.pathname === "/") {
    throw new Error("Invalid Postgres connection URL for Drizzle configuration.");
  }

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 5432,
    user: url.username || undefined,
    password: url.password || undefined,
    database: url.pathname.slice(1),
    ssl: "require" as const,
  };
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: toPostgresCredentials(migrationUrl),
  verbose: true,
  strict: true,
});
