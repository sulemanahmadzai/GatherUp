import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { emailLogs } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";
import { desc } from "drizzle-orm";

// GET /api/emails/logs - Get all email logs
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await db
      .select()
      .from(emailLogs)
      .orderBy(desc(emailLogs.sentAt))
      .limit(100); // Limit to most recent 100 emails

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching email logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch email logs" },
      { status: 500 }
    );
  }
}
