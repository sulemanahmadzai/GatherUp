import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { members, goals } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email/service";
import { eq, ne, and } from "drizzle-orm";

// GET /api/cron/reflections - Send reflection prompts to all active members
// Schedule: Every Wednesday at 12:00 PM
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active members (not pending)
    const activeMembers = await db
      .select()
      .from(members)
      .where(ne(members.status, "pending"));

    if (activeMembers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active members to send reflections to",
        count: 0,
      });
    }

    // Send reflection emails
    const emailPromises = activeMembers.map(async (member) => {
      try {
        // Get member's active goal
        const [goal] = await db
          .select()
          .from(goals)
          .where(and(eq(goals.memberId, member.id), eq(goals.status, "active")))
          .limit(1);

        await sendEmail({
          to: member.email,
          templateType: "reflection",
          variables: {
            memberName: member.name,
            goal: goal?.goalText || "your goal",
          },
          memberId: member.id,
        });

        return { success: true, email: member.email };
      } catch (error) {
        console.error(`Failed to send reflection to ${member.email}:`, error);
        return { success: false, email: member.email, error };
      }
    });

    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;

    return NextResponse.json({
      success: true,
      message: `Reflection emails sent to ${successCount}/${activeMembers.length} members`,
      total: activeMembers.length,
      sent: successCount,
    });
  } catch (error) {
    console.error("Error sending reflection emails:", error);
    return NextResponse.json(
      { error: "Failed to send reflection emails" },
      { status: 500 }
    );
  }
}
