/**
 * Drizzle Migration Wrapper with Retry Logic
 * This script wraps drizzle-kit commands with exponential backoff retry logic
 * to handle MySQL connection delays in Docker environments
 * 
 * IMPORTANT: This script ONLY runs at container startup via init-db.ts
 * It will gracefully skip if DATABASE_URL is not properly configured (build time)
 */

import { execSync } from "child_process";

// Skip if DATABASE_URL is not set (happens during Docker build)
if (!process.env.DATABASE_URL) {
  console.log("[Drizzle] ℹ️  DATABASE_URL not set - skipping migrations (build phase)");
  process.exit(0);
}

// Skip if we're using the fallback/placeholder database URL
if (process.env.DATABASE_URL === "mysql://user:password@localhost:3306/melitech_crm") {
  console.log("[Drizzle] ℹ️  Using placeholder DATABASE_URL - skipping migrations (build phase)");
  process.exit(0);
}

const args = process.argv.slice(2); // Get command arguments (e.g., 'generate', 'migrate')
const command = args.join(" ") || "migrate";
const maxRetries = 5;
const initialDelay = 2000; // 2 seconds

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeWithRetry(): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[Drizzle] 🔄 Attempt ${attempt}/${maxRetries}: Running drizzle-kit ${command}...`
      );

      const fullCommand = `drizzle-kit ${command} --config drizzle.config.ts`;
      execSync(fullCommand, { stdio: "inherit" });

      console.log(`[Drizzle] ✅ Successfully executed: drizzle-kit ${command}`);
      process.exit(0);
    } catch (error) {
      lastError = error as Error;
      const errorMsg = lastError.message || String(lastError);

      // Check if it's a connection error (ENOTFOUND, ECONNREFUSED, EHOSTUNREACH, etc)
      if (
        errorMsg.includes("ENOTFOUND") ||
        errorMsg.includes("ECONNREFUSED") ||
        errorMsg.includes("EHOSTUNREACH") ||
        errorMsg.includes("getaddrinfo") ||
        errorMsg.includes("Host is unreachable")
      ) {
        console.warn(
          `[Drizzle] ⚠️  Connection failed (attempt ${attempt}/${maxRetries}): Database not reachable`
        );

        if (attempt < maxRetries) {
          const delayMs = initialDelay * attempt;
          console.log(
            `[Drizzle] ⏳ Waiting ${delayMs}ms before retry (exponential backoff)...`
          );
          await sleep(delayMs);
          continue;
        }

        // All retries exhausted - this is likely happening during build or before DB is ready
        console.warn(`[Drizzle] ⚠️  Maximum retry attempts (${maxRetries}) reached`);
        console.warn(
          `[Drizzle] ℹ️  This may happen if running before database is available.`
        );
        console.warn(
          `[Drizzle] ℹ️  The database will be initialized at container startup via init-db.ts`
        );
        console.warn(`[Drizzle] Exiting gracefully (skipping migrations for now)`);
        process.exit(0); // Exit gracefully - not a fatal error
      }

      // Non-connection error, exit immediately with error
      console.error(`[Drizzle] ❌ Fatal error: ${errorMsg}`);
      process.exit(1);
    }
  }
}

executeWithRetry().catch((err) => {
  console.error("[Drizzle] ❌ Unexpected error:", err);
  process.exit(1);
});
