import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/db/queries";
import { redis } from "@/lib/cache/redis";

// POST /api/admin/clear-cache - Clear all Redis cache
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clear all cache keys
    // Note: This is a simple implementation. For production, you might want
    // to clear specific patterns or implement a more sophisticated cache invalidation

    try {
      // Get all keys and delete them
      const keys = await redis.keys("*");

      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`✅ Cleared ${keys.length} cache keys`);
      }

      return NextResponse.json({
        success: true,
        message: `Cleared ${keys.length} cache entries`,
        count: keys.length,
      });
    } catch (redisError) {
      console.error("Redis cache clear error:", redisError);
      return NextResponse.json({
        success: false,
        message: "Cache clearing failed (Redis might not be available)",
      });
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
