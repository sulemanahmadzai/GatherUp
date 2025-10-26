import { NextResponse } from "next/server";
import { getActivityLogs } from "@/lib/db/queries";

export async function GET() {
  try {
    const logs = await getActivityLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch activity logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}
