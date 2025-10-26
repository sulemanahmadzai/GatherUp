import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/db/queries";

// GET /api/admin/system - Get system information
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(systemInfo);
  } catch (error) {
    console.error("Error fetching system info:", error);
    return NextResponse.json(
      { error: "Failed to fetch system information" },
      { status: 500 }
    );
  }
}
