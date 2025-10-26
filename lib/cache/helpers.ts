import { redis, isRedisConfigured, CACHE_TTL } from "./redis";

/**
 * Generic cache get function with fallback
 * If cache misses or Redis is not configured, it executes the fallback function
 */
export async function getCached<T>(
  key: string,
  fallback: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  // If Redis is not configured, just execute fallback
  if (!isRedisConfigured()) {
    const start = Date.now();
    const data = await fallback();
    const ms = Date.now() - start;
    console.log(`[Cache BYPASS] ${key} (redis disabled, fallback ${ms}ms)`);
    return data;
  }

  try {
    // Try to get from cache
    const startGet = Date.now();
    const cached = await redis.get<T>(key);
    const getMs = Date.now() - startGet;

    if (cached !== null) {
      console.log(`[Cache HIT] ${key} (get ${getMs}ms)`);
      return cached;
    }

    console.log(`[Cache MISS] ${key} (get ${getMs}ms)`);

    // Cache miss - execute fallback and cache the result
    const startFb = Date.now();
    const data = await fallback();
    const fbMs = Date.now() - startFb;

    // Only cache if data is not null/undefined
    if (data !== null && data !== undefined) {
      // Upstash Redis handles JSON serialization automatically
      const startSet = Date.now();
      await redis.setex(key, ttl, data);
      const setMs = Date.now() - startSet;
      console.log(
        `[Cache SET] ${key} (ttl ${ttl}s, fallback ${fbMs}ms, set ${setMs}ms)`
      );
    } else {
      console.log(
        `[Cache SKIP SET] ${key} (fallback ${fbMs}ms, value is null/undefined)`
      );
    }

    return data;
  } catch (error) {
    console.error(`[Cache ERROR] ${key}:`, error);
    // On error, fall back to direct execution
    return fallback();
  }
}

/**
 * Set cache with TTL
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<void> {
  if (!isRedisConfigured()) return;

  try {
    // Upstash Redis handles JSON serialization automatically
    await redis.setex(key, ttl, value);
    console.log(`[Cache SET] ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    console.error(`[Cache SET ERROR] ${key}:`, error);
  }
}

/**
 * Delete specific cache key
 */
export async function deleteCache(key: string): Promise<void> {
  if (!isRedisConfigured()) return;

  try {
    await redis.del(key);
    console.log(`[Cache DELETE] ${key}`);
  } catch (error) {
    console.error(`[Cache DELETE ERROR] ${key}:`, error);
  }
}

/**
 * Delete cache keys matching a pattern
 * Useful for invalidating related caches
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  if (!isRedisConfigured()) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[Cache DELETE PATTERN] ${pattern} (${keys.length} keys)`);
    }
  } catch (error) {
    console.error(`[Cache DELETE PATTERN ERROR] ${pattern}:`, error);
  }
}

/**
 * Invalidate all caches for a specific team
 * Call this after any team data mutation
 */
export async function invalidateTeamCache(teamId: number): Promise<void> {
  if (!isRedisConfigured()) return;

  try {
    await Promise.all([
      deleteCachePattern(`customers:${teamId}:*`),
      deleteCachePattern(`customers_count:${teamId}`),
      deleteCachePattern(`customer:*`),
      deleteCachePattern(`staff:${teamId}:*`),
      deleteCachePattern(`staff_count:${teamId}`),
      deleteCachePattern(`team_members:${teamId}`),
    ]);
    console.log(`[Cache INVALIDATE TEAM] Team ${teamId}`);
  } catch (error) {
    console.error(`[Cache INVALIDATE TEAM ERROR] Team ${teamId}:`, error);
  }
}

/**
 * Invalidate user-specific caches
 */
export async function invalidateUserCache(userId: number): Promise<void> {
  if (!isRedisConfigured()) return;

  try {
    await Promise.all([
      deleteCache(`user:admin:${userId}`),
      deleteCache(`user:member:${userId}`),
      deleteCache(`user_team:${userId}`),
      deleteCache(`activity_logs:${userId}`),
    ]);
    console.log(`[Cache INVALIDATE USER] User ${userId}`);
  } catch (error) {
    console.error(`[Cache INVALIDATE USER ERROR] User ${userId}:`, error);
  }
}

/**
 * Invalidate all booking caches
 */
export async function invalidateBookingCache(): Promise<void> {
  if (!isRedisConfigured()) return;

  try {
    await Promise.all([
      deleteCachePattern(`bookings:*`),
      deleteCache(`bookings_count`),
    ]);
    console.log(`[Cache INVALIDATE BOOKINGS]`);
  } catch (error) {
    console.error(`[Cache INVALIDATE BOOKINGS ERROR]:`, error);
  }
}

/**
 * Clear all cache (use with caution)
 */
export async function clearAllCache(): Promise<void> {
  if (!isRedisConfigured()) return;

  try {
    await redis.flushdb();
    console.log(`[Cache FLUSH ALL]`);
  } catch (error) {
    console.error(`[Cache FLUSH ERROR]:`, error);
  }
}
