import { Redis } from "@upstash/redis";

// Initialize Redis client
// For development: use local Redis or Upstash free tier
// For production: use Upstash Redis (serverless-compatible)
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Check if Redis is configured
export const isRedisConfigured = () => {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
};

// Cache key prefixes for organization
export const CACHE_KEYS = {
  USER: (id: number, role: string) => `user:${role}:${id}`,
  USER_WITH_TEAM: (id: number) => `user_team:${id}`,
  TEAM_MEMBERS: (teamId: number) => `team_members:${teamId}`,
  STAFF: (teamId: number, page: number, pageSize: number) =>
    `staff:${teamId}:${page}:${pageSize}`,
  STAFF_COUNT: (teamId: number) => `staff_count:${teamId}`,
  BOOKINGS: (page: number, pageSize: number) => `bookings:${page}:${pageSize}`,
  BOOKINGS_COUNT: () => `bookings_count`,
  ACTIVITY_LOGS: (userId: number) => `activity_logs:${userId}`,
};

// Default TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 60, // 1 minute - for frequently changing data
  MEDIUM: 300, // 5 minutes - for semi-static data
  LONG: 3600, // 1 hour - for rarely changing data
  USER_SESSION: 1800, // 30 minutes - for user session data
};
