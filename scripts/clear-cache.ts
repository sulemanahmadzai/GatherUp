/**
 * Script to clear all Redis cache
 * Run this after fixing the cache serialization bug
 *
 * Usage: npx tsx scripts/clear-cache.ts
 */

import dotenv from "dotenv";
import { Redis } from "@upstash/redis";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function clearCache() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.log("❌ Redis not configured. Skipping cache clear.");
    console.log("   (This is fine if you haven't set up Redis yet)");
    return;
  }

  try {
    const redis = new Redis({ url, token });

    console.log("🗑️  Clearing all cache...");
    await redis.flushdb();
    console.log("✅ Cache cleared successfully!");
    console.log("   All cached data has been removed.");
    console.log("   Fresh data will be cached on next request.");
  } catch (error) {
    console.error("❌ Error clearing cache:", error);
    process.exit(1);
  }
}

clearCache();
